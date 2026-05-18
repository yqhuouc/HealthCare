/**
 * =============================================================================
 * TRANG: QUẢN LÝ LỊCH TRÌNH CÔNG TÁC (BÁC SĨ)
 * Đường dẫn: /doctor/schedule
 * =============================================================================
 *
 * CHỨC NĂNG CHÍNH:
 * 1. Lịch mini (Mini Calendar): Hiển thị tổng quan các ngày trong tháng.
 *    - Các ngày có dấu chấm: Đã đăng ký ca trực.
 *    - Chọn ngày: Lọc danh sách ca trực bên phải theo ngày đó.
 * 2. Danh sách ca trực: Hiển thị chi tiết giờ giấc, số lượng bệnh nhân đã đặt.
 * 3. Quản lý tác vụ: Cho phép bác sĩ đăng ký thêm ca mới hoặc hủy ca chưa diễn ra.
 *
 * PHONG CÁCH THIẾT KẾ:
 * - Ưu tiên sự gọn gàng, sử dụng các đường kẻ mảnh (Border-2) thay vì shadow.
 * - Các thẻ thông tin mang phong cách "Hồ sơ y tế" sạch sẽ, chuyên nghiệp.
 * - Chú thích tiếng Việt hỗ trợ việc đọc hiểu logic và giải trình đồ án.
 * =============================================================================
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { useLichLamViec, useDeleteLichLamViec } from "../../hooks/queries/useScheduleQueries";
import useAuthStore from "../../stores/useAuthStore";
import { toast } from "react-toastify";
import { formatTime, formatDate, toDateString, dayjs } from "../../utils/dateUtils";

// Tên các thứ trong tuần rút gọn
const DAYS_OF_WEEK = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

/**
 * HÀM HỖ TRỢ: Tính toán số ngày trong tháng và thứ của ngày đầu tiên.
 */
function getMonthData(year, month) {
  const d = dayjs().year(year).month(month);
  return {
    daysInMonth: d.daysInMonth(),
    firstDayIdx: d.startOf("month").day(), // 0 = CN, 1 = T2...
  };
}

function DoctorSchedulePage() {
  const { user } = useAuthStore();
  const bacSiId = user?.bacSi?.id;

  /**
   * 1. QUẢN LÝ TRẠNG THÁI LỊCH (CALENDAR STATE)
   */
  const now = dayjs().tz("Asia/Ho_Chi_Minh");
  const [selectedDay, setSelectedDay] = useState(now.date());
  const [month, setMonth] = useState(now.month());
  const [year, setYear] = useState(now.year());

  /**
   * 2. GỌI DỮ LIỆU TỪ SERVER (API)
   */
  const { data: schRes, isLoading: loading } = useLichLamViec({ bacSiId });
  const schedules = Array.isArray(schRes?.data) ? schRes.data : [];
  const deleteMutation = useDeleteLichLamViec();

  /**
   * 3. LOGIC XÁC ĐỊNH TRẠNG THÁI CA TRỰC (Hôm nay, Sắp tới, Hoàn thành)
   */
  const todayStr = toDateString(dayjs());

  const getShiftStatus = (item) => {
    if (item.sanSang === 0) return "pending";
    const dStr = toDateString(item.ngayLamViec);
    if (dStr < todayStr) return "completed";
    if (dStr === todayStr) return "active";
    return "upcoming";
  };

  // Cấu hình hiển thị nhãn (Badge) theo trạng thái
  const STATUS_CONFIG = {
    active: { label: "Hôm nay", style: "border-blue-200 text-blue-700 bg-blue-50" },
    upcoming: { label: "Sắp tới", style: "border-amber-200 text-amber-700 bg-amber-50" },
    completed: { label: "Đã qua", style: "border-slate-200 text-slate-500 bg-slate-50" },
    pending: { label: "Chờ duyệt", style: "border-orange-200 text-orange-700 bg-orange-50" },
  };

  /**
   * 4. LOGIC XỬ LÝ BỘ LỊCH MINI
   */
  const { daysInMonth, firstDayIdx } = getMonthData(year, month);

  // Chuyển tháng
  const handleMonthChange = (offset) => {
    let newMonth = month + offset;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    setMonth(newMonth);
    setYear(newYear);
    setSelectedDay(null); // Reset ngày chọn khi đổi tháng
  };

  // Tìm các ngày có ca trực trong tháng đang xem để đánh dấu (dot)
  const daysWithShift = schedules
    .filter((s) => {
      const d = dayjs(s.ngayLamViec).tz("Asia/Ho_Chi_Minh");
      return d.month() === month && d.year() === year;
    })
    .map((s) => dayjs(s.ngayLamViec).tz("Asia/Ho_Chi_Minh").date());

  /**
   * 5. LOGIC LỌC DANH SÁCH CHI TIẾT
   */
  const filteredList = schedules.filter((s) => {
    const d = dayjs(s.ngayLamViec).tz("Asia/Ho_Chi_Minh");
    if (d.month() !== month || d.year() !== year) return false;
    if (selectedDay && d.date() !== selectedDay) return false;
    return true;
  });

  // Thống kê nhanh số lượng
  const totalCount = schedules.length;
  const upcomingCount = schedules.filter((s) => getShiftStatus(s) === "upcoming").length;

  /**
   * 6. HÀM XỬ LÝ HÀNH ĐỘNG
   */
  const handleDelete = (id) => {
    if (!window.confirm("Bác sĩ có chắc chắn muốn hủy ca trực đã đăng ký này không?")) return;
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success("Đã xóa ca trực thành công"),
      onError: (err) => toast.error(err.message || "Không thể xóa ca trực"),
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Đang đồng bộ lịch trình...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý lịch công tác</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Cập nhật và theo dõi các khung giờ khám bệnh của bác sĩ
          </p>
        </div>
        <Link
          to="/doctor/schedule/add"
          className="px-6 py-3 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-2 uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          Đăng ký ca trực mới
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- CỘT TRÁI: BỘ LỊCH MINI (CALENDAR) --- */}
        <div className="lg:col-span-1">
          <div className="bg-white border-2 border-slate-100 rounded-2xl p-6 sticky top-8">
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => handleMonthChange(-1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">
                Tháng {month + 1}, {year}
              </h3>
              <button onClick={() => handleMonthChange(1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            {/* Header Thứ */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS_OF_WEEK.map((d) => (
                <div key={d} className="text-center text-[10px] font-bold text-slate-300 py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Lưới Ngày */}
            <div className="grid grid-cols-7 gap-1">
              {Array(firstDayIdx)
                .fill(null)
                .map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-bold transition-all relative ${
                    day === selectedDay
                      ? "bg-primary text-white border-2 border-primary"
                      : "text-slate-600 hover:bg-slate-50 border-2 border-transparent"
                  }`}
                >
                  {day}
                  {daysWithShift.includes(day) && (
                    <div
                      className={`w-1 h-1 rounded-full absolute bottom-1.5 ${day === selectedDay ? "bg-white" : "bg-primary"}`}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Legend / Guide */}
            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-3">
              <div className="w-1.5 h-8 bg-primary/20 rounded-full" />
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-tight leading-normal">
                {selectedDay ? `Ngày được chọn: ${selectedDay}` : `Đang xem toàn tháng ${month + 1}`}
                <br />
                <span className="text-slate-300 font-medium normal-case">Bấm vào ngày để lọc danh sách ca trực.</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- CỘT PHẢI: CHI TIẾT CA TRỰC --- */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden min-h-[400px] flex flex-col shadow-sm">
            <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">event_note</span>
                {selectedDay ? `Bản kê ca trực ngày ${selectedDay}` : `Toàn bộ ca trực tháng ${month + 1}`}
              </h3>
              {selectedDay && (
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-[10px] font-bold text-primary hover:underline uppercase"
                >
                  Hiện tất cả
                </button>
              )}
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-100 bg-white sticky top-0">
                  <tr className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    <th className="px-6 py-4">Thời gian</th>
                    <th className="px-6 py-4">Số lượng đăng ký</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-center">Quản lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredList.length > 0 ? (
                    filteredList.map((item) => {
                      const status = getShiftStatus(item);
                      const config = STATUS_CONFIG[status];
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-6 py-5">
                            <p className="text-sm font-bold text-slate-800">{formatDate(item.ngayLamViec)}</p>
                            <p className="text-xs text-primary font-bold mt-1">
                              {formatTime(item.khungGio?.gioBatDau)} - {formatTime(item.khungGio?.gioKetThuc)}
                            </p>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-1.5 w-32">
                              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                <div
                                  className="h-full bg-primary"
                                  style={{ width: `${(item.soBenhNhanHienTai / item.soBenhNhanToiDa) * 100}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-slate-400">
                                {item.soBenhNhanHienTai} / {item.soBenhNhanToiDa} Bệnh nhân
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span
                              className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${config.style}`}
                            >
                              {config.label}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-center">
                            {status !== "completed" ? (
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="size-8 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all flex items-center justify-center mx-auto"
                              >
                                <span className="material-symbols-outlined text-lg">delete</span>
                              </button>
                            ) : (
                              <span className="material-symbols-outlined text-emerald-400">verified_user</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-32 text-center text-slate-400 font-bold italic text-sm">
                        Trống: Không tìm thấy ca trực phù hợp
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- KPI STATS --- */}
          <div className="grid grid-cols-2 gap-4 pb-10">
            <div className="bg-white border-2 border-slate-100 rounded-2xl p-5 flex items-center gap-4">
              <div className="size-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <span className="material-symbols-outlined">assignment_turned_in</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tổng ca đăng ký</p>
                <p className="text-xl font-bold text-slate-800">{totalCount}</p>
              </div>
            </div>
            <div className="bg-white border-2 border-slate-100 rounded-2xl p-5 flex items-center gap-4">
              <div className="size-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <span className="material-symbols-outlined">pending_actions</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ca trực sắp tới</p>
                <p className="text-xl font-bold text-slate-800">{upcomingCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorSchedulePage;
