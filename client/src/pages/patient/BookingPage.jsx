/**
 * ============================================================
 * TRANG: Đặt lịch khám bệnh (Bệnh nhân)
 * Đường dẫn: /booking/:doctorId
 * ============================================================
 *
 * Chức năng:
 * - Quy trình đặt lịch 2 bước (step wizard):
 *   + Bước 1: Chọn ngày khám (14 ngày tiếp theo) + chọn slot trống + lý do khám
 *   + Bước 2: Xác nhận thông tin → gửi yêu cầu đặt lịch
 * - Gọi API slot trống theo bác sĩ + ngày
 * - Gửi POST /api/dat-lich để tạo lịch hẹn (thanh toán sau khi khám xong)
 *
 * Dữ liệu: API /api/bac-si/:id, /api/dat-lich/slot-trong
 * ============================================================
 */
import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useDoctor } from "../../hooks/queries/useDoctorQueries";
import { useSlotTrong, useCreateAppointment } from "../../hooks/queries/useAppointmentQueries";
import useAuthStore from "../../stores/useAuthStore";
import { formatPrice } from "../../utils/formatters";
import { toDateString, dayjs } from "../../utils/dateUtils";

const DAY_NAMES = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function generateNext14Days() {
  const days = [];
  const today = dayjs().tz("Asia/Ho_Chi_Minh");
  for (let i = 0; i <= 20; i++) {
    const date = today.add(i, "day");
    days.push({
      value: toDateString(date),
      display: date.format("DD/MM"),
      dayName: DAY_NAMES[date.day()],
      dateNum: date.date(),
    });
  }
  return days;
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export default function BookingPage() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const next14Days = useMemo(() => generateNext14Days(), []);

  // TanStack Query: Lấy thông tin bác sĩ
  const { data: docRes, isLoading: loadingDoctor } = useDoctor(doctorId);
  const doctor = docRes?.data || null;

  // Form states
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState("");
  const [step, setStep] = useState(1);

  // TanStack Query: Lấy slot trống khi chọn ngày (auto-refetch)
  const { data: slotRes, isLoading: loadingSlots } = useSlotTrong(doctorId, selectedDate);
  const slots = slotRes?.data?.slots || [];

  // TanStack Query: Mutation tạo lịch hẹn
  const createMutation = useCreateAppointment();
  const submitting = createMutation.isPending;

  // Loading bác sĩ
  if (loadingDoctor) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
        <p className="mt-4 text-slate-500">Đang tải thông tin bác sĩ...</p>
      </div>
    );
  }

  // Không tìm thấy bác sĩ
  if (!doctor) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-300">error</span>
        <h2 className="text-xl font-semibold text-slate-700 mt-4">Không tìm thấy bác sĩ</h2>
        <p className="text-slate-500 mt-2">Bác sĩ bạn đang tìm không tồn tại hoặc đã bị xóa.</p>
        <Link
          to="/doctors"
          className="inline-block mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition"
        >
          Quay lại danh sách bác sĩ
        </Link>
      </div>
    );
  }

  const specialtyName = doctor.chuyenKhoa?.tenChuyenKhoa || "Chưa phân khoa";
  const avatarUrl = doctor.taiKhoan?.anhDaiDien;
  const canContinue = selectedDate && selectedSlot;

  const handleContinue = () => {
    if (!canContinue) return;
    setStep(2);
  };

  const handleConfirm = () => {
    if (submitting) return;

    const benhNhanId = user?.benhNhan?.id;
    if (!benhNhanId) {
      toast.error("Không tìm thấy thông tin bệnh nhân. Vui lòng đăng nhập lại.");
      return;
    }

    createMutation.mutate(
      {
        bacSiId: Number(doctorId),
        benhNhanId: Number(benhNhanId),
        ngayDat: selectedDate,
        gioBatDau: selectedSlot.gioBatDau,
        lyDoKham: reason || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Đặt lịch thành công! Vui lòng chờ xác nhận từ phòng khám.");
          navigate("/appointments");
        },
        onError: (err) => {
          toast.error(err?.message || "Đặt lịch thất bại. Vui lòng thử lại.");
        },
      },
    );
  };

  const selectedDayInfo = next14Days.find((d) => d.value === selectedDate);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
        <Link to="/" className="hover:text-primary transition">
          Trang chủ
        </Link>
        <span className="material-symbols-outlined text-base">chevron_right</span>
        <Link to="/doctors" className="hover:text-primary transition">
          Bác sĩ
        </Link>
        <span className="material-symbols-outlined text-base">chevron_right</span>
        <span className="text-slate-700 font-medium">Đặt lịch khám</span>
      </nav>

      {/* Thông tin bác sĩ (compact) */}
      <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-lg p-4 mb-8">
        <div className="w-16 h-16 rounded-full border-2 border-primary/20 bg-primary/5 flex items-center justify-center overflow-hidden shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={doctor.tenBacSi} className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-3xl text-primary/40">person</span>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-800">{doctor.tenBacSi}</h3>
          <p className="text-sm text-slate-500">{specialtyName}</p>
        </div>
        {doctor.giaKham && (
          <div className="text-right">
            <p className="text-primary font-bold text-lg">{formatPrice(doctor.giaKham)}</p>
            <p className="text-xs text-slate-400">/ lần khám</p>
          </div>
        )}
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${step === 1 ? "bg-primary text-white" : "bg-slate-100 text-slate-500"}`}
        >
          <span className="material-symbols-outlined text-lg">calendar_month</span>
          Chọn ngày giờ
        </div>
        <span className="material-symbols-outlined text-slate-300">arrow_forward</span>
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${step === 2 ? "bg-primary text-white" : "bg-slate-100 text-slate-500"}`}
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
              <span className="material-symbols-outlined text-primary">calendar_month</span>
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
                  <span className="text-xs font-medium opacity-80">{day.dayName}</span>
                  <span className="text-lg font-bold mt-1">{day.dateNum}</span>
                  <span className="text-xs opacity-70">{day.display}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Chọn giờ (slot trống từ API) */}
          <section>
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">schedule</span>
              Chọn giờ khám
            </h3>

            {!selectedDate ? (
              <p className="text-slate-400 text-sm italic">Vui lòng chọn ngày khám trước.</p>
            ) : loadingSlots ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-3xl text-primary animate-spin">progress_activity</span>
                <p className="mt-2 text-slate-500 text-sm">Đang tải slot trống...</p>
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-lg">
                <span className="material-symbols-outlined text-4xl text-slate-300">event_busy</span>
                <p className="mt-2 text-slate-500 text-sm">Bác sĩ không có lịch làm việc vào ngày này.</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {slots.map((slot, idx) => {
                  const now = dayjs().tz("Asia/Ho_Chi_Minh");
                  const [h, m] = slot.gioBatDau.split(":").map(Number);
                  const slotDate = dayjs(selectedDate)
                    .tz("Asia/Ho_Chi_Minh")
                    .hour(h)
                    .minute(m)
                    .second(0)
                    .millisecond(0);

                  const isPast = slotDate.isBefore(now);
                  const isBooked = slot.daDat || !slot.conTrong || isPast;
                  const isSelected = selectedSlot?.gioBatDau === slot.gioBatDau;

                  return (
                    <button
                      key={idx}
                      onClick={() => !isBooked && setSelectedSlot(slot)}
                      disabled={isBooked}
                      className={`py-3 rounded-lg border text-sm font-medium transition ${
                        isBooked
                          ? "bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed"
                          : isSelected
                            ? "bg-primary text-white border-primary cursor-pointer"
                            : "bg-white border-slate-200 text-slate-600 hover:border-primary hover:text-primary cursor-pointer"
                      }`}
                    >
                      <span className={isPast ? "line-through opacity-50" : ""}>{slot.gioBatDau}</span>
                      {isPast ? (
                        <span className="text-[10px] block mt-1 font-bold text-slate-400">Hết hạn</span>
                      ) : isBooked ? (
                        <span className="text-[10px] block mt-1 font-bold text-red-400">Đã đặt</span>
                      ) : (
                        <span className="text-[10px] block mt-1 font-bold text-emerald-500">Còn trống</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <p className="text-sm text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-lg shrink-0">info</span>
            Thanh toán sau khi khám xong (online qua VNPay hoặc tại quầy đón tiếp).
          </p>

          {/* Lý do khám */}
          <section>
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">edit_note</span>
              Lý do khám <span className="text-slate-400 font-normal text-xs">(tùy chọn)</span>
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
              canContinue ? "bg-primary hover:opacity-90" : "bg-slate-300 cursor-not-allowed"
            }`}
          >
            Tiếp tục
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-800">Xác nhận thông tin đặt lịch</h3>

          {/* Thẻ xác nhận */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
            {/* Bác sĩ */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full border-2 border-primary/20 bg-primary/5 flex items-center justify-center overflow-hidden shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={doctor.tenBacSi} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-3xl text-primary/40">person</span>
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-800">{doctor.tenBacSi}</p>
                <p className="text-sm text-slate-500">{specialtyName}</p>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Chi tiết lịch hẹn */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400 mb-1">Ngày khám</p>
                <p className="font-medium text-slate-700 flex items-center gap-1">
                  <span className="material-symbols-outlined text-base text-primary">calendar_month</span>
                  {selectedDayInfo?.dayName}, {formatDisplayDate(selectedDate)}
                </p>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Giờ khám</p>
                <p className="font-medium text-slate-700 flex items-center gap-1">
                  <span className="material-symbols-outlined text-base text-primary">schedule</span>
                  {selectedSlot?.gioBatDau} - {selectedSlot?.gioKetThuc}
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
                {doctor.giaKham ? formatPrice(doctor.giaKham) : "Liên hệ"}
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
              disabled={submitting}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition cursor-pointer flex items-center justify-center gap-2 ${
                submitting ? "bg-slate-400 cursor-not-allowed" : "bg-primary hover:opacity-90"
              }`}
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">check_circle</span>
                  Xác nhận đặt lịch
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
