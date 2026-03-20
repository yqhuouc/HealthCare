const { asyncHandler } = require("../middlewares/error.middleware");
const donThuocService = require("../services/donThuoc.service");

const getAll = asyncHandler(async (req, res) => {
  const result = await donThuocService.getAll(req.query);
  res.json({ success: true, data: result.donThuocs, pagination: result.pagination });
});

const getById = asyncHandler(async (req, res) => {
  const donThuoc = await donThuocService.getById(req.params.id);
  res.json({ success: true, data: donThuoc });
});

const create = asyncHandler(async (req, res) => {
  const donThuoc = await donThuocService.create(req.body);
  res.status(201).json({ success: true, message: "Tạo đơn thuốc thành công", data: donThuoc });
});

const remove = asyncHandler(async (req, res) => {
  await donThuocService.remove(req.params.id);
  res.json({ success: true, message: "Xóa đơn thuốc thành công" });
});

module.exports = { getAll, getById, create, remove };
