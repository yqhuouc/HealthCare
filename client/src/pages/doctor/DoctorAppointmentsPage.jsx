/**
 * ============================================================
 * TRANG: Quản lý lịch khám (Bác sĩ)
 * Đường dẫn: /doctor/appointments
 * ============================================================
 *
 * Chức năng:
 * - Hiển thị toàn bộ lịch khám của bác sĩ (không chỉ hôm nay)
 * - Bộ lọc đa chiều: theo ngày (hôm nay / ngày mai / chọn ngày), tên/mã BN, trạng thái
 * - Thay đổi trạng thái trực tiếp:
 *   + Pending → Xác nhận (Confirmed) hoặc Từ chối (Cancelled)
 *   + Confirmed → Hoàn thành (Completed) hoặc Hủy (Cancelled)
 *   + Cancelled → Khôi phục (Pending)
 *   + Completed → Xem chi tiết
 * - 4 card thống kê tổng hợp ở cuối: tổng, đang chờ, hoàn thành, đã hủy
 * - Responsive: mobile card view, desktop table view
 *
 * State:
 * - appointments: mảng lịch hẹn (thay đổi trạng thái inline)
 * - activeDate: "today" | "tomorrow" | "custom" — xác định ngày đang lọc
 * - dateInput: giá trị input date khi chọn ngày tùy chỉnh
 * - searchQuery: chuỗi tìm kiếm tên/mã BN
 * - statusFilter: trạng thái đang lọc ("all" hoặc cụ thể)
 *
 * Dữ liệu: DOCTOR_APPOINTMENTS, APPOINTMENT_STATUS từ mockDoctorData.js
 * ============================================================
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  DOCTOR_APPOINTMENTS,
  APPOINTMENT_STATUS,
} from "../../data/mockDoctorData";

/** Cấu hình badge trạng thái: label + className cho mỗi status */
const STATUS_BADGE = {
  [APPOINTMENT_STATUS.PENDING]: {
    label: "Đang chờ",
    className: "bg-amber-100 text-amber-600 border border-amber-200",
  },
  [APPOINTMENT_STATUS.CONFIRMED]: {
    label: "Đã xác nhận",
    className: "bg-blue-100 text-blue-600 border border-blue-200",
  },
  [APPOINTMENT_STATUS.COMPLETED]: {
    label: "Hoàn thành",
    className: "bg-emerald-100 text-emerald-600 border border-emerald-200",
  },
  [APPOINTMENT_STATUS.CANCELLED]: {
    label: "Đã hủy",
    className: "bg-rose-100 text-rose-600 border border-rose-200",
  },
};

const STATUS_FILTERS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: APPOINTMENT_STATUS.PENDING, label: "Đang chờ" },
  { value: APPOINTMENT_STATUS.CONFIRMED, label: "Đã xác nhận" },
  { value: APPOINTMENT_STATUS.COMPLETED, label: "Hoàn thành" },
  { value: APPOINTMENT_STATUS.CANCELLED, label: "Đã hủy" },
];

function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState(DOCTOR_APPOINTMENTS);
  const [activeDate, setActiveDate] = useState("today");
  const [dateInput, setDateInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const selectedDate =
    activeDate === "today"
      ? today
      : activeDate === "tomorrow"
        ? tomorrow
        : dateInput;

  const filtered = appointments.filter((apt) => {
    const matchDate = !selectedDate || apt.date === selectedDate;
    const matchStatus =
      statusFilter === "all" || apt.status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      apt.patientName.toLowerCase().includes(q) ||
      `BN-${String(apt.id).padStart(3, "0")}`.toLowerCase().includes(q);
    return matchDate && matchStatus && matchSearch;
  });

  const stats = {
    total: filtered.length,
    pending: filtered.filter((a) => a.status === APPOINTMENT_STATUS.PENDING).length,
    completed: filtered.filter((a) => a.status === APPOINTMENT_STATUS.COMPLETED).length,
    cancelled: filtered.filter((a) => a.status === APPOINTMENT_STATUS.CANCELLED).length,
  };

  const handleConfirm = (id) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: APPOINTMENT_STATUS.CONFIRMED } : a
      )
    );
  };

  const handleCancel = (id) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: APPOINTMENT_STATUS.CANCELLED } : a
      )
    );
  };

  const handleRestore = (id) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: APPOINTMENT_STATUS.PENDING } : a
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Lịch khám hôm nay</h1>
        <p className="text-slate-500 mt-1">Quản lý và theo dõi lịch khám bệnh nhân</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-primary/5">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setActiveDate("today");
              setDateInput("");
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeDate === "today"
                ? "bg-primary text-white"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Hôm nay
          </button>
          <button
            onClick={() => {
              setActiveDate("tomorrow");
              setDateInput("");
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeDate === "tomorrow"
                ? "bg-primary text-white"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Ngày mai
          </button>

          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              calendar_today
            </span>
            <input
              type="date"
              value={dateInput}
              onChange={(e) => {
                setDateInput(e.target.value);
                setActiveDate("custom");
              }}
              className="pl-10 pr-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          <div className="relative flex-1 min-w-[240px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm tên hoặc mã bệnh nhân..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === f.value
                    ? "bg-primary/10 text-primary"
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-primary/10 overflow-hidden">
        {/* Mobile card view */}
        <div className="block md:hidden">
          {filtered.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filtered.map((apt) => {
                const badge = STATUS_BADGE[apt.status] || STATUS_BADGE[APPOINTMENT_STATUS.PENDING];
                const code = `BN-${String(apt.id).padStart(3, "0")}`;
                return (
                  <div key={apt.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-800">{apt.patientName}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{code}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                        {apt.time}
                      </span>
                      <span>{apt.patientPhone}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{apt.reason}</p>
                    <div className="flex items-center gap-1">
                      {apt.status === APPOINTMENT_STATUS.PENDING && (
                        <>
                          <button onClick={() => handleConfirm(apt.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-600 bg-emerald-50">Xác nhận</button>
                          <button onClick={() => handleCancel(apt.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-500 bg-rose-50">Từ chối</button>
                        </>
                      )}
                      {apt.status === APPOINTMENT_STATUS.CONFIRMED && (
                        <>
                          <button onClick={() => handleComplete(apt.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 bg-blue-50">Hoàn thành</button>
                          <button onClick={() => handleCancel(apt.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-500 bg-rose-50">Hủy</button>
                        </>
                      )}
                      {apt.status === APPOINTMENT_STATUS.COMPLETED && (
                        <Link to={`/doctor/appointments/${apt.id}`} className="px-3 py-1.5 rounded-lg text-xs font-medium text-primary bg-primary/5">Chi tiết</Link>
                      )}
                      {apt.status === APPOINTMENT_STATUS.CANCELLED && (
                        <button onClick={() => handleRestore(apt.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-100">Khôi phục</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-5 py-16 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">event_busy</span>
              <p className="text-slate-500 font-medium">Không có lịch khám nào</p>
              <p className="text-slate-400 text-xs mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}
        </div>

        {/* Desktop table view */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Giờ khám</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Bệnh nhân</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Số điện thoại</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Lý do khám</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Trạng thái</th>
                <th className="text-center px-5 py-3.5 font-semibold text-slate-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((apt) => {
                  const badge = STATUS_BADGE[apt.status] || STATUS_BADGE[APPOINTMENT_STATUS.PENDING];
                  const code = `BN-${String(apt.id).padStart(3, "0")}`;

                  return (
                    <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-lg">
                            schedule
                          </span>
                          <span className="font-semibold text-slate-800">{apt.time}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-slate-800">{apt.patientName}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{code}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{apt.patientPhone}</td>
                      <td className="px-5 py-4 text-slate-600 max-w-[200px] truncate">
                        {apt.reason}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-1">
                          {apt.status === APPOINTMENT_STATUS.PENDING && (
                            <>
                              <button
                                onClick={() => handleConfirm(apt.id)}
                                title="Xác nhận"
                                className="size-8 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-colors"
                              >
                                <span className="material-symbols-outlined text-xl">check</span>
                              </button>
                              <button
                                onClick={() => handleCancel(apt.id)}
                                title="Từ chối"
                                className="size-8 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors"
                              >
                                <span className="material-symbols-outlined text-xl">close</span>
                              </button>
                            </>
                          )}
                          {apt.status === APPOINTMENT_STATUS.CONFIRMED && (
                            <>
                              <button
                                onClick={() => handleComplete(apt.id)}
                                title="Hoàn thành"
                                className="size-8 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                              >
                                <span className="material-symbols-outlined text-xl">verified</span>
                              </button>
                              <button
                                onClick={() => handleCancel(apt.id)}
                                title="Hủy"
                                className="size-8 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors"
                              >
                                <span className="material-symbols-outlined text-xl">close</span>
                              </button>
                            </>
                          )}
                          {apt.status === APPOINTMENT_STATUS.COMPLETED && (
                            <Link
                              to={`/doctor/appointments/${apt.id}`}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
                            >
                              Chi tiết
                            </Link>
                          )}
                          {apt.status === APPOINTMENT_STATUS.CANCELLED && (
                            <button
                              onClick={() => handleRestore(apt.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                              Khôi phục
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">
                      event_busy
                    </span>
                    <p className="text-slate-500 font-medium">Không có lịch khám nào</p>
                    <p className="text-slate-400 text-xs mt-1">
                      Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-primary/10 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Tổng lịch khám</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</p>
          </div>
          <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-2xl">calendar_month</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-amber-200 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Đang chờ</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{stats.pending}</p>
          </div>
          <div className="size-12 rounded-lg bg-amber-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-amber-600 text-2xl">hourglass_top</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-emerald-200 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Hoàn thành</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{stats.completed}</p>
          </div>
          <div className="size-12 rounded-lg bg-emerald-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-emerald-600 text-2xl">task_alt</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-rose-200 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Đã hủy</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{stats.cancelled}</p>
          </div>
          <div className="size-12 rounded-lg bg-rose-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-rose-600 text-2xl">cancel</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorAppointmentsPage;
