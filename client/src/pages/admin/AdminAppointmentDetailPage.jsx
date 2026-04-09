import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { appointmentService } from "../../services/appointmentService";
import { APPOINTMENT_STATUS_CONFIG } from "../../data/mockAdminData";
import { getInitials } from "../../utils/formatters";

const STATUS_MAP = {
  0: "pending",
  1: "confirmed",
  2: "completed",
  3: "cancelled",
};

const PAYMENT_STATUS_OPTIONS = [
  { value: 0, label: "Chưa thanh toán", color: "text-red-600 bg-red-50" },
  { value: 1, label: "Đã thanh toán cọc", color: "text-amber-600 bg-amber-50" },
  { value: 2, label: "Đã thanh toán xong", color: "text-emerald-600 bg-emerald-50" },
];

function AdminAppointmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await appointmentService.getById(id);
        if (res.success) {
          setAppointment(res.data);
        }
      } catch (error) {
        console.error(error);
        toast.error("Không tìm thấy thông tin lịch hẹn!");
        navigate("/admin/appointments");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);

  const handleUpdateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await appointmentService.updateTrangThai(id, newStatus);
      toast.success("Cập nhật trạng thái thành công!");
      // Refresh data
      const res = await appointmentService.getById(id);
      if (res.success) setAppointment(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi cập nhật trạng thái");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePayment = async (newPaymentStatus) => {
    setUpdating(true);
    try {
      await appointmentService.updateThanhToan(id, newPaymentStatus);
      toast.success("Cập nhật thanh toán thành công!");
      // Refresh data
      const res = await appointmentService.getById(id);
      if (res.success) setAppointment(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi cập nhật thanh toán");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">
          progress_activity
        </span>
      </div>
    );
  }

  if (!appointment) return null;

  const statusKey = STATUS_MAP[appointment.trangThai] || "pending";
  const statusCfg = APPOINTMENT_STATUS_CONFIG[statusKey];
  const patient = appointment.benhNhan || {};
  const doctor = appointment.bacSi || {};
  const prescription = appointment.donThuoc;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <Link to="/admin/appointments" className="text-slate-500 hover:text-primary transition-colors">
          Quản lý lịch khám
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-medium">Chi tiết LK{id}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            Chi tiết lịch khám #LK{id}
            {statusCfg && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusCfg.className}`}>
                {statusCfg.label}
              </span>
            )}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Ngày đặt: {new Date(appointment.ngayDat).toLocaleDateString("vi-VN")} | 
            Giờ: {appointment.gioBatDau ? new Date(appointment.gioBatDau).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "—"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {appointment.trangThai === 0 && (
            <button
              onClick={() => handleUpdateStatus(1)}
              disabled={updating}
              className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition shadow-sm"
            >
              Xác nhận lịch
            </button>
          )}
          {appointment.trangThai < 3 && (
            <button
              onClick={() => handleUpdateStatus(3)}
              disabled={updating}
              className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 text-sm font-semibold rounded-lg hover:bg-rose-100 transition"
            >
              Hủy lịch
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: Thông tin chính */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Thông tin khám bệnh</h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Bệnh nhân</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {getInitials(patient.hoTen || "??")}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{patient.hoTen}</p>
                    <p className="text-sm text-slate-500">{patient.soDienThoai}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Bác sĩ phụ trách</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{doctor.tenBacSi}</p>
                    <p className="text-sm text-slate-500">{doctor.chuyenKhoa?.tenChuyenKhoa}</p>
                  </div>
                </div>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Triệu chứng / Ghi chú đặt lịch</p>
                <p className="mt-2 text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                  "{appointment.trieuChung || "Bệnh nhân không để lại ghi chú."}"
                </p>
              </div>
            </div>
          </div>

          {/* Đơn thuốc (Nếu có) */}
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
                        <td className="py-3 text-right text-slate-600">
                          {item.donGia?.toLocaleString("vi-VN")}đ
                        </td>
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

        {/* Cột phải: Trạng thái & Thanh toán */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-4">Quản lý thanh toán</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-2">Trạng thái hiện tại</p>
                <div className={`p-3 rounded-xl border flex items-center justify-center font-bold ${
                  PAYMENT_STATUS_OPTIONS.find(o => o.value === appointment.trangThaiThanhToan)?.color || "bg-slate-50"
                }`}>
                  {PAYMENT_STATUS_OPTIONS.find(o => o.value === appointment.trangThaiThanhToan)?.label || "Không rõ"}
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
                  {((appointment.giaKham || 0) + (prescription?.tongTien || 0)).toLocaleString("vi-VN")}đ
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
