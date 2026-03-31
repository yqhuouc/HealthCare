/**
 * Bác sĩ: lọc theo chuyên khoa + tên; tạo transaction taiKhoan (bac_si) + bacSi.
 * Xóa kèm taiKhoan nếu không còn lịch hẹn.
 */
const bcrypt = require("bcryptjs");
const prisma = require("../utils/prisma");
const { AppError } = require("../middlewares/error.middleware");

// Lọc chuyenKhoaId + search tên; include chuyenKhoa + taiKhoan (không matKhau)
const getAll = async ({ chuyenKhoaId, search, page = 1, limit = 10 }) => {
  const skip = (Number(page) - 1) * Number(limit);
  const where = {};
  if (chuyenKhoaId) where.chuyenKhoaId = BigInt(chuyenKhoaId);
  if (search) where.tenBacSi = { contains: search, mode: "insensitive" };

  const [bacSiList, total] = await Promise.all([
    prisma.bacSi.findMany({
      where,
      include: {
        chuyenKhoa: { select: { id: true, tenChuyenKhoa: true } },
        taiKhoan: {
          select: {
            id: true,
            email: true,
            anhDaiDien: true,
            trangThaiTaiKhoan: true,
          },
        },
      },
      skip,
      take: Number(limit),
      orderBy: { tenBacSi: "asc" },
    }),
    prisma.bacSi.count({ where }),
  ]);

  return {
    bacSiList,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

// Chi tiết + chuyenKhoa + taiKhoan (không trả matKhau)
const getById = async (id) => {
  const bacSi = await prisma.bacSi.findUnique({
    where: { id: BigInt(id) },
    include: {
      chuyenKhoa: true,
      taiKhoan: {
        select: {
          id: true,
          email: true,
          anhDaiDien: true,
          gioiTinh: true,
          ngaySinh: true,
          diaChi: true,
        },
      },
    },
  });

  if (!bacSi) throw new AppError("Không tìm thấy bác sĩ", 404);
  return bacSi;
};

// Bắt buộc có email/matKhau và định danh vaiTro là bac_si. Nếu trùng email -> 409
const create = async (data) => {
  const exists = await prisma.taiKhoan.findUnique({
    where: { email: data.email },
  });
  if (exists) throw new AppError("Email đã được sử dụng", 409);

  const hashedPassword = await bcrypt.hash(data.matKhau, 10);

  const result = await prisma.$transaction(async (tx) => {
    const taiKhoan = await tx.taiKhoan.create({
      data: {
        email: data.email,
        matKhau: hashedPassword,
        vaiTro: "bac_si",
        trangThaiTaiKhoan: 1,
        gioiTinh: data.gioiTinh || null,
        ngaySinh: data.ngaySinh ? new Date(data.ngaySinh) : null,
        diaChi: data.diaChi || null,
      },
    });

    const bacSi = await tx.bacSi.create({
      data: {
        tenBacSi: data.tenBacSi,
        hocViChucDanh: data.hocViChucDanh || null,
        moTaNgan: data.moTaNgan || null,
        moTaChiTiet: data.moTaChiTiet || null,
        giaKham: data.giaKham ? parseFloat(data.giaKham) : null,
        chuyenKhoaId: BigInt(data.chuyenKhoaId),
        taiKhoanId: taiKhoan.id,
      },
    });

    return bacSi;
  });

  return result;
};

// Cập nhật từng field tùy body; parse giaKham / chuyenKhoaId
const update = async (id, data) => {
  const existing = await prisma.bacSi.findUnique({ where: { id: BigInt(id) } });
  if (!existing) throw new AppError("Không tìm thấy bác sĩ", 404);

  return prisma.bacSi.update({
    where: { id: BigInt(id) },
    data: {
      tenBacSi: data.tenBacSi,
      hocViChucDanh: data.hocViChucDanh,
      moTaNgan: data.moTaNgan,
      moTaChiTiet: data.moTaChiTiet,
      giaKham:
        data.giaKham !== undefined ? parseFloat(data.giaKham) : undefined,
      chuyenKhoaId:
        data.chuyenKhoaId !== undefined ? BigInt(data.chuyenKhoaId) : undefined,
    },
  });
};

// Cấm xóa nếu còn lịch; xóa bacSi rồi taiKhoan liên kết
const remove = async (id) => {
  const existing = await prisma.bacSi.findUnique({ where: { id: BigInt(id) } });
  if (!existing) throw new AppError("Không tìm thấy bác sĩ", 404);

  const appointmentCount = await prisma.datLich.count({
    where: { bacSiId: BigInt(id) },
  });
  if (appointmentCount > 0) {
    throw new AppError(
      `Không thể xóa vì bác sĩ có ${appointmentCount} lịch hẹn`,
      400,
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.bacSi.delete({ where: { id: BigInt(id) } });
    if (existing.taiKhoanId) {
      await tx.taiKhoan.delete({ where: { id: existing.taiKhoanId } });
    }
  });
};

module.exports = { getAll, getById, create, update, remove };
