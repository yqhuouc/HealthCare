const express = require("express");
const router = express.Router();
const hinhThucThanhToanController = require("../controllers/hinhThucThanhToan.controller");
const { authenticate, authorize } = require("../middlewares/auth");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/hinh-thuc-thanh-toan - Lấy danh sách hình thức thanh toán (public)
router.get("/", asyncHandler(hinhThucThanhToanController.getAll));

// POST /api/hinh-thuc-thanh-toan - Tạo mới (admin)
router.post("/", authenticate, authorize("admin"), asyncHandler(hinhThucThanhToanController.create));

// DELETE /api/hinh-thuc-thanh-toan/:id - Xóa (admin)
router.delete("/:id", authenticate, authorize("admin"), asyncHandler(hinhThucThanhToanController.remove));

module.exports = router;
