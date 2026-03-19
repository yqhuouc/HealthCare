/**
 * Router gốc - Gom tất cả route modules vào đây.
 * Mỗi module được mount tại 1 prefix riêng.
 */
const express = require("express");
const router = express.Router();

// Health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server đang hoạt động!",
    timestamp: new Date().toISOString(),
  });
});

// Mount các route modules
router.use("/auth", require("./auth.routes"));
router.use("/chuyen-khoa", require("./chuyenKhoa.routes"));
router.use("/bac-si", require("./bacSi.routes"));
router.use("/benh-nhan", require("./benhNhan.routes"));
router.use("/dat-lich", require("./datLich.routes"));
router.use("/lich-lam-viec", require("./lichLamViec.routes"));
router.use("/don-thuoc", require("./donThuoc.routes"));
router.use("/cau-hoi-thuong-gap", require("./cauHoiThuongGap.routes"));
router.use("/hinh-thuc-thanh-toan", require("./hinhThucThanhToan.routes"));

module.exports = router;
