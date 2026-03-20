const { asyncHandler } = require("../middlewares/error.middleware");
const lichLamViecService = require("../services/lichLamViec.service");

// ===== KHUNG GIỜ =====
const getAllKhungGio = asyncHandler(async (req, res) => {
  const khungGios = await lichLamViecService.getAllKhungGio();
  res.json({ success: true, data: khungGios });
});

const createKhungGio = asyncHandler(async (req, res) => {
  const khungGio = await lichLamViecService.createKhungGio(req.body);
  res.status(201).json({ success: true, message: "Tạo khung giờ thành công", data: khungGio });
});

const deleteKhungGio = asyncHandler(async (req, res) => {
  await lichLamViecService.deleteKhungGio(req.params.id);
  res.json({ success: true, message: "Xóa khung giờ thành công" });
});

// ===== LỊCH LÀM VIỆC =====
const getLichLamViec = asyncHandler(async (req, res) => {
  const lichLamViec = await lichLamViecService.getLichLamViec(req.query);
  res.json({ success: true, data: lichLamViec });
});

const createLichLamViec = asyncHandler(async (req, res) => {
  const lich = await lichLamViecService.createLichLamViec(req.body);
  res.status(201).json({ success: true, message: "Tạo lịch làm việc thành công", data: lich });
});

const updateLichLamViec = asyncHandler(async (req, res) => {
  const lich = await lichLamViecService.updateLichLamViec(req.params.id, req.body);
  res.json({ success: true, message: "Cập nhật lịch làm việc thành công", data: lich });
});

const deleteLichLamViec = asyncHandler(async (req, res) => {
  await lichLamViecService.deleteLichLamViec(req.params.id);
  res.json({ success: true, message: "Xóa lịch làm việc thành công" });
});

module.exports = {
  getAllKhungGio, createKhungGio, deleteKhungGio,
  getLichLamViec, createLichLamViec, updateLichLamViec, deleteLichLamViec,
};
