/**
 * ============================================================
 * TRANG: Lịch sử đặt khám (Bệnh nhân)
 * Đường dẫn: /appointments
 * ============================================================
 *
 * Chức năng:
 * - Hiển thị tất cả lịch hẹn khám bệnh của bệnh nhân
 * - Lọc theo trạng thái bằng tabs: Tất cả / Chờ xác nhận / Đã xác nhận / Đã khám / Đã hủy
 * - Mỗi card lịch hẹn hiển thị: ảnh BS, tên BS, chuyên khoa, ngày giờ, lý do, trạng thái
 * - Nút "Hủy lịch" cho các lịch hẹn đang Chờ/Đã xác nhận
 * - Nút "Xem kết quả" cho lịch hẹn Đã khám → chuyển sang MedicalResultPage
 *
 * State:
 * - filterStatus: trạng thái đang lọc ("all" hoặc 1 trong các APPOINTMENT_STATUS)
 *
 * Dữ liệu: APPOINTMENTS, APPOINTMENT_STATUS, STATUS_CONFIG từ mockAppointments.js
 * ============================================================
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  APPOINTMENTS,
  APPOINTMENT_STATUS,
  STATUS_CONFIG,
} from "../../data/mockAppointments";
import { toast } from "react-toastify";

/** Cấu hình các tab lọc trạng thái lịch hẹn */
const FILTER_TABS = [
  { key: "all", label: "Tất cả" },
  { key: APPOINTMENT_STATUS.PENDING, label: "Chờ xác nhận" },
  { key: APPOINTMENT_STATUS.CONFIRMED, label: "Đã xác nhận" },
  { key: APPOINTMENT_STATUS.COMPLETED, label: "Đã khám" },
  { key: APPOINTMENT_STATUS.CANCELLED, label: "Đã hủy" },
];

/** Format "2026-03-15" thành "15/03/2026" */
function formatDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export default function AppointmentHistoryPage() {
  const [filterStatus, setFilterStatus] = useState("all");

  // Lọc danh sách lịch hẹn theo trạng thái
  const filteredAppointments =
    filterStatus === "all"
      ? APPOINTMENTS
      : APPOINTMENTS.filter((a) => a.status === filterStatus);

  const handleCancel = (appointmentId) => {
    toast.info(`Đã gửi yêu cầu hủy lịch hẹn #${appointmentId}`);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      {/* Tiêu đề trang */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Lịch sử đặt khám</h1>
        <div className="w-16 h-1 bg-primary rounded-full mt-2" />
      </div>

      {/* Tabs lọc trạng thái */}
      <div className="flex flex-wrap gap-2 mb-8">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer ${
              filterStatus === tab.key
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Danh sách lịch hẹn */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-slate-300">
            event_busy
          </span>
          <p className="text-slate-500 mt-4">
            Không có lịch hẹn nào
            {filterStatus !== "all" && " với trạng thái này"}.
          </p>
          <Link
            to="/doctors"
            className="inline-block mt-4 text-primary hover:underline text-sm font-medium"
          >
            Đặt lịch khám ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => {
            const statusCfg = STATUS_CONFIG[appointment.status];
            const isPendingOrConfirmed =
              appointment.status === APPOINTMENT_STATUS.PENDING ||
              appointment.status === APPOINTMENT_STATUS.CONFIRMED;
            const isCompleted =
              appointment.status === APPOINTMENT_STATUS.COMPLETED;

            return (
              <div
                key={appointment.id}
                className="bg-white border border-slate-200 rounded-lg p-6 flex items-start gap-4 hover:shadow-md transition"
              >
                {/* Ảnh bác sĩ */}
                <img
                  src={appointment.doctorImage}
                  alt={appointment.doctorName}
                  className="w-16 h-16 rounded-full object-cover shrink-0"
                />

                {/* Thông tin chi tiết */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800">
                    {appointment.doctorName}
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {appointment.specialty}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base text-slate-400">
                        calendar_month
                      </span>
                      {formatDate(appointment.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base text-slate-400">
                        schedule
                      </span>
                      {appointment.time}
                    </span>
                  </div>

                  {appointment.reason && (
                    <p className="text-sm text-slate-500 mt-2 line-clamp-1">
                      <span className="font-medium text-slate-600">Lý do:</span>{" "}
                      {appointment.reason}
                    </p>
                  )}
                </div>

                {/* Trạng thái + hành động */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusCfg.color}`}
                  >
                    {statusCfg.label}
                  </span>

                  {isPendingOrConfirmed && (
                    <button
                      onClick={() => handleCancel(appointment.id)}
                      className="px-3 py-1.5 rounded-lg border border-red-300 text-red-500 text-xs font-medium hover:bg-red-50 transition cursor-pointer"
                    >
                      Hủy lịch
                    </button>
                  )}

                  {isCompleted && (
                    <Link
                      to={`/medical-results/${appointment.id}`}
                      className="px-3 py-1.5 rounded-lg border border-primary text-primary text-xs font-medium hover:bg-primary/5 transition"
                    >
                      Xem kết quả
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
