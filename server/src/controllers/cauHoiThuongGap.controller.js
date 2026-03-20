const { asyncHandler } = require("../middlewares/error.middleware");
const cauHoiThuongGapService = require("../services/cauHoiThuongGap.service");

const getActive = asyncHandler(async (req, res) => {
  const faqs = await cauHoiThuongGapService.getActive();
  res.json({ success: true, data: faqs });
});

const getAll = asyncHandler(async (req, res) => {
  const result = await cauHoiThuongGapService.getAll(req.query);
  res.json({ success: true, data: result.faqs, pagination: result.pagination });
});

const getById = asyncHandler(async (req, res) => {
  const faq = await cauHoiThuongGapService.getById(req.params.id);
  res.json({ success: true, data: faq });
});

const create = asyncHandler(async (req, res) => {
  const faq = await cauHoiThuongGapService.create(req.body);
  res.status(201).json({ success: true, message: "Tạo FAQ thành công", data: faq });
});

const update = asyncHandler(async (req, res) => {
  const faq = await cauHoiThuongGapService.update(req.params.id, req.body);
  res.json({ success: true, message: "Cập nhật FAQ thành công", data: faq });
});

const remove = asyncHandler(async (req, res) => {
  await cauHoiThuongGapService.remove(req.params.id);
  res.json({ success: true, message: "Xóa FAQ thành công" });
});

module.exports = { getActive, getAll, getById, create, update, remove };
