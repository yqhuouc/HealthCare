const { asyncHandler } = require("../middlewares/error.middleware");
const benhNhanService = require("../services/benhNhan.service");

const getAll = asyncHandler(async (req, res) => {
  const result = await benhNhanService.getAll(req.query);
  res.json({ success: true, data: result.benhNhans, pagination: result.pagination });
});

const getById = asyncHandler(async (req, res) => {
  const benhNhan = await benhNhanService.getById(req.params.id);
  res.json({ success: true, data: benhNhan });
});

const update = asyncHandler(async (req, res) => {
  const benhNhan = await benhNhanService.update(req.params.id, req.body, req.user);
  res.json({ success: true, message: "Cập nhật bệnh nhân thành công", data: benhNhan });
});

const remove = asyncHandler(async (req, res) => {
  await benhNhanService.remove(req.params.id);
  res.json({ success: true, message: "Xóa bệnh nhân thành công" });
});

module.exports = { getAll, getById, update, remove };
