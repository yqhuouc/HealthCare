/**
 * Patient Service — Gọi API bệnh nhân tới backend.
 *
 * Endpoints:
 *   GET /api/benh-nhan      — Admin lấy danh sách
 *   GET /api/benh-nhan/:id  — Admin/Chủ sở hữu lấy chi tiết
 *   PUT /api/benh-nhan/:id  — Cập nhật hồ sơ
 *   DELETE /api/benh-nhan/:id — Admin xóa
 */
import api from "./api";

export const patientService = {
  /** Lấy danh sách bệnh nhân (tích hợp phân trang, filter - Admin) */
  getAll: (params = {}) => api.get("/benh-nhan", { params }),

  /** Lấy chi tiết bệnh nhân */
  getById: (id) => api.get(`/benh-nhan/${id}`),

  /** Cập nhật thông tin bệnh nhân */
  update: (id, data) => api.put(`/benh-nhan/${id}`, data),

  /** Xóa bệnh nhân (Admin) */
  remove: (id) => api.delete(`/benh-nhan/${id}`),
};
