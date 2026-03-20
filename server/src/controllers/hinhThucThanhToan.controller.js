const { asyncHandler } = require("../middlewares/error.middleware");
const hinhThucThanhToanService = require("../services/hinhThucThanhToan.service");

const getAll = asyncHandler(async (req, res) => {
  const data = await hinhThucThanhToanService.getAll();
  res.json({ success: true, data });
});

const create = asyncHandler(async (req, res) => {
  const ht = await hinhThucThanhToanService.create(req.body);
  res.status(201).json({ success: true, message: "Tạo hình thức thanh toán thành công", data: ht });
});

const remove = asyncHandler(async (req, res) => {
  await hinhThucThanhToanService.remove(req.params.id);
  res.json({ success: true, message: "Xóa hình thức thanh toán thành công" });
});

module.exports = { getAll, create, remove };
