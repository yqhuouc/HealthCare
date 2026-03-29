/**
 * Controller đơn thuốc: gắn với lịch khám; tạo bởi bác sĩ, xem/xóa theo route + authorize.
 * Lỗi → asyncHandler → errorHandler.
 */
const { asyncHandler } = require("../middlewares/error.middleware");
const donThuocService = require("../services/donThuoc.service");

// GET /api/don-thuoc — danh sách + pagination (admin, bác sĩ)
const getAll = asyncHandler(async (req, res) => {
  const result = await donThuocService.getAll(req.query);
  res.json({ success: true, data: result.donThuocs, pagination: result.pagination });
});

// GET /api/don-thuoc/:id — chi tiết (đăng nhập)
// Nếu là bệnh nhân chưa thanh toán xong → ẩn chi tiết thuốc
const getById = asyncHandler(async (req, res) => {
  const donThuoc = await donThuocService.getById(req.params.id, req.user);
  res.json({ success: true, data: donThuoc });
});

// POST /api/don-thuoc — tạo đơn (bác sĩ)
const create = asyncHandler(async (req, res) => {
  const donThuoc = await donThuocService.create(req.body);
  res.status(201).json({ success: true, message: "Tạo đơn thuốc thành công", data: donThuoc });
});

// PUT /api/don-thuoc/:id — cập nhật đơn thuốc (bác sĩ)
const update = asyncHandler(async (req, res) => {
  const donThuoc = await donThuocService.update(req.params.id, req.body, req.user);
  res.json({ success: true, message: "Cập nhật đơn thuốc thành công", data: donThuoc });
});

// DELETE /api/don-thuoc/:id — xóa (admin)
const remove = asyncHandler(async (req, res) => {
  await donThuocService.remove(req.params.id);
  res.json({ success: true, message: "Xóa đơn thuốc thành công" });
});

module.exports = { getAll, getById, create, update, remove };
