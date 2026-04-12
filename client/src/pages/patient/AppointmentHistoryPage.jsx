/**
 * ============================================================
 * TRANG: Lịch sử đặt khám (Bệnh nhân)
 * Đường dẫn: /appointments
 * ============================================================
 *
 * Chức năng:
 * - Hiển thị tất cả lịch hẹn khám bệnh của bệnh nhân (từ API)
 * - Lọc theo trạng thái bằng tabs: Tất cả / Chờ xác nhận / Đã xác nhận / Đã khám / Đã hủy
 * - Mỗi card: ảnh BS, tên BS, chuyên khoa, ngày giờ, lý do, trạng thái
 * - Nút "Hủy lịch" (xóa) cho các lịch hẹn Chờ xác nhận
 * - Nút "Xem kết quả" cho lịch hẹn Đã khám
 *
 * Dữ liệu: API /api/dat-lich/benh-nhan/:benhNhanId
 * ============================================================
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useAppointmentsByPatient,
  useDeleteAppointment,
  useChangePaymentMethod,
} from "../../hooks/queries/useAppointmentQueries";
import useAuthStore from "../../stores/useAuthStore";
import { formatTime, formatDate } from "../../utils/dateUtils";
import { paymentService } from "../../services/paymentService";
import ConfirmModal from "../../components/ui/ConfirmModal";

const STATUS_CONFIG = {
  0: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700" },
  1: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-700" },
  2: { label: "Đã khám", color: "bg-green-100 text-green-700" },
  3: { label: "Đã hủy", color: "bg-red-100 text-red-700" },
};

const PAYMENT_STATUS_CONFIG = {
  0: { label: "Chưa thanh toán", color: "bg-red-50 text-red-500" },
  1: { label: "Đã trả phí khám", color: "bg-amber-50 text-amber-600" },
  2: { label: "Đã trả toàn bộ", color: "bg-emerald-50 text-emerald-600" },
};

const FILTER_TABS = [
  { key: "all", label: "Tất cả" },
  { key: 0, label: "Chờ xác nhận" },
  { key: 1, label: "Đã xác nhận" },
  { key: 2, label: "Đã khám" },
  { key: 3, label: "Đã hủy" },
];

export default function AppointmentHistoryPage() {
  const user = useAuthStore((s) => s.user);
  const benhNhanId = user?.benhNhan?.id;
  const [filterStatus, setFilterStatus] = useState("all");

  // State quản lý Modal xác nhận
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "danger",
    confirmLabel: "Xác nhận",
  });

  // TanStack Query: Lấy lịch hẹn theo bệnh nhân
  const { data: aptRes, isLoading: loading } = useAppointmentsByPatient(benhNhanId);
  const appointments = aptRes?.data || [];

  // TanStack Query: Mutation chính
  const deleteMutation = useDeleteAppointment();
  const changeMethodMutation = useChangePaymentMethod();

  const filteredAppointments =
    filterStatus === "all" ? appointments : appointments.filter((a) => a.trangThai === filterStatus);

  const openModal = (config) => setModalConfig({ ...config, isOpen: true });
  const closeModal = () => setModalConfig((prev) => ({ ...prev, isOpen: false }));

  const handleCancelClick = (appointmentId) => {
    openModal({
      title: "Hủy lịch hẹn?",
      message: "Bạn có chắc chắn muốn hủy lịch hẹn này? Hành động này không thể hoàn tác.",
      type: "danger",
      confirmLabel: "Xác nhận hủy",
      onConfirm: () => {
        deleteMutation.mutate(appointmentId, {
          onSuccess: () => {
            toast.success("Đã hủy lịch hẹn thành công.");
            closeModal();
          },
          onError: (err) => toast.error(err?.message || "Không thể hủy lịch hẹn."),
        });
      },
    });
  };

  /** Thử lại thanh toán VNPay */
  const handleRetryPayment = async (appointmentId) => {
    try {
      toast.info("Đang tạo liên kết thanh toán...");
      const res = await paymentService.createVnpayPayment({
        datLichId: appointmentId,
        loaiGiaoDich: "PHI_KHAM",
      });
      if (res.paymentUrl) {
        window.location.assign(res.paymentUrl);
      } else {
        toast.error("Không thể khởi tạo thanh toán. Vui lòng thử lại sau.");
      }
    } catch (err) {
      toast.error("Không thể khởi tạo thanh toán. Vui lòng thử lại sau.", err);
    }
  };

  /** Chuyển sang thanh toán tại quầy (ID 6 - Offline) */
  const handleSwitchToOfflineClick = (appointmentId) => {
    openModal({
      title: "Đổi phương thức thanh toán?",
      message: "Bạn muốn chuyển sang thanh toán trực tiếp tại quầy khi đến khám?",
      type: "warning",
      confirmLabel: "Đồng ý chuyển",
      onConfirm: () => {
        changeMethodMutation.mutate(
          { id: appointmentId, hinhThucThanhToanId: 6 },
          {
            onSuccess: () => {
              toast.success("Đã chuyển sang thanh toán tại quầy.");
              closeModal();
            },
            onError: (err) => toast.error(err?.message || "Không thể đổi phương thức."),
          },
        );
      },
    });
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
        <p className="mt-4 text-slate-500">Đang tải lịch sử đặt khám...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      {/* Tiêu đề trang */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Lịch sử đặt khám</h1>
        <div className="w-16 h-1 bg-primary rounded-full mt-2" />
      </div>

      {/* Tabs lọc trạng thái */}
      <div className="flex flex-wrap gap-2 mb-8">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer ${
              filterStatus === tab.key ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Danh sách lịch hẹn */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-slate-300">event_busy</span>
          <p className="text-slate-500 mt-4">
            Không có lịch hẹn nào
            {filterStatus !== "all" && " với trạng thái này"}.
          </p>
          <Link to="/doctors" className="inline-block mt-4 text-primary hover:underline text-sm font-medium">
            Đặt lịch khám ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => {
            const statusCfg = STATUS_CONFIG[appointment.trangThai] || STATUS_CONFIG[0];
            const isPending = appointment.trangThai === 0;
            const isCompleted = appointment.trangThai === 2;
            const doctorName = appointment.bacSi?.tenBacSi || "Bác sĩ";
            const specialtyName = appointment.bacSi?.chuyenKhoa?.tenChuyenKhoa || "";

            return (
              <div
                key={appointment.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 hover:shadow-md transition relative overflow-hidden"
              >
                {/* Avatar bác sĩ */}
                <div className="w-16 h-16 rounded-full border-2 border-primary/20 bg-primary/5 flex items-center justify-center overflow-hidden shrink-0">
                  <span className="material-symbols-outlined text-3xl text-primary/40">person</span>
                </div>

                {/* Thông tin chi tiết */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <h3 className="font-semibold text-slate-800">{doctorName}</h3>
                  {specialtyName && <p className="text-sm text-slate-500 mt-0.5">{specialtyName}</p>}

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 mt-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base text-slate-400">calendar_month</span>
                      {formatDate(appointment.ngayDat)}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base text-slate-400">schedule</span>
                      {formatTime(appointment.gioBatDau)}
                    </span>
                  </div>

                  {appointment.lyDoKham && (
                    <p className="text-sm text-slate-500 mt-2 line-clamp-1">
                      <span className="font-medium text-slate-600">Lý do:</span> {appointment.lyDoKham}
                    </p>
                  )}
                </div>

                {/* Trạng thái + hành động */}
                <div className="flex flex-col items-center sm:items-end gap-3 shrink-0 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="flex flex-col items-center sm:items-end gap-1.5">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${statusCfg.color}`}
                    >
                      {statusCfg.label}
                    </span>
                    {appointment.trangThai !== 3 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${PAYMENT_STATUS_CONFIG[appointment.trangThaiThanhToan]?.color || "bg-slate-100"}`}
                      >
                        {PAYMENT_STATUS_CONFIG[appointment.trangThaiThanhToan]?.label}
                      </span>
                    )}
                  </div>

                  {isPending && appointment.trangThaiThanhToan === 0 && (
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      {appointment.hinhThucThanhToan?.maLoai === "VNPAY" && (
                        <button
                          onClick={() => handleRetryPayment(appointment.id)}
                          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition cursor-pointer flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
                        >
                          <span className="material-symbols-outlined text-sm">payments</span>
                          Thanh toán phí khám
                        </button>
                      )}

                      {appointment.hinhThucThanhToan?.maLoai === "VNPAY" && (
                        <button
                          onClick={() => handleSwitchToOfflineClick(appointment.id)}
                          className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-200 text-slate-500 text-[10px] font-medium hover:bg-slate-50 transition cursor-pointer whitespace-nowrap"
                        >
                          Chuyển trả tại quầy
                        </button>
                      )}
                    </div>
                  )}

                  {isPending && (
                    <button
                      onClick={() => handleCancelClick(appointment.id)}
                      className="w-full sm:w-auto px-4 py-2 rounded-lg border border-red-200 text-red-400 text-[10px] font-medium hover:bg-red-50 transition cursor-pointer whitespace-nowrap"
                    >
                      Hủy lịch hẹn
                    </button>
                  )}

                  {isCompleted && (
                    <Link
                      to={`/medical-results/${appointment.id}`}
                      className="w-full sm:w-auto px-4 py-2 rounded-lg border border-primary text-primary text-xs font-medium hover:bg-primary/5 transition text-center"
                    >
                      Xem kết quả
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tích hợp ConfirmModal */}
      <ConfirmModal
        {...modalConfig}
        onClose={closeModal}
        isLoading={deleteMutation.isPending || changeMethodMutation.isPending}
      />
    </div>
  );
}
