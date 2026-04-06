/**
 * Payment Service — Gọi API hình thức thanh toán tới backend.
 *
 * Endpoints:
 *   GET /api/hinh-thuc-thanh-toan — Danh sách hình thức thanh toán (public)
 */
import api from "./api";

export const paymentService = {
  /** Lấy tất cả hình thức thanh toán */
  getAll: () => api.get("/hinh-thuc-thanh-toan"),
};
