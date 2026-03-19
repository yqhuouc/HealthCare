/**
 * ============================================================
 * TRANG: Lịch làm việc của bác sĩ
 * Đường dẫn: /doctor/schedule
 * ============================================================
 *
 * Chức năng:
 * - Mini calendar bên trái: chọn ngày, chuyển tháng, đánh dấu ngày có ca trực
 * - Bảng danh sách ca làm việc bên phải (tuần này / tháng này)
 * - Mỗi ca: ngày, giờ bắt đầu, giờ kết thúc, trạng thái (đang diễn ra / sắp tới / hoàn thành)
 * - Thao tác: Sửa/Xóa (ca chưa hoàn thành), Xem (ca đã hoàn thành)
 * - Nút "Thêm ca làm việc" → chuyển sang DoctorAddShiftPage
 * - 2 card thống kê: giờ hoàn thành + giờ dự kiến
 * - Responsive: mobile card view, desktop table view
 *
 * State:
 * - selectedDate: ngày đang chọn trên calendar (số ngày 1-31)
 * - currentMonth / currentYear: tháng/năm đang hiển thị trên calendar
 * - activeTab: "week" | "month" — lọc bảng ca làm việc
 *
 * Dữ liệu: WORK_SHIFTS (mock cục bộ), ACTIVE_DAYS (ngày có ca trực)
 * ============================================================
 */
import { useState } from "react";
import { Link } from "react-router-dom";

/** Dữ liệu ca làm việc mẫu — sẽ thay bằng API khi có backend */
const WORK_SHIFTS = [
  { id: 1, date: "05/10/2023", startTime: "08:00", endTime: "12:00", status: "active" },
  { id: 2, date: "10/10/2023", startTime: "13:30", endTime: "17:30", status: "upcoming" },
  { id: 3, date: "12/10/2023", startTime: "08:00", endTime: "12:00", status: "upcoming" },
  { id: 4, date: "01/10/2023", startTime: "08:00", endTime: "12:00", status: "completed" },
];

const DAYS_OF_WEEK = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const STATUS_MAP = {
  active: { label: "Đang diễn ra", className: "bg-blue-100 text-blue-800" },
  upcoming: { label: "Sắp tới", className: "bg-amber-100 text-amber-800" },
  completed: { label: "Hoàn thành", className: "bg-emerald-100 text-emerald-800" },
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

const ACTIVE_DAYS = [1, 5, 10, 12, 18, 22, 25];

function DoctorSchedulePage() {
  const [selectedDate, setSelectedDate] = useState(5);
  const [currentMonth, setCurrentMonth] = useState(9);
  const [currentYear, setCurrentYear] = useState(2023);
  const [activeTab, setActiveTab] = useState("week");

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  const handleEdit = (id) => {
    console.log(`Chỉnh sửa ca làm việc #${id}`);
  };

  const handleDelete = (id) => {
    console.log(`Xóa ca làm việc #${id}`);
  };

  const handleView = (id) => {
    console.log(`Xem chi tiết ca làm việc #${id}`);
  };

  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  return (
    <>
      {/* Top Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Lịch trình chi tiết</h1>
        <Link
          to="/doctor/schedule/add"
          className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-sm transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Thêm ca làm việc
        </Link>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Calendar Mini Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            {/* Month Header */}
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
              >
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
              <h3 className="font-semibold text-slate-800 capitalize">{monthName}</h3>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
              >
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-slate-400 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  {day ? (
                    <button
                      onClick={() => setSelectedDate(day)}
                      className={`w-9 h-9 rounded-full text-sm font-medium transition-colors relative flex items-center justify-center ${
                        day === selectedDate
                          ? "bg-primary text-white"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {day}
                      {ACTIVE_DAYS.includes(day) && day !== selectedDate && (
                        <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary" />
                      )}
                    </button>
                  ) : (
                    <span className="w-9 h-9" />
                  )}
                </div>
              ))}
            </div>

            {/* Bottom Note */}
            <div className="mt-5 border-l-4 border-primary bg-primary/5 rounded-r-lg p-3">
              <p className="text-sm font-medium text-slate-800">Ngày đã chọn: {selectedDate}/{currentMonth + 1}/{currentYear}</p>
              <p className="text-xs text-slate-500 mt-1">Nhấn vào ngày trên lịch để xem ca làm việc.</p>
            </div>
          </div>
        </div>

        {/* RIGHT: Work Shift List + Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Table Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            {/* Table Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Danh sách ca làm việc</h3>
              <div className="flex bg-slate-100 rounded-lg p-0.5 self-start sm:self-auto">
                <button
                  onClick={() => setActiveTab("week")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "week"
                      ? "bg-white text-primary shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Tuần này
                </button>
                <button
                  onClick={() => setActiveTab("month")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "month"
                      ? "bg-white text-primary shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Tháng này
                </button>
              </div>
            </div>

            {/* Mobile card view */}
            <div className="block md:hidden divide-y divide-slate-100">
              {WORK_SHIFTS.map((shift) => {
                const statusInfo = STATUS_MAP[shift.status];
                return (
                  <div key={shift.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-800">{shift.date}</span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{shift.startTime} — {shift.endTime}</p>
                    <div className="flex items-center gap-1 pt-1">
                      {shift.status === "completed" ? (
                        <button onClick={() => handleView(shift.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-100">Xem</button>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(shift.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 bg-blue-50">Sửa</button>
                          <button onClick={() => handleDelete(shift.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50">Xóa</button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Giờ bắt đầu</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Giờ kết thúc</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="text-center py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {WORK_SHIFTS.map((shift) => {
                    const statusInfo = STATUS_MAP[shift.status];
                    return (
                      <tr key={shift.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-6 text-sm font-medium text-slate-800">{shift.date}</td>
                        <td className="py-3.5 px-6 text-sm text-slate-600">{shift.startTime}</td>
                        <td className="py-3.5 px-6 text-sm text-slate-600">{shift.endTime}</td>
                        <td className="py-3.5 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.className}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-center">
                          {shift.status === "completed" ? (
                            <button
                              onClick={() => handleView(shift.id)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              <span className="material-symbols-outlined text-xl">visibility</span>
                            </button>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleEdit(shift.id)}
                                className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                              >
                                <span className="material-symbols-outlined text-xl">edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(shift.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                              >
                                <span className="material-symbols-outlined text-xl">delete</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 sm:px-6 py-3 border-t border-slate-200">
              <p className="text-xs sm:text-sm text-slate-500">Hiển thị 1-{WORK_SHIFTS.length} trong {WORK_SHIFTS.length} kết quả</p>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                  <span className="material-symbols-outlined text-xl">chevron_left</span>
                </button>
                <button className="w-8 h-8 rounded-lg bg-primary text-white text-sm font-medium">1</button>
                <button className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-600 text-sm font-medium transition-colors">2</button>
                <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                  <span className="material-symbols-outlined text-xl">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-emerald-600">check_circle</span>
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-700">Hoàn thành</p>
                <p className="text-2xl font-bold text-emerald-800">24 Giờ</p>
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-primary">schedule</span>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Dự kiến</p>
                <p className="text-2xl font-bold text-blue-800">18 Giờ</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DoctorSchedulePage;
