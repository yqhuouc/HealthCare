/**
 * FAQ: getActive cho trang public (dangHoatDong = 1); admin dùng getAll phân trang + CRUD.
 */
const prisma = require("../utils/prisma");
const { AppError } = require("../middlewares/error.middleware");
const { getCache, setCache, delCache } = require("../utils/redis.util");

// Cache key cho danh sách FAQ đang hoạt động (trang public)
const CACHE_KEY = "cache:faq:active";

const getActive = async () => {
  const cached = await getCache(CACHE_KEY);
  if (cached) return cached;

  const data = await prisma.cauHoiThuongGap.findMany({ where: { dangHoatDong: 1 }, orderBy: { id: "asc" } });
  await setCache(CACHE_KEY, data, 3600); // 1 giờ
  return data;
};

const getAll = async ({ page = 1, limit = 20 }) => {
  const skip = (Number(page) - 1) * Number(limit);
  const [faqs, total] = await Promise.all([
    prisma.cauHoiThuongGap.findMany({ skip, take: Number(limit), orderBy: { id: "asc" } }),
    prisma.cauHoiThuongGap.count(),
  ]);

  return {
    faqs,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
  };
};

const getById = async (id) => {
  const faq = await prisma.cauHoiThuongGap.findUnique({ where: { id: BigInt(id) } });
  if (!faq) throw new AppError("Không tìm thấy câu hỏi", 404);
  return faq;
};

const create = async (data) => {
  const result = await prisma.cauHoiThuongGap.create({
    data: {
      cauHoi: data.cauHoi,
      traLoi: data.traLoi,
      dangHoatDong: data.dangHoatDong !== undefined ? data.dangHoatDong : 1,
    },
  });
  await delCache(CACHE_KEY);
  return result;
};

const update = async (id, data) => {
  const existing = await prisma.cauHoiThuongGap.findUnique({ where: { id: BigInt(id) } });
  if (!existing) throw new AppError("Không tìm thấy câu hỏi", 404);

  const result = await prisma.cauHoiThuongGap.update({
    where: { id: BigInt(id) },
    data: { cauHoi: data.cauHoi, traLoi: data.traLoi, dangHoatDong: data.dangHoatDong },
  });
  await delCache(CACHE_KEY);
  return result;
};

const remove = async (id) => {
  const existing = await prisma.cauHoiThuongGap.findUnique({ where: { id: BigInt(id) } });
  if (!existing) throw new AppError("Không tìm thấy câu hỏi", 404);

  await prisma.cauHoiThuongGap.delete({ where: { id: BigInt(id) } });
  await delCache(CACHE_KEY);
};

module.exports = { getActive, getAll, getById, create, update, remove };
