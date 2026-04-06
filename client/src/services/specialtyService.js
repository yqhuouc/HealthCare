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
};
