/**
 * ============================================================
 * TRANG: Quản lý lịch khám (Admin)
 * Đường dẫn: /admin/appointments
 * ============================================================
 *
 * Chức năng:
 * - 4 card thống kê: tổng lịch khám, chờ xác nhận, đã khám, đã hủy
 * - Bộ lọc: trạng thái (pill buttons), khoảng ngày (date range), nút "Lọc"
 * - Bảng lịch khám: mã LK, BN (avatar initials), BS, ngày giờ, trạng thái, link chi tiết
 * - Phân trang
 * - Responsive: mobile card view, desktop table view
 *
 * State:
 * - statusFilter: trạng thái đang lọc ("all" hoặc cụ thể)
 * - currentPage: trang hiện tại
 *
 * Dữ liệu: ADMIN_APPOINTMENT_LIST, APPOINTMENT_STATUS_CONFIG từ mockAdminData.js
 * ============================================================
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { ADMIN_APPOINTMENT_LIST, APPOINTMENT_STATUS_CONFIG } from "../../data/mockAdminData";

/** 4 card thống kê tổng hợp hiển thị trên đầu trang */
const STATS = [
  { label: "Tổng lịch khám", value: "1,284", valueClass: "" },
  { label: "Chờ xác nhận", value: "45", valueClass: "text-amber-500" },
  { label: "Đã khám", value: "892", valueClass: "text-emerald-500" },
  { label: "Đã hủy", value: "12", valueClass: "text-red-500" },
];

const STATUS_FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "completed", label: "Đã khám" },
  { value: "cancelled", label: "Đã hủy" },
];

const ITEMS_PER_PAGE = 5;

function AdminAppointmentsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = ADMIN_APPOINTMENT_LIST.filter((apt) => {
    const matchStatus = statusFilter === "all" || apt.status === statusFilter;
    return matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {STATS.map((s) => (
          <div key={s.label} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.valueClass || "text-slate-800"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === f.value ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Từ ngày</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Đến ngày</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <button className="mt-6 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
              Lọc
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Mã lịch</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Bệnh nhân</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Bác sĩ</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Ngày/Giờ khám</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Trạng thái</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.map((apt) => {
                const config = APPOINTMENT_STATUS_CONFIG[apt.status];
                return (
                  <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-800">{apt.code}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`size-9 rounded-full flex items-center justify-center text-xs font-bold ${apt.initialsColor || "bg-slate-200 text-slate-700"}`}>
                          {apt.initials}
                        </div>
                        <span className="font-medium text-slate-800">{apt.patient}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{apt.doctor}</td>
                    <td className="px-5 py-4 text-slate-600">{apt.dateTime}</td>
                    <td className="px-5 py-4">
                      {config && (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
                          {config.label}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Link to={`/admin/appointments/${apt.id}`} className="text-primary font-medium hover:underline text-sm">
                        Xem chi tiết
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="block md:hidden divide-y divide-slate-100">
          {paginatedData.map((apt) => {
            const config = APPOINTMENT_STATUS_CONFIG[apt.status];
            return (
              <div key={apt.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`size-9 rounded-full flex items-center justify-center text-xs font-bold ${apt.initialsColor || "bg-slate-200 text-slate-700"}`}>
                      {apt.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{apt.patient}</p>
                      <p className="text-xs text-slate-500">{apt.code}</p>
                    </div>
                  </div>
                  {config && (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${config.className}`}>
                      {config.label}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">{apt.doctor}</p>
                <p className="text-xs text-slate-500">{apt.dateTime}</p>
                <Link to={`/admin/appointments/${apt.id}`} className="inline-block text-primary font-medium text-sm hover:underline">
                  Xem chi tiết
                </Link>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Trang {currentPage} / {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="size-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="size-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAppointmentsPage;
