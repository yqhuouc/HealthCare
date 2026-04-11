/**
 * ============================================================
 * TRANG: Dashboard Bác sĩ (Tổng quan)
 * Đường dẫn: /doctor/dashboard
 * ============================================================
 *
 * Chức năng chính:
 * 1. Hiển thị các con số thống kê nhanh trong ngày (Lịch hẹn, hoàn thành, tổng BN).
 * 2. Liệt kê danh sách bệnh nhân cần khám trong hôm nay.
 * 3. Cho phép bác sĩ nhanh chóng xác nhận hoặc hoàn thành lịch hẹn.
 *
 * Đặc điểm giao diện:
 * - Phong cách thiết kế: "Clinical Style" sạch sẽ, tối giản.
 * - Sử dụng Border thay vì Shadow để giao diện trông chuyên nghiệp, hàn lâm hơn.
 * - Hỗ trợ hiển thị tốt trên cả Máy tính (Table) và Điện thoại (Cards).
 * ============================================================
 */
import { Link } from "react-router-dom";
import {
  useAppointmentsByDoctor,
  useUpdateAppointmentStatus,
} from "../../hooks/queries/useAppointmentQueries";
import useAuthStore from "../../stores/useAuthStore";
import { toast } from "react-toastify";
import { getInitials } from "../../utils/formatters";
import { formatTime, toDateString, dayjs } from "../../utils/dateUtils";

/**
 * Cấu hình hiển thị cho các trạng thái lịch hẹn.
 * Màu sắc được chọn theo tông Pastel nhẹ nhàng, chuyên nghiệp.
 */
const STATUS_CONFIG = {
  0: {
    label: "Chờ xác nhận",
    color: "border-amber-200 text-amber-700 bg-amber-50",
  },
  1: {
    label: "Đã xác nhận",
    color: "border-blue-200 text-blue-700 bg-blue-50",
  },
  2: {
    label: "Hoàn thành",
    color: "border-emerald-200 text-emerald-700 bg-emerald-50",
  },
  3: { label: "Đã hủy", color: "border-rose-200 text-rose-700 bg-rose-50" },
};

function DoctorDashboardPage() {
  // Lấy thông tin bác sĩ đang đăng nhập từ Store (Zustand)
  const { user } = useAuthStore();
  const bacSiId = user?.bacSi?.id;

  /**
   * 1. LẤY DỮ LIỆU TỪ SERVER (Dùng React Query)
   * hook này tự động fetched dữ liệu và quản lý trạng thái loading.
   */
  const { data: aptRes, isLoading: loading } = useAppointmentsByDoctor(bacSiId);
  const appointments = Array.isArray(aptRes?.data) ? aptRes.data : [];

  /**
   * 2. XỬ LÝ CẬP NHẬT TRẠNG THÁI (Mutation)
   * Dùng để thay đổi trạng thái lịch hẹn khi bác sĩ bấm nút.
   */
  const statusMutation = useUpdateAppointmentStatus();

  /**
   * 3. XỬ LÝ DỮ LIỆU HIỂN THỊ TRONG NGÀY
   */
  const todayStr = toDateString(dayjs()); // Lấy ngày hiện tại (YYYY-MM-DD)

  // Lọc danh sách: Chỉ lấy những lịch hẹn của chính ngày hôm nay
  const todayAppointments = appointments.filter(
    (a) => toDateString(a.ngayDat) === todayStr,
  );

  /**
   * 4. TÍNH TOÁN CÁC CHỈ SỐ THỐNG KÊ (Stats)
   */
  const stats = [
    {
      label: "Lịch hôm nay",
      icon: "event_upcoming",
      value: todayAppointments.filter((a) => a.trangThai !== 3).length,
      textColor: "text-primary",
      borderColor: "border-primary/20",
    },
    {
      label: "Đã khám xong",
      icon: "task_alt",
      value: todayAppointments.filter((a) => a.trangThai === 2).length,
      textColor: "text-emerald-600",
      borderColor: "border-emerald-200",
    },
    {
      label: "Chờ xác nhận",
      icon: "hourglass_empty",
      value: todayAppointments.filter((a) => a.trangThai === 0).length,
      textColor: "text-amber-600",
      borderColor: "border-amber-200",
    },
    {
      label: "Tổng bệnh nhân",
      icon: "groups",
      value: appointments.filter((a) => a.trangThai !== 3).length,
      textColor: "text-blue-600",
      borderColor: "border-blue-200",
    },
  ];

  /**
   * Hàm xử lý khi bấm nút thay đổi trạng thái
   */
  const handleUpdateStatus = (id, newStatus) => {
    const labels = { 1: "Đã xác nhận", 2: "Đã hoàn thành", 3: "Đã hủy" };
    statusMutation.mutate(
      { id, trangThai: newStatus },
      {
        onSuccess: () => toast.success(`Đã cập nhật: ${labels[newStatus]}`),
        onError: (err) =>
          toast.error(err.message || "Không thể cập nhật trạng thái"),
      },
    );
  };

  /**
   * COMPONENT CON: Render Badge Trạng thái
   */
  const renderStatusBadge = (appointment) => {
    // Nếu truyền số trạng thái trực tiếp (tốt cho việc tái sử dụng)
    const status =
      typeof appointment === "object" ? appointment.trangThai : appointment;
    const config = STATUS_CONFIG[status];
    if (!config) return null;

    return (
      <div className="flex flex-col gap-1">
        <span
          className={`px-2.5 py-1 border rounded-md text-[10px] font-bold uppercase tracking-tight ${config.color}`}
        >
          {config.label}
        </span>
        {/* Nếu ca khám đã có đơn thuốc thì hiện thêm biểu tượng pill */}
        {appointment?.donThuoc && (
          <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 italic">
            <span className="material-symbols-outlined text-[10px]">pill</span>
            Đã kê đơn
          </span>
        )}
      </div>
    );
  };

  /**
   * COMPONENT CON: Render các nút hành động (Xác nhận, Hoàn thành, Link chi tiết)
   */
  const renderActions = (appointment) => {
    const { id, trangThai } = appointment;
    return (
      <div className="flex items-center gap-2">
        {/* Nút XÁC NHẬN nếu lịch đang ở trạng thái CHỜ (0) */}
        {trangThai === 0 && (
          <button
            onClick={() => handleUpdateStatus(id, 1)}
            className="h-8 px-3 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">check</span>
            Xác nhận
          </button>
        )}

        {/* Nút HOÀN THÀNH nếu lịch đã XÁC NHẬN (1) và đang khám */}
        {trangThai === 1 && (
          <button
            onClick={() => handleUpdateStatus(id, 2)}
            className="h-8 px-3 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">done_all</span>
            Xong
          </button>
        )}

        {/* Nút đi tới CHI TIẾT (Kê đơn / Xem kết quả) */}
        <Link
          to={`/doctor/appointments/${id}`}
          className={`h-8 px-3 border rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
            trangThai === 2
              ? "border-primary text-primary hover:bg-primary hover:text-white"
              : "border-slate-300 text-slate-500 hover:bg-slate-50"
          }`}
        >
          <span className="material-symbols-outlined text-sm">
            {trangThai === 2 ? "visibility" : "clinical_notes"}
          </span>
          {trangThai === 2 ? "Xem hồ sơ" : "Khám bệnh"}
        </Link>
      </div>
    );
  };

  // Hiển thị vòng xoay khi đang tải dữ liệu
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium">
          Đang tải dữ liệu tổng quan...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* SECTION 1: CÁC THẺ THỐNG KÊ (STAT CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((card) => (
          <div
            key={card.label}
            className={`bg-white p-5 border-2 ${card.borderColor} rounded-xl flex items-center gap-4`}
          >
            <div
              className={`w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center ${card.textColor}`}
            >
              <span className="material-symbols-outlined text-3xl font-light">
                {card.icon}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                {card.label}
              </p>
              <p
                className={`text-2xl font-bold ${card.textColor} leading-none`}
              >
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 2: DANH SÁCH LỊCH KHÁM HÔM NAY */}
      <div className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {/* Header của bảng */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Lịch làm việc hôm nay
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Danh sách bệnh nhân đăng ký khám trong ngày
            </p>
          </div>
          <Link
            to="/doctor/appointments"
            className="px-4 py-2 text-xs font-bold text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-all"
          >
            Xem toàn bộ lịch trình
          </Link>
        </div>

        {/* Nội dung danh sách */}
        {todayAppointments.length === 0 ? (
          /* Trường hợp không có lịch hẹn */
          <div className="py-24 text-center">
            <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">
              calendar_today
            </span>
            <p className="text-slate-500 font-bold">
              Hôm nay bạn chưa có lịch hẹn nào
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Các yêu cầu khám mới sẽ xuất hiện tại đây
            </p>
          </div>
        ) : (
          /* Hiển thị bảng dữ liệu (Responsive) */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                    Thời gian
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                    Bệnh nhân
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-widest hidden lg:table-cell">
                    Lý do khám
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-widest text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todayAppointments.map((appt) => (
                  <tr
                    key={appt.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {/* Cột: Giờ khám */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <span className="material-symbols-outlined text-sm">
                          schedule
                        </span>
                        {formatTime(appt.gioBatDau)}
                      </div>
                    </td>

                    {/* Cột: Bệnh nhân */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 border border-slate-200 rounded-lg bg-white flex items-center justify-center text-xs font-bold text-slate-400">
                          {getInitials(appt.benhNhan?.hoTen)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 leading-none mb-1">
                            {appt.benhNhan?.hoTen || "—"}
                          </p>
                          <p className="text-[11px] text-slate-500 leading-none">
                            SĐT: {appt.benhNhan?.soDienThoai || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Cột: Lý do (Ẩn trên mobile cho gọn) */}
                    <td className="px-6 py-5 hidden lg:table-cell">
                      <p className="text-xs text-slate-500 italic max-w-xs truncate">
                        "{appt.lyDoKham || "Không có lý do cụ thể"}"
                      </p>
                    </td>

                    {/* Cột: Trạng thái */}
                    <td className="px-6 py-5">{renderStatusBadge(appt)}</td>

                    {/* Cột: Thao tác */}
                    <td className="px-6 py-5 text-right">
                      <div className="inline-flex items-center">
                        {renderActions(appt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer của bảng */}
        <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 italic">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
            * Dữ liệu được cập nhật thời gian thực từ hệ thống quản lý trung tâm
          </p>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboardPage;
