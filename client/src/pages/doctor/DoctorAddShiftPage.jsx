/**
 * ============================================================
 * TRANG: Thêm ca làm việc mới (Bác sĩ)
 * Đường dẫn: /doctor/schedule/add
 * ============================================================
 *
 * Chức năng:
 * - Calendar full-size để chọn ngày làm việc (kèm leading/trailing days)
 * - Chọn khung giờ từ danh sách TIME_SLOTS (08:00-10:00, 10:00-12:00, ...)
 * - Textarea ghi chú tùy chọn
 * - Validate: phải chọn khung giờ trước khi lưu
 * - Nút "Lưu ca làm việc" → toast thành công → quay về /doctor/schedule
 * - Breadcrumb: Lịch làm việc / Thêm ca làm việc
 *
 * State:
 * - currentMonth / currentYear: tháng/năm hiển thị trên calendar
 * - selectedDate: ngày đã chọn (số ngày 1-31)
 * - selectedSlot: khung giờ đã chọn ("08:00 - 10:00", v.v.)
 * - notes: ghi chú tùy chọn
 *
 * Helper functions:
 * - getDaysInMonth(): số ngày trong tháng
 * - getFirstDayOfMonth(): ngày đầu tiên trong tuần (0=CN)
 * ============================================================
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

/** Tên viết tắt các ngày trong tuần */
const DAYS_OF_WEEK = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

/** Các khung giờ làm việc có thể chọn */
const TIME_SLOTS = [
  "08:00 - 10:00",
  "10:00 - 12:00",
  "13:30 - 15:30",
  "15:30 - 17:30",
  "18:00 - 20:00",
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function DoctorAddShiftPage() {
  const navigate = useNavigate();
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState(now.getDate());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState("");

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevDaysInMonth = getDaysInMonth(
    currentMonth === 0 ? currentYear - 1 : currentYear,
    currentMonth === 0 ? 11 : currentMonth - 1
  );

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

  const monthLabel = new Date(currentYear, currentMonth).toLocaleDateString(
    "vi-VN",
    { month: "long", year: "numeric" }
  );

  const trailingDays = [];
  const totalCells = firstDay + daysInMonth;
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= remaining; i++) {
    trailingDays.push(i);
  }

  const leadingDays = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    leadingDays.push(prevDaysInMonth - i);
  }

  const handleSave = () => {
    if (!selectedSlot) {
      toast.warn("Vui lòng chọn khung giờ làm việc.");
      return;
    }
    toast.success(
      `Đã thêm ca làm việc ngày ${selectedDate}/${currentMonth + 1}/${currentYear} — ${selectedSlot}`
    );
    navigate("/doctor/schedule");
  };

  return (
    <div className="w-full mx-auto max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link
          to="/doctor/schedule"
          className="text-slate-500 hover:text-primary transition-colors"
        >
          Lịch làm việc
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-medium">Thêm ca làm việc</span>
      </div>

      {/* Page title */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">
          Thêm ca làm việc mới
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Vui lòng nhập đầy đủ thông tin để khởi tạo ca trực mới của bạn trong
          hệ thống.
        </p>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 space-y-8">
          {/* Calendar Section */}
          <section className="flex flex-col items-center">
            <label className="block text-sm font-semibold text-slate-700 mb-4">
              Chọn ngày làm việc
            </label>
            <div className="border border-slate-200 rounded-lg p-4 sm:p-8 w-full max-w-2xl">
              {/* Month nav */}
              <div className="flex items-center justify-between mb-4 px-2">
                <button
                  onClick={prevMonth}
                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">
                    chevron_left
                  </span>
                </button>
                <span className="text-sm font-bold capitalize">
                  {monthLabel}
                </span>
                <button
                  onClick={nextMonth}
                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">
                    chevron_right
                  </span>
                </button>
              </div>

              {/* Days header */}
              <div className="grid grid-cols-7 text-center gap-y-4">
                {DAYS_OF_WEEK.map((day) => (
                  <span
                    key={day}
                    className="text-xs sm:text-base font-bold text-slate-400 uppercase py-2"
                  >
                    {day}
                  </span>
                ))}

                {/* Leading days (prev month) */}
                {leadingDays.map((d) => (
                  <button
                    key={`prev-${d}`}
                    disabled
                    className="text-sm sm:text-base text-slate-300 cursor-not-allowed py-2 h-10 sm:h-12"
                  >
                    {d}
                  </button>
                ))}

                {/* Current month days */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                  (day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(day)}
                      className={`text-sm sm:text-base rounded-full py-2 h-10 sm:h-12 transition-colors ${
                        day === selectedDate
                          ? "bg-primary text-white font-bold"
                          : "hover:bg-primary/10 hover:text-primary"
                      }`}
                    >
                      {day}
                    </button>
                  )
                )}

                {/* Trailing days (next month) */}
                {trailingDays.map((d) => (
                  <button
                    key={`next-${d}`}
                    disabled
                    className="text-sm sm:text-base text-slate-300 cursor-not-allowed py-2 h-10 sm:h-12"
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Time Slots */}
          <section className="flex flex-col items-center">
            <label className="block text-sm font-semibold text-slate-700 mb-4">
              Chọn khung giờ làm việc
            </label>
            <div className="flex flex-wrap gap-3 justify-center">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`px-4 sm:px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    selectedSlot === slot
                      ? "border-2 border-primary text-primary bg-primary/5 font-bold"
                      : "border border-slate-200 bg-white hover:border-primary hover:text-primary"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </section>

          {/* Notes */}
          <section className="max-w-2xl mx-auto w-full">
            <label
              htmlFor="shift-notes"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              Ghi chú (không bắt buộc)
            </label>
            <textarea
              id="shift-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Thêm lưu ý cho ca trực này..."
              rows={4}
              className="w-full rounded-lg border-slate-200 bg-white text-sm focus:ring-primary focus:border-primary"
            />
          </section>
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 px-6 sm:px-8 py-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-200">
          <button
            onClick={() => navigate("/doctor/schedule")}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-semibold shadow-md shadow-primary/20 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">save</span>
            Lưu ca làm việc
          </button>
        </div>
      </div>
    </div>
  );
}

export default DoctorAddShiftPage;
