/**
 * Controller thống kê dashboard: chỉ admin; dữ liệu gom ở thongKe.service.
 * Lỗi → asyncHandler → errorHandler.
 */
const { asyncHandler } = require("../middlewares/error.middleware");
const thongKeService = require("../services/thongKe.service");

// GET /api/thong-ke/tong-quan — số liệu tổng (bệnh nhân, bác sĩ, lịch, doanh thu, ...)
const tongQuan = asyncHandler(async (req, res) => {
  const data = await thongKeService.tongQuan();
  res.json({ success: true, data });
});

// GET /api/thong-ke/lich-hen — thống kê lịch hẹn theo filter query
const thongKeLichHen = asyncHandler(async (req, res) => {
  const data = await thongKeService.thongKeLichHen(req.query);
  res.json({ success: true, data });
});

// GET /api/thong-ke/doanh-thu?nam=2026 — thống kê doanh thu theo 12 tháng
const thongKeDoanhThu = asyncHandler(async (req, res) => {
  const data = await thongKeService.thongKeDoanhThuTheoThang(req.query.nam);
  res.json({ success: true, data });
});

module.exports = { tongQuan, thongKeLichHen, thongKeDoanhThu };
