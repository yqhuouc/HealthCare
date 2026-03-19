/**
 * Appointment Service - Đặt lịch, lấy lịch sử, hủy lịch
 * TODO: Kết nối với API backend thật (POST /api/appointments, GET /api/appointments/my)
 */
import { APPOINTMENTS } from "../data/mockAppointments";

export const appointmentService = {
  /** Lấy danh sách lịch hẹn của bệnh nhân đang đăng nhập */
  getMyAppointments: async () => {
    // TODO: return api.get("/appointments/my");
    return [...APPOINTMENTS];
  },

  /** Tạo lịch hẹn mới */
  create: async (data) => {
    // TODO: return api.post("/appointments", data);
    return { id: Date.now(), ...data, status: "pending" };
  },

  /** Hủy lịch hẹn */
  cancel: async (id) => {
    // TODO: return api.patch(`/appointments/${id}/cancel`);
    return { message: "Đã hủy lịch hẹn thành công." };
  },
};
