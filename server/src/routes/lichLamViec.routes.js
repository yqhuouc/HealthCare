/**
 * Routes /api/lich-lam-viec — khung giờ master + lịch làm việc theo bác sĩ.
 */
const express = require("express");
const router = express.Router();
const lichLamViecController = require("../controllers/lichLamViec.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { khungGioSchema, lichLamViecSchema, updateLichLamViecSchema } = require("../validations/lichLamViec.validation");

// ===== KHUNG GIỜ =====

// GET /api/lich-lam-viec/khung-gio - Lấy tất cả khung giờ (public)
router.get("/khung-gio", lichLamViecController.getAllKhungGio);

// POST /api/lich-lam-viec/khung-gio - Tạo khung giờ (admin)
router.post("/khung-gio", authenticate, authorize("admin"), validate(khungGioSchema), lichLamViecController.createKhungGio);

// DELETE /api/lich-lam-viec/khung-gio/:id - Xóa khung giờ (admin)
router.delete("/khung-gio/:id", authenticate, authorize("admin"), lichLamViecController.deleteKhungGio);

// ===== LỊCH LÀM VIỆC =====

// GET /api/lich-lam-viec - Lấy lịch làm việc (public)
router.get("/", lichLamViecController.getLichLamViec);

// POST /api/lich-lam-viec - Tạo lịch làm việc (admin, bác sĩ)
router.post("/", authenticate, authorize("admin", "bac_si"), validate(lichLamViecSchema), lichLamViecController.createLichLamViec);

// PUT /api/lich-lam-viec/:id - Cập nhật (admin, bác sĩ)
router.put("/:id", authenticate, authorize("admin", "bac_si"), validate(updateLichLamViecSchema), lichLamViecController.updateLichLamViec);

// DELETE /api/lich-lam-viec/:id - Xóa (admin, bác sĩ)
router.delete("/:id", authenticate, authorize("admin", "bac_si"), lichLamViecController.deleteLichLamViec);

module.exports = router;
