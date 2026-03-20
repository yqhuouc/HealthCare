const { asyncHandler } = require("../middlewares/error.middleware");
const bacSiService = require("../services/bacSi.service");

const getAll = asyncHandler(async (req, res) => {
  const result = await bacSiService.getAll(req.query);
  res.json({ success: true, data: result.bacSis, pagination: result.pagination });
});

const getById = asyncHandler(async (req, res) => {
  const bacSi = await bacSiService.getById(req.params.id);
  res.json({ success: true, data: bacSi });
});

const create = asyncHandler(async (req, res) => {
  const bacSi = await bacSiService.create(req.body);
  res.status(201).json({ success: true, message: "Tạo bác sĩ thành công", data: bacSi });
});

const update = asyncHandler(async (req, res) => {
  const bacSi = await bacSiService.update(req.params.id, req.body);
  res.json({ success: true, message: "Cập nhật bác sĩ thành công", data: bacSi });
});

const remove = asyncHandler(async (req, res) => {
  await bacSiService.remove(req.params.id);
  res.json({ success: true, message: "Xóa bác sĩ thành công" });
});

module.exports = { getAll, getById, create, update, remove };
