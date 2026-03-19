/**
 * ============================================================
 * TRANG: Dashboard quản trị (Admin)
 * Đường dẫn: /admin/dashboard
 * ============================================================
 *
 * Chức năng:
 * - 4 card thống kê tổng quan: tổng BS, tổng BN, tổng lịch khám, lịch khám hôm nay
 *   (mỗi card có badge % tăng/giảm so với kỳ trước)
 * - Biểu đồ cột: thống kê lịch khám theo tháng (CSS bar chart)
 *   + Dropdown chọn năm (2023-2026)
 * - Bảng 5 lịch khám gần nhất: BN, BS, ngày, trạng thái
 *   + Link "Xem tất cả" → /admin/appointments
 * - Responsive: mobile card view, desktop table view
 *
 * State:
 * - year: năm đang hiển thị trên biểu đồ (mặc định năm hiện tại)
 *
 * Dữ liệu: ADMIN_STATS, RECENT_APPOINTMENTS, APPOINTMENT_STATUS_CONFIG,
 *           CHART_DATA từ mockAdminData.js
 * ============================================================
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ADMIN_STATS,
  RECENT_APPOINTMENTS,
  APPOINTMENT_STATUS_CONFIG,
  CHART_DATA,
} from "../../data/mockAdminData";

/** Cấu hình 4 card thống kê tổng quan hiển thị trên đầu trang */
const STATS_CARDS = [
  {
    label: "Tổng số bác sĩ",
    value: ADMIN_STATS.totalDoctors,
    icon: "stethoscope",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    badge: ADMIN_STATS.doctorGrowth,
    badgeGreen: true,
  },
  {
    label: "Tổng số bệnh nhân",
    value: ADMIN_STATS.totalPatients.toLocaleString("vi-VN"),
    icon: "groups",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    badge: ADMIN_STATS.patientGrowth,
    badgeGreen: true,
  },
  {
    label: "Tổng số lịch khám",
    value: ADMIN_STATS.totalAppointments.toLocaleString("vi-VN"),
    icon: "book_online",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
    badge: ADMIN_STATS.appointmentGrowth,
    badgeGreen: false,
  },
  {
    label: "Lịch khám hôm nay",
    value: ADMIN_STATS.todayAppointments,
    icon: "event_available",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    badge: ADMIN_STATS.todayGrowth,
    badgeGreen: true,
  },
];

function AdminDashboardPage() {
  const [year, setYear] = useState(new Date().getFullYear());

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {STATS_CARDS.map((card) => (
          <div
            key={card.label}
            className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-slate-200"
          >
            <div className="flex items-start justify-between gap-2">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 ${card.iconBg}`}
              >
                <span
                  className={`material-symbols-outlined text-xl sm:text-2xl ${card.iconColor}`}
                >
                  {card.icon}
                </span>
              </div>
              <span
                className={`text-xs font-semibold shrink-0 ${
                  card.badgeGreen ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {card.badge}
              </span>
            </div>
            <p className="mt-3 text-xl sm:text-2xl font-bold text-slate-900">
              {card.value}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Thống kê số lịch khám theo tháng
          </h2>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:border-primary"
          >
            {[2023, 2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="p-4 sm:p-6">
          <div className="flex items-end justify-between gap-2 sm:gap-4 h-40">
            {CHART_DATA.map((bar) => (
              <div
                key={bar.month}
                className="flex-1 flex flex-col items-center gap-2 group"
              >
                <div
                  className="w-full max-w-10 bg-primary rounded-t transition-opacity hover:opacity-80"
                  style={{ height: bar.height, minHeight: "24px" }}
                />
                <span className="text-[10px] sm:text-xs font-medium text-slate-500">
                  {bar.month}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Danh sách 5 lịch khám gần nhất
          </h2>
          <Link
            to="/admin/appointments"
            className="text-sm text-primary font-semibold hover:underline"
          >
            Xem tất cả
          </Link>
        </div>

        <div className="block md:hidden divide-y divide-slate-100">
          {RECENT_APPOINTMENTS.map((apt) => {
            const statusConfig = APPOINTMENT_STATUS_CONFIG[apt.status];
            return (
              <div key={apt.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${apt.color} text-slate-700`}
                    >
                      {apt.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {apt.patient}
                      </p>
                      <p className="text-xs text-slate-500">{apt.doctor}</p>
                    </div>
                  </div>
                  {statusConfig && (
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${statusConfig.className}`}
                    >
                      {statusConfig.label}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{apt.date}</p>
                <div className="flex justify-end">
                  <button className="p-2 text-slate-400 hover:text-primary rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-xl">
                      more_vert
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="overflow-x-auto hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-3 text-left text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                  Bệnh nhân
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                  Bác sĩ
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                  Ngày khám
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {RECENT_APPOINTMENTS.map((apt) => {
                const statusConfig = APPOINTMENT_STATUS_CONFIG[apt.status];
                return (
                  <tr
                    key={apt.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${apt.color} text-slate-700`}
                        >
                          {apt.initials}
                        </div>
                        <span className="text-sm font-semibold text-slate-900">
                          {apt.patient}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {apt.doctor}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {apt.date}
                    </td>
                    <td className="px-6 py-4">
                      {statusConfig && (
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${statusConfig.className}`}
                        >
                          {statusConfig.label}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-primary rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-xl">
                          more_vert
                        </span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
