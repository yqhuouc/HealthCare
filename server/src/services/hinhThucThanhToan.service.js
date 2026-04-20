/**
 * Danh mục hình thức thanh toán (datLich tham chiếu). Xóa bị chặn nếu còn lịch dùng.
 */
const prisma = require("../utils/prisma");
const { AppError } = require("../middlewares/error.middleware");
const { getCache, setCache, delCache } = require("../utils/redis.util");

// Cache key cho danh sách hình thức thanh toán
const CACHE_KEY = "cache:thanhtoan:all";

const getAll = async () => {
  const cached = await getCache(CACHE_KEY);
  if (cached) return cached;

  const data = await prisma.hinhThucThanhToan.findMany({ orderBy: { id: "asc" } });
  await setCache(CACHE_KEY, data, 7200); // 2 giờ
  return data;
};

const create = async (data) => {
  const result = await prisma.hinhThucThanhToan.create({
    data: { tenHinhThuc: data.tenHinhThuc, maLoai: data.maLoai || "OFFLINE" },
  });
  await delCache(CACHE_KEY);
  return result;
};

const remove = async (id) => {
  const existing = await prisma.hinhThucThanhToan.findUnique({ where: { id: BigInt(id) } });
  if (!existing) throw new AppError("Không tìm thấy hình thức thanh toán", 404);

  const usageCount = await prisma.datLich.count({ where: { hinhThucThanhToanId: BigInt(id) } });
  if (usageCount > 0) {
    throw new AppError(`Không thể xóa vì có ${usageCount} lịch hẹn đang sử dụng`, 400);
  }

  await prisma.hinhThucThanhToan.delete({ where: { id: BigInt(id) } });
  await delCache(CACHE_KEY);
};

module.exports = { getAll, create, remove };
