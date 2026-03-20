const { asyncHandler } = require("../middlewares/error.middleware");
const chuyenKhoaService = require("../services/chuyenKhoa.service");

const getAll = asyncHandler(async (req, res) => {
  const chuyenKhoas = await chuyenKhoaService.getAll();
  res.json({ success: true, data: chuyenKhoas });
});

const getById = asyncHandler(async (req, res) => {
  const chuyenKhoa = await chuyenKhoaService.getById(req.params.id);
  res.json({ success: true, data: chuyenKhoa });
});

const create = asyncHandler(async (req, res) => {
  const chuyenKhoa = await chuyenKhoaService.create(req.body);
  res.status(201).json({ success: true, message: "Tạo chuyên khoa thành công", data: chuyenKhoa });
});

const update = asyncHandler(async (req, res) => {
  const chuyenKhoa = await chuyenKhoaService.update(req.params.id, req.body);
  res.json({ success: true, message: "Cập nhật chuyên khoa thành công", data: chuyenKhoa });
});

const remove = asyncHandler(async (req, res) => {
  await chuyenKhoaService.remove(req.params.id);
  res.json({ success: true, message: "Xóa chuyên khoa thành công" });
});

module.exports = { getAll, getById, create, update, remove };
