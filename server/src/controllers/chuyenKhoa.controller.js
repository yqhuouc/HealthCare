/**
 * Controller chuyên khoa: map HTTP → chuyenKhoa.service, trả JSON thống nhất.
 * Lỗi từ service → asyncHandler → errorHandler.
 */
const { asyncHandler, AppError } = require("../middlewares/error.middleware");
const chuyenKhoaService = require("../services/chuyenKhoa.service");

// GET /api/chuyen-khoa — danh sách (public)
const getAll = asyncHandler(async (req, res) => {
  const chuyenKhoas = await chuyenKhoaService.getAll();
  res.json({ success: true, data: chuyenKhoas });
});

// GET /api/chuyen-khoa/:id — chi tiết + bác sĩ (public)
const getById = asyncHandler(async (req, res) => {
  const chuyenKhoa = await chuyenKhoaService.getById(req.params.id);
  res.json({ success: true, data: chuyenKhoa });
});

// POST /api/chuyen-khoa — tạo (admin, đã validate body)
const create = asyncHandler(async (req, res) => {
  const chuyenKhoa = await chuyenKhoaService.create(req.body);
  res.status(201).json({ success: true, message: "Tạo chuyên khoa thành công", data: chuyenKhoa });
});

// PUT /api/chuyen-khoa/:id — cập nhật (admin)
const update = asyncHandler(async (req, res) => {
  const chuyenKhoa = await chuyenKhoaService.update(req.params.id, req.body);
  res.json({ success: true, message: "Cập nhật chuyên khoa thành công", data: chuyenKhoa });
});

// DELETE /api/chuyen-khoa/:id — xóa nếu không còn bác sĩ (admin)
const remove = asyncHandler(async (req, res) => {
  await chuyenKhoaService.remove(req.params.id);
  res.json({ success: true, message: "Xóa chuyên khoa thành công" });
});

// PUT /api/chuyen-khoa/:id/upload-anh — tải ảnh (multipart/form-data qua Cloudinary)
const uploadAnh = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Vui lòng chọn một file ảnh để tải lên", 400);
  }
  const imageUrl = req.file.path; // do multer-storage-cloudinary gán vào
  const chuyenKhoa = await chuyenKhoaService.uploadAnh(req.params.id, imageUrl);
  res.json({ success: true, message: "Cập nhật ảnh chuyên khoa thành công", data: chuyenKhoa });
});

module.exports = { getAll, getById, create, update, remove, uploadAnh };
