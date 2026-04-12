import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useAppointment,
  useUpdateAppointmentStatus,
  useUpdatePaymentStatus,
} from "../../hooks/queries/useAppointmentQueries";
import { APPOINTMENT_STATUS_CONFIG } from "../../data/appointmentConstants";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getInitials } from "../../utils/formatters";
import { formatDate, formatTime } from "../../utils/dateUtils";

// Map mã trạng thái từ DB sang key cấu hình UI
const STATUS_MAP = {
  0: "pending",
  1: "confirmed",
  2: "completed",
  3: "cancelled",
};

// Các tùy chọn trạng thái thanh toán và màu sắc tương ứng
const PAYMENT_STATUS_OPTIONS = [
  { value: 0, label: "Chưa thanh toán", color: "text-red-600 bg-red-50" },
  { value: 1, label: "Đã thanh toán cọc", color: "text-amber-600 bg-amber-50" },
  { value: 2, label: "Đã thanh toán xong", color: "text-emerald-600 bg-emerald-50" },
];

/**
 * Trang AdminAppointmentDetailPage - Xem chi tiết và quản lý một lịch hẹn cụ thể
 * Cho phép cập nhật trạng thái lịch khám và trạng thái thanh toán.
 */
function AdminAppointmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // TanStack Query: Lấy chi tiết lịch hẹn (auto-cache)
  const { data: aptRes, isLoading: loading } = useAppointment(id);
  const appointment = aptRes?.data || null;

  // TanStack Query: Mutations (auto-invalidate toàn bộ appointment queries)
  const statusMutation = useUpdateAppointmentStatus();
  const paymentMutation = useUpdatePaymentStatus();
  const updating = statusMutation.isPending || paymentMutation.isPending;

  /**
   * Cập nhật trạng thái lịch khám
   */
  const handleUpdateStatus = (newStatus) => {
    statusMutation.mutate(
      { id, trangThai: newStatus },
      {
        onSuccess: () => toast.success("Cập nhật trạng thái thành công!"),
        onError: () => toast.error("Lỗi khi cập nhật trạng thái"),
      },
    );
  };

  /**
   * Cập nhật trạng thái thanh toán
   */
  const handleUpdatePayment = (newPaymentStatus) => {
    paymentMutation.mutate(
      { id, trangThaiThanhToan: newPaymentStatus },
      {
        onSuccess: () => toast.success("Cập nhật thanh toán thành công!"),
        onError: () => toast.error("Lỗi khi cập nhật thanh toán"),
      },
    );
  };

  // Hiển thị vòng xoay loading khi đang tải dữ liệu
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="size-12" />
      </div>
    );
  }

  if (!appointment) return null;

  // Chuẩn bị thông tin hiển thị trạng thái
  const statusKey = STATUS_MAP[appointment.trangThai] || "pending";
  const statusCfg = APPOINTMENT_STATUS_CONFIG[statusKey];
  const patient = appointment.benhNhan || {};
  const doctor = appointment.bacSi || {};
  const prescription = appointment.donThuoc;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Đường dẫn Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/admin/appointments" className="text-slate-500 hover:text-primary transition-colors">
          Quản lý lịch khám
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-bold">Chi tiết LK{id}</span>
      </div>

      {/* SECTION ĐẦU TRANG: Tiêu đề và Các nút chuyển đổi trạng thái */}
      <div className="space-y-4 pb-6 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Chi tiết lịch khám #LK{id}</h2>
          {statusCfg && (
            <span
              className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${statusCfg.className}`}
            >
              {statusCfg.label}
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">calendar_month</span>
              {formatDate(appointment.ngayDat)}
            </span>
            <span className="text-slate-200">|</span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">schedule</span>
              {appointment.gioBatDau ? formatTime(appointment.gioBatDau) : "—"}
            </span>
          </div>

          {/* NHÓM CÁC NÚT ĐIỀU KHIỂN TRẠNG THÁI (Duyệt, Hủy, Xong...) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Nếu đang ở trạng thái CHỜ XÁC NHẬN (0) */}
            {appointment.trangThai === 0 && (
              <>
                <button
                  onClick={() => handleUpdateStatus(1)}
                  disabled={updating}
                  className="px-4 py-2 bg-primary text-white text-[10px] font-black rounded-xl hover:bg-primary/90 transition shadow-md shadow-primary/10 flex items-center gap-2 uppercase tracking-widest"
                >
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  Duyệt lịch
                </button>
                <button
                  onClick={() => handleUpdateStatus(3)}
                  disabled={updating}
                  className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-black rounded-xl hover:bg-rose-100 transition flex items-center gap-2 uppercase tracking-widest"
                >
                  <span className="material-symbols-outlined text-base">cancel</span>
                  Hủy
                </button>
              </>
            )}

            {/* Nếu đang ở trạng thái ĐÃ XÁC NHẬN (1) */}
            {appointment.trangThai === 1 && (
              <>
                <button
                  onClick={() => handleUpdateStatus(2)}
                  disabled={updating}
                  className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-black rounded-xl hover:bg-emerald-700 transition shadow-md shadow-emerald-100 flex items-center gap-2 uppercase tracking-widest"
                >
                  <span className="material-symbols-outlined text-base">task_alt</span>
                  Xong
                </button>
                <button
                  onClick={() => handleUpdateStatus(0)}
                  disabled={updating}
                  className="px-4 py-2 bg-slate-100 text-slate-500 text-[10px] font-black rounded-xl hover:bg-slate-200 transition flex items-center gap-2 uppercase tracking-widest"
                >
                  <span className="material-symbols-outlined text-base">undo</span>
                  Hoàn tác
                </button>
                <button
                  onClick={() => handleUpdateStatus(3)}
                  disabled={updating}
                  className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-black rounded-xl hover:bg-rose-100 transition flex items-center gap-2 uppercase tracking-widest"
                >
                  <span className="material-symbols-outlined text-base">cancel</span>
                  Hủy
                </button>
              </>
            )}

            {/* Nếu đang ở trạng thái ĐÃ HỦY (3) */}
            {appointment.trangThai === 3 && (
              <button
                onClick={() => handleUpdateStatus(1)}
                disabled={updating}
                className="px-4 py-2 bg-primary text-white text-[10px] font-black rounded-xl hover:bg-primary/90 transition shadow-md shadow-primary/10 flex items-center gap-2 uppercase tracking-widest"
              >
                <span className="material-symbols-outlined text-base">history</span>
                Khôi phục
              </button>
            )}

            {/* Nếu đang ở trạng thái ĐÃ KHÁM (2) */}
            {appointment.trangThai === 2 && (
              <button
                onClick={() => handleUpdateStatus(1)}
                disabled={updating}
                className="px-4 py-2 bg-slate-100 text-slate-500 text-[10px] font-black rounded-xl hover:bg-slate-200 transition flex items-center gap-2 uppercase tracking-widest"
              >
                <span className="material-symbols-outlined text-base">undo</span>
                Hoàn tác xong
              </button>
            )}

            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 px-4 py-2 text-[10px] font-black bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-sm">close</span>
              Thoát
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CỘT TRÁI: Dữ liệu chi tiết Bệnh nhân, Bác sĩ và Triệu chứng */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Thông tin khám bệnh</h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Thông tin Bệnh nhân */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Thông tin Bệnh nhân
                </p>
                <div className="flex items-center gap-4 group">
                  <div className="size-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black text-lg border border-primary/10 group-hover:bg-primary transition-colors group-hover:text-white">
                    {getInitials(patient.hoTen || "??")}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-base leading-tight">{patient.hoTen}</p>
                    <p className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-1.5 cursor-default">
                      <span className="material-symbols-outlined text-[10px] text-primary font-black">call</span>
                      {patient.soDienThoai}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bác sĩ phụ trách */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Bác sĩ phụ trách</p>
                <div className="flex items-center gap-4 group">
                  <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-2xl">medical_services</span>
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-base leading-tight">{doctor.tenBacSi}</p>
                    <p className="text-xs font-bold text-primary mt-1 flex items-center gap-1.5 cursor-default uppercase tracking-tighter">
                      <span className="material-symbols-outlined text-[10px] font-black">stethoscope</span>
                      {doctor.chuyenKhoa?.tenChuyenKhoa}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mô tả Triệu chứng */}
              <div className="sm:col-span-2 pt-4 border-t border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">
                  Lý do khám / Triệu chứng
                </p>
                <div className="bg-slate-50/50 p-4 rounded-xl border border-dashed border-slate-200 italic text-sm text-slate-600 leading-relaxed font-medium">
                  "{appointment.trieuChung || "Bệnh nhân không để lại ghi chú triệu chứng."}"
                </div>
              </div>
            </div>
          </div>

          {/* HIỂN THỊ ĐƠN THUỐC (Nếu kết quả khám đã có đơn thuốc) */}
          {prescription && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-emerald-50/30 flex items-center justify-between">
                <h3 className="font-bold text-emerald-900 flex items-center gap-2">
                  <span className="material-symbols-outlined">prescriptions</span>
                  Đơn thuốc đã kê
                </h3>
                <span className="text-xs text-emerald-600 font-semibold">#{prescription.id}</span>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-xs text-slate-500 font-semibold">Chẩn đoán</p>
                  <p className="font-medium text-slate-900 mt-1">{prescription.chanDoan}</p>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-100">
                      <th className="text-left py-2 font-medium">Tên thuốc</th>
                      <th className="text-center py-2 font-medium">SL</th>
                      <th className="text-right py-2 font-medium">Đơn giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescription.chiTietDonThuoc?.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-50 last:border-0">
                        <td className="py-3">
                          <p className="font-semibold text-slate-800">{item.tenThuoc}</p>
                          <p className="text-xs text-slate-500 italic">{item.lieuDung}</p>
                        </td>
                        <td className="py-3 text-center text-slate-600">{item.soLuong}</td>
                        <td className="py-3 text-right text-slate-600">{item.donGia?.toLocaleString("vi-VN")}đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <p className="font-bold text-slate-900">Tổng tiền đơn thuốc:</p>
                  <p className="text-lg font-bold text-rose-600">
                    {prescription.tongTien?.toLocaleString("vi-VN")} VNĐ
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CỘT PHẢI: Quản lý Thanh toán & Tóm tắt chi phí */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-4">Quản lý thanh toán</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-2">Trạng thái hiện tại</p>
                <div
                  className={`p-3 rounded-xl border flex items-center justify-center font-bold ${
                    PAYMENT_STATUS_OPTIONS.find((o) => o.value === appointment.trangThaiThanhToan)?.color ||
                    "bg-slate-50"
                  }`}
                >
                  {PAYMENT_STATUS_OPTIONS.find((o) => o.value === appointment.trangThaiThanhToan)?.label || "Không rõ"}
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-semibold mb-2">Cập nhật nhanh</p>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => handleUpdatePayment(2)}
                    disabled={updating || appointment.trangThaiThanhToan === 2}
                    className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Xác nhận đã thanh toán
                  </button>
                  <button
                    onClick={() => handleUpdatePayment(0)}
                    disabled={updating || appointment.trangThaiThanhToan === 0}
                    className="w-full py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 disabled:opacity-50"
                  >
                    Đánh dấu chưa trả tiền
                  </button>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  * Admin có quyền ghi đè trạng thái thanh toán khi nhận tiền mặt tại quầy hoặc đối soát xong.
                </p>
              </div>
            </div>
          </div>

          {/* TÓM TẮT CHI PHÍ (Phí khám + Phí thuốc) */}
          <div className="bg-slate-900 rounded-xl p-6 text-white shadow-lg">
            <h3 className="font-bold mb-4 opacity-80">Chi phí dịch vụ</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="opacity-60">Phí khám bệnh</span>
                <span>{appointment.giaKham?.toLocaleString("vi-VN") || 0}đ</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-60">Phí đơn thuốc</span>
                <span>{prescription?.tongTien?.toLocaleString("vi-VN") || 0}đ</span>
              </div>
              <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                <span className="font-bold">Tổng cộng</span>
                <span className="text-xl font-bold text-primary-light">
                  {((Number(appointment.giaKham) || 0) + (Number(prescription?.tongTien) || 0)).toLocaleString("vi-VN")}
                  đ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAppointmentDetailPage;
