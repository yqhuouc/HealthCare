/**
 * ============================================================
 * CONTROLLER: Hình thức thanh toán (Payment Method)
 * ============================================================
 * - GET    /api/hinh-thuc-thanh-toan       → Lấy tất cả hình thức
 * - POST   /api/hinh-thuc-thanh-toan       → Tạo mới (admin)
 * - DELETE /api/hinh-thuc-thanh-toan/:id   → Xóa (admin)
 * ============================================================
 */
const prisma = require("../utils/prisma");
const { sendSuccess, sendError } = require("../utils/response");

const getAll = async (req, res) => {
  const hinhThucs = await prisma.hinhThucThanhToan.findMany({
    orderBy: { id: "asc" },
  });
  return sendSuccess(res, hinhThucs, "Lấy danh sách hình thức thanh toán thành công");
};

const create = async (req, res) => {
  const { tenHinhThuc } = req.body;

  if (!tenHinhThuc) {
    return sendError(res, "Tên hình thức thanh toán không được để trống", 400);
  }

  const hinhThuc = await prisma.hinhThucThanhToan.create({
    data: { tenHinhThuc },
  });

  return sendSuccess(res, hinhThuc, "Tạo hình thức thanh toán thành công", 201);
};

const remove = async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.hinhThucThanhToan.findUnique({ where: { id: BigInt(id) } });
  if (!existing) return sendError(res, "Không tìm thấy hình thức thanh toán", 404);

  await prisma.hinhThucThanhToan.delete({ where: { id: BigInt(id) } });
  return sendSuccess(res, null, "Xóa hình thức thanh toán thành công");
};

module.exports = { getAll, create, remove };
