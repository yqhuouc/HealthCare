const express = require("express");
const router = express.Router();
const vnpayController = require("../controllers/vnpay.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// POST /api/vnpay/create-payment - Tạo link thanh toán
router.post("/create-payment", authenticate, vnpayController.createPayment);

// GET /api/vnpay/return - VNPay redirect bệnh nhân về (Thông báo KQ)
router.get("/return", vnpayController.vnpayReturn);

// GET /api/vnpay/ipn - VNPay gọi thông báo kết quả (Auto-update DB)
router.get("/ipn", vnpayController.vnpayIpn);

// POST /api/vnpay/verify - Xác thực chủ động từ Frontend
router.post("/verify", vnpayController.verifyPayment);

module.exports = router;

