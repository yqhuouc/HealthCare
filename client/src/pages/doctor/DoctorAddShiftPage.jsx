/**
 * ============================================================
 * TRANG: ĐĂNG KÝ CA TRỰC MỚI (BÁC SĨ)
 * Đường dẫn: /doctor/schedule/add
 * ============================================================
 *
 * CHỨC NĂNG CHÍNH:
 * 1. Hiển thị lịch để bác sĩ chọn ngày công tác.
 * 2. Hiển thị danh sách các khung giờ (Morning, Afternoon...) từ hệ thống.
 * 3. Ràng buộc: Không cho chọn ngày trong quá khứ hoặc giờ đã qua của hôm nay.
 *
 * PHONG CÁCH THIẾT KẾ:
 * - Giao diện "Clinical Form" (Mẫu biểu y tế) tinh giản, rõ ràng.
 * - Sử dụng các khối nội dung được bao bọc bởi Border-2 mảnh.
 * - Màu sắc chủ đạo: Slate (xanh đá) trung tính và Emerald (xanh lá) cho các hành động thành công.
 * ============================================================
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useKhungGio, useCreateLichLamViec } from "../../hooks/queries/useScheduleQueries";
import useAuthStore from "../../stores/useAuthStore";
import { toast } from "react-toastify";
import { formatTime, dayjs } from "../../utils/dateUtils";

// Thứ trong tuần rút gọn
const DAYS_OF_WEEK = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

/**
 * HÀM HỖ TRỢ: Lấy thông tin tháng (Số ngày & Vị trí ngày đầu tiên)
 */
function getMonthData(year, month) {
  const d = dayjs().year(year).month(month);
  return {
    daysInMonth: d.daysInMonth(),
    firstDayIdx: d.startOf("month").day(),
  };
}

function DoctorAddShiftPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const bacSiId = user?.bacSi?.id;

  /**
   * 1. QUẢN LÝ TRẠNG THÁI FORM
   */
  const today = dayjs().tz("Asia/Ho_Chi_Minh").startOf("day");
  const [month, setMonth] = useState(today.month());
  const [year, setYear] = useState(today.year());
  const [selectedDay, setSelectedDay] = useState(today.date());
  const [selectedSlotId, setSelectedSlotId] = useState(null);

  /**
   * 2. GỌI DỮ LIỆU TỪ SERVER
   */
  const { data: kgRes, isLoading: loadingKg } = useKhungGio();
  const khungGios = Array.isArray(kgRes?.data) ? kgRes.data : [];
  const createMutation = useCreateLichLamViec();

  /**
   * 3. LOGIC XỬ LÝ LỊCH (CALENDAR)
   */
  const { daysInMonth, firstDayIdx } = getMonthData(year, month);

  // Kiểm tra tính hợp lệ của ngày (Không cho chọn quá khứ)
  const isPast = (day) => {
    const target = dayjs().year(year).month(month).date(day).startOf("day");
    return target.isBefore(today);
  };

  // Kiểm tra tính hợp lệ của giờ (Nếu chọn ngày hôm nay)
  const isPastTime = (slotTime) => {
    const now = dayjs().tz("Asia/Ho_Chi_Minh");
    if (year === now.year() && month === now.month() && selectedDay === now.date()) {
      const [h, m] = slotTime.split(":").map(Number);
      return now.hour(h).minute(m).isBefore(now);
    }
    return false;
  };

  /**
   * 4. HÀM XỬ LÝ ĐIỀU HƯỚNG THÁNG (SỬ DỤNG SETYEAR)
   */
  const handlePrevMonth = () => {
    if (month === today.month() && year === today.year()) return;
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  /**
   * 5. HÀM XỬ LÝ LƯU DỮ LIỆU
   */
  const handleSave = () => {
    if (!selectedSlotId) {
      toast.warning("Vui lòng chọn một khung giờ làm việc.");
      return;
    }

    // Định dạng ngày chuẩn ISO: YYYY-MM-DD
    const dateStr = dayjs().year(year).month(month).date(selectedDay).format("YYYY-MM-DD");

    createMutation.mutate(
      {
        bacSiId: Number(bacSiId),
        khungGioId: Number(selectedSlotId),
        ngayLamViec: dateStr,
      },
      {
        onSuccess: () => {
          toast.success("Đã đăng ký ca trực thành công!");
          navigate("/doctor/schedule");
        },
        onError: (err) => toast.error(err.message || "Lỗi khi đăng ký ca"),
      },
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700 p-4 sm:p-0">
      {/* điều hướng rút gọn */}
      <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <Link to="/doctor/schedule" className="hover:text-primary transition-colors">
          Lịch trình
        </Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-slate-600">Đăng ký mới</span>
      </nav>

      {/* Tiêu đề */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Thiết lập ca trực mới</h1>
        <p className="text-slate-500 text-sm font-medium">
          Bác sĩ vui lòng chọn ngày và giờ công tác chính xác để hệ thống đồng bộ.
        </p>
      </div>

      <div className="bg-white border-2 border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 sm:p-10 space-y-12">
          {/* BƯỚC 1: CALENDAR PICKER */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">calendar_today</span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">1. Chọn ngày công tác</h3>
            </div>

            <div className="bg-slate-50/50 border-2 border-slate-100 rounded-2xl p-6 sm:p-8">
              {/* Month Controller */}
              <div className="flex items-center justify-between mb-8 max-w-sm mx-auto">
                <button
                  onClick={handlePrevMonth}
                  className={`p-2 rounded-lg border border-slate-200 transition-all ${month === today.month() && year === today.year() ? "opacity-20 translate-x-1 grayscale" : "hover:bg-white text-slate-500"}`}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="text-sm font-bold text-slate-800 uppercase tracking-tighter">
                  Tháng {month + 1}, {year}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-2 border border-slate-200 hover:bg-white rounded-lg text-slate-500"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>

              {/* Grid Ngày */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 max-w-xl mx-auto">
                {DAYS_OF_WEEK.map((d) => (
                  <div key={d} className="text-center text-[10px] font-bold text-slate-300 py-2 uppercase">
                    {d}
                  </div>
                ))}
                {Array(firstDayIdx)
                  .fill(null)
                  .map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const past = isPast(day);
                  const selected = selectedDay === day;
                  return (
                    <button
                      key={day}
                      disabled={past}
                      onClick={() => setSelectedDay(day)}
                      className={`aspect-square flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                        past
                          ? "text-slate-200 cursor-not-allowed"
                          : selected
                            ? "bg-primary text-white scale-110 shadow-lg"
                            : "text-slate-600 hover:bg-white border-2 border-transparent hover:border-primary/20"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* BƯỚC 2: TIME SLOTS */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                <span className="material-symbols-outlined">schedule</span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">2. Chọn khung giờ trực</h3>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              {loadingKg ? (
                <div className="py-4 text-slate-400 text-xs font-bold animate-pulse uppercase">
                  Đang tải danh mục khung giờ...
                </div>
              ) : (
                khungGios.map((slot) => {
                  const past = isPastTime(slot.gioBatDau);
                  const selected = selectedSlotId === slot.id;
                  return (
                    <button
                      key={slot.id}
                      disabled={past}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`px-6 py-3 rounded-xl text-xs font-bold border-2 transition-all ${
                        past
                          ? "opacity-30 border-slate-100 text-slate-300 cursor-not-allowed strike-through"
                          : selected
                            ? "border-primary text-primary bg-primary/5 scale-105"
                            : "border-slate-100 text-slate-500 hover:border-primary/20 hover:text-primary"
                      }`}
                    >
                      {formatTime(slot.gioBatDau)} - {formatTime(slot.gioKetThuc)}
                    </button>
                  );
                })
              )}
            </div>
            {!selectedSlotId && (
              <p className="text-center text-[10px] text-amber-500 font-bold uppercase italic">
                * Yêu cầu bác sĩ chọn 1 khung giờ cụ thể
              </p>
            )}
          </section>
        </div>

        {/* Action Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-10 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-slate-800 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSave}
            disabled={createMutation.isPending || !selectedSlotId}
            className="w-full sm:w-auto px-10 py-3 bg-primary text-white text-xs font-bold rounded-xl uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:grayscale"
          >
            {createMutation.isPending ? (
              <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-lg">check_circle</span>
            )}
            {createMutation.isPending ? "Đang lưu..." : "Lưu ca trực"}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-[10px] text-slate-300 font-bold uppercase tracking-tighter italic">
        <span className="material-symbols-outlined text-xs">shield</span>
        Mọi thay đổi sẽ được cập nhật đồng nhất lên hệ thống đặt lịch của bệnh nhân.
      </div>
    </div>
  );
}

export default DoctorAddShiftPage;
