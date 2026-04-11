/**
 * ============================================================
 * TRANG: CHI TIẾT HỒ SƠ KHÁM BỆNH (BÁC SĨ)
 * Đường dẫn: /doctor/appointments/:id
 * ============================================================
 * 
 * CHỨC NĂNG CHÍNH:
 * 1. Hiển thị thông tin hành chính của bệnh nhân (Họ tên, mã BN, SĐT...).
 * 2. Ghi chép Chẩn đoán bệnh lý và Lời dặn của bác sĩ.
 * 3. Kê đơn thuốc (Dynamic Form): Thêm/xóa thuốc, tính tổng tiền tự động.
 * 4. Quản lý luồng trạng thái: Chờ xác nhận -> Đã xác nhận -> Đã khám.
 * 
 * PHONG CÁCH THIẾT KẾ:
 * - Giao diện "Medical Record" (Bệnh án) trang trọng, tinh tế.
 * - Sử dụng các khối nội dung ngăn cách bằng viền (Border) chuyên nghiệp.
 * - Loại bỏ các hiệu ứng "đồ chơi" (Shadow quá đậm, gradients rực rỡ).
 * ============================================================
 */
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppointment, useUpdateAppointmentStatus } from "../../hooks/queries/useAppointmentQueries";
import { useCreatePrescription, useUpdatePrescription } from "../../hooks/queries/usePrescriptionQueries";
import { toast } from "react-toastify";
import { formatPrice } from "../../utils/formatters";
import { formatTime, formatDate } from "../../utils/dateUtils";

// Cấu trúc khởi tạo cho một dòng thuốc mới
const EMPTY_MED = {
  tenThuoc: "",
  soLuong: "",
  donGia: "",
  lieuDung: "",
  ghiChu: "",
};

function DoctorAppointmentDetailPage() {
  const { id } = useParams(); // Lấy ID lịch hẹn từ URL
  const navigate = useNavigate();

  /**
   * 1. GỌI DỮ LIỆU TỪ SERVER
   */
  const { data: aptRes, isLoading: loading } = useAppointment(id);
  const appointment = aptRes?.data || null;

  /**
   * 2. CÁC HÀM CẬP NHẬT TRẠNG THÁI & ĐƠN THUỐC
   */
  const statusMutation = useUpdateAppointmentStatus();
  const createPrescription = useCreatePrescription();
  const updatePrescriptionMutation = useUpdatePrescription();
  
  // Trạng thái cục bộ phục vụ việc hiển thị UI
  const [submitting, setSubmitting] = useState(false);

  // State quản lý Form nhập liệu chính
  const [chanDoan, setChanDoan] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  const [prescription, setPrescription] = useState([{ ...EMPTY_MED }]);
  const [initialized, setInitialized] = useState(false);

  /**
   * 3. LOGIC KHỞI TẠO DỮ LIỆU BAN ĐẦU (Pre-fill)
   * Nếu ca khám này đã có hồ sơ cũ, ta đổ dữ liệu vào Form để bác sĩ sửa đổi.
   */
  if (appointment && !initialized) {
    if (appointment.donThuoc) {
      setChanDoan(appointment.donThuoc.chanDoan || "");
      setGhiChu(appointment.donThuoc.ghiChu || "");
      if (appointment.donThuoc.chiTietDonThuoc?.length) {
        setPrescription(
          appointment.donThuoc.chiTietDonThuoc.map((ct) => ({
            tenThuoc: ct.tenThuoc || "",
            soLuong: ct.soLuong || "",
            donGia: ct.donGia || "",
            lieuDung: ct.lieuDung || "",
            ghiChu: ct.ghiChu || "",
          }))
        );
      }
    }
    setInitialized(true);
  }

  /**
   * Hàm hỗ trợ thay đổi trạng thái nhanh (Xác nhận/Hủy)
   */
  const handleUpdateStatus = (newStatus) => {
    statusMutation.mutate(
      { id, trangThai: newStatus },
      {
        onSuccess: () => toast.success("Cập nhật trạng thái thành công!"),
        onError: () => toast.error("Lỗi khi cập nhật trạng thái"),
      }
    );
  };

  /**
   * LOGIC QUẢN LÝ BẢNG THUỐC (Dynamically add/remove rows)
   */
  const handleAddMed = () => setPrescription((p) => [...p, { ...EMPTY_MED }]);
  const handleRemoveMed = (idx) => {
    setPrescription((p) => {
      const filtered = p.filter((_, i) => i !== idx);
      return filtered.length === 0 ? [{ ...EMPTY_MED }] : filtered;
    });
  };
  const handleMedChange = (idx, field, val) => {
    setPrescription((p) => p.map((m, i) => (i === idx ? { ...m, [field]: val } : m)));
  };

  // Tính tổng tiền đơn thuốc (Thành tiền = Số lượng * Đơn giá)
  const totalMedicine = prescription.reduce((sum, med) => {
    return sum + (Number(med.soLuong) || 0) * (Number(med.donGia) || 0);
  }, 0);

  /**
   * 4. HÀM GỬI HỒ SƠ & ĐƠN THUỐC (Submit)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!chanDoan.trim()) {
      toast.warning("Vui lòng nhập chẩn đoán cho bệnh nhân.");
      return;
    }

    setSubmitting(true);
    try {
      // BƯỚC 1: Nếu chưa khám, cập nhật trạng thái lịch thành "Đã khám" (2)
      if (appointment.trangThai !== 2) {
        await statusMutation.mutateAsync({ id, trangThai: 2 });
      }

      // BƯỚC 2: Chuẩn bị dữ liệu Đơn thuốc
      const payload = {
        datLichId: Number(id),
        chanDoan: chanDoan.trim(),
        ghiChu: ghiChu.trim() || null,
        chiTietDonThuoc: prescription.filter(m => m.tenThuoc.trim()).map(m => ({
          tenThuoc: m.tenThuoc.trim(),
          soLuong: Number(m.soLuong) || 1,
          donGia: Number(m.donGia) || 0,
          lieuDung: m.lieuDung.trim() || null,
          ghiChu: m.ghiChu.trim() || null,
        })),
      };

      // BƯỚC 3: Gọi API Lưu hồ sơ (Tạo mới hoặc Cập nhật)
      if (appointment.donThuoc) {
        await updatePrescriptionMutation.mutateAsync({ id: appointment.donThuoc.id, data: payload });
        toast.success("Đã cập nhật hồ sơ thành công!");
      } else {
        await createPrescription.mutateAsync(payload);
        toast.success("Đã hoàn tất ca khám và gửi đơn thuốc.");
      }
      navigate("/doctor/appointments");
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi lưu bệnh án");
    } finally {
      setSubmitting(false);
    }
  };

  // Màn hình Loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-bold tracking-tight uppercase text-xs">Phân tích dữ liệu hồ sơ...</p>
      </div>
    );
  }

  const patient = appointment.benhNhan;
  const patientCode = `BN-${String(patient?.id || "").padStart(3, "0")}`;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 p-4 sm:p-0 animate-in fade-in duration-700">
      
      {/* ---------------------------------------------------------
          SECTION 1: HEADER ACTIONS (THANH CÔNG CỤ)
          --------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Hồ sơ bệnh án chi tiết</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Vui lòng ghi nhận chẩn đoán và hướng dẫn điều trị chính xác.</p>
        </div>
        
        {/* Nhóm các nút điều khiển luồng ca trực */}
        <div className="flex flex-wrap items-center gap-3">
          {appointment.trangThai === 0 && ( /* Lịch đang chờ */
            <>
              <button onClick={() => handleUpdateStatus(1)} className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Xác nhận lịch
              </button>
              <button onClick={() => handleUpdateStatus(3)} className="px-4 py-2 border border-rose-200 text-rose-500 text-xs font-bold rounded-lg hover:bg-rose-50 transition-all">
                Hủy lịch
              </button>
            </>
          )}

          {appointment.trangThai === 1 && ( /* Đã xác nhận */
            <button onClick={() => handleUpdateStatus(3)} className="px-4 py-2 border border-rose-200 text-rose-500 text-xs font-bold rounded-lg hover:bg-rose-50 transition-all">
              Bệnh nhân vắng mặt / Hủy lịch
            </button>
          )}

          <div className="w-px h-8 bg-slate-200 mx-1 hidden sm:block" />
          
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Quay lại
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------------
          SECTION 2: THÔNG TIÊU TRẠNG THÁI (STATUS BADGE)
          --------------------------------------------------------- */}
      <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tiến độ hiện tại:</span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase transition-colors ${
          appointment.trangThai === 0 ? "border-amber-200 text-amber-600 bg-amber-50" :
          appointment.trangThai === 1 ? "border-blue-200 text-blue-600 bg-blue-50" :
          appointment.trangThai === 2 ? "border-emerald-200 text-emerald-600 bg-emerald-50" : "border-rose-200 text-rose-600 bg-rose-50"
        }`}>
          {appointment.trangThai === 0 ? "Bệnh nhân đang chờ" :
           appointment.trangThai === 1 ? "Đã sẵn sàng khám" :
           appointment.trangThai === 2 ? "Ca khám hoàn tất" : "Lịch đã bị hủy"}
        </span>
      </div>

      {/* ---------------------------------------------------------
          SECTION 3: THÔNG TIN HÀNH CHÍNH (PATIENT CARD)
          --------------------------------------------------------- */}
      <section className="bg-white border-2 border-slate-100 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-start shadow-sm">
        {/* Ảnh đại diện quy chuẩn */}
        <div className="w-24 h-24 rounded-xl bg-slate-50 border-2 border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
          {patient?.taiKhoan?.anhDaiDien ? (
            <img 
              src={import.meta.env.VITE_API_URL + patient?.taiKhoan?.anhDaiDien} 
              alt="BN" 
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=BN&background=f8fafc&color=94a3b8"; }}
            />
          ) : (
            <span className="material-symbols-outlined text-4xl text-slate-200">person</span>
          )}
        </div>

        {/* Thông tin văn bản */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{patientCode}</p>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">{patient?.hoTen || "Bệnh nhân ẩn danh"}</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-tighter">Ngày sinh / Giới tính</span>
              <p className="text-sm font-bold text-slate-700">
                {formatDate(patient?.ngaySinh) || "—"} / {patient?.gioiTinh === 1 ? "Nam" : "Nữ"}
              </p>
            </div>
            <div className="space-y-1 border-l border-slate-100 pl-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-tighter">Số điện thoại</span>
              <p className="text-sm font-bold text-slate-700">{patient?.soDienThoai || "—"}</p>
            </div>
            <div className="space-y-1 border-l border-slate-100 pl-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-tighter">Ngày đăng ký</span>
              <p className="text-sm font-bold text-slate-700">{formatDate(appointment.ngayDat)}</p>
            </div>
            <div className="space-y-1 border-l border-slate-100 pl-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-tighter">Giờ khám dự kiến</span>
              <p className="text-sm font-bold text-slate-700">{formatTime(appointment.gioBatDau)}</p>
            </div>
          </div>

          {/* Lý do bệnh nhân khai báo */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Triệu chứng & Lý do bệnh nhân khai báo:</p>
            <p className="text-sm text-slate-600 italic font-medium">"{appointment.lyDoKham || "Không có nội dung mô tả"}"</p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------
          SECTION 4: FORM CHẨN ĐOÁN (MEDICAL RESULTS)
          --------------------------------------------------------- */}
      <section className="bg-white border-2 border-slate-100 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <span className="material-symbols-outlined text-primary">analytics</span>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Kết quả chẩn đoán bệnh lý</h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Chẩn đoán của bác sĩ <span className="text-rose-500">*</span></label>
            <textarea
              value={chanDoan}
              onChange={(e) => setChanDoan(e.target.value)}
              placeholder="Nhập tên bệnh lý, tình trạng sức khỏe cụ thể..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-bold transition-all bg-slate-50/30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Lời dặn & Hướng dẫn sử dụng thuốc</label>
            <textarea
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              placeholder="Uống thuốc đúng giờ, hạn chế đồ cay nóng, tái khám sau 7 ngày..."
              rows={2}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-bold transition-all bg-slate-50/30"
            />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------
          SECTION 5: KÊ ĐƠN THUỐC (PRESCRIPTION TABLE)
          --------------------------------------------------------- */}
      <section className="bg-white border-2 border-slate-100 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">pill</span>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Đơn thuốc chỉ định</h3>
          </div>
          <button 
            type="button" 
            onClick={handleAddMed}
            className="px-4 py-2 bg-primary/5 text-primary border border-primary/20 rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-all flex items-center gap-2 uppercase tracking-wide"
          >
            <span className="material-symbols-outlined text-sm font-bold">add</span>
            Thêm loại thuốc
          </button>
        </div>

        {/* Bảng kê đơn chuyên nghiệp */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Tên thuốc</th>
                <th className="px-4 py-4 w-24 text-center">S.Lượng</th>
                <th className="px-4 py-4 w-32">Đơn giá (đ)</th>
                <th className="px-4 py-4">Liều lượng & Cách dùng</th>
                <th className="px-6 py-4 w-12 text-center">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prescription.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50/30">
                  <td className="px-6 py-3">
                    <input
                      type="text"
                      value={item.tenThuoc}
                      onChange={(e) => handleMedChange(index, "tenThuoc", e.target.value)}
                      placeholder="Tên biệt dược..."
                      className="w-full bg-transparent outline-none text-sm font-bold text-slate-800 placeholder-slate-300"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={item.soLuong}
                      onChange={(e) => handleMedChange(index, "soLuong", e.target.value)}
                      className="w-full bg-transparent outline-none text-sm font-bold text-slate-800 text-center"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={item.donGia}
                      onChange={(e) => handleMedChange(index, "donGia", e.target.value)}
                      className="w-full bg-transparent outline-none text-sm font-bold text-primary font-mono tracking-tighter"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={item.lieuDung}
                      onChange={(e) => handleMedChange(index, "lieuDung", e.target.value)}
                      placeholder="Sáng 1v, chiều 1v..."
                      className="w-full bg-transparent outline-none text-xs font-medium text-slate-500"
                    />
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button onClick={() => handleRemoveMed(index)} className="text-slate-300 hover:text-rose-500 transition-colors">
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tổng kết đơn thuốc */}
        <div className="flex justify-end pt-4">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tổng hóa đơn thuốc:</span>
            <p className="text-2xl font-bold text-primary tracking-tighter mt-1">{formatPrice(totalMedicine)}</p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------
          SECTION 6: SUBMIT ACTION (LƯU HỒ SƠ)
          --------------------------------------------------------- */}
      <div className="pt-8">
        <button
          onClick={handleSubmit}
          disabled={submitting || (appointment.trangThai !== 1 && appointment.trangThai !== 2)}
          className="w-full py-5 bg-emerald-600 text-white rounded-xl text-base font-bold uppercase tracking-widest hover:bg-emerald-700 active:scale-[0.99] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined">{appointment.trangThai === 2 ? "save" : "task_alt"}</span>
          )}
          {submitting ? "Đang xử lý hồ sơ..." : 
           appointment.trangThai === 2 ? "Lưu các thay đổi bệnh án" : 
           appointment.trangThai === 1 ? "Hoàn tất khám & Xuất đơn thuốc" : "Yêu cầu bác sĩ xác nhận lịch trước"}
        </button>
        
        <div className="flex items-center justify-center gap-2 mt-6 text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">
          <span className="material-symbols-outlined text-xs">shield_with_heart</span>
          Thông tin được lưu trữ an toàn và bảo mật theo tiêu chuẩn y tế.
        </div>
      </div>
    </div>
  );
}

export default DoctorAppointmentDetailPage;
