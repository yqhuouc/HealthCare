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
};
