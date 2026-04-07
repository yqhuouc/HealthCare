/**
 * ============================================================
 * TRANG: Chi tiết Lịch hẹn & Hồ sơ Khám bệnh (Bác sĩ)
 * Đường dẫn: /doctor/appointments/:id
 * ============================================================
 * 
 * Chức năng chính:
 * 1. Hiển thị thông tin chi tiết bệnh nhân & lý do khám.
 * 2. Ghi nhận Chẩn đoán & Lời dặn của bác sĩ.
 * 3. Kê đơn thuốc (Prescription):
 *    - Thêm/Xóa dòng thuốc linh hoạt.
 *    - Tự động tính tổng tiền đơn thuốc dựa trên số lượng & đơn giá.
 * 4. Luồng xử lý trạng thái:
 *    - Khi bấm gửi: Cập nhật trạng thái lịch hẹn sang "Đã khám" (2).
 *    - Tạo mới hoặc cập nhật bản ghi đơn thuốc trong CSDL.
 * 5. Chế độ Xem lại (Read-only): Nếu lịch đã hoàn thành, hiển thị lại đơn cũ.
 * 
 * Dữ liệu: Kết hợp từ DatLich, DonThuoc và ChiTietDonThuoc.
 * ============================================================
 */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { appointmentService } from "../../services/appointmentService";
import { prescriptionService } from "../../services/prescriptionService";
import { toast } from "react-toastify";

/** 
 * Cấu trúc mặc định của một dòng thuốc trong đơn
 */
const EMPTY_MED = { 
  tenThuoc: "", 
  soLuong: "", 
  donGia: "", 
  lieuDung: "", 
  ghiChu: "" 
};

/** 
 * Format giờ hiển thị (HH:mm)
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
 * Format ngày hiển thị (DD/MM/YYYY)
 */
function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit", 
    month: "2-digit", 
    year: "numeric", 
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

/** 
 * Định dạng tiền tệ VNĐ
 */
function formatPrice(val) {
  return Number(val || 0).toLocaleString("vi-VN") + "đ";
}

function DoctorAppointmentDetailPage() {
  const { id } = useParams(); // Lấy ID lịch hẹn từ URL
  const navigate = useNavigate();

  // State quản lý dữ liệu chính
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State quản lý Form khám bệnh & đơn thuốc
  const [chanDoan, setChanDoan] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  const [prescription, setPrescription] = useState([{ ...EMPTY_MED }]);

  /**
   * Effect: Tải thông tin chi tiết ca khám khi vào trang
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await appointmentService.getById(id);
        const data = res.data;
        setAppointment(data);

        // Trường hợp ĐÃ CÓ đơn thuốc (Ca khám đã hoàn thành hoặc đang bổ sung)
        // Hệ thống sẽ tự động điền (Pre-fill) dữ liệu cũ vào các ô nhập
        if (data.donThuoc) {
          setChanDoan(data.donThuoc.chanDoan || "");
          setGhiChu(data.donThuoc.ghiChu || "");
          if (data.donThuoc.chiTietDonThuoc?.length) {
            setPrescription(data.donThuoc.chiTietDonThuoc.map((ct) => ({
              tenThuoc: ct.tenThuoc || "",
              soLuong: ct.soLuong || "",
              donGia: ct.donGia || "",
              lieuDung: ct.lieuDung || "",
              ghiChu: ct.ghiChu || "",
            })));
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Không tìm thấy thông tin lịch hẹn này.");
        navigate("/doctor/appointments");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  // UI khi đang tải dữ liệu
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  // UI khi không tìm thấy dữ liệu
  if (!appointment) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="material-symbols-outlined text-7xl text-slate-200 mb-4 font-light">error</span>
        <h2 className="text-xl font-black text-slate-800">Dữ liệu không tồn tại</h2>
        <button onClick={() => navigate("/doctor/appointments")} className="mt-6 text-primary font-bold">Quay lại danh sách</button>
      </div>
    );
  }

  const patient = appointment.benhNhan;
  const hasPrescription = !!appointment.donThuoc;

  /** 
   * Xử lý ảnh đại diện bệnh nhân
   */
  const getPatientAvatar = (anhDaiDien) => {
    if (!anhDaiDien) return null;
    if (anhDaiDien.startsWith("http")) return anhDaiDien;
    return `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${anhDaiDien}`;
  };

  const patientAvatarUrl = getPatientAvatar(patient?.taiKhoan?.anhDaiDien);

  /** 
   * LOGIC QUẢN LÝ ĐƠN THUỐC (Dynamic Table)
   */
  const handleAddMed = () => setPrescription((prev) => [...prev, { ...EMPTY_MED }]);

  const handleRemoveMed = (index) => {
    setPrescription((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length === 0 ? [{ ...EMPTY_MED }] : next;
    });
  };

  const handleMedChange = (index, field, value) => {
    setPrescription((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  /** Tính tổng giá trị đơn thuốc hiện tại */
  const totalMedicine = prescription.reduce((sum, med) => {
    return sum + (Number(med.soLuong) || 0) * (Number(med.donGia) || 0);
  }, 0);

  /** 
   * XỬ LÝ GỬI KẾT QUẢ & ĐƠN THUỐC (Submission)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra tính hợp lệ của dữ liệu
    if (!chanDoan.trim()) {
      toast.error("Bác sĩ vui lòng nhập Chẩn đoán bệnh.");
      return;
    }

    const validMeds = prescription.filter((m) => m.tenThuoc.trim());
    
    setSubmitting(true);
    try {
      // 1. Cập nhật trạng thái lịch hẹn sang "Đã khám" (Trạng thái 2)
      if (appointment.trangThai !== 2) {
        await appointmentService.updateTrangThai(id, 2);
      }

      // 2. Chuẩn bị Payload gửi lên Server
      const prescriptionData = {
        datLichId: Number(id),
        chanDoan: chanDoan.trim(),
        ghiChu: ghiChu.trim() || null,
        chiTietDonThuoc: validMeds.map((m) => ({
          tenThuoc: m.tenThuoc.trim(),
          soLuong: Number(m.soLuong) || 1,
          donGia: Number(m.donGia) || 0,
          lieuDung: m.lieuDung.trim() || null,
          ghiChu: m.ghiChu.trim() || null,
        })),
      };

      // 3. Gọi API tạo hoặc cập nhật đơn thuốc
      if (hasPrescription) {
        await prescriptionService.update(appointment.donThuoc.id, prescriptionData);
        toast.success("Cập nhật bệnh án thành công!");
      } else {
        await prescriptionService.create(prescriptionData);
        toast.success("Đã gửi đơn thuốc cho bệnh nhân thành công!");
      }

      navigate("/doctor/appointments");
    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi khi xử lý đơn thuốc";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sm:p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      
      {/* THANH ĐIỀU CHỈNH (Header Actions) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Chi tiết hồ sơ ca khám</h1>
          <p className="text-slate-500 text-sm font-medium">Bác sĩ vui lòng kiểm tra thông tin và kê đơn thuốc chính xác</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-black bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest shadow-sm"
        >
          <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
          Quay lại
        </button>
      </div>

      {/* THÔNG TIN BỆNH NHÂN (Patient Info Section) */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 transition-all hover:shadow-md">
        <div className="flex flex-col md:flex-row md:items-center gap-6 sm:gap-8">
          {/* Avatar Area */}
          <div className="size-20 sm:size-24 rounded-2xl overflow-hidden bg-slate-50 shrink-0 border-2 border-white shadow-lg ring-1 ring-slate-100 flex items-center justify-center">
            {patientAvatarUrl ? (
              <img src={patientAvatarUrl} alt={patient?.hoTen} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(patient?.hoTen || "BN")}&size=128&background=f1f5f9&color=64748b`; }} />
            ) : (
              <span className="material-symbols-outlined text-4xl text-slate-300 font-light">account_circle</span>
            )}
          </div>

          {/* Text Area */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 leading-none">
                {patient?.hoTen || "—"}
              </h3>
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/10 rounded-lg">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Cấp mã:</span>
                <span className="text-xs font-black text-primary leading-none uppercase">BN-{String(patient?.id || appointment.benhNhanId || appointment.id).padStart(3, "0")}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-3 gap-x-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Số điện thoại</span>
                <span className="text-sm font-bold text-slate-700">{patient?.soDienThoai || "Chưa cập nhật"}</span>
              </div>
              <div className="flex flex-col border-l border-slate-50 pl-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Giới tính</span>
                <span className="text-sm font-bold text-slate-700">{patient?.gioiTinh === 1 ? "Nam" : patient?.gioiTinh === 2 ? "Nữ" : "Khác"}</span>
              </div>
              <div className="flex flex-col border-l border-slate-50 pl-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Ngày đặt khám</span>
                <span className="text-sm font-bold text-slate-700">{formatDate(appointment.ngayDat)}</span>
              </div>
              <div className="flex flex-col border-l border-slate-50 pl-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Giờ khám</span>
                <span className="text-sm font-bold text-slate-700">{formatTime(appointment.gioBatDau)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lý do khám - Hiển thị đặc biệt */}
        {appointment.lyDoKham && (
          <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100 flex gap-4">
            <span className="material-symbols-outlined text-slate-300 font-light select-none">format_quote</span>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Lý do bệnh nhân đến khám:</p>
              <p className="text-sm text-slate-700 font-medium leading-relaxed">"{appointment.lyDoKham}"</p>
            </div>
          </div>
        )}
      </section>

      {/* CHẨN ĐOÁN VÀ KẾT QUẢ (Medical Results) */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary font-bold">medical_information</span>
          Xác định bệnh lý & Chẩn đoán
        </h3>
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              Chẩn đoán bệnh lý <span className="text-red-500">*</span>
            </label>
            <textarea
              value={chanDoan}
              onChange={(e) => setChanDoan(e.target.value)}
              placeholder="Ví dụ: Viêm mũi dị ứng, Sốt xuất huyết độ 1..."
              rows={3}
              className="w-full rounded-xl border-slate-100 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white text-sm font-bold transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Lời dặn & Hướng dẫn sinh hoạt</label>
            <input
              type="text"
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              placeholder="Uống nhiều nước, hạn chế đồ cay nóng, tái khám sau 7 ngày..."
              className="w-full rounded-xl border-slate-100 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white text-sm font-bold transition-all"
            />
          </div>
        </div>
      </section>

      {/* ĐƠN THUỐC CHI TIẾT (Prescription Table) */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6 transition-all hover:shadow-md">
        <div className="flex justify-between items-center sm:items-end">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary font-bold">pill</span>
            Kê đơn thuốc
          </h3>
          <button
            type="button"
            onClick={handleAddMed}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-primary text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all border border-primary/10"
          >
            <span className="material-symbols-outlined text-sm font-bold">add_circle</span>
            Thêm loại thuốc
          </button>
        </div>

        {/* Prescription Grid / Table */}
        <div className="overflow-x-auto border border-slate-50 rounded-2xl">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Tên loại thuốc</th>
                <th className="px-4 py-4 w-24">S.Lượng</th>
                <th className="px-4 py-4 w-32">Đơn giá (đ)</th>
                <th className="px-4 py-4">Liều dùng (Cách dùng)</th>
                <th className="px-4 py-4">Ghi chú</th>
                <th className="px-6 py-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {prescription.map((item, index) => (
                <tr key={index} className="group hover:bg-slate-50/30">
                  <td className="px-6 py-4">
                    <input type="text" value={item.tenThuoc}
                      onChange={(e) => handleMedChange(index, "tenThuoc", e.target.value)}
                      placeholder="Tên thuốc..."
                      className="w-full rounded-lg border-transparent bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-sm font-bold text-slate-800" />
                  </td>
                  <td className="px-4 py-4">
                    <input type="number" value={item.soLuong}
                      onChange={(e) => handleMedChange(index, "soLuong", e.target.value)}
                      placeholder="1" min="1"
                      className="w-full rounded-lg border-transparent bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-sm font-bold text-slate-800 text-center" />
                  </td>
                  <td className="px-4 py-4">
                    <input type="number" value={item.donGia}
                      onChange={(e) => handleMedChange(index, "donGia", e.target.value)}
                      placeholder="0" min="0"
                      className="w-full rounded-lg border-transparent bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-sm font-bold text-primary font-mono" />
                  </td>
                  <td className="px-4 py-4">
                    <input type="text" value={item.lieuDung}
                      onChange={(e) => handleMedChange(index, "lieuDung", e.target.value)}
                      placeholder="VD: 2v x 3 lần/ngày"
                      className="w-full rounded-lg border-transparent bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-sm font-medium text-slate-600" />
                  </td>
                  <td className="px-4 py-4">
                    <input type="text" value={item.ghiChu}
                      onChange={(e) => handleMedChange(index, "ghiChu", e.target.value)}
                      placeholder="Sau ăn..."
                      className="w-full rounded-lg border-transparent bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-sm font-medium text-slate-600" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button type="button" onClick={() => handleRemoveMed(index)}
                      className="text-slate-300 hover:text-rose-500 transition-all">
                      <span className="material-symbols-outlined text-lg">cancel</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TỔNG KẾT CHI PHÍ (Total Pricing) */}
        {prescription.some((m) => m.tenThuoc) && (
          <div className="flex justify-end pt-4 border-t border-slate-50">
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thành tiền đơn thuốc:</span>
              <span className="text-2xl font-black text-primary tracking-tight">
                {formatPrice(totalMedicine)}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* NÚT GỬI KẾT QUẢ (Submit Section) */}
      <div className="pt-6 pb-20">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-3 py-5 bg-primary text-white text-base font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
        >
          {submitting ? (
            <span className="material-symbols-outlined animate-spin font-bold">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined font-bold">check_circle</span>
          )}
          {submitting ? "Đang xử lý dữ liệu..." : (hasPrescription ? "Cập nhật hồ sơ bệnh án" : "Hoàn tất & Gửi kết quả cho bệnh nhân")}
        </button>
        <div className="flex items-center justify-center gap-2 mt-6 text-slate-400 text-[10px] font-bold uppercase tracking-tighter italic">
          <span className="material-symbols-outlined text-xs">verified_user</span>
          Lưu ý: Kết quả sau khi gửi sẽ được bệnh nhân xem trực tiếp trên ứng dụng cá nhân.
        </div>
      </div>
    </div>
  );
}

export default DoctorAppointmentDetailPage;

