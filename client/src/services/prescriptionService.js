/**
 * Prescription Service — Gọi API đơn thuốc tới backend.
 *
 * Endpoints:
 *   POST /api/don-thuoc       — Tạo đơn thuốc (bác sĩ)
 *   PUT  /api/don-thuoc/:id   — Cập nhật đơn thuốc (bác sĩ/admin)
 *   GET  /api/don-thuoc/:id   — Chi tiết đơn thuốc
 */
import api from "./api";

export const prescriptionService = {
  /**
   * Tạo đơn thuốc cho một lịch hẹn đã khám (trangThai = 2).
   * @param {Object} data - { datLichId, chanDoan, ghiChu, chiTietDonThuoc: [...] }
   */
  create: (data) => api.post("/don-thuoc", data),

  /**
   * Cập nhật đơn thuốc (sửa chẩn đoán, thay đổi thuốc).
   * @param {number|string} id - ID đơn thuốc
   * @param {Object} data - { chanDoan, ghiChu, chiTietDonThuoc: [...] }
   */
  update: (id, data) => api.put(`/don-thuoc/${id}`, data),

  /**
   * Lấy chi tiết đơn thuốc.
   * @param {number|string} id - ID đơn thuốc
   */
  getById: (id) => api.get(`/don-thuoc/${id}`),
};
