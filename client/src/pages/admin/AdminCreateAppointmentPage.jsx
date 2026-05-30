/**
 * ============================================================
 * TRANG: Tiếp đón & Đăng ký khám tại quầy (Admin)
 * Đường dẫn: /admin/appointments/create
 * ============================================================
 *
 * Chức năng chính:
 * 1. Tiếp đón bệnh nhân trực tiếp tại quầy lễ tân (offline).
 * 2. Đăng ký khám nhanh thông qua quy trình Wizard 4 bước:
 *    - Bước 1: Chọn bệnh nhân sẵn có trong hệ thống hoặc tạo nhanh hồ sơ bệnh nhân vãng lai (không cần tài khoản website).
 *    - Bước 2: Chọn chuyên khoa và danh sách bác sĩ thuộc chuyên khoa đang hoạt động.
 *    - Bước 3: Chọn ngày khám làm việc (trong vòng 14 ngày kế tiếp) và các khung giờ (time slots) còn trống của bác sĩ.
 *    - Bước 4: Xem tóm tắt thông tin dịch vụ, nhập lý do khám lâm sàng và xác nhận đặt lịch (lịch sẽ tự động duyệt sang trạng thái Chờ khám).
 *
 * Dữ liệu sử dụng:
 * - API Tìm bệnh nhân, Tạo bệnh nhân vãng lai, Danh sách chuyên khoa, Danh sách bác sĩ, Khung giờ trực trống, Tạo lịch hẹn.
 * ============================================================
 */

import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { usePatients, useCreatePatient } from "../../hooks/queries/usePatientQueries";
import { useSpecialties } from "../../hooks/queries/useSpecialtyQueries";
import { useDoctors } from "../../hooks/queries/useDoctorQueries";
import { useSlotTrong, useCreateAppointment } from "../../hooks/queries/useAppointmentQueries";
import { formatPrice } from "../../utils/formatters";
import { toDateString, dayjs, formatDate } from "../../utils/dateUtils";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// Tên các ngày trong tuần phục vụ hiển thị lịch chọn ngày
const DAY_NAMES = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

/**
 * Hàm sinh tự động danh sách 14 ngày làm việc tiếp theo kể từ ngày hôm nay
 * @returns {Array<{ value: string, display: string, dayName: string, dateNum: number }>}
 */
function generateNext14Days() {
  const days = [];
  // Sử dụng múi giờ Việt Nam để đồng bộ thời gian thực tế
  const today = dayjs().tz("Asia/Ho_Chi_Minh");
  for (let i = 0; i <= 14; i++) {
    const date = today.add(i, "day");
    days.push({
      value: toDateString(date), // Định dạng YYYY-MM-DD gửi lên server
      display: date.format("DD/MM"), // Định dạng DD/MM hiển thị
      dayName: DAY_NAMES[date.day()], // Thứ mấy (T2, T3, ...)
      dateNum: date.date(), // Số ngày (1, 2, 3...)
    });
  }
  return days;
}

export default function AdminCreateAppointmentPage() {
  const navigate = useNavigate();

  // Lưu danh sách 14 ngày tiếp theo vào bộ nhớ cache của component tránh sinh lại khi re-render
  const next14Days = useMemo(() => generateNext14Days(), []);

  // ============================================================
  // QUẢN LÝ TRẠNG THÁI (STATE MANAGEMENT)
  // ============================================================

  // Trạng thái bước hiện tại trong Wizard (1, 2, 3 hoặc 4)
  const [step, setStep] = useState(1);

  // States Bước 1: Tìm kiếm bệnh nhân và bệnh nhân được chọn
  const [patientSearch, setPatientSearch] = useState(""); // Từ khóa tìm kiếm nhập trực tiếp
  const [debouncedSearch, setDebouncedSearch] = useState(""); // Từ khóa đã được trì hoãn (debounce) để tránh spam API
  const [selectedPatient, setSelectedPatient] = useState(null); // Thông tin hồ sơ bệnh nhân được chọn

  // States Tạo hồ sơ nhanh bệnh nhân vãng lai (không tài khoản)
  const [showCreateForm, setShowCreateForm] = useState(false); // Trạng thái hiển thị form tạo nhanh
  const [newPatientName, setNewPatientName] = useState(""); // Họ tên bệnh nhân mới
  const [newPatientPhone, setNewPatientPhone] = useState(""); // SĐT bệnh nhân mới
  const [newPatientEmail, setNewPatientEmail] = useState(""); // Email liên hệ bệnh nhân mới (tùy chọn)

  // States Bước 2: Chuyên khoa & Bác sĩ được chọn
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState(""); // ID chuyên khoa được chọn
  const [selectedDoctorId, setSelectedDoctorId] = useState(""); // ID bác sĩ được chọn

  // States Bước 3: Ngày làm việc & Khung giờ khám được chọn
  const [selectedDate, setSelectedDate] = useState(""); // Ngày khám đã chọn (YYYY-MM-DD)
  const [selectedSlot, setSelectedSlot] = useState(null); // Khung giờ đã chọn
  const [reason, setReason] = useState(""); // Triệu chứng lâm sàng / Lý do khám

  // ============================================================
  // HIỆU ỨNG TRÌ HOÃN TÌM KIẾM (DEBOUNCE SEARCH EFFECT)
  // ============================================================
  useState(() => {
    // Trì hoãn 400ms sau khi người dùng ngừng gõ phím mới cập nhật debouncedSearch
    const timer = setTimeout(() => {
      setDebouncedSearch(patientSearch);
    }, 400);
    return () => clearTimeout(timer);
  }, [patientSearch]);

  /**
   * Xử lý thay đổi input tìm kiếm bệnh nhân
   * Cập nhật tức thời nếu chuỗi rỗng để trả lại danh sách trống nhanh chóng
   */
  const handleSearchChange = (e) => {
    setPatientSearch(e.target.value);
    if (!e.target.value) {
      setDebouncedSearch("");
    } else {
      const timer = setTimeout(() => {
        setDebouncedSearch(e.target.value);
      }, 400);
      return () => clearTimeout(timer);
    }
  };

  // ============================================================
  // TANSTACK QUERY & MUTATIONS (GỌI API TỪ HOOKS)
  // ============================================================

  // 1. Lấy danh sách bệnh nhân dựa theo từ khóa tìm kiếm đã debounce
  const { data: patientsRes, isLoading: loadingPatients } = usePatients({
    search: debouncedSearch,
    limit: 10,
  });
  const patientsList = patientsRes?.data || [];

  // 2. Lấy toàn bộ danh sách chuyên khoa đang hoạt động
  const { data: specialtiesRes, isLoading: loadingSpecialties } = useSpecialties();
  const specialties = specialtiesRes?.data || [];

  // 3. Lấy danh sách bác sĩ tương ứng với chuyên khoa được chọn (nếu chọn)
  const { data: doctorsRes, isLoading: loadingDoctors } = useDoctors({
    limit: 100,
    ...(selectedSpecialtyId && { chuyenKhoaId: selectedSpecialtyId }),
  });
  const doctors = doctorsRes?.data || [];

  // Tìm chi tiết thông tin bác sĩ được chọn từ danh sách bác sĩ
  const selectedDoctor = useMemo(() => {
    return doctors.find((d) => String(d.id) === String(selectedDoctorId));
  }, [doctors, selectedDoctorId]);

  // 4. Lấy danh sách các khung giờ (time slots) còn trống của bác sĩ theo ngày khám
  const { data: slotRes, isLoading: loadingSlots } = useSlotTrong(selectedDoctorId, selectedDate);
  const slots = slotRes?.data?.slots || [];

  // Các mutations xử lý cập nhật dữ liệu (Tạo bệnh nhân mới và tạo lịch hẹn mới)
  const createPatientMutation = useCreatePatient();
  const createAppointmentMutation = useCreateAppointment();

  // ============================================================
  // XỬ LÝ SỰ KIỆN HÀNH ĐỘNG (EVENT HANDLERS)
  // ============================================================

  /**
   * Bước 1: Chọn một bệnh nhân đã có sẵn trong danh sách tìm kiếm
   */
  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setStep(2); // Chuyển tiếp nhanh sang Bước 2
  };

  /**
   * Bước 1: Gửi yêu cầu tạo hồ sơ bệnh nhân vãng lai mới lên Server
   */
  const handleCreatePatient = async (e) => {
    e.preventDefault();
    if (!newPatientName.trim()) {
      toast.warning("Vui lòng nhập họ tên bệnh nhân");
      return;
    }

    try {
      // Gọi API tạo bệnh nhân offline qua TanStack Mutation
      const res = await createPatientMutation.mutateAsync({
        hoTen: newPatientName.trim(),
        soDienThoai: newPatientPhone.trim() || null,
        emailLienHe: newPatientEmail.trim() || null,
      });
      toast.success("Tạo hồ sơ bệnh nhân vãng lai thành công!");

      // Gán bệnh nhân vừa tạo làm bệnh nhân được chọn và chuyển sang Bước 2
      setSelectedPatient(res.data);
      setStep(2);

      // Thiết lập lại (Reset) các giá trị trong form nhập
      setNewPatientName("");
      setNewPatientPhone("");
      setNewPatientEmail("");
      setShowCreateForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi tạo hồ sơ bệnh nhân");
    }
  };

  /**
   * Bước 4: Xác nhận và tiến hành đăng ký xếp lịch khám lên Server
   */
  const handleConfirmBooking = async () => {
    if (!selectedPatient || !selectedDoctorId || !selectedDate || !selectedSlot) {
      toast.error("Vui lòng hoàn tất đầy đủ các bước thông tin");
      return;
    }

    try {
      // Gọi API tạo lịch hẹn. Giá khám được lấy trực tiếp từ bảng giá của bác sĩ được chọn
      await createAppointmentMutation.mutateAsync({
        bacSiId: Number(selectedDoctorId),
        benhNhanId: Number(selectedPatient.id),
        ngayDat: selectedDate,
        gioBatDau: selectedSlot.gioBatDau,
        lyDoKham: reason.trim() || undefined,
        giaKham: selectedDoctor?.giaKham ? Number(selectedDoctor.giaKham) : undefined,
      });
      toast.success("Đăng ký khám thành công! Lịch khám đã ở trạng thái Chờ khám.");

      // Điều hướng admin quay trở về trang quản lý danh sách lịch hẹn chung
      navigate("/admin/appointments");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Đăng ký lịch khám thất bại");
    }
  };

  // Điều kiện kiểm tra xem người dùng đã đủ điều kiện chuyển qua các bước tiếp theo hay chưa
  const canGoToStep3 = selectedDoctorId; // Đã chọn bác sĩ
  const canGoToStep4 = selectedDate && selectedSlot; // Đã chọn cả ngày và giờ khám

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* --- Breadcrumb điều hướng phía trên cùng --- */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/admin/appointments" className="text-slate-500 hover:text-primary transition-colors">
          Quản lý lịch khám
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-bold">Đăng ký khám tại quầy</span>
      </div>

      {/* --- Khối Header và tiêu đề trang --- */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Tiếp đón & Đăng ký khám</h1>
          <p className="text-slate-500 text-sm mt-1">
            Quy trình điều phối bệnh nhân vãng lai offline và xếp ca trực phù hợp.
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Hủy bỏ
        </button>
      </div>

      {/* --- Thanh tiến trình chỉ số các bước (Step Indicators) --- */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between overflow-x-auto gap-4">
        <div className="flex items-center gap-6 min-w-[500px] w-full justify-around">
          {/* Bước 1: Chọn bệnh nhân */}
          <div
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 cursor-pointer pb-1 transition-all ${
              step === 1 ? "border-b-2 border-primary text-primary font-bold" : "text-slate-400 font-medium"
            }`}
          >
            <span className="material-symbols-outlined text-lg">person_add</span>
            1. Bệnh nhân
          </div>
          <span className="material-symbols-outlined text-slate-200">chevron_right</span>

          {/* Bước 2: Chọn chuyên khoa & bác sĩ */}
          <button
            disabled={!selectedPatient}
            onClick={() => setStep(2)}
            className={`flex items-center gap-2 disabled:opacity-40 pb-1 transition-all ${
              step === 2 ? "border-b-2 border-primary text-primary font-bold" : "text-slate-400 font-medium"
            }`}
          >
            <span className="material-symbols-outlined text-lg">stethoscope</span>
            2. Chuyên khoa & Bác sĩ
          </button>
          <span className="material-symbols-outlined text-slate-200">chevron_right</span>

          {/* Bước 3: Chọn ngày & giờ khám */}
          <button
            disabled={!selectedPatient || !canGoToStep3}
            onClick={() => setStep(3)}
            className={`flex items-center gap-2 disabled:opacity-40 pb-1 transition-all ${
              step === 3 ? "border-b-2 border-primary text-primary font-bold" : "text-slate-400 font-medium"
            }`}
          >
            <span className="material-symbols-outlined text-lg">calendar_month</span>
            3. Ngày & Slot
          </button>
          <span className="material-symbols-outlined text-slate-200">chevron_right</span>

          {/* Bước 4: Xác nhận thông tin cuối cùng */}
          <button
            disabled={!selectedPatient || !canGoToStep3 || !canGoToStep4}
            onClick={() => setStep(4)}
            className={`flex items-center gap-2 disabled:opacity-40 pb-1 transition-all ${
              step === 4 ? "border-b-2 border-primary text-primary font-bold" : "text-slate-400 font-medium"
            }`}
          >
            <span className="material-symbols-outlined text-lg">fact_check</span>
            4. Xác nhận
          </button>
        </div>
      </div>

      {/* --- Hiển thị thông tin tóm tắt của bệnh nhân đã chọn (Xuất hiện từ Bước 2 trở đi) --- */}
      {selectedPatient && step > 1 && (
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">account_circle</span>
            <div>
              <p className="text-xs text-slate-400 font-bold">BỆNH NHÂN ĐÃ CHỌN:</p>
              <p className="font-bold text-slate-800 text-sm">
                {selectedPatient.hoTen} {selectedPatient.soDienThoai && `(${selectedPatient.soDienThoai})`}
                {/* Đánh dấu nhãn vãng lai nếu bệnh nhân này không liên kết tài khoản hệ thống */}
                {!selectedPatient.taiKhoanId && (
                  <span className="ml-2 inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-black uppercase">
                    Vãng lai (Không TK)
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedPatient(null);
              setStep(1); // Trở về bước 1 để chọn lại bệnh nhân khác
            }}
            className="text-xs text-rose-500 hover:underline font-bold"
          >
            Thay đổi
          </button>
        </div>
      )}

      {/* ============================================================
          GIAO DIỆN BƯỚC 1: TÌM BỆNH NHÂN CÓ SẴN HOẶC TẠO MỚI HỒ SƠ
          ============================================================ */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cột trái (Chiếm 2/3 bề ngang): Tìm kiếm hồ sơ cũ */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="material-symbols-outlined text-primary">person_search</span>
              Tìm kiếm bệnh nhân có sẵn
            </h3>

            {/* Ô nhập tìm kiếm (Họ tên hoặc Số điện thoại) */}
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                search
              </span>
              <input
                type="text"
                value={patientSearch}
                onChange={handleSearchChange}
                placeholder="Nhập tên bệnh nhân hoặc số điện thoại..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
              />
            </div>

            {/* Kết quả tìm kiếm từ API */}
            {loadingPatients ? (
              <div className="py-12 flex justify-center">
                <LoadingSpinner size="size-8" />
              </div>
            ) : patientsList.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs italic">
                {debouncedSearch ? "Không tìm thấy kết quả phù hợp." : "Nhập từ khóa để bắt đầu tìm kiếm."}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-1">
                {patientsList.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPatient(p)}
                    className="py-3 px-4 rounded-xl hover:bg-slate-50 transition-all flex justify-between items-center cursor-pointer group"
                  >
                    <div>
                      <p className="font-bold text-slate-800 text-sm group-hover:text-primary transition-colors">
                        {p.hoTen}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                        {p.soDienThoai && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px]">call</span>
                            {p.soDienThoai}
                          </span>
                        )}
                        {p.taiKhoan?.email || p.emailLienHe ? (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px]">mail</span>
                            {p.taiKhoan?.email || p.emailLienHe}
                          </span>
                        ) : null}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-all">
                      arrow_forward_ios
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cột phải (Chiếm 1/3 bề ngang): Form tạo nhanh bệnh nhân vãng lai mới */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="material-symbols-outlined text-primary">person_add</span>
                Tạo hồ sơ vãng lai nhanh
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Dành cho bệnh nhân mới tới phòng khám trực tiếp và không có tài khoản website.
              </p>

              <form onSubmit={handleCreatePatient} className="space-y-4 pt-2">
                {/* Input họ tên */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Họ và tên bệnh nhân <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none font-bold"
                  />
                </div>

                {/* Input số điện thoại */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={newPatientPhone}
                    onChange={(e) => setNewPatientPhone(e.target.value)}
                    placeholder="09xxxxxxxx"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none"
                  />
                </div>

                {/* Input email */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Email liên hệ (tùy chọn)
                  </label>
                  <input
                    type="email"
                    value={newPatientEmail}
                    onChange={(e) => setNewPatientEmail(e.target.value)}
                    placeholder="example@mail.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none"
                  />
                </div>

                {/* Nút gửi form */}
                <button
                  type="submit"
                  disabled={createPatientMutation.isPending}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition shadow-md disabled:opacity-50 mt-4 cursor-pointer"
                >
                  {createPatientMutation.isPending ? "Đang xử lý..." : "Lưu & Tiếp tục"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          GIAO DIỆN BƯỚC 2: CHỌN CHUYÊN KHOA VÀ BÁC SĨ PHỤ TRÁCH
          ============================================================ */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="material-symbols-outlined text-primary">stethoscope</span>
            Chọn Chuyên khoa & Bác sĩ khám
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cột trái (1/3): Lưới chọn Chuyên khoa */}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                1. Chọn chuyên khoa
              </p>
              {loadingSpecialties ? (
                <div className="py-6 flex justify-center">
                  <LoadingSpinner size="size-8" />
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
                  {/* Nút lọc tất cả các chuyên khoa */}
                  <button
                    onClick={() => {
                      setSelectedSpecialtyId("");
                      setSelectedDoctorId(""); // Reset bác sĩ được chọn khi đổi chuyên khoa
                    }}
                    className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      !selectedSpecialtyId
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-white text-slate-500 border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    Tất cả chuyên khoa
                  </button>

                  {/* Lặp qua danh sách chuyên khoa */}
                  {specialties.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedSpecialtyId(String(s.id));
                        setSelectedDoctorId(""); // Reset bác sĩ được chọn khi đổi chuyên khoa
                      }}
                      className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        selectedSpecialtyId === String(s.id)
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-white text-slate-500 border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      {s.tenChuyenKhoa}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cột phải (2/3): Hiển thị danh sách bác sĩ thuộc khoa tương ứng */}
            <div className="md:col-span-2 space-y-3 border-l border-slate-100 md:pl-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                2. Chọn bác sĩ
              </p>

              {loadingDoctors ? (
                <div className="py-12 flex justify-center">
                  <LoadingSpinner size="size-10" />
                </div>
              ) : doctors.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs italic">
                  Không có bác sĩ nào thuộc chuyên khoa này đang hoạt động.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-1">
                  {/* Lặp hiển thị các card thông tin bác sĩ */}
                  {doctors.map((doc) => {
                    const isSelected = String(doc.id) === String(selectedDoctorId);
                    return (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDoctorId(String(doc.id))}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex gap-3 items-center hover:shadow-md ${
                          isSelected
                            ? "border-primary bg-primary/5 text-slate-900"
                            : "border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        {/* Ảnh đại diện bác sĩ */}
                        <div className="size-12 rounded-full border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
                          {doc.taiKhoan?.anhDaiDien ? (
                            <img
                              src={
                                doc.taiKhoan.anhDaiDien.startsWith("http")
                                  ? doc.taiKhoan.anhDaiDien
                                  : `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${doc.taiKhoan.anhDaiDien}`
                              }
                              alt={doc.tenBacSi}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-2xl text-slate-300">person</span>
                          )}
                        </div>

                        {/* Chi tiết học vị, họ tên, và giá dịch vụ */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-primary font-black uppercase tracking-wide leading-none mb-1">
                            {doc.hocViChucDanh || "Bác sĩ"}
                          </p>
                          <p className="font-bold text-slate-900 text-sm truncate leading-tight">{doc.tenBacSi}</p>
                          <p className="text-xs text-rose-500 font-bold mt-1">
                            {doc.giaKham ? formatPrice(doc.giaKham) : "Liên hệ"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Hàng nút điều hướng chân trang bước 2 */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
              Quay lại
            </button>
            <button
              disabled={!selectedDoctorId}
              onClick={() => setStep(3)}
              className="px-5 py-2.5 bg-primary text-white rounded-lg text-xs font-black uppercase tracking-wider hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-primary/20"
            >
              Chọn ngày giờ
              <span className="material-symbols-outlined text-sm font-black">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          GIAO DIỆN BƯỚC 3: CHỌN NGÀY VÀ KHUNG GIỜ CÒN TRỐNG
          ============================================================ */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="material-symbols-outlined text-primary">calendar_month</span>
            Chọn Ngày khám & Giờ khám
          </h3>

          <div className="space-y-6">
            {/* Lưới chọn ngày làm việc */}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                1. Chọn ngày làm việc
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {next14Days.map((day) => (
                  <button
                    key={day.value}
                    onClick={() => {
                      setSelectedDate(day.value);
                      setSelectedSlot(null); // Reset khung giờ đã chọn khi thay đổi ngày
                    }}
                    className={`flex flex-col items-center py-2 px-1 rounded-xl border text-xs transition cursor-pointer ${
                      selectedDate === day.value
                        ? "bg-primary text-white border-primary shadow-md"
                        : "bg-white border-slate-200 text-slate-600 hover:border-primary/40"
                    }`}
                  >
                    <span className="text-[9px] font-bold opacity-80">{day.dayName}</span>
                    <span className="text-base font-black mt-0.5">{day.dateNum}</span>
                    <span className="text-[9px] opacity-70 mt-0.5">{day.display}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Lưới chọn khung giờ trống tương ứng của bác sĩ */}
            <div className="space-y-3 border-t border-slate-50 pt-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                2. Chọn khung giờ (Time slots)
              </p>

              {!selectedDate ? (
                <p className="text-slate-400 text-xs italic">Vui lòng chọn ngày khám ở trên trước.</p>
              ) : loadingSlots ? (
                <div className="py-8 flex justify-center">
                  <LoadingSpinner size="size-8" />
                </div>
              ) : slots.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-xl border border-slate-100">
                  <span className="material-symbols-outlined text-3xl text-slate-300">event_busy</span>
                  <p className="text-slate-400 text-xs mt-1">Bác sĩ không đăng ký lịch trực trong ngày này.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {slots.map((slot, idx) => {
                    const now = dayjs().tz("Asia/Ho_Chi_Minh");
                    const [h, m] = slot.gioBatDau.split(":").map(Number);
                    const slotDate = dayjs(selectedDate)
                      .tz("Asia/Ho_Chi_Minh")
                      .hour(h)
                      .minute(m)
                      .second(0)
                      .millisecond(0);

                    // Các khung giờ trong quá khứ so với thời điểm hiện tại sẽ bị khóa
                    const isPast = slotDate.isBefore(now);
                    const isBooked = slot.daDat || !slot.conTrong || isPast;
                    const isSelected = selectedSlot?.gioBatDau === slot.gioBatDau;

                    return (
                      <button
                        key={idx}
                        onClick={() => !isBooked && setSelectedSlot(slot)}
                        disabled={isBooked}
                        className={`py-2 px-1 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center ${
                          isBooked
                            ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                            : isSelected
                              ? "bg-primary text-white border-primary shadow-md cursor-pointer"
                              : "bg-white border-slate-200 text-slate-600 hover:border-primary/40 cursor-pointer"
                        }`}
                      >
                        <span className={isPast ? "line-through opacity-50" : ""}>{slot.gioBatDau}</span>
                        {isPast ? (
                          <span className="text-[8px] font-black block mt-0.5 text-slate-400 uppercase">Hết giờ</span>
                        ) : isBooked ? (
                          <span className="text-[8px] font-black block mt-0.5 text-rose-400 uppercase">Đầy chỗ</span>
                        ) : (
                          <span className="text-[8px] font-black block mt-0.5 text-emerald-500 uppercase">
                            Còn trống
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Khối nhập lý do khám / Triệu chứng ban đầu */}
            <div className="space-y-2 border-t border-slate-50 pt-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 leading-none">
                3. Triệu chứng lâm sàng / Lý do khám
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ví dụ: Đau răng số 8 hàm dưới, sốt nhẹ..."
                rows={2}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary resize-none transition"
              />
            </div>
          </div>

          {/* Hàng nút điều hướng chân trang bước 3 */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
              Quay lại
            </button>
            <button
              disabled={!selectedDate || !selectedSlot}
              onClick={() => setStep(4)}
              className="px-5 py-2.5 bg-primary text-white rounded-lg text-xs font-black uppercase tracking-wider hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-primary/20"
            >
              Xem tóm tắt
              <span className="material-symbols-outlined text-sm font-black">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          GIAO DIỆN BƯỚC 4: TÓM TẮT THÔNG TIN VÀ XÁC NHẬN CUỐI CÙNG
          ============================================================ */}
      {step === 4 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="material-symbols-outlined text-primary">fact_check</span>
            Xác nhận hồ sơ & Đăng ký khám
          </h3>

          {/* Khối hiển thị thông tin hóa đơn tóm tắt */}
          <div className="border border-slate-200 rounded-xl p-6 space-y-6 bg-slate-50/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tóm tắt thông tin nhân thân bệnh nhân */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                  Hồ sơ Bệnh nhân
                </p>
                <div className="bg-white border border-slate-200/60 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Họ và tên</span>
                    <span className="font-bold text-slate-800">{selectedPatient?.hoTen}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Số điện thoại</span>
                    <span className="font-bold text-slate-800">{selectedPatient?.soDienThoai || "—"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Loại hồ sơ</span>
                    <span className="font-bold text-primary">
                      {selectedPatient?.taiKhoanId ? "Đăng ký Online" : "Khách vãng lai (Offline)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tóm tắt thông tin dịch vụ, giờ khám, bác sĩ phụ trách */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                  Lịch trực & Bác sĩ khám
                </p>
                <div className="bg-white border border-slate-200/60 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Bác sĩ phụ trách</span>
                    <span className="font-bold text-slate-800">{selectedDoctor?.tenBacSi}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Chuyên khoa</span>
                    <span className="font-bold text-slate-800">{selectedDoctor?.chuyenKhoa?.tenChuyenKhoa}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Thời gian</span>
                    <span className="font-bold text-slate-800">
                      {selectedSlot?.gioBatDau} | {formatDate(selectedDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lý do khám / Mô tả bệnh cảnh lâm sàng */}
            {reason && (
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                  Triệu chứng mô tả
                </p>
                <p className="text-xs text-slate-600 bg-white border border-slate-200/60 p-3 rounded-xl italic">
                  "{reason}"
                </p>
              </div>
            )}

            {/* Chi tiết giá tiền và lưu ý thanh toán */}
            <div className="border-t-2 border-dashed border-slate-200 pt-4 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                  Giá dịch vụ khám
                </span>
                <p className="text-xs text-slate-400 mt-1 italic">* Thanh toán tại quầy sau khi khám xong</p>
              </div>
              <span className="text-xl font-bold text-primary font-mono">
                {selectedDoctor?.giaKham ? formatPrice(selectedDoctor.giaKham) : "Liên hệ"}
              </span>
            </div>
          </div>

          {/* Hàng nút bấm gửi dữ liệu hoặc quay lại Bước 3 */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
              Quay lại
            </button>

            <button
              onClick={handleConfirmBooking}
              disabled={createAppointmentMutation.isPending}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {createAppointmentMutation.isPending ? (
                <>
                  {/* Trạng thái Spinner khi đang gửi yêu cầu */}
                  <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Đang ghi nhận...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
                  Xác nhận xếp lịch
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
