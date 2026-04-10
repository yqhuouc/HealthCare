/**
 * ============================================================
 * TRANG: Đăng ký Ca làm việc mới (Bác sĩ)
 * Đường dẫn: /doctor/schedule/add
 * ============================================================
 *
 * Chức năng chính:
 * 1. Hiển thị Calendar để bác sĩ chọn ngày trực cụ thể.
 * 2. Lấy danh sách Khung giờ (Shift slots) từ hệ thống qua API.
 * 3. Cho phép bác sĩ chọn một khung giờ và lưu vào lịch làm việc cá nhân.
 * 4. Ràng buộc dữ liệu: Yêu cầu chọn đầy đủ Ngày và Giờ mới cho phép Lưu.
 *
 * Luồng hoạt động:
 * - Mount: Gọi API getAllKhungGio() để render các button giờ.
 * - User chọn ngày trên lịch → Lưu vào state `selectedDate`.
 * - User chọn khung giờ → Lưu vào state `selectedSlotId`.
 * - User bấm Lưu → Gọi API createLichLamViec() → Chuyển hướng về trang Lịch trình.
 * ============================================================
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useKhungGio, useCreateLichLamViec } from "../../hooks/queries/useScheduleQueries";
import useAuthStore from "../../stores/useAuthStore";
import { toast } from "react-toastify";
import { formatTime } from "../../utils/formatters";

// Mảng định nghĩa tiêu đề các thứ trong tuần
const DAYS_OF_WEEK = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];



/**
 * Helper: Tính số ngày của tháng
 */
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Helper: Tính thứ của ngày đầu tiên trong tháng
 */
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function DoctorAddShiftPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const bacSiId = user?.bacSi?.id;

  // Quản lý trạng thái Calendar
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Đưa về 0h để so sánh ngày dễ hơn

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());

  // Quản lý dữ liệu Khung giờ từ TanStack Query
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const { data: kgRes } = useKhungGio();
  const khungGios = Array.isArray(kgRes?.data) ? kgRes.data : [];

  // TanStack Query: Mutation tạo ca làm việc
  const createMutation = useCreateLichLamViec();
  const submitting = createMutation.isPending;

  // Tính toán các thông số để render Calendar UI
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevDaysInMonth = getDaysInMonth(
    currentMonth === 0 ? currentYear - 1 : currentYear,
    currentMonth === 0 ? 11 : currentMonth - 1,
  );

  // Chuyển tháng
  const prevMonth = () => {
    // Không cho quay về tháng trước của hiện tại
    if (
      currentYear < today.getFullYear() ||
      (currentYear === today.getFullYear() && currentMonth <= today.getMonth())
    ) {
      return;
    }
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };

  const monthLabel = new Date(currentYear, currentMonth).toLocaleDateString(
    "vi-VN",
    {
      month: "long",
      year: "numeric",
    },
  );

  // Tạo các ô trống (ngày của tháng cũ/mới) để Calendar cân đối
  const trailingDays = [];
  const totalCells = firstDay + daysInMonth;
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= remaining; i++) trailingDays.push(i);

  const leadingDays = [];
  for (let i = firstDay - 1; i >= 0; i--) leadingDays.push(prevDaysInMonth - i);

  /**
   * Kiểm tra ngày có trong quá khứ không
   */
  const checkIsPastDay = (day) => {
    const dateToCheck = new Date(currentYear, currentMonth, day);
    return dateToCheck < today;
  };

  /**
   * Kiểm tra giờ có trong quá khứ không (cho ngày hiện tại)
   */
  const checkIsPastTime = (slotTime) => {
    const now = new Date();
    // Chỉ kiểm tra nếu ngày được chọn là hôm nay
    if (
      currentYear === now.getFullYear() &&
      currentMonth === now.getMonth() &&
      selectedDate === now.getDate()
    ) {
      const [hours, minutes] = slotTime.split(":").map(Number);
      const slotDate = new Date();
      slotDate.setHours(hours, minutes, 0, 0);
      return slotDate < now;
    }
    return false;
  };

  /**
   * Xử lý Lưu ca làm việc
   */
  const handleSave = async () => {
    // 1. Kiểm tra đầu vào
    if (!selectedSlotId) {
      toast.warn("Bạn chưa chọn khung giờ làm việc.");
      return;
    }

    if (!bacSiId) {
      toast.error("Thông tin định danh bác sĩ không hợp lệ.");
      return;
    }

    // 2. Chuẩn bị chuỗi ngày theo định dạng chuẩn SQL (YYYY-MM-DD)
    const month = String(currentMonth + 1).padStart(2, "0");
    const day = String(selectedDate).padStart(2, "0");
    const ngayLamViec = `${currentYear}-${month}-${day}`;

    // 3. Gọi mutation tạo mới
    createMutation.mutate(
      {
        bacSiId: Number(bacSiId),
        khungGioId: Number(selectedSlotId),
        ngayLamViec,
      },
      {
        onSuccess: () => {
          toast.success(`Đã thêm thành công ca trực ngày ${day}/${month}/${currentYear}`);
          navigate("/doctor/schedule");
        },
        onError: (err) => {
          toast.error(err.message || "Lỗi khi đăng ký ca làm việc");
        },
      }
    );
  };

  return (
    <div className="w-full mx-auto max-w-4xl space-y-6">
      {/* THANH ĐIỀU HƯỚNG (Breadcrumb) */}
      <nav className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
        <Link
          to="/doctor/schedule"
          className="text-slate-400 hover:text-primary transition-colors"
        >
          Lịch trình
        </Link>
        <span className="material-symbols-outlined text-[10px] text-slate-300">
          chevron_right
        </span>
        <span className="text-primary">Đăng ký ca mới</span>
      </nav>

      {/* TIÊU ĐỀ TRANG */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-slate-800">
          Đăng ký ca làm việc
        </h2>
        <p className="text-slate-500 text-sm font-medium italic">
          Vui lòng chọn ngày và giờ phù hợp để hệ thống cập nhật lịch khám cho
          bệnh nhân.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
        <div className="p-6 sm:p-10 space-y-10">
          {/* BƯỚC 1: CHỌN NGÀY (Phần Calendar) */}
          <section className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl text-xl">
                calendar_month
              </span>
              <label className="text-sm font-black text-slate-700 uppercase tracking-tight">
                1. Chọn ngày làm việc
              </label>
            </div>

            <div className="border border-slate-100 bg-slate-50/30 rounded-2xl p-4 sm:p-8 w-full max-w-2xl transition-all hover:bg-white hover:border-primary/20">
              <div className="flex items-center justify-between mb-6 px-2">
                <button
                  onClick={prevMonth}
                  disabled={
                    currentYear === today.getFullYear() &&
                    currentMonth === today.getMonth()
                  }
                  className={`p-2 rounded-xl border border-transparent transition-all ${
                    currentYear === today.getFullYear() &&
                    currentMonth === today.getMonth()
                      ? "text-slate-200 cursor-not-allowed"
                      : "hover:bg-white hover:border-slate-100 text-slate-400"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl font-bold">
                    chevron_left
                  </span>
                </button>
                <span className="text-sm font-black capitalize text-slate-800 tracking-wide">
                  {monthLabel}
                </span>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-100 transition-all text-slate-400"
                >
                  <span className="material-symbols-outlined text-xl font-bold">
                    chevron_right
                  </span>
                </button>
              </div>

              {/* Lưới ngày */}
              <div className="grid grid-cols-7 text-center gap-y-3">
                {DAYS_OF_WEEK.map((d) => (
                  <span
                    key={d}
                    className="text-[10px] font-black text-slate-300 uppercase py-2 tracking-widest"
                  >
                    {d}
                  </span>
                ))}
                {leadingDays.map((d) => (
                  <button
                    key={`prev-${d}`}
                    disabled
                    className="text-sm text-slate-200 cursor-not-allowed opacity-50 py-2 h-10 sm:h-12 font-medium"
                  >
                    {d}
                  </button>
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                  (day) => {
                    const isPast = checkIsPastDay(day);
                    return (
                      <button
                        key={day}
                        disabled={isPast}
                        onClick={() => setSelectedDate(day)}
                        className={`text-sm rounded-xl py-2 h-10 sm:h-12 transition-all font-bold ${
                          isPast
                            ? "text-slate-200 cursor-not-allowed opacity-40"
                            : day === selectedDate
                              ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110"
                              : "text-slate-600 hover:bg-white border border-transparent hover:border-primary/20 hover:text-primary"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  },
                )}
                {trailingDays.map((d) => (
                  <button
                    key={`next-${d}`}
                    disabled
                    className="text-sm text-slate-200 cursor-not-allowed opacity-50 py-2 h-10 sm:h-12 font-medium"
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <div className="h-px bg-slate-50 w-full" />

          {/* BƯỚC 2: CHỌN GIỜ (Khung giờ từ API) */}
          <section className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-amber-500 bg-amber-50 p-2 rounded-xl text-xl">
                schedule
              </span>
              <label className="text-sm font-black text-slate-700 uppercase tracking-tight">
                2. Chọn khung giờ làm việc
              </label>
            </div>

            {khungGios.length === 0 ? (
              <div className="flex flex-col items-center py-4">
                <span className="material-symbols-outlined animate-spin text-primary">
                  progress_activity
                </span>
                <p className="text-slate-400 text-[11px] font-bold uppercase mt-2">
                  Đang tải dữ liệu khung giờ...
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4 justify-center max-w-2xl px-4">
                {khungGios.map((slot) => {
                  const isPast = checkIsPastTime(slot.gioBatDau);
                  return (
                    <button
                      key={slot.id}
                      disabled={isPast}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`px-5 py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                        isPast
                          ? "bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed opacity-50"
                          : selectedSlotId === slot.id
                            ? "border-primary text-primary bg-primary/5 shadow-inner scale-105"
                            : "border-slate-50 bg-slate-50/50 text-slate-500 hover:border-primary/20 hover:text-primary hover:bg-white"
                      }`}
                    >
                      {formatTime(slot.gioBatDau)} —{" "}
                      {formatTime(slot.gioKetThuc)}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Cảnh báo nếu chưa chọn giờ */}
            {!selectedSlotId && (
              <p className="text-[10px] text-amber-500 font-bold uppercase mt-4 italic tracking-tighter">
                * Vui lòng chọn một khung giờ để tiếp tục
              </p>
            )}
          </section>
        </div>

        {/* NÚT THAO TÁC (Footer actions) */}
        <div className="bg-slate-50/50 px-6 sm:px-10 py-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-100">
          <button
            onClick={() => navigate("/doctor/schedule")}
            className="w-full sm:w-auto px-8 py-3 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 hover:text-slate-800 transition-all"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSave}
            disabled={submitting || !selectedSlotId}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="material-symbols-outlined text-lg animate-spin font-bold">
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined text-lg font-bold">
                save_as
              </span>
            )}
            {submitting ? "Đang xử lý..." : "Lưu ca làm việc"}
          </button>
        </div>
      </div>

      {/* Lưu ý nhỏ cuối trang */}
      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium px-2 italic">
        <span className="material-symbols-outlined text-xs">info</span>
        Lưu ý: Bác sĩ chỉ nên đăng ký ca trực khi chắc chắn về thời gian làm
        việc để tránh ảnh hưởng đến bệnh nhân.
      </div>
    </div>
  );
}

export default DoctorAddShiftPage;
