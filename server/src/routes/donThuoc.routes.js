const express = require("express");
const router = express.Router();
const donThuocController = require("../controllers/donThuoc.controller");
const { donThuocValidator } = require("../validators/donThuoc.validator");
const validate = require("../middlewares/validate");
const { authenticate, authorize } = require("../middlewares/auth");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/don-thuoc - Lấy tất cả đơn thuốc (admin, bác sĩ)
router.get("/", authenticate, authorize("admin", "bac_si"), asyncHandler(donThuocController.getAll));

// GET /api/don-thuoc/:id - Lấy chi tiết đơn thuốc
router.get("/:id", authenticate, asyncHandler(donThuocController.getById));

// POST /api/don-thuoc - Tạo đơn thuốc (bác sĩ)
router.post("/", authenticate, authorize("bac_si"), donThuocValidator, validate, asyncHandler(donThuocController.create));

// DELETE /api/don-thuoc/:id - Xóa đơn thuốc (admin)
router.delete("/:id", authenticate, authorize("admin"), asyncHandler(donThuocController.remove));

module.exports = router;
