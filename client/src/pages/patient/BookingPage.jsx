/**
 * ============================================================
 * TRANG: Đặt lịch khám bệnh (Bệnh nhân)
 * Đường dẫn: /booking/:doctorId
 * ============================================================
 *
 * Chức năng:
 * - Quy trình đặt lịch 2 bước (step wizard):
 *   + Bước 1: Chọn ngày khám (14 ngày tiếp theo) + giờ khám + lý do
 *   + Bước 2: Xác nhận thông tin → gửi yêu cầu đặt lịch
 * - Hiển thị thông tin bác sĩ + giá khám ở header
 * - Step indicator hiển thị bước hiện tại
 *
 * State:
 * - selectedDate: ngày khám được chọn (dạng "YYYY-MM-DD")
 * - selectedTime: giờ khám được chọn (dạng "HH:mm")
 * - reason: lý do khám (tùy chọn, nhập tự do)
 * - step: bước hiện tại của wizard (1 hoặc 2)
 *
 * Params:
 * - doctorId (URL param): ID bác sĩ muốn đặt lịch
 *
 * Dữ liệu: DOCTORS, TIME_SLOTS từ mockDoctors.js
 * ============================================================
 */
import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DOCTORS, TIME_SLOTS } from "../../data/mockDoctors";
import { toast } from "react-toastify";

/** Tên viết tắt các ngày trong tuần (0=CN, 1=T2, ..., 6=T7) */
const DAY_NAMES = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

/** Tạo danh sách 14 ngày tiếp theo kể từ hôm nay */
function generateNext14Days() {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    days.push({
      value: `${yyyy}-${mm}-${dd}`,
      display: `${dd}/${mm}`,
      dayName: DAY_NAMES[date.getDay()],
      dateNum: date.getDate(),
    });
  }
  return days;
}

/** Format giá tiền VND */
function formatPrice(price) {
  return price.toLocaleString("vi-VN") + "đ";
}

/** Format ngày hiển thị dạng dd/MM/yyyy */
function formatDisplayDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export default function BookingPage() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const doctor = DOCTORS.find((d) => d.id === Number(doctorId));

  const next14Days = useMemo(() => generateNext14Days(), []);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");
  const [step, setStep] = useState(1);

  if (!doctor) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-300">
          error
        </span>
        <h2 className="text-xl font-semibold text-slate-700 mt-4">
          Không tìm thấy bác sĩ
        </h2>
        <p className="text-slate-500 mt-2">
          Bác sĩ bạn đang tìm không tồn tại hoặc đã bị xóa.
        </p>
        <Link
          to="/doctors"
          className="inline-block mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition"
        >
          Quay lại danh sách bác sĩ
        </Link>
      </div>
    );
  }

  const canContinue = selectedDate && selectedTime;

  const handleContinue = () => {
    if (!canContinue) return;
    setStep(2);
  };

  const handleConfirm = () => {
    toast.success("Đặt lịch thành công!");
    navigate("/appointments");
  };

  // Lấy thông tin ngày đã chọn để hiển thị ở bước xác nhận
  const selectedDayInfo = next14Days.find((d) => d.value === selectedDate);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
        <Link to="/" className="hover:text-primary transition">
          Trang chủ
        </Link>
        <span className="material-symbols-outlined text-base">
          chevron_right
        </span>
        <Link to="/doctors" className="hover:text-primary transition">
          Bác sĩ
        </Link>
        <span className="material-symbols-outlined text-base">
          chevron_right
        </span>
        <span className="text-slate-700 font-medium">Đặt lịch khám</span>
      </nav>

      {/* Thông tin bác sĩ (compact) */}
      <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-lg p-4 mb-8">
        <img
          src={doctor.image}
          alt={doctor.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-slate-800">{doctor.name}</h3>
          <p className="text-sm text-slate-500">{doctor.specialty}</p>
        </div>
        <div className="text-right">
          <p className="text-primary font-bold text-lg">
            {formatPrice(doctor.price)}
          </p>
          <p className="text-xs text-slate-400">/ lần khám</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
            step === 1 ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            calendar_month
          </span>
          Chọn ngày giờ
        </div>
        <span className="material-symbols-outlined text-slate-300">
          arrow_forward
        </span>
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
            step === 2 ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
          }`}
        >
          <span className="material-symbols-outlined text-lg">fact_check</span>
          Xác nhận
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-8">
          {/* Chọn ngày */}
          <section>
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                calendar_month
              </span>
              Chọn ngày khám
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {next14Days.map((day) => (
                <button
                  key={day.value}
                  onClick={() => setSelectedDate(day.value)}
                  className={`flex flex-col items-center py-3 px-1 rounded-lg border text-sm transition cursor-pointer ${
                    selectedDate === day.value
                      ? "bg-primary text-white border-primary"
                      : "bg-white border-slate-200 text-slate-600 hover:border-primary hover:text-primary"
                  }`}
                >
                  <span className="text-xs font-medium opacity-80">
                    {day.dayName}
                  </span>
                  <span className="text-lg font-bold mt-1">{day.dateNum}</span>
                  <span className="text-xs opacity-70">{day.display}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Chọn giờ */}
          <section>
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                schedule
              </span>
              Chọn giờ khám
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  className={`py-3 rounded-lg border text-sm font-medium transition cursor-pointer ${
                    selectedTime === slot
                      ? "bg-primary text-white border-primary"
                      : "bg-white border-slate-200 text-slate-600 hover:border-primary hover:text-primary"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </section>

          {/* Lý do khám */}
          <section>
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                edit_note
              </span>
              Lý do khám
            </h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Mô tả triệu chứng hoặc lý do bạn muốn khám..."
              rows={4}
              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none transition"
            />
          </section>

          {/* Nút tiếp tục */}
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className={`w-full py-3 rounded-lg font-semibold text-white transition cursor-pointer flex items-center justify-center gap-2 ${
              canContinue
                ? "bg-primary hover:opacity-90"
                : "bg-slate-300 cursor-not-allowed"
            }`}
          >
            Tiếp tục
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-800">
            Xác nhận thông tin đặt lịch
          </h3>

          {/* Thẻ xác nhận */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
            {/* Bác sĩ */}
            <div className="flex items-center gap-4">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="w-14 h-14 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-slate-800">{doctor.name}</p>
                <p className="text-sm text-slate-500">{doctor.specialty}</p>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Chi tiết lịch hẹn */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400 mb-1">Ngày khám</p>
                <p className="font-medium text-slate-700 flex items-center gap-1">
                  <span className="material-symbols-outlined text-base text-primary">
                    calendar_month
                  </span>
                  {selectedDayInfo?.dayName}, {formatDisplayDate(selectedDate)}
                </p>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Giờ khám</p>
                <p className="font-medium text-slate-700 flex items-center gap-1">
                  <span className="material-symbols-outlined text-base text-primary">
                    schedule
                  </span>
                  {selectedTime}
                </p>
              </div>
            </div>

            {reason && (
              <>
                <div className="border-t border-slate-100" />
                <div className="text-sm">
                  <p className="text-slate-400 mb-1">Lý do khám</p>
                  <p className="text-slate-700">{reason}</p>
                </div>
              </>
            )}

            <div className="border-t border-slate-100" />

            {/* Tổng chi phí */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Phí khám</span>
              <span className="text-xl font-bold text-primary">
                {formatPrice(doctor.price)}
              </span>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex gap-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 rounded-lg font-semibold border border-slate-300 text-slate-600 hover:bg-slate-50 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Quay lại
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 rounded-lg font-semibold bg-primary text-white hover:opacity-90 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">check_circle</span>
              Xác nhận đặt lịch
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
