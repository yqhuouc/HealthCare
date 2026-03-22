/**
 * Controller lịch làm việc: khung giờ (master) + lịch theo bác sĩ/ngày.
 * Lỗi → asyncHandler → errorHandler.
 */
const { asyncHandler } = require("../middlewares/error.middleware");
const lichLamViecService = require("../services/lichLamViec.service");

// --- Khung giờ ---

// GET /api/lich-lam-viec/khung-gio — danh sách khung giờ (public)
const getAllKhungGio = asyncHandler(async (req, res) => {
  const khungGios = await lichLamViecService.getAllKhungGio();
  res.json({ success: true, data: khungGios });
});

// POST /api/lich-lam-viec/khung-gio — tạo khung giờ (admin)
const createKhungGio = asyncHandler(async (req, res) => {
  const khungGio = await lichLamViecService.createKhungGio(req.body);
  res.status(201).json({ success: true, message: "Tạo khung giờ thành công", data: khungGio });
});

// DELETE /api/lich-lam-viec/khung-gio/:id — xóa nếu không còn lịch dùng (admin)
const deleteKhungGio = asyncHandler(async (req, res) => {
  await lichLamViecService.deleteKhungGio(req.params.id);
  res.json({ success: true, message: "Xóa khung giờ thành công" });
});

// --- Lịch làm việc bác sĩ ---

// GET /api/lich-lam-viec — tra cứu theo query (public)
const getLichLamViec = asyncHandler(async (req, res) => {
  const lichLamViec = await lichLamViecService.getLichLamViec(req.query);
  res.json({ success: true, data: lichLamViec });
});

// POST /api/lich-lam-viec — tạo lịch (admin, bác sĩ)
const createLichLamViec = asyncHandler(async (req, res) => {
  const lich = await lichLamViecService.createLichLamViec(req.body);
  res.status(201).json({ success: true, message: "Tạo lịch làm việc thành công", data: lich });
});

// PUT /api/lich-lam-viec/:id — cập nhật (admin, bác sĩ)
const updateLichLamViec = asyncHandler(async (req, res) => {
  const lich = await lichLamViecService.updateLichLamViec(req.params.id, req.body);
  res.json({ success: true, message: "Cập nhật lịch làm việc thành công", data: lich });
});

// DELETE /api/lich-lam-viec/:id — xóa (admin, bác sĩ)
const deleteLichLamViec = asyncHandler(async (req, res) => {
  await lichLamViecService.deleteLichLamViec(req.params.id);
  res.json({ success: true, message: "Xóa lịch làm việc thành công" });
});

module.exports = {
  getAllKhungGio, createKhungGio, deleteKhungGio,
  getLichLamViec, createLichLamViec, updateLichLamViec, deleteLichLamViec,
};
