/**
 * Bệnh nhân: danh sách + phân trang; cập nhật đồng bộ benhNhan + taiKhoan (nếu có).
 * benh_nhan chỉ được sửa bản ghi trùng taiKhoanId; xóa kèm tài khoản nếu không còn lịch.
 */
const prisma = require("../utils/prisma");
const { AppError } = require("../middlewares/error.middleware");
const { delCache } = require("../utils/redis.util");

// Lọc theo họ tên (contains, không phân biệt hoa thường) + skip/take
const getAll = async ({ search, page = 1, limit = 10, hasAccount }) => {
  const skip = (Number(page) - 1) * Number(limit);
  const where = {};
  if (search) where.hoTen = { contains: search, mode: "insensitive" };

  if (hasAccount === "true") {
    where.taiKhoanId = { not: null };
  } else if (hasAccount === "false") {
    where.taiKhoanId = null;
  }

  const [benhNhans, total] = await Promise.all([
    prisma.benhNhan.findMany({
      where,
      include: {
        taiKhoan: {
          select: {
            id: true,
            email: true,
            anhDaiDien: true,
            trangThaiTaiKhoan: true,
            ngayTao: true,
          },
        },
      },
      skip,
      take: Number(limit),
      orderBy: { hoTen: "asc" },
    }),
    prisma.benhNhan.count({ where }),
  ]);

  return {
    benhNhans,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

// Chi tiết + include taiKhoan (ảnh, giới tính, ...)
const getById = async (id, requestUser) => {
  const benhNhan = await prisma.benhNhan.findUnique({
    where: { id: BigInt(id) },
    include: {
      taiKhoan: {
        select: {
          id: true,
          email: true,
          anhDaiDien: true,
          gioiTinh: true,
          ngaySinh: true,
          diaChi: true,
          ngayTao: true,
          trangThaiTaiKhoan: true,
        },
      },
    },
  });

  if (!benhNhan) throw new AppError("Không tìm thấy bệnh nhân", 404);

  // Ownership check:
  // - benh_nhan chỉ xem được hồ sơ thuộc taiKhoanId của chính họ
  // - admin được phép xem tất cả (authorize ở route đã chặn các role khác)
  if (
    requestUser?.vaiTro === "benh_nhan" &&
    benhNhan.taiKhoanId !== requestUser.id
  ) {
    throw new AppError("Bạn không có quyền xem hồ sơ này", 403);
  }

  return benhNhan;
};

// Transaction: cập nhật benhNhan + (tuỳ) taiKhoan.
// - admin: sửa mọi bệnh nhân
// - benh_nhan: chỉ sửa bệnh nhân thuộc taiKhoan của chính mình
const update = async (id, data, requestUser) => {
  const existing = await prisma.benhNhan.findUnique({
    where: { id: BigInt(id) },
  });
  if (!existing) throw new AppError("Không tìm thấy bệnh nhân", 404);

  // Kiểm tra quyền:
  // - admin: được phép
  // - benh_nhan: chỉ được phép nếu đúng bản ghi thuộc taiKhoanId của mình
  // - các role khác (vd bac_si): không được phép
  const isOwner = existing.taiKhoanId && existing.taiKhoanId === requestUser.id;
  if (
    requestUser.vaiTro !== "admin" &&
    !(requestUser.vaiTro === "benh_nhan" && isOwner)
  ) {
    throw new AppError("Bạn không có quyền chỉnh sửa hồ sơ này", 403);
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Cập nhật bảng BenhNhan (chỉ những trường có dữ liệu)
    const updateData = {};
    if (data.hoTen !== undefined) updateData.hoTen = data.hoTen;
    if (data.soDienThoai !== undefined) updateData.soDienThoai = data.soDienThoai;
    if (data.emailLienHe !== undefined) updateData.emailLienHe = data.emailLienHe;

    if (Object.keys(updateData).length > 0) {
      await tx.benhNhan.update({
        where: { id: BigInt(id) },
        data: updateData,
      });
    }

    // 2. Cập nhật bảng TaiKhoan liên kết
    if (existing.taiKhoanId) {
      const accountUpdate = {};

      if (data.trangThaiTaiKhoan !== undefined) {
        accountUpdate.trangThaiTaiKhoan = Number(data.trangThaiTaiKhoan);
      }
      if (data.emailLienHe) accountUpdate.email = data.emailLienHe;
      if (data.gioiTinh !== undefined) accountUpdate.gioiTinh = Number(data.gioiTinh);
      if (data.ngaySinh !== undefined) accountUpdate.ngaySinh = new Date(data.ngaySinh);
      if (data.diaChi !== undefined) accountUpdate.diaChi = data.diaChi;
      if (data.anhDaiDien !== undefined) accountUpdate.anhDaiDien = data.anhDaiDien;

      if (Object.keys(accountUpdate).length > 0) {
        await tx.taiKhoan.update({
          where: { id: existing.taiKhoanId },
          data: accountUpdate,
        });
      }
    }

    // 3. Trả về kết quả mới nhất kèm trạng thái tài khoản
    return tx.benhNhan.findUnique({
      where: { id: BigInt(id) },
      include: {
        taiKhoan: {
          select: {
            id: true,
            email: true,
            trangThaiTaiKhoan: true,
          },
        },
      },
    });
  });
};

// Không xóa nếu còn datLich; xóa benhNhan + taiKhoan liên kết
const remove = async (id) => {
  const existing = await prisma.benhNhan.findUnique({
    where: { id: BigInt(id) },
  });
  if (!existing) throw new AppError("Không tìm thấy bệnh nhân", 404);

  const appointmentCount = await prisma.datLich.count({
    where: { benhNhanId: BigInt(id) },
  });
  if (appointmentCount > 0) {
    throw new AppError(
      `Không thể xóa vì bệnh nhân có ${appointmentCount} lịch hẹn`,
      400,
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.benhNhan.delete({ where: { id: BigInt(id) } });
    if (existing.taiKhoanId) {
      await tx.taiKhoan.delete({ where: { id: existing.taiKhoanId } });
    }
  });

  await delCache("cache:stats:overview");
};

// Tạo mới bệnh nhân vãng lai (không có tài khoản liên kết)
const create = async (data) => {
  const benhNhan = await prisma.benhNhan.create({
    data: {
      hoTen: data.hoTen,
      soDienThoai: data.soDienThoai || null,
      emailLienHe: data.emailLienHe || null,
    },
  });

  await delCache("cache:stats:overview");
  return benhNhan;
};

module.exports = { getAll, getById, update, remove, create };
