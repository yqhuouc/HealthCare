/**
 * ============================================================
 * TRANG: Quản lý lịch khám (Admin)
 * Đường dẫn: /admin/appointments
 * ============================================================
 *
 * Chức năng:
 * - 4 card thống kê: tổng lịch khám, chờ xác nhận, đã khám, đã hủy
 * - Bộ lọc: trạng thái (pill buttons), khoảng ngày (date range), nút "Lọc"
 * - Bảng lịch khám: mã LK, BN (avatar initials), BS, ngày giờ, trạng thái, link chi tiết
 * - Phân trang
 * - Responsive: mobile card view, desktop table view
 *
 * State:
 * - statusFilter: trạng thái đang lọc ("all" hoặc cụ thể)
 * - currentPage: trang hiện tại
 *
 * Dữ liệu: ADMIN_APPOINTMENT_LIST, APPOINTMENT_STATUS_CONFIG từ mockAdminData.js
 * ============================================================
 */
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { APPOINTMENT_STATUS_CONFIG } from "../../data/mockAdminData";
import { appointmentService } from "../../services/appointmentService";
import { getInitials } from "../../utils/formatters";

// Mapping from numeric status in DB to string keys in APPOINTMENT_STATUS_CONFIG
const STATUS_MAP = {
  0: "pending",
  1: "confirmed",
  2: "completed",
  3: "cancelled",
};

const STATUS_FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: "0", label: "Chờ xác nhận" },
  { value: "1", label: "Đã xác nhận" },
  { value: "2", label: "Đã khám" },
  { value: "3", label: "Đã hủy" },
];

const ITEMS_PER_PAGE = 5;

function AdminAppointmentsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAppointments, setTotalAppointments] = useState(0);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        ...(statusFilter !== "all" && { trangThai: statusFilter }),
        ...(dateFrom && { ngayDat: dateFrom }),
      };
      const res = await appointmentService.getAllForAdmin(params);
      if (res.success) {
        setAppointments(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalAppointments(res.pagination?.total || 0);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi lấy danh sách lịch hẹn");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, dateFrom]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleFilter = () => {
    setPage(1);
    fetchAppointments();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Tổng lịch đang hiện thị</p>
          <p className={`text-2xl font-bold mt-1 text-slate-800`}>{totalAppointments}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === f.value ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Từ ngày</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Đến ngày</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <button onClick={handleFilter} className="mt-6 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
              Lọc
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Mã lịch</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Bệnh nhân</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Bác sĩ</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Ngày/Giờ khám</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Trạng thái</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10">
                    <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-500">
                    Không tìm thấy lịch hẹn phù hợp.
                  </td>
                </tr>
              ) : appointments.map((apt) => {
                const statusString = STATUS_MAP[apt.trangThai] || "pending";
                const config = APPOINTMENT_STATUS_CONFIG[statusString];
                const patientName = apt.benhNhan?.hoTen || "Chưa xác định";
                const doctorName = typeof apt.bacSi === "object" ? apt.bacSi?.tenBacSi : "Chưa xác định";
                const formattedDate = new Date(apt.ngayDat).toLocaleDateString("vi-VN");
                const timeString = apt.gioBatDau ? new Date(apt.gioBatDau).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "";
                
                return (
                  <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-800">LK-{apt.id}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`size-9 rounded-full flex items-center justify-center text-xs font-bold bg-primary/10 text-primary`}>
                          {getInitials(patientName)}
                        </div>
                        <span className="font-medium text-slate-800">{patientName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{doctorName}</td>
                    <td className="px-5 py-4 text-slate-600">{timeString} - {formattedDate}</td>
                    <td className="px-5 py-4">
                      {config && (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
                          {config.label}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Link to={`/admin/appointments/${apt.id}`} className="text-primary font-medium hover:underline text-sm">
                        Xem chi tiết
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="block md:hidden divide-y divide-slate-100">
          {appointments.map((apt) => {
            const statusString = STATUS_MAP[apt.trangThai] || "pending";
            const config = APPOINTMENT_STATUS_CONFIG[statusString];
            const patientName = apt.benhNhan?.hoTen || "Chưa xác định";
            const doctorName = typeof apt.bacSi === "object" ? apt.bacSi?.tenBacSi : "Chưa xác định";
            const formattedDate = new Date(apt.ngayDat).toLocaleDateString("vi-VN");
            const timeString = apt.gioBatDau ? new Date(apt.gioBatDau).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "";
            
            return (
              <div key={apt.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`size-9 rounded-full flex items-center justify-center text-xs font-bold bg-primary/10 text-primary`}>
                      {getInitials(patientName)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{patientName}</p>
                      <p className="text-xs text-slate-500">LK-{apt.id}</p>
                    </div>
                  </div>
                  {config && (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${config.className}`}>
                      {config.label}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">{doctorName}</p>
                <p className="text-xs text-slate-500">{timeString} - {formattedDate}</p>
                <Link to={`/admin/appointments/${apt.id}`} className="inline-block text-primary font-medium text-sm hover:underline">
                  Xem chi tiết
                </Link>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Trang {page} / {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="size-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="size-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAppointmentsPage;
