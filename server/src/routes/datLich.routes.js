const express = require("express");
const router = express.Router();
const datLichController = require("../controllers/datLich.controller");
const { datLichValidator, capNhatTrangThaiValidator } = require("../validators/datLich.validator");
const validate = require("../middlewares/validate");
const { authenticate, authorize } = require("../middlewares/auth");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/dat-lich - Lấy tất cả lịch hẹn (admin)
router.get("/", authenticate, authorize("admin"), asyncHandler(datLichController.getAll));

// GET /api/dat-lich/benh-nhan/:id - Lấy lịch hẹn theo bệnh nhân
router.get("/benh-nhan/:id", authenticate, asyncHandler(datLichController.getByBenhNhan));

// GET /api/dat-lich/bac-si/:id - Lấy lịch hẹn theo bác sĩ
router.get("/bac-si/:id", authenticate, asyncHandler(datLichController.getByBacSi));

// GET /api/dat-lich/:id - Lấy chi tiết lịch hẹn
router.get("/:id", authenticate, asyncHandler(datLichController.getById));

// POST /api/dat-lich - Tạo lịch hẹn mới
router.post("/", authenticate, datLichValidator, validate, asyncHandler(datLichController.create));

// PUT /api/dat-lich/:id/trang-thai - Cập nhật trạng thái (admin, bác sĩ)
router.put("/:id/trang-thai", authenticate, authorize("admin", "bac_si"), capNhatTrangThaiValidator, validate, asyncHandler(datLichController.updateTrangThai));

// DELETE /api/dat-lich/:id - Xóa lịch hẹn
router.delete("/:id", authenticate, asyncHandler(datLichController.remove));

module.exports = router;
