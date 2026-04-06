/**
 * Routes /api/chuyen-khoa — CRUD chuyên khoa; GET public, thay đổi admin.
 */
const express = require("express");
const router = express.Router();
const chuyenKhoaController = require("../controllers/chuyenKhoa.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { multerUpload } = require("../config/cloudinary.config");
const { chuyenKhoaSchema } = require("../validations/chuyenKhoa.validation");

// GET /api/chuyen-khoa - Lấy tất cả chuyên khoa (public)
router.get("/", chuyenKhoaController.getAll);

// GET /api/chuyen-khoa/:id - Lấy chi tiết (public)
router.get("/:id", chuyenKhoaController.getById);

// POST /api/chuyen-khoa - Tạo mới (admin)
router.post("/", authenticate, authorize("admin"), validate(chuyenKhoaSchema), chuyenKhoaController.create);

// PUT /api/chuyen-khoa/:id - Cập nhật (admin)
router.put("/:id", authenticate, authorize("admin"), validate(chuyenKhoaSchema), chuyenKhoaController.update);

// DELETE /api/chuyen-khoa/:id - Xóa (admin)
router.delete("/:id", authenticate, authorize("admin"), chuyenKhoaController.remove);

// PUT /api/chuyen-khoa/:id/upload-anh - Tải ảnh chuyên khoa (admin)
router.put("/:id/upload-anh", authenticate, authorize("admin"), multerUpload.single("image"), chuyenKhoaController.uploadAnh);

module.exports = router;
