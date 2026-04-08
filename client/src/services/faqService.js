/**
 * FAQ Service — Gọi API câu hỏi thường gặp tới backend.
 *
 * Endpoints:
 *   GET /api/cau-hoi-thuong-gap  — Danh sách FAQ đang hoạt động
 */
import api from "./api";

export const faqService = {
  /** Lấy danh sách FAQ đang hoạt động (dangHoatDong = 1) */
  getAll: () => api.get("/cau-hoi-thuong-gap"),

  // ===== ADMIN PORTAL =====

  /** Lấy tất cả FAQ (bao gồm cả bị ẩn) (admin) */
  getAllAdmin: (params = {}) => api.get("/cau-hoi-thuong-gap/all", { params }),

  /** Tạo FAQ mới (admin) */
  create: (data) => api.post("/cau-hoi-thuong-gap", data),

  /** Cập nhật FAQ (admin) */
  update: (id, data) => api.put(`/cau-hoi-thuong-gap/${id}`, data),

  /** Xóa FAQ (admin) */
  remove: (id) => api.delete(`/cau-hoi-thuong-gap/${id}`),
};
