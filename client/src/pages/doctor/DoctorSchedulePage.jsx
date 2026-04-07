/**
 * ============================================================
 * TRANG: Quản lý Lịch làm việc & Ca trực (Bác sĩ)
 * Đường dẫn: /doctor/schedule
 * ============================================================
 * 
 * Chức năng chính:
 * 1. Mini Calendar: Xem tổng quan các ngày có ca trực trong tháng.
 * 2. Lọc thông minh: 
 *    - Bấm vào một ngày trên lịch để xem danh sách ca làm việc của ngày đó.
 *    - Chuyển đổi giữa các tháng/năm để theo dõi lịch trình dài hạn.
 * 3. Danh sách ca trực: Hiển thị chi tiết khung giờ, số lượng bệnh nhân tối đa.
 * 4. Quản lý ca: Xóa ca trực (nếu chưa diễn ra/chưa hoàn thành).
 * 5. Thẻ thống kê: Xem nhanh tổng số ca đã đăng ký và số ca sắp tới.
 * 
 * UI/UX đặc biệt: 
 * - Container danh sách có thanh cuộn (Scrollable) khi có quá nhiều ca.
 * - Trạng thái ca chia làm 3 loại: Hoàn thành, Đang diễn ra (today), Sắp tới.
 * ============================================================
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { scheduleService } from "../../services/scheduleService";
import useAuthStore from "../../stores/useAuthStore";
import { toast } from "react-toastify";

// Hằng số định nghĩa thứ trong tuần (hiển thị trên Calendar)
const DAYS_OF_WEEK = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

/** 
 * Hàm format giờ (HH:mm) đảm bảo tính nhất quán múi giờ VN
 */
function formatTime(timeInput) {
  if (!timeInput) return "";
  if (typeof timeInput === "string" && !timeInput.includes("T") && timeInput.includes(":")) {
    return timeInput.substring(0, 5);
  }
  const d = new Date(timeInput);
  if (isNaN(d.getTime())) return timeInput;
  d.setFullYear(2024);
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit", 
    minute: "2-digit", 
    hour12: false, 
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

/** 
 * Lấy số ngày trong một tháng của một năm cụ thể
 */
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/** 
 * Lấy thứ của ngày đầu tiên trong tháng (0 = CN, 1 = T2...)
 */
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function DoctorSchedulePage() {
  // Lấy thông tin bác sĩ từ Store
  const { user } = useAuthStore();
  const bacSiId = user?.bacSi?.id;

  // State quản lý Calendar và Dữ liệu
  const now = new Date();
  const [selectedDate, setSelectedDate] = useState(now.getDate()); // Theo dõi ngày đang được chọn (filter)
  const [currentMonth, setCurrentMonth] = useState(now.getMonth()); // Tháng đang xem trên Calendar
  const [currentYear, setCurrentYear] = useState(now.getFullYear()); // Năm đang xem trên Calendar
  const [schedules, setSchedules] = useState([]);                  // Danh sách toàn bộ ca làm việc
  const [loading, setLoading] = useState(true);

  /**
   * Effect: Tải toàn bộ lịch làm việc của bác sĩ khi vào trang
   */
  useEffect(() => {
    if (!bacSiId) return;
    const fetchData = async () => {
      try {
        const res = await scheduleService.getLichLamViec({ bacSiId });
        setSchedules(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Schedule fetch error:", err);
        toast.error("Không thể tải lịch làm việc");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [bacSiId]);

  /** 
   * Xác định các ngày "active" (có ca trực) trong tháng đang xem
   */
  const activeDays = schedules
    .filter((s) => {
      const d = new Date(s.ngayLamViec);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .map((s) => new Date(s.ngayLamViec).getDate());

  /** 
   * Logic phân loại trạng thái ca làm việc
   */
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });

  const getShiftStatus = (schedule) => {
    const shiftDate = new Date(schedule.ngayLamViec).toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
    if (shiftDate < todayStr) return "completed"; // Đã qua
    if (shiftDate === todayStr) return "active";   // Hôm nay
    return "upcoming";                            // Tương lai
  };

  /** 
   * Cấu hình màu sắc nhãn cho từng trạng thái
   */
  const STATUS_MAP = {
    active: { label: "Hôm nay", className: "bg-blue-100 text-blue-800 border border-blue-200" },
    upcoming: { label: "Sắp tới", className: "bg-amber-100 text-amber-800 border border-amber-200" },
    completed: { label: "Hoàn thành", className: "bg-emerald-100 text-emerald-800 border border-emerald-200" },
  };

  // Các biến phục vụ hiển thị Calendar
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  // Điều hướng lịch
  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString("vi-VN", {
    month: "long", year: "numeric",
  });

  /** 
   * Xử lý xóa ca làm việc
   */
  const handleDelete = async (shiftId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa ca làm việc này?")) return;
    try {
      await scheduleService.deleteLichLamViec(shiftId);
      setSchedules((prev) => prev.filter((s) => s.id !== shiftId));
      toast.success("Đã xóa ca làm việc");
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi xóa ca làm việc");
    }
  };

  /** 
   * Tính toán các ô trống và ngày trong tháng cho Calendar Grid
   */
  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  /** 
   * Thống kê nhanh (tính trên TẤT CẢ các ca hiện tại)
   */
  const totalShifts = schedules.length;
  const upcomingShifts = schedules.filter((s) => getShiftStatus(s) === "upcoming").length;

  /** 
   * Logic Lọc (Filtering): Lọc ca để hiển thị theo Tháng + Ngày đã chọn trên lịch
   */
  const filteredSchedules = schedules.filter((s) => {
    const d = new Date(s.ngayLamViec);
    // 1. Kiểm tra khớp tháng/năm đang xem
    if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) return false;
    // 2. Nếu bác sĩ đang chọn lọc theo ngày cụ thể
    if (selectedDate !== null && d.getDate() !== selectedDate) return false;
    return true;
  });

  // UI Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* TIÊU ĐỀ & NÚT THÊM MỚI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Lịch trình làm việc</h1>
          <p className="text-slate-500 text-sm font-medium">Theo dõi và quản lý các ca trực tại phòng khám</p>
        </div>
        <Link
          to="/doctor/schedule/add"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all text-sm uppercase tracking-wide"
        >
          <span className="material-symbols-outlined text-xl">add_circle</span>
          Đăng ký ca trực
        </Link>
      </div>

      {/* BỐ CỤC CHÍNH (Grid Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CỘT TRÁI: BỘ LỊCH NHỎ (Mini Calendar) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-6">
            {/* Thanh điều hướng Tháng */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-slate-400 hover:text-primary">
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
              <h3 className="font-black text-slate-800 capitalize tracking-tight">{monthName}</h3>
              <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-slate-400 hover:text-primary">
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
            </div>

            {/* Header Thứ trong tuần */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="text-center text-[10px] font-black text-slate-300 py-1 uppercase">{day}</div>
              ))}
            </div>

            {/* Grid các ngày trong tháng */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((day, idx) => (
                <div key={idx} className="aspect-square flex items-center justify-center">
                  {day ? (
                    <button
                      onClick={() => setSelectedDate(day === selectedDate ? null : day)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all relative flex items-center justify-center ${
                        day === selectedDate 
                        ? "bg-primary text-white shadow-lg shadow-primary/25 scale-110" 
                        : "text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100"
                      }`}
                    >
                      {day}
                      {/* Dấu chấm nhỏ đánh dấu ngày CÓ ca trực */}
                      {activeDays.includes(day) && day !== selectedDate && (
                        <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-primary" />
                      )}
                    </button>
                  ) : (
                    <span className="w-10 h-10" />
                  )}
                </div>
              ))}
            </div>

            {/* Chú dẫn bên dưới Calendar */}
            <div className="mt-6 pt-6 border-t border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-primary rounded-full" />
                <div>
                  <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">
                    {selectedDate ? `Đang xem: Ngày ${selectedDate}` : `Xem tất cả tháng ${currentMonth + 1}`}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {selectedDate ? "Bấm vào ngày lần nữa để xem toàn bộ tháng." : "Chọn một ngày để lọc chi tiết ca trực."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: DANH SÁCH CA TRỰC & THỐNG KÊ */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* BẢNG DANH SÁCH CA (Scrollable Container) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[520px] overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-5 border-b border-slate-50 shrink-0">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">event_list</span>
                {selectedDate ? `Ca trực ngày ${selectedDate}/${currentMonth + 1}` : "Toàn bộ ca trực trong tháng"}
              </h3>
              {selectedDate !== null && (
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-xs font-black text-primary hover:underline uppercase tracking-wider"
                >
                  Xem toàn bộ tháng
                </button>
              )}
            </div>

            {/* Nội dung danh sách (có thanh cuộn dọc) */}
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {filteredSchedules.length === 0 ? (
                <div className="px-5 flex flex-col items-center justify-center h-full min-h-[300px]">
                  <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-4xl text-slate-200">calendar_today</span>
                  </div>
                  <p className="text-slate-400 font-bold italic text-sm">Không tìm thấy ca trực nào phù hợp.</p>
                </div>
              ) : (
                <>
                  {/* Hiển thị trên Mobile (Card dọc) */}
                  <div className="block md:hidden divide-y divide-slate-50">
                    {filteredSchedules.map((shift) => {
                      const status = getShiftStatus(shift);
                      const statusInfo = STATUS_MAP[status];
                      const shiftDate = new Date(shift.ngayLamViec).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
                      return (
                        <div key={shift.id} className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-800">{shiftDate}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${statusInfo.className}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                            <span className="material-symbols-outlined text-primary text-lg font-light">schedule</span>
                            {formatTime(shift.khungGio?.gioBatDau)} — {formatTime(shift.khungGio?.gioKetThuc)}
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <p className="text-[11px] text-slate-400 font-medium font-mono">
                              BN: {shift.soBenhNhanHienTai} / {shift.soBenhNhanToiDa} (Slot)
                            </p>
                            {status !== "completed" ? (
                              <button onClick={() => handleDelete(shift.id)}
                                className="px-3 py-1 rounded-lg text-[10px] font-black text-rose-500 bg-rose-50 uppercase border border-rose-100">Xóa</button>
                            ) : (
                              <span className="text-[10px] text-emerald-500 font-bold italic">Đã xong</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Hiển thị trên Desktop (Table ngang) */}
                  <div className="hidden md:block">
                    <table className="w-full relative">
                      <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm border-b border-slate-100">
                        <tr>
                          <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày trực</th>
                          <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Khung giờ</th>
                          <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Số lượng BN</th>
                          <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                          <th className="text-center py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 italic md:not-italic">
                        {filteredSchedules.map((shift) => {
                          const status = getShiftStatus(shift);
                          const statusInfo = STATUS_MAP[status];
                          const shiftDate = new Date(shift.ngayLamViec).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
                          return (
                            <tr key={shift.id} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="py-4 px-6 text-sm font-bold text-slate-800">
                                {shiftDate}
                              </td>
                              <td className="py-4 px-6 text-sm text-slate-600 font-medium">
                                <span className="text-primary font-bold">{formatTime(shift.khungGio?.gioBatDau)}</span> - {formatTime(shift.khungGio?.gioKetThuc)}
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-1.5 h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden mt-1 mb-1">
                                    <div 
                                      className="h-full bg-primary" 
                                      style={{ width: `${(shift.soBenhNhanHienTai/shift.soBenhNhanToiDa)*100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-[10px] font-black text-slate-400">{shift.soBenhNhanHienTai} / {shift.soBenhNhanToiDa} BN</span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${statusInfo.className}`}>
                                  {statusInfo.label}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                {status !== "completed" ? (
                                  <button onClick={() => handleDelete(shift.id)}
                                    className="p-2 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-all"
                                    title="Hủy ca trực">
                                    <span className="material-symbols-outlined text-xl">delete_forever</span>
                                  </button>
                                ) : (
                                  <span className="material-symbols-outlined text-emerald-300 text-lg">verified</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* CÁC THẺ THỐNG KÊ NHANH */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 transition-all hover:scale-[1.02]">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                <span className="material-symbols-outlined text-2xl text-emerald-500">assignment_turned_in</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng ca đăng ký</p>
                <p className="text-2xl font-black text-slate-800">{totalShifts} <span className="text-xs text-slate-400 font-normal">lượt</span></p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 transition-all hover:scale-[1.02]">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                <span className="material-symbols-outlined text-2xl text-blue-500">pending_actions</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ca chưa diễn ra</p>
                <p className="text-2xl font-black text-slate-800">{upcomingShifts} <span className="text-xs text-slate-400 font-normal">ca</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorSchedulePage;

