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
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { appointmentService } from "../../services/appointmentService";
import useAuthStore from "../../stores/useAuthStore";

/**
 * Mapping trạng thái lịch hẹn: number → { label, color }
 * 0: Chờ xác nhận | 1: Đã xác nhận | 2: Đã khám | 3: Đã hủy
 */
const STATUS_CONFIG = {
  0: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700" },
  1: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-700" },
  2: { label: "Đã khám", color: "bg-green-100 text-green-700" },
  3: { label: "Đã hủy", color: "bg-red-100 text-red-700" },
};

/** Cấu hình các tab lọc trạng thái lịch hẹn */
const FILTER_TABS = [
  { key: "all", label: "Tất cả" },
  { key: 0, label: "Chờ xác nhận" },
  { key: 1, label: "Đã xác nhận" },
  { key: 2, label: "Đã khám" },
  { key: 3, label: "Đã hủy" },
];

/** Format Date object hoặc ISO string thành "dd/MM/yyyy" */
function formatDate(dateInput) {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/** Format giờ từ Date hoặc chuỗi ISO/Time */
function formatTime(timeInput) {
  if (!timeInput) return "";

  // Nếu là chuỗi HH:mm (như từ API slot trống gửi về) thì lấy luôn
  if (typeof timeInput === "string" && !timeInput.includes("T") && timeInput.includes(":")) {
    return timeInput.substring(0, 5);
  }

  // Nếu là đối tượng Date hoặc chuỗi ISO (có T và Z/múi giờ)
  const d = new Date(timeInput);
  if (isNaN(d.getTime())) return timeInput;

  // QUAN TRỌNG: Ép về năm 2024 để tránh lỗi múi giờ lịch sử của Asia/Ho_Chi_Minh 
  // (Năm 1970 múi giờ VN là +8, còn hiện tại là +7)
  d.setFullYear(2024);

  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

export default function AppointmentHistoryPage() {
  const user = useAuthStore((s) => s.user);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchAppointments = async () => {
      const benhNhanId = user?.benhNhan?.id;
      if (!benhNhanId) {
        setLoading(false);
        return;
      }
      try {
        const res = await appointmentService.getByBenhNhan(benhNhanId);
        setAppointments(res.data || []);
      } catch {
        /* lỗi hiện qua interceptor */
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [user]);

  // Lọc danh sách lịch hẹn theo trạng thái
  const filteredAppointments =
    filterStatus === "all"
      ? appointments
      : appointments.filter((a) => a.trangThai === filterStatus);

  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy lịch hẹn này?")) return;
    try {
      await appointmentService.remove(appointmentId);
      setAppointments((prev) => prev.filter((a) => String(a.id) !== String(appointmentId)));
      toast.success("Đã hủy lịch hẹn thành công.");
    } catch (err) {
      toast.error(err?.message || "Không thể hủy lịch hẹn.");
    }
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
              filterStatus === tab.key
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
            Không có lịch hẹn nào{filterStatus !== "all" && " với trạng thái này"}.
          </p>
          <Link
            to="/doctors"
            className="inline-block mt-4 text-primary hover:underline text-sm font-medium"
          >
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
                className="bg-white border border-slate-200 rounded-lg p-6 flex items-start gap-4 hover:shadow-md transition"
              >
                {/* Avatar bác sĩ */}
                <div className="w-16 h-16 rounded-full border-2 border-primary/20 bg-primary/5 flex items-center justify-center overflow-hidden shrink-0">
                  <span className="material-symbols-outlined text-3xl text-primary/40">person</span>
                </div>

                {/* Thông tin chi tiết */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800">{doctorName}</h3>
                  {specialtyName && (
                    <p className="text-sm text-slate-500 mt-0.5">{specialtyName}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-slate-600">
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
                      <span className="font-medium text-slate-600">Lý do:</span>{" "}
                      {appointment.lyDoKham}
                    </p>
                  )}
                </div>

                {/* Trạng thái + hành động */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusCfg.color}`}>
                    {statusCfg.label}
                  </span>

                  {isPending && (
                    <button
                      onClick={() => handleCancel(appointment.id)}
                      className="px-3 py-1.5 rounded-lg border border-red-300 text-red-500 text-xs font-medium hover:bg-red-50 transition cursor-pointer"
                    >
                      Hủy lịch
                    </button>
                  )}

                  {isCompleted && (
                    <Link
                      to={`/medical-results/${appointment.id}`}
                      className="px-3 py-1.5 rounded-lg border border-primary text-primary text-xs font-medium hover:bg-primary/5 transition"
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
    </div>
  );
}
