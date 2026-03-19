const express = require("express");
const router = express.Router();
const bacSiController = require("../controllers/bacSi.controller");
const { bacSiValidator } = require("../validators/bacSi.validator");
const validate = require("../middlewares/validate");
const { authenticate, authorize } = require("../middlewares/auth");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/bac-si - Lấy danh sách bác sĩ (public, hỗ trợ filter)
router.get("/", asyncHandler(bacSiController.getAll));

// GET /api/bac-si/:id - Lấy chi tiết bác sĩ (public)
router.get("/:id", asyncHandler(bacSiController.getById));

// POST /api/bac-si - Tạo bác sĩ mới (admin)
router.post("/", authenticate, authorize("admin"), bacSiValidator, validate, asyncHandler(bacSiController.create));

// PUT /api/bac-si/:id - Cập nhật bác sĩ (admin)
router.put("/:id", authenticate, authorize("admin"), bacSiValidator, validate, asyncHandler(bacSiController.update));

// DELETE /api/bac-si/:id - Xóa bác sĩ (admin)
router.delete("/:id", authenticate, authorize("admin"), asyncHandler(bacSiController.remove));

module.exports = router;
