/**
 * Nghiệp vụ chuyên khoa: CRUD Prisma; xóa có kiểm tra còn bác sĩ hay không.
 * Lỗi nghiệp vụ → AppError để errorHandler trả JSON.
 */
const prisma = require("../utils/prisma");
const { AppError } = require("../middlewares/error.middleware");

// Danh sách + đếm số bác sĩ mỗi khoa
const getAll = async () => {
  return prisma.chuyenKhoa.findMany({
    include: { _count: { select: { bacSiList: true } } },
    orderBy: { tenChuyenKhoa: "asc" },
  });
};

// Chi tiết + danh sách bác sĩ thuộc khoa
const getById = async (id) => {
  const chuyenKhoa = await prisma.chuyenKhoa.findUnique({
    where: { id: BigInt(id) },
    include: {
      bacSiList: { select: { id: true, tenBacSi: true, hocViChucDanh: true, moTaNgan: true, giaKham: true } },
    },
  });

  if (!chuyenKhoa) throw new AppError("Không tìm thấy chuyên khoa", 404);
  return chuyenKhoa;
};

const create = async (data) => {
  return prisma.chuyenKhoa.create({
    data: { 
      tenChuyenKhoa: data.tenChuyenKhoa, 
      anhChuyenKhoa: data.anhChuyenKhoa, 
      moTaChuyenKhoa: data.moTaChuyenKhoa,
      thoiLuongKham: data.thoiLuongKham 
    },
  });
};

const update = async (id, data) => {
  const existing = await prisma.chuyenKhoa.findUnique({ where: { id: BigInt(id) } });
  if (!existing) throw new AppError("Không tìm thấy chuyên khoa", 404);

  return prisma.chuyenKhoa.update({
    where: { id: BigInt(id) },
    data: { 
      tenChuyenKhoa: data.tenChuyenKhoa, 
      anhChuyenKhoa: data.anhChuyenKhoa, 
      moTaChuyenKhoa: data.moTaChuyenKhoa,
      thoiLuongKham: data.thoiLuongKham 
    },
  });
};

// Chỉ xóa khi không còn bacSi gắn chuyenKhoaId
const remove = async (id) => {
  const existing = await prisma.chuyenKhoa.findUnique({ where: { id: BigInt(id) } });
  if (!existing) throw new AppError("Không tìm thấy chuyên khoa", 404);

  const doctorCount = await prisma.bacSi.count({ where: { chuyenKhoaId: BigInt(id) } });
  if (doctorCount > 0) {
    throw new AppError(`Không thể xóa vì có ${doctorCount} bác sĩ thuộc chuyên khoa này`, 400);
  }

  await prisma.chuyenKhoa.delete({ where: { id: BigInt(id) } });
};

const uploadAnh = async (id, fileUrl) => {
  const existing = await prisma.chuyenKhoa.findUnique({ where: { id: BigInt(id) } });
  if (!existing) throw new AppError("Không tìm thấy chuyên khoa", 404);

  return prisma.chuyenKhoa.update({
    where: { id: BigInt(id) },
    data: { anhChuyenKhoa: fileUrl },
  });
};

module.exports = { getAll, getById, create, update, remove, uploadAnh };
