/**
 * ============================================================
 * TRANG: Dashboard bác sĩ
 * Đường dẫn: /doctor/dashboard
 * ============================================================
 *
 * Chức năng:
 * - Hiển thị 4 card thống kê nhanh: lịch khám hôm nay, đã hoàn thành, chờ xác nhận, tổng BN
 * - Bảng danh sách bệnh nhân hôm nay (lọc theo ngày TODAY)
 * - Mỗi dòng: giờ khám, tên BN, SĐT, lý do, trạng thái, nút hành động
 * - Nút "Xác nhận" cho lịch Pending → chuyển sang Confirmed
 * - Nút "Hoàn thành" cho lịch Confirmed → chuyển sang Completed
 * - Nút "Chi tiết" → chuyển sang DoctorAppointmentDetailPage
 * - Responsive: mobile hiển thị card, desktop hiển thị table
 *
 * State:
 * - appointments: mảng lịch hẹn hôm nay (có thể thay đổi trạng thái inline)
 *
 * Dữ liệu: DOCTOR_APPOINTMENTS, DASHBOARD_STATS, STATUS_CONFIG, APPOINTMENT_STATUS
 *           từ mockDoctorData.js
 * ============================================================
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  DOCTOR_APPOINTMENTS,
  DASHBOARD_STATS,
  STATUS_CONFIG,
  APPOINTMENT_STATUS,
} from "../../data/mockDoctorData";

/** Ngày hiện tại dùng để lọc lịch hẹn — sẽ thay bằng Date.now() khi có backend */
const TODAY = "2026-03-12";

/** Cấu hình 4 card thống kê nhanh trên đầu trang */
const STATS_CARDS = [
  {
    label: "Lịch khám hôm nay",
    icon: "event_upcoming",
    value: DASHBOARD_STATS.todayAppointments,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    label: "Lịch đã hoàn thành",
    icon: "check_circle",
    value: DASHBOARD_STATS.completedThisWeek,
    iconBg: "bg-green-500/10",
    iconColor: "text-green-600",
  },
  {
    label: "Đang chờ xác nhận",
    icon: "pending",
    value: DASHBOARD_STATS.pendingAppointments,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600",
  },
  {
    label: "Tổng bệnh nhân",
    icon: "group",
    value: DASHBOARD_STATS.totalPatients.toLocaleString("vi-VN"),
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600",
  },
];

function DoctorDashboardPage() {
  const [appointments, setAppointments] = useState(
    DOCTOR_APPOINTMENTS.filter((a) => a.date === TODAY)
  );

  const handleConfirm = (id) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: APPOINTMENT_STATUS.CONFIRMED } : a
      )
    );
  };

  const handleComplete = (id) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: APPOINTMENT_STATUS.COMPLETED } : a
      )
    );
  };

  const getInitials = (name) => {
    const parts = name.split(" ");
    return parts.length >= 2
      ? parts[parts.length - 2][0] + parts[parts.length - 1][0]
      : parts[0][0];
  };

  const renderStatusBadge = (status) => {
    const config = STATUS_CONFIG[status];
    if (!config) return null;
    return (
      <span
        className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const renderActions = (appointment) => {
    const { id, status } = appointment;
    return (
      <div className="flex items-center gap-2">
        {status === APPOINTMENT_STATUS.PENDING && (
          <button
            onClick={() => handleConfirm(id)}
            className="min-w-[100px] px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-colors"
          >
            Xác nhận
          </button>
        )}
        {status === APPOINTMENT_STATUS.CONFIRMED && (
          <button
            onClick={() => handleComplete(id)}
            className="min-w-[100px] px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-colors"
          >
            Hoàn thành
          </button>
        )}
        <Link
          to={`/doctor/appointments/${id}`}
          className="min-w-[80px] inline-block text-center px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
        >
          Chi tiết
        </Link>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {STATS_CARDS.map((card) => (
          <div
            key={card.label}
            className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-slate-200 flex items-center gap-3 sm:gap-4"
          >
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 ${card.iconBg}`}
            >
              <span className={`material-symbols-outlined text-xl sm:text-2xl ${card.iconColor}`}>
                {card.icon}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold text-slate-900">{card.value}</p>
              <p className="text-xs sm:text-sm text-slate-500 truncate">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Danh sách bệnh nhân hôm nay
          </h2>
          <Link
            to="/doctor/appointments"
            className="text-sm text-primary font-semibold hover:underline"
          >
            Xem tất cả
          </Link>
        </div>

        {/* Mobile card view */}
        <div className="block md:hidden divide-y divide-slate-100">
          {appointments.map((appt) => (
            <div key={appt.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                    {getInitials(appt.patientName)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{appt.patientName}</p>
                    <p className="text-xs text-slate-500">{appt.patientAge} tuổi &middot; {appt.patientGender}</p>
                  </div>
                </div>
                {renderStatusBadge(appt.status)}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                  {appt.time}
                </span>
                <span>{appt.patientPhone}</span>
              </div>
              <p className="text-xs text-slate-500 truncate">{appt.reason}</p>
              <div>{renderActions(appt)}</div>
            </div>
          ))}
        </div>

        {/* Desktop table view */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-3 text-left text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                  Giờ khám
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                  Bệnh nhân
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                  Số điện thoại
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                  Lý do khám
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map((appt) => (
                <tr
                  key={appt.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-primary font-semibold whitespace-nowrap">
                    {appt.time}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                        {getInitials(appt.patientName)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {appt.patientName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {appt.patientAge} tuổi &middot; {appt.patientGender}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {appt.patientPhone}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-[200px] truncate">
                    {appt.reason}
                  </td>
                  <td className="px-6 py-4">
                    {renderStatusBadge(appt.status)}
                  </td>
                  <td className="px-6 py-4">{renderActions(appt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 sm:px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs sm:text-sm text-slate-500">
            Hiển thị {appointments.length} / {appointments.length} lịch hẹn
          </p>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold bg-primary text-white">
              1
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboardPage;
