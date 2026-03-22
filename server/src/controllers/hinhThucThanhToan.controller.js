/**
 * Controller hình thức thanh toán: danh sách public; tạo/xóa admin (xóa kiểm tra ràng buộc ở service).
 * Lỗi → asyncHandler → errorHandler.
 */
const { asyncHandler } = require("../middlewares/error.middleware");
const hinhThucThanhToanService = require("../services/hinhThucThanhToan.service");

// GET /api/hinh-thuc-thanh-toan — danh sách (public)
const getAll = asyncHandler(async (req, res) => {
  const data = await hinhThucThanhToanService.getAll();
  res.json({ success: true, data });
});

// POST /api/hinh-thuc-thanh-toan — tạo (admin)
const create = asyncHandler(async (req, res) => {
  const ht = await hinhThucThanhToanService.create(req.body);
  res.status(201).json({ success: true, message: "Tạo hình thức thanh toán thành công", data: ht });
});

// DELETE /api/hinh-thuc-thanh-toan/:id — xóa (admin)
const remove = asyncHandler(async (req, res) => {
  await hinhThucThanhToanService.remove(req.params.id);
  res.json({ success: true, message: "Xóa hình thức thanh toán thành công" });
});

module.exports = { getAll, create, remove };
