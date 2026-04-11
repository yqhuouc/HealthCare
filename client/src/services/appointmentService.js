/**
 * Appointment Service — Gọi API lịch hẹn tới backend.
 *
 * Endpoints:
 *   GET  /api/dat-lich/slot-trong?bacSiId=X&ngayDat=YYYY-MM-DD — Slot trống
 *   GET  /api/dat-lich/benh-nhan/:benhNhanId                   — Lịch sử bệnh nhân
 *   GET  /api/dat-lich/:id                                     — Chi tiết lịch hẹn
 *   POST /api/dat-lich                                         — Tạo lịch hẹn
 *   DELETE /api/dat-lich/:id                                   — Xóa lịch hẹn
 */
import api from "./api";

export const appointmentService = {
  /** Lấy danh sách slot trống theo bác sĩ và ngày */
  getSlotTrong: (bacSiId, ngayDat) =>
    api.get("/dat-lich/slot-trong", { params: { bacSiId, ngayDat } }),

  /** Lấy lịch sử đặt khám của một bệnh nhân */
  getByBenhNhan: (benhNhanId) =>
    api.get(`/dat-lich/benh-nhan/${benhNhanId}`),

  /** Lấy chi tiết một lịch hẹn (kèm đơn thuốc, bác sĩ, bệnh nhân) */
  getById: (id) => api.get(`/dat-lich/${id}`),

  /** Tạo lịch hẹn mới */
  create: (data) => api.post("/dat-lich", data),

  /** Xóa lịch hẹn (soft: chuyển trạng thái hủy hoặc hard delete) */
  remove: (id) => api.delete(`/dat-lich/${id}`),

  // ===== DOCTOR PORTAL =====

  /** Lấy tất cả lịch hẹn của một bác sĩ (Data Ownership) */
  getByBacSi: (bacSiId) => api.get(`/dat-lich/bac-si/${bacSiId}`),

  /** Cập nhật trạng thái lịch hẹn (0=Chờ, 1=Xác nhận, 2=Đã khám, 3=Hủy) */
  updateTrangThai: (id, trangThai) =>
    api.put(`/dat-lich/${id}/trang-thai`, { trangThai }),

  // ===== ADMIN PORTAL =====

  /** Lấy danh sách tất cả lịch hẹn (admin) */
  getAllForAdmin: (params = {}) => api.get("/dat-lich", { params }),

  /** Cập nhật trạng thái thanh toán (admin) */
  updateThanhToan: (id, trangThaiThanhToan) =>
    api.put(`/dat-lich/${id}/thanh-toan`, { trangThaiThanhToan }),

  /** Đổi phương thức thanh toán (Bệnh nhân) */
  changePaymentMethod: (id, hinhThucThanhToanId) =>
    api.patch(`/dat-lich/${id}/payment-method`, { hinhThucThanhToanId }),
};

