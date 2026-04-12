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
 * Dữ liệu: APPOINTMENT_STATUS_CONFIG từ appointmentConstants.js
 * ============================================================
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { APPOINTMENT_STATUS_CONFIG } from "../../data/appointmentConstants";
import { useAppointments, useUpdateAppointmentStatus, useDeleteAppointment } from "../../hooks/queries/useAppointmentQueries";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ConfirmModal from "../../components/ui/ConfirmModal";

// Chuyển đổi mã trạng thái số từ Database sang key chuỗi dùng cho config UI
const STATUS_MAP = {
  0: "pending", // Chờ xác nhận
  1: "confirmed", // Đã xác nhận
  2: "completed", // Đã khám xong
  3: "cancelled", // Đã hủy
};

// Danh sách các bộ lọc trạng thái để hiển thị các nút Pill
const STATUS_FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: "0", label: "Chờ xác nhận" },
  { value: "1", label: "Đã xác nhận" },
  { value: "2", label: "Đã khám" },
  { value: "3", label: "Đã hủy" },
];

const ITEMS_PER_PAGE = 5; // Số bản ghi hiển thị trên mỗi trang

/**
 * Component AdminAppointmentsPage - Hiển thị danh sách và quản lý các lịch hẹn khám
 */
function AdminAppointmentsPage() {
  // State quản lý bộ lọc và phân trang
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // State quản lý xóa lịch hẹn
  const [selectedApt, setSelectedApt] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Debounce tìm kiếm
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // TanStack Query: Lấy danh sách lịch hẹn (auto-cache, auto-refetch theo filters)
  const queryParams = {
    page,
    limit: ITEMS_PER_PAGE,
    search: debouncedSearch,
    ...(statusFilter !== "all" && { trangThai: statusFilter }),
    ...(dateFrom && { ngayDat: dateFrom }),
  };
  const { data: aptRes, isLoading: loading } = useAppointments(queryParams);
  const appointments = aptRes?.data || [];
  const totalPages = aptRes?.pagination?.totalPages || 1;
  const totalAppointments = aptRes?.pagination?.total || 0;

  // TanStack Query: Mutation cập nhật trạng thái (auto-invalidate)
  const statusMutation = useUpdateAppointmentStatus();
  const deleteMutation = useDeleteAppointment();

  /**
   * Mở modal xác nhận trước khi xóa
   */
  const openDeleteModal = (apt) => {
    setSelectedApt(apt);
    setIsDeleteModalOpen(true);
  };

  /**
   * Thực hiện hành động xóa lịch hẹn
   */
  const handleDelete = () => {
    if (!selectedApt) return;
    deleteMutation.mutate(selectedApt.id, {
      onSuccess: () => {
        toast.success(`Đã xóa thành công lịch LK${selectedApt.id}`);
        setIsDeleteModalOpen(false);
        setSelectedApt(null);
      },
      onError: (err) => {
        toast.error(err.message || "Lỗi khi xóa lịch hẹn");
      },
    });
  };

  /**
   * Xử lý cập nhật nhanh trạng thái của một lịch hẹn
   */
  const handleUpdateStatus = (id, newStatus) => {
    const labels = {
      0: "Đã hoàn tác (về chờ)",
      1: "Đã xác nhận lịch",
      2: "Đã hoàn thành khám",
      3: "Đã hủy lịch",
    };
    statusMutation.mutate(
      { id, trangThai: newStatus },
      {
        onSuccess: () => toast.success(labels[newStatus] || "Cập nhật thành công"),
        onError: (err) => toast.error(err.message || "Lỗi cập nhật trạng thái"),
      },
    );
  };

  /**
   * Kích hoạt lọc theo ngày
   */
  const handleFilter = () => {
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Khối thống kê đơn giản */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Tổng lịch đang hiện thị</p>
          <p className={`text-2xl font-bold mt-1 text-slate-800`}>{totalAppointments}</p>
        </div>
      </div>

      {/* Khu vực Bộ lọc và Tìm kiếm */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 space-y-4">
        {/* Thanh tìm kiếm đa năng */}
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo Mã lịch (VD: LK25), tên bác sĩ hoặc tên bệnh nhân..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-sm font-medium"
          />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          {/* Nhóm Filter bên trái: Các nút chuyển đổi trạng thái */}
          <div className="space-y-4 flex-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
              Bộ lọc trạng thái
            </p>
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    statusFilter === f.value
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                      : "bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:text-slate-700 shadow-sm"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nhóm Filter Ngày bên phải: Chọn khoảng thời gian đặt lịch */}
          <div className="flex flex-wrap items-end gap-3 lg:border-l lg:border-slate-100 lg:pl-6">
            <div className="flex-1 min-w-[140px]">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                Từ ngày
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  calendar_today
                </span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm"
                />
              </div>
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                Đến ngày
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  event
                </span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm"
                />
              </div>
            </div>
            <button
              onClick={handleFilter}
              className="h-[42px] px-6 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
              Lọc
            </button>
          </div>
        </div>
      </div>

      {/* HIỂN THỊ DANH SÁCH LỊCH HẸN */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Chế độ bảng (Table View) - Cho màn hình Máy tính (Desktop) */}
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
                    <LoadingSpinner size="size-10" />
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-500">
                    Không tìm thấy lịch hẹn phù hợp.
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => {
                  const statusString = STATUS_MAP[apt.trangThai] || "pending";
                  const config = APPOINTMENT_STATUS_CONFIG[statusString];
                  const patientName = apt.benhNhan?.hoTen || "Chưa xác định";
                  const doctorName = typeof apt.bacSi === "object" ? apt.bacSi?.tenBacSi : "Chưa xác định";
                  const formattedDate = new Date(apt.ngayDat).toLocaleDateString("vi-VN");
                  const timeString = apt.gioBatDau
                    ? new Date(apt.gioBatDau).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "";

                  return (
                    <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 font-medium text-slate-800">LK{apt.id}</td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-900">{patientName}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{doctorName}</td>
                      <td className="px-5 py-4 text-slate-600">
                        {timeString} - {formattedDate}
                      </td>
                      <td className="px-5 py-4">
                        {config && (
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}
                          >
                            {config.label}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 flex items-center gap-2">
                        <Link
                          to={`/admin/appointments/${apt.id}`}
                          className="text-primary font-medium hover:underline text-sm"
                        >
                          Xem chi tiết
                        </Link>
                        {/* Các nút xử lý nhanh dựa trên trạng thái hiện tại */}
                        {apt.trangThai === 0 && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(apt.id, 1)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-100"
                              title="Xác nhận"
                            >
                              <span className="material-symbols-outlined text-sm">check</span>
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(apt.id, 3)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-100"
                              title="Hủy lịch"
                            >
                              <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                          </>
                        )}
                        {apt.trangThai === 1 && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(apt.id, 2)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-100"
                              title="Hoàn tất khám"
                            >
                              <span className="material-symbols-outlined text-sm">task_alt</span>
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(apt.id, 0)}
                              className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                              title="Hoàn tác về chờ"
                            >
                              <span className="material-symbols-outlined text-sm">undo</span>
                            </button>
                          </>
                        )}
                        {apt.trangThai === 2 && (
                          <button
                            onClick={() => handleUpdateStatus(apt.id, 1)}
                            className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                            title="Hoàn tác khám (về xác nhận)"
                          >
                            <span className="material-symbols-outlined text-sm">undo</span>
                          </button>
                        )}
                          {apt.trangThai === 3 && (
                            <button
                              onClick={() => handleUpdateStatus(apt.id, 1)}
                              className="p-1.5 text-primary hover:bg-primary/5 rounded-lg transition-colors border border-primary/10"
                              title="Khôi phục lịch"
                            >
                              <span className="material-symbols-outlined text-sm">history</span>
                            </button>
                          )}

                          {/* Nút Xóa vĩnh viễn (Admin luôn có quyền) */}
                          <button
                            onClick={() => openDeleteModal(apt)}
                            className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                            title="Xóa vĩnh viễn"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </td>
                      </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Chế độ danh sách (Card View) - Cho màn hình Điện thoại (Mobile) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {appointments.map((apt) => {
            const statusString = STATUS_MAP[apt.trangThai] || "pending";
            const config = APPOINTMENT_STATUS_CONFIG[statusString];
            const patientName = apt.benhNhan?.hoTen || "Chưa xác định";
            const doctorName = typeof apt.bacSi === "object" ? apt.bacSi?.tenBacSi : "Chưa xác định";
            const formattedDate = new Date(apt.ngayDat).toLocaleDateString("vi-VN");
            const timeString = apt.gioBatDau
              ? new Date(apt.gioBatDau).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";

            return (
              <div key={apt.id} className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-black text-slate-900 leading-none">{patientName}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">LK{apt.id}</span>
                      <span className="text-[10px] text-slate-300">•</span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {timeString} - {formattedDate}
                      </span>
                    </div>
                  </div>
                  {config && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${config.className}`}
                    >
                      {config.label}
                    </span>
                  )}
                </div>

                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-sm text-slate-400">person_filled</span>
                    <p className="text-xs font-bold text-slate-600">{doctorName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-slate-400">medical_services</span>
                    <p className="text-[11px] font-medium text-slate-500 italic truncate opacity-80">
                      "{apt.trieuChung || "—"}"
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/admin/appointments/${apt.id}`}
                    className="flex-1 text-center py-2.5 bg-white text-slate-500 text-[10px] font-black uppercase rounded-xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm tracking-widest"
                  >
                    Hồ sơ
                  </Link>
                  {apt.trangThai === 0 && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 1)}
                        className="flex-[1.5] py-2.5 bg-primary text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-primary/20 tracking-widest"
                      >
                        Duyệt
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 3)}
                        className="aspect-square flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl border border-rose-100"
                      >
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                    </>
                  )}
                  {apt.trangThai === 1 && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 2)}
                        className="flex-[1.5] py-2.5 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-emerald-200 tracking-widest"
                      >
                        Xong
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 0)}
                        className="aspect-square flex items-center justify-center bg-slate-100 text-slate-500 rounded-xl"
                      >
                        <span className="material-symbols-outlined text-lg font-bold">undo</span>
                      </button>
                    </>
                  )}
                  {apt.trangThai === 2 && (
                    <button
                      onClick={() => handleUpdateStatus(apt.id, 1)}
                      className="flex-1 py-2.5 bg-slate-100 text-slate-400 text-[10px] font-black uppercase rounded-xl tracking-widest hover:text-slate-600"
                    >
                      Hoàn tác xong
                    </button>
                  )}
                  {apt.trangThai === 3 && (
                    <button
                      onClick={() => handleUpdateStatus(apt.id, 1)}
                      className="flex-1 py-2.5 bg-primary/5 text-primary text-[10px] font-black uppercase rounded-xl border border-primary/10 tracking-widest"
                    >
                      Khôi phục
                    </button>
                  )}

                  {/* Nút xóa Mobile */}
                  <button
                    onClick={() => openDeleteModal(apt)}
                    className="aspect-square flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl border border-rose-100"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Thanh Phân trang (Pagination) */}
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

      {/* Modal xác nhận xóa */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isLoading}
        title="Xác nhận xóa lịch hẹn"
        message={
          <>
            Bạn có chắc chắn muốn xóa lịch hẹn <strong>LK{selectedApt?.id}</strong> của bệnh nhân{" "}
            <strong>{selectedApt?.benhNhan?.hoTen}</strong>? Hành động này sẽ xóa vĩnh viễn dữ liệu và không thể hoàn
            tác.
          </>
        }
        confirmLabel="Xóa vĩnh viễn"
        type="danger"
      />
    </div>
  );
}

export default AdminAppointmentsPage;
