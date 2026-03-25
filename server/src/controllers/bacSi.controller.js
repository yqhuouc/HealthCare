/**
 * Controller bác sĩ: CRUD + phân trang/lọc qua query (service xử lý).
 * Lỗi → asyncHandler → errorHandler.
 */
const { asyncHandler } = require("../middlewares/error.middleware");
const bacSiService = require("../services/bacSi.service");

// GET /api/bac-si — danh sách + pagination (public)
const getAll = asyncHandler(async (req, res) => {
  const result = await bacSiService.getAll(req.query);
  res.json({ success: true, data: result.bacSiList, pagination: result.pagination });
});

// GET /api/bac-si/:id — chi tiết (public)
const getById = asyncHandler(async (req, res) => {
  const bacSi = await bacSiService.getById(req.params.id);
  res.json({ success: true, data: bacSi });
});

// POST /api/bac-si — tạo (admin)
const create = asyncHandler(async (req, res) => {
  const bacSi = await bacSiService.create(req.body);
  res.status(201).json({ success: true, message: "Tạo bác sĩ thành công", data: bacSi });
});

// PUT /api/bac-si/:id — cập nhật (admin)
const update = asyncHandler(async (req, res) => {
  const bacSi = await bacSiService.update(req.params.id, req.body);
  res.json({ success: true, message: "Cập nhật bác sĩ thành công", data: bacSi });
});

// DELETE /api/bac-si/:id — xóa (admin)
const remove = asyncHandler(async (req, res) => {
  await bacSiService.remove(req.params.id);
  res.json({ success: true, message: "Xóa bác sĩ thành công" });
});

module.exports = { getAll, getById, create, update, remove };
