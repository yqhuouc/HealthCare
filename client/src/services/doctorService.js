/**
 * Doctor Service — Gọi API bác sĩ tới backend.
 *
 * Endpoints:
 *   GET /api/bac-si              — Danh sách (filter, phân trang)
 *   GET /api/bac-si/:id          — Chi tiết bác sĩ
 */
import api from "./api";

export const doctorService = {
  /**
   * Lấy danh sách bác sĩ, hỗ trợ filter + phân trang.
   * @param {Object} params - { chuyenKhoaId, search, page, limit }
   * @returns {{ data: { bacSiList, pagination } }}
   */
  getAll: (params = {}) => api.get("/bac-si", { params }),

  /**
   * Lấy chi tiết 1 bác sĩ (kèm chuyenKhoa + taiKhoan).
   * @param {number|string} id
   */
  getById: (id) => api.get(`/bac-si/${id}`),
};
