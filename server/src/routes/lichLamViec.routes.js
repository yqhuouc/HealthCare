const express = require("express");
const router = express.Router();
const lichLamViecController = require("../controllers/lichLamViec.controller");
const { khungGioValidator, lichLamViecValidator } = require("../validators/lichLamViec.validator");
const validate = require("../middlewares/validate");
const { authenticate, authorize } = require("../middlewares/auth");
const asyncHandler = require("../utils/asyncHandler");

// ===== KHUNG GIỜ =====

// GET /api/lich-lam-viec/khung-gio - Lấy tất cả khung giờ (public)
router.get("/khung-gio", asyncHandler(lichLamViecController.getAllKhungGio));

// POST /api/lich-lam-viec/khung-gio - Tạo khung giờ (admin)
router.post("/khung-gio", authenticate, authorize("admin"), khungGioValidator, validate, asyncHandler(lichLamViecController.createKhungGio));

// DELETE /api/lich-lam-viec/khung-gio/:id - Xóa khung giờ (admin)
router.delete("/khung-gio/:id", authenticate, authorize("admin"), asyncHandler(lichLamViecController.deleteKhungGio));

// ===== LỊCH LÀM VIỆC =====

// GET /api/lich-lam-viec - Lấy lịch làm việc (public, filter theo bacSiId + ngayLamViec)
router.get("/", asyncHandler(lichLamViecController.getLichLamViec));

// POST /api/lich-lam-viec - Tạo lịch làm việc (admin, bác sĩ)
router.post("/", authenticate, authorize("admin", "bac_si"), lichLamViecValidator, validate, asyncHandler(lichLamViecController.createLichLamViec));

// PUT /api/lich-lam-viec/:id - Cập nhật (admin, bác sĩ)
router.put("/:id", authenticate, authorize("admin", "bac_si"), asyncHandler(lichLamViecController.updateLichLamViec));

// DELETE /api/lich-lam-viec/:id - Xóa (admin, bác sĩ)
router.delete("/:id", authenticate, authorize("admin", "bac_si"), asyncHandler(lichLamViecController.deleteLichLamViec));

module.exports = router;
