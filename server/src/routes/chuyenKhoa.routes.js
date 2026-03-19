const express = require("express");
const router = express.Router();
const chuyenKhoaController = require("../controllers/chuyenKhoa.controller");
const { chuyenKhoaValidator } = require("../validators/chuyenKhoa.validator");
const validate = require("../middlewares/validate");
const { authenticate, authorize } = require("../middlewares/auth");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/chuyen-khoa - Lấy tất cả chuyên khoa (public)
router.get("/", asyncHandler(chuyenKhoaController.getAll));

// GET /api/chuyen-khoa/:id - Lấy chi tiết (public)
router.get("/:id", asyncHandler(chuyenKhoaController.getById));

// POST /api/chuyen-khoa - Tạo mới (admin)
router.post("/", authenticate, authorize("admin"), chuyenKhoaValidator, validate, asyncHandler(chuyenKhoaController.create));

// PUT /api/chuyen-khoa/:id - Cập nhật (admin)
router.put("/:id", authenticate, authorize("admin"), chuyenKhoaValidator, validate, asyncHandler(chuyenKhoaController.update));

// DELETE /api/chuyen-khoa/:id - Xóa (admin)
router.delete("/:id", authenticate, authorize("admin"), asyncHandler(chuyenKhoaController.remove));

module.exports = router;
