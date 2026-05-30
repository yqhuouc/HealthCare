/**
 * Controller bệnh nhân: danh sách admin; chi tiết/cập nhật theo quyền trong service.
 * Lỗi → asyncHandler → errorHandler.
 */
const { asyncHandler } = require("../middlewares/error.middleware");
const benhNhanService = require("../services/benhNhan.service");

// GET /api/benh-nhan — danh sách + pagination (admin)
const getAll = asyncHandler(async (req, res) => {
  const result = await benhNhanService.getAll(req.query);
  res.json({ success: true, data: result.benhNhans, pagination: result.pagination });
});

// GET /api/benh-nhan/:id — chi tiết (đăng nhập)
const getById = asyncHandler(async (req, res) => {
  const benhNhan = await benhNhanService.getById(req.params.id, req.user);
  res.json({ success: true, data: benhNhan });
});

// PUT /api/benh-nhan/:id — cập nhật (truyền req.user để service kiểm tra quyền)
const update = asyncHandler(async (req, res) => {
  const benhNhan = await benhNhanService.update(req.params.id, req.body, req.user);
  res.json({ success: true, message: "Cập nhật bệnh nhân thành công", data: benhNhan });
});

// DELETE /api/benh-nhan/:id — xóa (admin)
const remove = asyncHandler(async (req, res) => {
  await benhNhanService.remove(req.params.id);
  res.json({ success: true, message: "Xóa bệnh nhân thành công" });
});

// POST /api/benh-nhan — tạo bệnh nhân mới (admin)
const create = asyncHandler(async (req, res) => {
  const benhNhan = await benhNhanService.create(req.body);
  res.status(201).json({
    success: true,
    message: "Tạo hồ sơ bệnh nhân thành công",
    data: benhNhan,
  });
});

module.exports = { getAll, getById, update, remove, create };
