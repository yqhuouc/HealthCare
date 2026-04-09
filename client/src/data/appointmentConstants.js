/**
 * appointmentConstants.js
 * ============================================================
 * Hằng số cấu hình trạng thái lịch hẹn dùng chung cho toàn bộ hệ thống.
 * File này được sử dụng bởi cả 3 portal: Admin, Doctor, và Patient
 * nhằm đảm bảo tính nhất quán về màu sắc và nhãn hiển thị.
 *
 * Mapping trạng thái (Backend → Frontend):
 *   0 → pending    (Chờ xác nhận)
 *   1 → confirmed  (Đã xác nhận)
 *   2 → completed  (Đã hoàn thành)
 *   3 → cancelled  (Đã hủy bỏ)
 * ============================================================
 */

export const APPOINTMENT_STATUS_CONFIG = {
  pending: {
    label: "Chờ xác nhận",
    className: "bg-amber-50 text-amber-700 border border-amber-100",
  },
  confirmed: {
    label: "Đã xác nhận",
    className: "bg-blue-50 text-blue-700 border border-blue-100",
  },
  completed: {
    label: "Đã hoàn thành",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  },
  cancelled: {
    label: "Đã hủy bỏ",
    className: "bg-rose-50 text-rose-700 border border-rose-100",
  },
};
