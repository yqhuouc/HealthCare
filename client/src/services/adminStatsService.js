/**
 * Admin Stats Service — Gọi API thống kê dashboard tới backend.
 *
 * Endpoints:
 *   GET /api/thong-ke/tong-quan
 *   GET /api/thong-ke/lich-hen
 *   GET /api/thong-ke/doanh-thu
 */
import api from "./api";

export const adminStatsService = {
  /** Lấy các con số thống kê tổng lượng Bác sĩ, Bệnh nhân, Lịch khám */
  getTongQuan: () => api.get("/thong-ke/tong-quan"),

  /** Lấy dữ liệu biểu đồ trạng thái lịch hẹn */
  getLichHenStats: (query = {}) => api.get("/thong-ke/lich-hen", { params: query }),

  /** Lấy dữ liệu biểu đồ doanh thu theo năm */
  getDoanhThuStats: (query = {}) => api.get("/thong-ke/doanh-thu", { params: query }),
};
