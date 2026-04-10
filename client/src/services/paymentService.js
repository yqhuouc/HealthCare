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

  /** Tạo hình thức thanh toán mới (Admin) */
  create: (data) => api.post("/hinh-thuc-thanh-toan", data),

  /** Xóa hình thức thanh toán (Admin) */
  remove: (id) => api.delete(`/hinh-thuc-thanh-toan/${id}`),

  /** Tạo link thanh toán VNPay */
  createVnpayPayment: (data) => api.post("/vnpay/create-payment", data),
};
