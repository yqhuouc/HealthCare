/**
 * Danh mục hình thức thanh toán (datLich tham chiếu). Xóa bị chặn nếu còn lịch dùng.
 */
const prisma = require("../utils/prisma");
const { AppError } = require("../middlewares/error.middleware");

const getAll = async () => {
  return prisma.hinhThucThanhToan.findMany({ orderBy: { id: "asc" } });
};

const create = async (data) => {
  return prisma.hinhThucThanhToan.create({
    data: { tenHinhThuc: data.tenHinhThuc, maLoai: data.maLoai || "OFFLINE" },
  });
};

const remove = async (id) => {
  const existing = await prisma.hinhThucThanhToan.findUnique({ where: { id: BigInt(id) } });
  if (!existing) throw new AppError("Không tìm thấy hình thức thanh toán", 404);

  const usageCount = await prisma.datLich.count({ where: { hinhThucThanhToanId: BigInt(id) } });
  if (usageCount > 0) {
    throw new AppError(`Không thể xóa vì có ${usageCount} lịch hẹn đang sử dụng`, 400);
  }

  await prisma.hinhThucThanhToan.delete({ where: { id: BigInt(id) } });
};

module.exports = { getAll, create, remove };
