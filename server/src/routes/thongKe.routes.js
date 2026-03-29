/**
 * Routes /api/thong-ke — thống kê dashboard (chỉ admin).
 */
const express = require("express");
const router = express.Router();
const thongKeController = require("../controllers/thongKe.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

// GET /api/thong-ke/tong-quan - Dashboard tổng quan (admin)
router.get("/tong-quan", authenticate, authorize("admin"), thongKeController.tongQuan);

// GET /api/thong-ke/lich-hen - Thống kê lịch hẹn (admin)
router.get("/lich-hen", authenticate, authorize("admin"), thongKeController.thongKeLichHen);

// GET /api/thong-ke/doanh-thu - Thống kê doanh thu theo tháng (admin)
router.get("/doanh-thu", authenticate, authorize("admin"), thongKeController.thongKeDoanhThu);

module.exports = router;
