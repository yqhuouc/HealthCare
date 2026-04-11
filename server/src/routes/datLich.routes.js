/**
 * Routes /api/dat-lich — đặt lịch, xem theo bệnh nhân/bác sĩ, slot trống, cập nhật trạng thái, xóa.
 */
const express = require("express");
const router = express.Router();
const datLichController = require("../controllers/datLich.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {
  createDatLichSchema,
  updateTrangThaiSchema,
  updateThanhToanSchema,
} = require("../validations/datLich.validation");

// GET /api/dat-lich/slot-trong?bacSiId=1&ngayDat=2026-03-27 — Lấy slot trống (public)
router.get("/slot-trong", datLichController.getSlotTrong);

// GET /api/dat-lich - Lấy tất cả lịch hẹn (admin)
router.get("/", authenticate, authorize("admin"), datLichController.getAll);

// GET /api/dat-lich/benh-nhan/:id - Lấy lịch hẹn theo bệnh nhân
router.get("/benh-nhan/:id", authenticate, datLichController.getByBenhNhan);

// GET /api/dat-lich/bac-si/:id - Lấy lịch hẹn theo bác sĩ
router.get("/bac-si/:id", authenticate, datLichController.getByBacSi);

// GET /api/dat-lich/:id - Lấy chi tiết lịch hẹn
router.get("/:id", authenticate, datLichController.getById);

// POST /api/dat-lich - Tạo lịch hẹn mới
router.post(
  "/",
  authenticate,
  validate(createDatLichSchema),
  datLichController.create,
);

// PUT /api/dat-lich/:id/trang-thai - Cập nhật trạng thái (admin, bác sĩ)
router.put(
  "/:id/trang-thai",
  authenticate,
  authorize("admin", "bac_si"),
  validate(updateTrangThaiSchema),
  datLichController.updateTrangThai,
);

// PUT /api/dat-lich/:id/thanh-toan - Cập nhật trạng thái thanh toán (admin)
router.put(
  "/:id/thanh-toan",
  authenticate,
  authorize("admin"),
  validate(updateThanhToanSchema),
  datLichController.updateThanhToan,
);

// DELETE /api/dat-lich/:id - Xóa lịch hẹn
router.delete("/:id", authenticate, datLichController.remove);

// PATCH /api/dat-lich/:id/payment-method - Đổi phương thức thanh toán (Bệnh nhân)
router.patch("/:id/payment-method", authenticate, datLichController.changePaymentMethod);

module.exports = router;

