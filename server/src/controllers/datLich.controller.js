const { asyncHandler } = require("../middlewares/error.middleware");
const datLichService = require("../services/datLich.service");

const getAll = asyncHandler(async (req, res) => {
  const result = await datLichService.getAll(req.query);
  res.json({ success: true, data: result.datLichs, pagination: result.pagination });
});

const getById = asyncHandler(async (req, res) => {
  const datLich = await datLichService.getById(req.params.id);
  res.json({ success: true, data: datLich });
});

const getByBenhNhan = asyncHandler(async (req, res) => {
  const datLichs = await datLichService.getByBenhNhan(req.params.id, req.user);
  res.json({ success: true, data: datLichs });
});

const getByBacSi = asyncHandler(async (req, res) => {
  const datLichs = await datLichService.getByBacSi(req.params.id, req.user);
  res.json({ success: true, data: datLichs });
});

const create = asyncHandler(async (req, res) => {
  const datLich = await datLichService.create(req.body);
  res.status(201).json({ success: true, message: "Đặt lịch thành công", data: datLich });
});

const updateTrangThai = asyncHandler(async (req, res) => {
  const datLich = await datLichService.updateTrangThai(req.params.id, req.body.trangThai);
  res.json({ success: true, message: "Cập nhật trạng thái thành công", data: datLich });
});

const remove = asyncHandler(async (req, res) => {
  await datLichService.remove(req.params.id, req.user);
  res.json({ success: true, message: "Xóa lịch hẹn thành công" });
});

module.exports = { getAll, getById, getByBenhNhan, getByBacSi, create, updateTrangThai, remove };
