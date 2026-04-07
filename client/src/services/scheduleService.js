/**
 * Schedule Service — Gọi API lịch làm việc & khung giờ tới backend.
 *
 * Endpoints:
 *   GET    /api/lich-lam-viec?bacSiId=X       — DS lịch làm việc theo bác sĩ
 *   POST   /api/lich-lam-viec                 — Tạo ca làm việc mới
 *   PUT    /api/lich-lam-viec/:id             — Cập nhật ca (sanSang, soBenhNhanToiDa)
 *   DELETE /api/lich-lam-viec/:id             — Xóa ca làm việc
 *   GET    /api/lich-lam-viec/khung-gio       — DS khung giờ master
 */
import api from "./api";

export const scheduleService = {
  /** Lấy danh sách lịch làm việc (filter theo bacSiId và/hoặc ngayLamViec) */
  getLichLamViec: (params = {}) =>
    api.get("/lich-lam-viec", { params }),

  /** Tạo ca làm việc mới cho bác sĩ */
  createLichLamViec: (data) => api.post("/lich-lam-viec", data),

  /** Cập nhật ca làm việc (VD: tắt/mở sanSang, điều chỉnh soBenhNhanToiDa) */
  updateLichLamViec: (id, data) => api.put(`/lich-lam-viec/${id}`, data),

  /** Xóa ca làm việc (chỉ khi chưa có bệnh nhân đặt trong ca) */
  deleteLichLamViec: (id) => api.delete(`/lich-lam-viec/${id}`),

  /** Lấy tất cả khung giờ master (Ca Sáng, Ca Chiều, Ca Tối...) */
  getAllKhungGio: () => api.get("/lich-lam-viec/khung-gio"),
};
