/**
 * Specialty Service — Gọi API chuyên khoa tới backend.
 *
 * Endpoints:
 *   GET /api/chuyen-khoa        — Danh sách (kèm _count.bacSiList)
 *   GET /api/chuyen-khoa/:id    — Chi tiết (kèm bacSiList)
 */
import api from "./api";

export const specialtyService = {
  /** Lấy tất cả chuyên khoa, mỗi phần tử kèm `_count.bacSiList` */
  getAll: () => api.get("/chuyen-khoa"),

  /** Lấy chi tiết 1 chuyên khoa + danh sách bác sĩ thuộc khoa đó */
  getById: (id) => api.get(`/chuyen-khoa/${id}`),

  // ===== ADMIN PORTAL =====

  /** Tạo chuyên khoa mới (admin) */
  create: (data) => api.post("/chuyen-khoa", data),

  /** Cập nhật chuyên khoa (admin) */
  update: (id, data) => api.put(`/chuyen-khoa/${id}`, data),

  /** Xóa chuyên khoa (admin) */
  remove: (id) => api.delete(`/chuyen-khoa/${id}`),

  /** Tải ảnh lên cho chuyên khoa (admin) */
  uploadAnh: (id, file) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.put(`/chuyen-khoa/${id}/upload-anh`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
