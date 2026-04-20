/**
 * Nghiệp vụ chuyên khoa: CRUD Prisma; xóa có kiểm tra còn bác sĩ hay không.
 * Lỗi nghiệp vụ → AppError để errorHandler trả JSON.
 */
const prisma = require("../utils/prisma");
const { AppError } = require("../middlewares/error.middleware");
const { getCache, setCache, delCache } = require("../utils/redis.util");

// Cache key cho danh sách chuyên khoa
const CACHE_KEY = "cache:chuyenkhoa:all";

// Danh sách + đếm số bác sĩ mỗi khoa
const getAll = async () => {
  // 1. Kiểm tra cache trước
  const cached = await getCache(CACHE_KEY);
  if (cached) return cached;

  // 2. Cache miss → lấy từ Database
  const data = await prisma.chuyenKhoa.findMany({
    include: { _count: { select: { bacSiList: true } } },
    orderBy: { tenChuyenKhoa: "asc" },
  });

  // 3. Lưu vào cache (TTL = 1 giờ = 3600 giây)
  await setCache(CACHE_KEY, data, 3600);
  return data;
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
  const result = await prisma.chuyenKhoa.create({
    data: { 
      tenChuyenKhoa: data.tenChuyenKhoa, 
      anhChuyenKhoa: data.anhChuyenKhoa,
      icon: data.icon,
      moTaChuyenKhoa: data.moTaChuyenKhoa,
      thoiLuongKham: data.thoiLuongKham 
    },
  });
  await delCache(CACHE_KEY); 
  await delCache("cache:stats:overview");
  return result;
};

const update = async (id, data) => {
  const existing = await prisma.chuyenKhoa.findUnique({ where: { id: BigInt(id) } });
  if (!existing) throw new AppError("Không tìm thấy chuyên khoa", 404);

  const result = await prisma.chuyenKhoa.update({
    where: { id: BigInt(id) },
    data: { 
      tenChuyenKhoa: data.tenChuyenKhoa, 
      anhChuyenKhoa: data.anhChuyenKhoa,
      icon: data.icon,
      moTaChuyenKhoa: data.moTaChuyenKhoa,
      thoiLuongKham: data.thoiLuongKham 
    },
  });
  await delCache(CACHE_KEY); // Xóa cache cũ
  return result;
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
  await delCache(CACHE_KEY); // Xóa cache cũ
  await delCache("cache:stats:overview");
};

const uploadAnh = async (id, fileUrl) => {
  const existing = await prisma.chuyenKhoa.findUnique({ where: { id: BigInt(id) } });
  if (!existing) throw new AppError("Không tìm thấy chuyên khoa", 404);

  const result = await prisma.chuyenKhoa.update({
    where: { id: BigInt(id) },
    data: { anhChuyenKhoa: fileUrl },
  });
  await delCache(CACHE_KEY); // Xóa cache cũ khi đổi ảnh
  return result;
};

module.exports = { getAll, getById, create, update, remove, uploadAnh };
