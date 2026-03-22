/**
 * Controller đặt lịch: lọc theo quyền, tạo/cập nhật/xóa qua datLich.service.
 * Lỗi → asyncHandler → errorHandler.
 */
const { asyncHandler } = require("../middlewares/error.middleware");
const datLichService = require("../services/datLich.service");

// GET /api/dat-lich — tất cả lịch + pagination (admin)
const getAll = asyncHandler(async (req, res) => {
  const result = await datLichService.getAll(req.query);
  res.json({ success: true, data: result.datLichs, pagination: result.pagination });
});

// GET /api/dat-lich/:id — chi tiết một lịch
const getById = asyncHandler(async (req, res) => {
  const datLich = await datLichService.getById(req.params.id);
  res.json({ success: true, data: datLich });
});

// GET /api/dat-lich/benh-nhan/:id — lịch theo bệnh nhân (service kiểm tra quyền)
const getByBenhNhan = asyncHandler(async (req, res) => {
  const datLichs = await datLichService.getByBenhNhan(req.params.id, req.user);
  res.json({ success: true, data: datLichs });
});

// GET /api/dat-lich/bac-si/:id — lịch theo bác sĩ
const getByBacSi = asyncHandler(async (req, res) => {
  const datLichs = await datLichService.getByBacSi(req.params.id, req.user);
  res.json({ success: true, data: datLichs });
});

// POST /api/dat-lich — tạo lịch mới
const create = asyncHandler(async (req, res) => {
  const datLich = await datLichService.create(req.body);
  res.status(201).json({ success: true, message: "Đặt lịch thành công", data: datLich });
});

// PUT /api/dat-lich/:id/trang-thai — đổi trạng thái (admin, bác sĩ)
const updateTrangThai = asyncHandler(async (req, res) => {
  const datLich = await datLichService.updateTrangThai(req.params.id, req.body.trangThai);
  res.json({ success: true, message: "Cập nhật trạng thái thành công", data: datLich });
});

// DELETE /api/dat-lich/:id — xóa (có kiểm tra quyền trong service)
const remove = asyncHandler(async (req, res) => {
  await datLichService.remove(req.params.id, req.user);
  res.json({ success: true, message: "Xóa lịch hẹn thành công" });
});

module.exports = { getAll, getById, getByBenhNhan, getByBacSi, create, updateTrangThai, remove };
