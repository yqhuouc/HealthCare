const express = require("express");
const router = express.Router();
const benhNhanController = require("../controllers/benhNhan.controller");
const { benhNhanValidator } = require("../validators/benhNhan.validator");
const validate = require("../middlewares/validate");
const { authenticate, authorize } = require("../middlewares/auth");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/benh-nhan - Lấy danh sách bệnh nhân (admin)
router.get("/", authenticate, authorize("admin"), asyncHandler(benhNhanController.getAll));

// GET /api/benh-nhan/:id - Lấy chi tiết bệnh nhân
router.get("/:id", authenticate, asyncHandler(benhNhanController.getById));

// PUT /api/benh-nhan/:id - Cập nhật thông tin bệnh nhân
router.put("/:id", authenticate, benhNhanValidator, validate, asyncHandler(benhNhanController.update));

// DELETE /api/benh-nhan/:id - Xóa bệnh nhân (admin)
router.delete("/:id", authenticate, authorize("admin"), asyncHandler(benhNhanController.remove));

module.exports = router;
