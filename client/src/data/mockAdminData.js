/**
 * mockAdminData.js
 * Chứa các cấu hình dữ liệu dùng chung cho giao diện Admin.
 * 
 * Nội dung:
 * 1. APPOINTMENT_STATUS_CONFIG: Định nghĩa màu sắc và nhãn hiển thị cho các trạng thái lịch hẹn.
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
