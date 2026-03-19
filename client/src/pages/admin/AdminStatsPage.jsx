/**
 * ============================================================
 * TRANG: Thống kê chi tiết hệ thống (Admin)
 * Đường dẫn: /admin/stats
 * ============================================================
 *
 * Chức năng:
 * - Tabs lọc kỳ: Theo tháng / Theo quý / Theo năm
 * - 4 KPI cards: lịch khám tháng này, tỷ lệ hoàn thành, tỷ lệ hủy, BN mới
 *   (mỗi card có % thay đổi so với tháng trước, mũi tên lên/xuống)
 * - Biểu đồ cột: lượt đặt lịch khám theo 12 tháng (hover hiện tooltip số liệu)
 * - Biểu đồ donut: phân bổ trạng thái lịch khám (hoàn thành, xác nhận, chờ, hủy)
 * - Biểu đồ thanh ngang: lượt khám theo chuyên khoa (progress bar)
 * - Biểu đồ thanh ngang: khung giờ đặt lịch phổ biến (màu theo mức độ)
 * - Biểu đồ cột: bệnh nhân đăng ký mới theo tháng
 * - Bảng Top 5 bác sĩ được đặt lịch nhiều nhất
 *
 * State:
 * - period: kỳ thống kê đang chọn ("month" | "quarter" | "year")
 *
 * Component phụ:
 * - StatCard: card KPI tái sử dụng (icon, label, value, change, changeLabel)
 *
 * Dữ liệu: STATS_OVERVIEW, MONTHLY_APPOINTMENTS, APPOINTMENT_STATUS_STATS,
 *           SPECIALTY_APPOINTMENT_STATS, PEAK_HOURS, PATIENT_GROWTH,
 *           TOP_DOCTORS_STATS, DOCTOR_STATUS_CONFIG từ mockAdminData.js
 * ============================================================
 */
import { useState } from "react";
import {
  STATS_OVERVIEW,
  MONTHLY_APPOINTMENTS,
  APPOINTMENT_STATUS_STATS,
  SPECIALTY_APPOINTMENT_STATS,
  PEAK_HOURS,
  PATIENT_GROWTH,
  TOP_DOCTORS_STATS,
  DOCTOR_STATUS_CONFIG,
} from "../../data/mockAdminData";

/** Cấu hình tabs chọn kỳ thống kê */
const PERIOD_TABS = [
  { id: "month", label: "Theo tháng" },
  { id: "quarter", label: "Theo quý" },
  { id: "year", label: "Theo năm" },
];

function StatCard({ icon, iconBg, label, value, change, changeLabel }) {
  const isPositive = change >= 0;
  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}
        >
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <p className="text-sm text-slate-500 font-medium leading-tight">
          {label}
        </p>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <div className="flex items-center gap-1.5 mt-1">
        <span
          className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
            isPositive ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          <span className="material-symbols-outlined text-sm">
            {isPositive ? "trending_up" : "trending_down"}
          </span>
          {isPositive ? "+" : ""}
          {change}%
        </span>
        <span className="text-xs text-slate-400">{changeLabel}</span>
      </div>
    </div>
  );
}

function AdminStatsPage() {
  const [period, setPeriod] = useState("month");

  const maxMonthly = Math.max(...MONTHLY_APPOINTMENTS.map((m) => m.count));
  const maxPatientGrowth = Math.max(...PATIENT_GROWTH.map((m) => m.count));

  const getInitials = (name) => {
    const parts = name.replace("BS. ", "").split(" ");
    return parts.length >= 2
      ? parts[0][0] + parts[parts.length - 1][0]
      : parts[0]?.slice(0, 2) || "BS";
  };

  const appointmentsChange =
    STATS_OVERVIEW.appointmentsLastMonth > 0
      ? (
          ((STATS_OVERVIEW.appointmentsThisMonth -
            STATS_OVERVIEW.appointmentsLastMonth) /
            STATS_OVERVIEW.appointmentsLastMonth) *
          100
        ).toFixed(1)
      : 0;

  const patientsChange =
    STATS_OVERVIEW.newPatientsLastMonth > 0
      ? (
          ((STATS_OVERVIEW.newPatientsThisMonth -
            STATS_OVERVIEW.newPatientsLastMonth) /
            STATS_OVERVIEW.newPatientsLastMonth) *
          100
        ).toFixed(1)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Thống kê hệ thống
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Tổng hợp dữ liệu hoạt động của hệ thống đặt lịch khám bệnh
          </p>
        </div>
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
          {PERIOD_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPeriod(tab.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === tab.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="calendar_month"
          iconBg="bg-primary/10 text-primary"
          label="Lịch khám tháng này"
          value={STATS_OVERVIEW.appointmentsThisMonth.toLocaleString("vi-VN")}
          change={Number(appointmentsChange)}
          changeLabel="so với tháng trước"
        />
        <StatCard
          icon="task_alt"
          iconBg="bg-emerald-500/10 text-emerald-600"
          label="Tỷ lệ hoàn thành khám"
          value={`${STATS_OVERVIEW.completionRate}%`}
          change={STATS_OVERVIEW.completionRateChange}
          changeLabel="so với tháng trước"
        />
        <StatCard
          icon="event_busy"
          iconBg="bg-rose-500/10 text-rose-600"
          label="Tỷ lệ hủy lịch"
          value={`${STATS_OVERVIEW.cancellationRate}%`}
          change={STATS_OVERVIEW.cancellationRateChange}
          changeLabel="so với tháng trước"
        />
        <StatCard
          icon="person_add"
          iconBg="bg-violet-500/10 text-violet-600"
          label="Bệnh nhân mới"
          value={STATS_OVERVIEW.newPatientsThisMonth}
          change={Number(patientsChange)}
          changeLabel="so với tháng trước"
        />
      </div>

      {/* Row: Monthly chart + Status breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Monthly appointments bar chart */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <h3 className="text-base font-bold text-slate-900 mb-5">
            Lượt đặt lịch khám theo tháng
          </h3>
          <div className="flex items-end gap-1 sm:gap-2 h-44 sm:h-52">
            {MONTHLY_APPOINTMENTS.map((m) => {
              const heightPercent =
                maxMonthly > 0 ? (m.count / maxMonthly) * 100 : 0;
              return (
                <div
                  key={m.month}
                  className="flex-1 flex flex-col items-center gap-1.5 group relative"
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-medium px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {m.count > 0 ? m.count.toLocaleString("vi-VN") : "—"}
                  </div>
                  <div
                    className={`w-full max-w-8 rounded-t transition-all ${
                      m.count > 0
                        ? "bg-primary group-hover:bg-primary/80"
                        : "bg-slate-100"
                    }`}
                    style={{
                      height: `${Math.max(heightPercent, 4)}%`,
                    }}
                  />
                  <span className="text-[10px] sm:text-xs font-medium text-slate-400">
                    {m.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Appointment status donut */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <h3 className="text-base font-bold text-slate-900 mb-5">
            Trạng thái lịch khám
          </h3>
          <div className="flex flex-col items-center gap-5">
            <div
              className="w-36 h-36 rounded-full relative"
              style={{
                background: `conic-gradient(
                  #10b981 0% ${APPOINTMENT_STATUS_STATS[0].percent}%,
                  #3b82f6 ${APPOINTMENT_STATUS_STATS[0].percent}% ${APPOINTMENT_STATUS_STATS[0].percent + APPOINTMENT_STATUS_STATS[1].percent}%,
                  #f59e0b ${APPOINTMENT_STATUS_STATS[0].percent + APPOINTMENT_STATUS_STATS[1].percent}% ${APPOINTMENT_STATUS_STATS[0].percent + APPOINTMENT_STATUS_STATS[1].percent + APPOINTMENT_STATUS_STATS[2].percent}%,
                  #f43f5e ${APPOINTMENT_STATUS_STATS[0].percent + APPOINTMENT_STATUS_STATS[1].percent + APPOINTMENT_STATUS_STATS[2].percent}% 100%
                )`,
              }}
            >
              <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-slate-900">1.284</span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Tổng cộng
                </span>
              </div>
            </div>
            <div className="w-full space-y-2.5">
              {APPOINTMENT_STATUS_STATS.map((s) => (
                <div key={s.status} className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.color}`} />
                  <span className="text-sm text-slate-600 flex-1">{s.label}</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {s.count}
                  </span>
                  <span className="text-xs text-slate-400 w-10 text-right">
                    {s.percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row: Specialty stats + Peak hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Specialty horizontal bars */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <h3 className="text-base font-bold text-slate-900 mb-5">
            Lượt khám theo chuyên khoa
          </h3>
          <div className="space-y-3">
            {SPECIALTY_APPOINTMENT_STATS.map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-700">{s.name}</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {s.count}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${s.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak hours */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <h3 className="text-base font-bold text-slate-900 mb-5">
            Khung giờ đặt lịch phổ biến
          </h3>
          <div className="space-y-3">
            {PEAK_HOURS.map((h) => (
              <div key={h.time} className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-500 w-24 shrink-0">
                  {h.time}
                </span>
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      h.percent === 100
                        ? "bg-emerald-500"
                        : h.percent >= 70
                        ? "bg-primary"
                        : h.percent >= 50
                        ? "bg-amber-500"
                        : "bg-slate-300"
                    }`}
                    style={{ width: `${h.percent}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-700 w-8 text-right">
                  {h.count}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-4 text-[10px] font-medium text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Cao nhất
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary" /> Cao
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Trung bình
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-300" /> Thấp
            </span>
          </div>
        </div>
      </div>

      {/* Patient growth mini chart */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <h3 className="text-base font-bold text-slate-900 mb-5">
          Bệnh nhân đăng ký mới theo tháng
        </h3>
        <div className="flex items-end gap-1 sm:gap-2 h-32 sm:h-40">
          {PATIENT_GROWTH.map((m) => {
            const heightPercent =
              maxPatientGrowth > 0 ? (m.count / maxPatientGrowth) * 100 : 0;
            return (
              <div
                key={m.month}
                className="flex-1 flex flex-col items-center gap-1.5 group relative"
              >
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-medium px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {m.count > 0 ? m.count : "—"}
                </div>
                <div
                  className={`w-full max-w-8 rounded-t transition-all ${
                    m.count > 0
                      ? "bg-violet-500 group-hover:bg-violet-400"
                      : "bg-slate-100"
                  }`}
                  style={{ height: `${Math.max(heightPercent, 4)}%` }}
                />
                <span className="text-[10px] sm:text-xs font-medium text-slate-400">
                  {m.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top doctors table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Top 5 bác sĩ được đặt lịch nhiều nhất
          </h3>
        </div>

        {/* Mobile cards */}
        <div className="block md:hidden divide-y divide-slate-100">
          {TOP_DOCTORS_STATS.map((doc, idx) => {
            const statusConfig = DOCTOR_STATUS_CONFIG[doc.status];
            return (
              <div key={doc.id} className="p-4 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {doc.name}
                  </p>
                  <p className="text-xs text-slate-500">{doc.specialty}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                    <span className="text-slate-600 font-medium">
                      {doc.appointments} lịch khám
                    </span>
                    <span className="flex items-center gap-0.5 text-amber-600">
                      <span className="material-symbols-outlined text-sm">
                        star
                      </span>
                      {doc.rating}
                    </span>
                    {statusConfig && (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusConfig.className}`}
                      >
                        {statusConfig.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop table */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 w-12">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Bác sĩ
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Chuyên khoa
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Số lịch khám
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Đánh giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {TOP_DOCTORS_STATS.map((doc, idx) => {
                const statusConfig = DOCTOR_STATUS_CONFIG[doc.status];
                return (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                        {idx + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {getInitials(doc.name)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {doc.name}
                          </p>
                          <p className="text-xs text-slate-400">{doc.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {doc.specialty}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-900">
                        {doc.appointments}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-sm">
                        <span className="material-symbols-outlined text-amber-500 text-base">
                          star
                        </span>
                        <span className="font-semibold text-slate-900">
                          {doc.rating}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {statusConfig && (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${statusConfig.className}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`}
                          />
                          {statusConfig.label}
                        </span>
                      )}
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

export default AdminStatsPage;
