/**
 * ============================================================
 * TRANG: Dashboard Bác sĩ (Tổng quan)
 * Đường dẫn: /doctor/dashboard
 * ============================================================
 *
 * Chức năng chính:
 * 1. Hiển thị các chỉ số thống kê nhanh (Lịch hôm nay, Hoàn thành, Chờ xác nhận, Tổng BN).
 * 2. Liệt kê danh sách bệnh nhân có lịch hẹn trong ngày hôm nay.
 * 3. Thao tác nhanh: Xác nhận hoặc Hoàn thành lịch hẹn trực tiếp từ bảng.
 * 4. Đồng bộ dữ liệu realtime khi bác sĩ cập nhật trạng thái.
 *
 * Biến môi trường: VITE_API_URL dùng để gọi API backend.
 * State quản lý: appointments (danh sách), loading (trạng thái tải).
 * ============================================================
 */
import { Link } from "react-router-dom";
import { useAppointmentsByDoctor, useUpdateAppointmentStatus } from "../../hooks/queries/useAppointmentQueries";
import useAuthStore from "../../stores/useAuthStore";
import { toast } from "react-toastify";
import { getInitials } from "../../utils/formatters";
import { formatTime, toDateString, dayjs } from "../../utils/dateUtils";

/**
 * Cấu hình hiển thị cho các trạng thái lịch hẹn
 * Dùng để render Badge (nhãn) với màu sắc tương ứng.
 */
const STATUS_CONFIG = {
  0: { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-600" },
  1: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-600" },
  2: { label: "Hoàn thành", color: "bg-emerald-100 text-emerald-600" },
  3: { label: "Đã hủy", color: "bg-rose-100 text-rose-600" },
};

function DoctorDashboardPage() {
  const { user } = useAuthStore();
  const bacSiId = user?.bacSi?.id;

  // TanStack Query: Lấy danh sách lịch hẹn theo bác sĩ (auto-cache)
  const { data: aptRes, isLoading: loading } = useAppointmentsByDoctor(bacSiId);
  const appointments = Array.isArray(aptRes?.data) ? aptRes.data : [];

  // TanStack Query: Mutation cập nhật trạng thái (auto-invalidate)
  const statusMutation = useUpdateAppointmentStatus();

  /**
   * Xử lý lọc dữ liệu ngay tại Client
   */
  // Lấy chuỗi ngày hôm nay theo định dạng YYYY-MM-DD (múi giờ VN)
  const todayStr = toDateString(dayjs());

  // Lọc lấy các lịch hẹn của hôm nay
  const todayAppointments = appointments.filter((a) => {
    return toDateString(a.ngayDat) === todayStr;
  });

  /**
   * Tính toán các con số thống kê cho 4 Card ở đầu trang
   */
  const stats = [
    {
      label: "Lịch hôm nay",
      icon: "event_upcoming",
      value: todayAppointments.filter((a) => a.trangThai !== 3).length, // Không tính lịch đã hủy
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      label: "Đã khám xong",
      icon: "check_circle",
      value: todayAppointments.filter((a) => a.trangThai === 2).length,
      iconBg: "bg-green-500/10",
      iconColor: "text-green-600",
    },
    {
      label: "Chờ xác nhận",
      icon: "pending",
      value: todayAppointments.filter((a) => a.trangThai === 0).length,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
    },
    {
      label: "Tổng bệnh nhân",
      icon: "group",
      value: appointments.filter((a) => a.trangThai !== 3).length, // Tổng lịch (trừ hủy)
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-600",
    },
  ];

  const handleUpdateStatus = (id, newStatus) => {
    const labels = { 1: "Đã xác nhận", 2: "Đã hoàn thành", 3: "Đã hủy" };
    statusMutation.mutate(
      { id, trangThai: newStatus },
      {
        onSuccess: () => toast.success(labels[newStatus] || "Cập nhật thành công"),
        onError: (err) => toast.error(err.message || "Lỗi cập nhật trạng thái"),
      }
    );
  };

  /**
   * Render nhãn trạng thái (Badge) + ký hiệu đã kê đơn
   */
  const renderStatusBadge = (appointment) => {
    const { trangThai, donThuoc } = appointment;
    const config = STATUS_CONFIG[trangThai];
    if (!config) return null;
    return (
      <div className="flex flex-col items-start gap-1">
        <span
          className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase shadow-sm ${config.color}`}
        >
          {config.label}
        </span>
        {donThuoc && (
          <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-tighter">
            <span className="material-symbols-outlined text-[10px]">pill</span>
            Đã có đơn thuốc
          </span>
        )}
      </div>
    );
  };

  /**
   * Render các nút thao tác tùy theo trạng thái lịch
   */
  const renderActions = (appointment) => {
    const { id, trangThai } = appointment;
    return (
      <div className="flex items-center gap-2">
        {/* Nút Xác nhận cho lịch đang "Chờ" */}
        {trangThai === 0 && (
          <button
            onClick={() => handleUpdateStatus(id, 1)}
            className="group size-8 flex items-center justify-center bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
            title="Xác nhận lịch hẹn"
          >
            <span className="material-symbols-outlined text-lg font-bold">
              check
            </span>
          </button>
        )}
        {/* Nút Hoàn thành cho lịch "Đã xác nhận" */}
        {trangThai === 1 && (
          <button
            onClick={() => handleUpdateStatus(id, 2)}
            className="group size-8 flex items-center justify-center bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-all shadow-sm shadow-emerald-600/20"
            title="Đánh dấu hoàn thành"
          >
            <span className="material-symbols-outlined text-lg font-bold">
              verified
            </span>
          </button>
        )}

        {/* Link Thao tác chính: Kết quả hoặc Quản lý */}
        {trangThai === 2 ? (
          <Link
            to={`/doctor/appointments/${id}`}
            className="px-4 py-1.5 bg-primary/5 text-primary text-[10px] font-black uppercase rounded-lg border border-primary/20 hover:bg-primary hover:text-white transition-all tracking-wider"
          >
            Kết quả
          </Link>
        ) : (
          <Link
            to="/doctor/appointments"
            className="px-4 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded-lg border border-slate-200 hover:bg-slate-200 hover:text-slate-700 transition-all tracking-wider"
          >
            Quản lý
          </Link>
        )}
      </div>
    );
  };

  // Màn hình loading khi đang fetch dữ liệu
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined text-5xl text-primary animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Phần Thống kê nhanh (Stats Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {stats.map((card) => (
          <div
            key={card.label}
            className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-slate-200 flex items-center gap-3 sm:gap-4 transition-all hover:shadow-md"
          >
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 ${card.iconBg}`}
            >
              <span
                className={`material-symbols-outlined text-xl sm:text-2xl ${card.iconColor}`}
              >
                {card.icon}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-black text-slate-900">
                {card.value}
              </p>
              <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">
                {card.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Bảng Danh sách lịch khám hôm nay */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Lịch làm việc hôm nay
          </h2>
          <Link
            to="/doctor/appointments"
            className="text-sm text-primary font-bold hover:underline"
          >
            Xem toàn bộ
          </Link>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="px-5 py-20 text-center flex flex-col items-center">
            <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-4xl text-slate-300">
                event_busy
              </span>
            </div>
            <p className="text-slate-500 font-medium">
              Hôm nay bạn chưa có lịch khám nào.
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Lịch hẹn mới sẽ được hiển thị tại đây.
            </p>
          </div>
        ) : (
          <>
            {/* Chế độ hiển thị Mobile (Card dọc) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {todayAppointments.map((appt) => (
                <div key={appt.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                        {getInitials(appt.benhNhan?.hoTen)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {appt.benhNhan?.hoTen || "—"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {appt.benhNhan?.soDienThoai}
                        </p>
                      </div>
                    </div>
                    {renderStatusBadge(appt)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <span className="material-symbols-outlined text-sm text-primary">
                      schedule
                    </span>
                    Giờ khám:{" "}
                    <span className="font-bold">
                      {formatTime(appt.gioBatDau)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate italic">
                    Lý do: {appt.lyDoKham}
                  </p>
                  <div className="pt-1">{renderActions(appt)}</div>
                </div>
              ))}
            </div>

            {/* Chế độ hiển thị Desktop (Bảng ngang) */}
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/80">
                    <th className="px-6 py-4 text-left text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                      Giờ khám
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                      Bệnh nhân
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                      Số điện thoại
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                      Lý do khám
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 italic md:not-italic">
                  {todayAppointments.map((appt) => (
                    <tr
                      key={appt.id}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      <td className="px-6 py-4 text-sm text-primary font-bold whitespace-nowrap">
                        {formatTime(appt.gioBatDau)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            {getInitials(appt.benhNhan?.hoTen)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              {appt.benhNhan?.hoTen || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium whitespace-nowrap">
                        {appt.benhNhan?.soDienThoai || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate italic">
                        {appt.lyDoKham || "—"}
                      </td>
                      <td className="px-6 py-4">
                        {renderStatusBadge(appt.trangThai)}
                      </td>
                      <td className="px-6 py-4">{renderActions(appt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Footer bảng */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-tighter">
            Hôm nay bạn có {todayAppointments.length} ca trực cần xử lý
          </p>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboardPage;
