/**
 * Bệnh nhân: danh sách + phân trang; cập nhật đồng bộ benhNhan + taiKhoan (nếu có).
 * benh_nhan chỉ được sửa bản ghi trùng taiKhoanId; xóa kèm tài khoản nếu không còn lịch.
 */
const prisma = require("../utils/prisma");
const { AppError } = require("../middlewares/error.middleware");

// Lọc theo họ tên (contains, không phân biệt hoa thường) + skip/take
const getAll = async ({ search, page = 1, limit = 10 }) => {
  const skip = (Number(page) - 1) * Number(limit);
  const where = {};
  if (search) where.hoTen = { contains: search, mode: "insensitive" };

  const [benhNhans, total] = await Promise.all([
    prisma.benhNhan.findMany({
      where,
      include: {
        taiKhoan: { select: { id: true, email: true, anhDaiDien: true, trangThaiTaiKhoan: true, ngayTao: true } },
      },
      skip,
      take: Number(limit),
      orderBy: { hoTen: "asc" },
    }),
    prisma.benhNhan.count({ where }),
  ]);

  return {
    benhNhans,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
  };
};

// Chi tiết + include taiKhoan (ảnh, giới tính, ...)
const getById = async (id) => {
  const benhNhan = await prisma.benhNhan.findUnique({
    where: { id: BigInt(id) },
    include: {
      taiKhoan: { select: { id: true, email: true, anhDaiDien: true, gioiTinh: true, ngaySinh: true, diaChi: true, ngayTao: true } },
    },
  });

  if (!benhNhan) throw new AppError("Không tìm thấy bệnh nhân", 404);
  return benhNhan;
};

// Transaction: cập nhật benhNhan + (tuỳ) taiKhoan.
// - admin: sửa mọi bệnh nhân
// - benh_nhan: chỉ sửa bệnh nhân thuộc taiKhoan của chính mình
const update = async (id, data, requestUser) => {
  const existing = await prisma.benhNhan.findUnique({ where: { id: BigInt(id) } });
  if (!existing) throw new AppError("Không tìm thấy bệnh nhân", 404);

  // Kiểm tra quyền:
  // - admin: được phép
  // - benh_nhan: chỉ được phép nếu đúng bản ghi thuộc taiKhoanId của mình
  // - các role khác (vd bac_si): không được phép
  const isOwner = existing.taiKhoanId && existing.taiKhoanId === requestUser.id;
  if (requestUser.vaiTro !== "admin" && !(requestUser.vaiTro === "benh_nhan" && isOwner)) {
    throw new AppError("Bạn không có quyền chỉnh sửa hồ sơ này", 403);
  }

  const result = await prisma.$transaction(async (tx) => {
    const benhNhan = await tx.benhNhan.update({
      where: { id: BigInt(id) },
      data: { hoTen: data.hoTen, soDienThoai: data.soDienThoai, emailLienHe: data.emailLienHe },
    });

    if (existing.taiKhoanId && (data.gioiTinh !== undefined || data.ngaySinh !== undefined || data.diaChi !== undefined || data.anhDaiDien !== undefined)) {
      await tx.taiKhoan.update({
        where: { id: existing.taiKhoanId },
        data: {
          gioiTinh: data.gioiTinh !== undefined ? data.gioiTinh : undefined,
          ngaySinh: data.ngaySinh !== undefined ? new Date(data.ngaySinh) : undefined,
          diaChi: data.diaChi !== undefined ? data.diaChi : undefined,
          anhDaiDien: data.anhDaiDien !== undefined ? data.anhDaiDien : undefined,
        },
      });
    }

    return benhNhan;
  });

  return result;
};

// Không xóa nếu còn datLich; xóa benhNhan + taiKhoan liên kết
const remove = async (id) => {
  const existing = await prisma.benhNhan.findUnique({ where: { id: BigInt(id) } });
  if (!existing) throw new AppError("Không tìm thấy bệnh nhân", 404);

  const appointmentCount = await prisma.datLich.count({ where: { benhNhanId: BigInt(id) } });
  if (appointmentCount > 0) {
    throw new AppError(`Không thể xóa vì bệnh nhân có ${appointmentCount} lịch hẹn`, 400);
  }

  await prisma.$transaction(async (tx) => {
    await tx.benhNhan.delete({ where: { id: BigInt(id) } });
    if (existing.taiKhoanId) {
      await tx.taiKhoan.delete({ where: { id: existing.taiKhoanId } });
    }
  });
};

module.exports = { getAll, getById, update, remove };
