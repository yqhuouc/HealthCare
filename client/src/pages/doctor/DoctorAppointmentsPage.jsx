/**
 * ============================================================
 * TRANG: Quản lý chi tiết lịch khám (Bác sĩ)
 * Đường dẫn: /doctor/appointments
 * ============================================================
 * 
 * Chức năng chính:
 * 1. Danh sách toàn bộ lịch khám của bác sĩ (có phân trang/lọc).
 * 2. Bộ lọc thông minh: 
 *    - Theo ngày: Hôm nay, Ngày mai, hoặc chọn ngày bất kỳ từ Calendar.
 *    - Theo từ khóa: Tìm theo tên bệnh nhân hoặc Mã BN (BN-XXX).
 *    - Theo trạng thái: Chờ xác nhận, Đã xác nhận, Hoàn thành, Đã hủy.
 * 3. Thao tác trạng thái: Xác nhận, Từ chối, Hoàn thành, Hủy, Khôi phục.
 * 4. Thống kê nhanh số lượng lịch theo từng trạng thái ở cuối trang.
 * 
 * Biến state: appointments (data gốc), filtered (data sau lọc), loading, activeDate...
 * ============================================================
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { appointmentService } from "../../services/appointmentService";
import useAuthStore from "../../stores/useAuthStore";
import { toast } from "react-toastify";

/** 
 * Cấu hình Badge cho các trạng thái lịch hẹn
 */
const STATUS_BADGE = {
  0: { label: "Đang chờ", className: "bg-amber-100 text-amber-600 border border-amber-200" },
  1: { label: "Đã xác nhận", className: "bg-blue-100 text-blue-600 border border-blue-200" },
  2: { label: "Hoàn thành", className: "bg-emerald-100 text-emerald-600 border border-emerald-200" },
  3: { label: "Đã hủy", className: "bg-rose-100 text-rose-600 border border-rose-200" },
};

/** 
 * Danh sách các tab lọc trạng thái
 */
const STATUS_FILTERS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: 0, label: "Đang chờ" },
  { value: 1, label: "Đã xác nhận" },
  { value: 2, label: "Hoàn thành" },
  { value: 3, label: "Đã hủy" },
];

/** 
 * Hàm format giờ (HH:mm) đảm bảo tính nhất quán múi giờ VN
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
 * Xử lý đường dẫn Avatar bệnh nhân
 */
function getPatientAvatar(anhDaiDien) {
  if (!anhDaiDien) return null;
  if (anhDaiDien.startsWith("http")) return anhDaiDien;
  return `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${anhDaiDien}`;
}

function DoctorAppointmentsPage() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Quản lý bộ lọc
  const [activeDate, setActiveDate] = useState("today"); // today, tomorrow, custom
  const [dateInput, setDateInput] = useState("");        // Giá trị khi chọn date picker
  const [searchQuery, setSearchQuery] = useState("");    // Ô tìm kiếm tên/mã BN
  const [statusFilter, setStatusFilter] = useState("all");

  const bacSiId = user?.bacSi?.id;

  /**
   * Lấy dữ liệu từ API khi vào trang hoặc khi bacSiId thay đổi
   */
  useEffect(() => {
    if (!bacSiId) return;
    const fetchData = async () => {
      try {
        const res = await appointmentService.getByBacSi(bacSiId);
        setAppointments(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Không thể tải danh sách lịch khám");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [bacSiId]);

  /** 
   * Xử lý ngày tháng để lọc
   */
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
  const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_MinH" });

  // Xác định ngày đang được chọn dựa trên tab active
  const selectedDate =
    activeDate === "today" ? today :
    activeDate === "tomorrow" ? tomorrow :
    dateInput;

  /** 
   * Filter chính: Kết hợp Ngày + Trạng thái + Tìm kiếm
   */
  const filtered = appointments.filter((apt) => {
    // 1. Lọc theo ngày
    const aptDate = new Date(apt.ngayDat).toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
    const matchDate = !selectedDate || aptDate === selectedDate;

    // 2. Lọc theo trạng thái
    const matchStatus = statusFilter === "all" || apt.trangThai === statusFilter;

    // 3. Lọc theo tên hoặc Mã BN
    const q = searchQuery.trim().toLowerCase();
    const patientId = apt.benhNhan?.id || apt.benhNhanId || apt.id;
    const matchSearch = !q ||
      (apt.benhNhan?.hoTen || "").toLowerCase().includes(q) ||
      `BN-${String(patientId).padStart(3, "0")}`.toLowerCase().includes(q);

    return matchDate && matchStatus && matchSearch;
  });

  /** 
   * Tính toán chỉ số cho các thẻ thống kê
   */
  const stats = {
    total: filtered.length,
    pending: filtered.filter((a) => a.trangThai === 0).length,
    completed: filtered.filter((a) => a.trangThai === 2).length,
    cancelled: filtered.filter((a) => a.trangThai === 3).length,
  };

  /** 
   * Hàm cập nhật trạng thái lịch khám
   */
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await appointmentService.updateTrangThai(id, newStatus);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, trangThai: newStatus } : a))
      );
      const labels = { 0: "Đã khôi phục", 1: "Đã xác nhận", 2: "Đã hoàn thành", 3: "Đã hủy" };
      toast.success(labels[newStatus] || "Cập nhật thành công");
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi cập nhật trạng thái");
    }
  };

  // UI Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Lịch khám bệnh nhân</h1>
          <p className="text-slate-500 text-sm font-medium">Quản lý và cập nhật tiến độ khám chữa bệnh</p>
        </div>
      </div>

      {/* THANH BỘ LỌC (Filters Bar) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-primary/5">
        <div className="flex flex-wrap items-center gap-3">
          {/* Lọc theo ngày nhanh */}
          <button
            onClick={() => { setActiveDate("today"); setDateInput(""); }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeDate === "today" ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Hôm nay
          </button>
          <button
            onClick={() => { setActiveDate("tomorrow"); setDateInput(""); }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeDate === "tomorrow" ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Ngày mai
          </button>

          {/* Chọn ngày cụ thể */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              calendar_today
            </span>
            <input
              type="date"
              value={dateInput}
              onChange={(e) => { setDateInput(e.target.value); setActiveDate("custom"); }}
              className="pl-10 pr-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          {/* Ô tìm kiếm thông minh */}
          <div className="relative flex-1 min-w-[240px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input
              type="text"
              placeholder="Tìm tên hoặc Mã BN (BN-XXX)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          {/* Tab trạng thái */}
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={String(f.value)}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  statusFilter === f.value
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DANH SÁCH LỊCH HẸN */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Chế độ Mobile: Card Layout */}
        <div className="block md:hidden">
          {filtered.length > 0 ? (
            <div className="divide-y divide-slate-100 italic">
              {filtered.map((apt) => {
                const badge = STATUS_BADGE[apt.trangThai] || STATUS_BADGE[0];
                const patientId = apt.benhNhan?.id || apt.benhNhanId || apt.id;
                const code = `BN-${String(patientId).padStart(3, "0")}`;
                return (
                  <div key={apt.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={getPatientAvatar(apt.benhNhan?.taiKhoan?.anhDaiDien) || `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.benhNhan?.hoTen || "BN")}&size=128&background=f1f5f9&color=64748b`}
                          alt={apt.benhNhan?.hoTen}
                          className="size-10 rounded-full object-cover shrink-0 border-2 border-white shadow-sm"
                          onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.benhNhan?.hoTen || "BN")}&size=128&background=f1f5f9&color=64748b`; }}
                        />
                        <div>
                          <p className="font-bold text-slate-800 leading-tight">{apt.benhNhan?.hoTen || "—"}</p>
                          <p className="text-[10px] font-black text-primary mt-0.5 tracking-widest">{code}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                        {formatTime(apt.gioBatDau)}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-slate-400">call</span>
                        {apt.benhNhan?.soDienThoai}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 italic font-normal">Lý do: {apt.lyDoKham}</p>
                    
                    {/* Các nút thao tác Mobile */}
                    <div className="flex items-center gap-2 pt-1">
                      {apt.trangThai === 0 && (
                        <>
                          <button onClick={() => handleUpdateStatus(apt.id, 1)} className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100">Xác nhận</button>
                          <button onClick={() => handleUpdateStatus(apt.id, 3)} className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-rose-500 bg-rose-50 border border-rose-100">Từ chối</button>
                        </>
                      )}
                      {apt.trangThai === 1 && (
                        <>
                          <button onClick={() => handleUpdateStatus(apt.id, 2)} className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100">Hoàn thành</button>
                          <button onClick={() => handleUpdateStatus(apt.id, 3)} className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-rose-500 bg-rose-50 border border-rose-100">Hủy</button>
                        </>
                      )}
                      {apt.trangThai === 2 && (
                        <Link to={`/doctor/appointments/${apt.id}`} className="flex-1 text-center py-1.5 rounded-lg text-[11px] font-bold text-primary bg-primary/5 border border-primary/10">Xem chi tiết</Link>
                      )}
                      {apt.trangThai === 3 && (
                        <button onClick={() => handleUpdateStatus(apt.id, 0)} className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200">Khôi phục</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-5 py-20 text-center flex flex-col items-center">
              <span className="material-symbols-outlined text-5xl text-slate-200 mb-3 block">search_off</span>
              <p className="text-slate-500 font-bold">Không tìm thấy lịch khám nào</p>
              <p className="text-slate-400 text-xs mt-1">Hãy thử điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm.</p>
            </div>
          )}
        </div>

        {/* Chế độ Desktop: Table Layout */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="text-left px-5 py-4 font-black text-[11px] uppercase tracking-widest text-slate-400">Giờ khám</th>
                <th className="text-left px-5 py-4 font-black text-[11px] uppercase tracking-widest text-slate-400">Bệnh nhân</th>
                <th className="text-left px-5 py-4 font-black text-[11px] uppercase tracking-widest text-slate-400">Số điện thoại</th>
                <th className="text-left px-5 py-4 font-black text-[11px] uppercase tracking-widest text-slate-400">Lý do khám</th>
                <th className="text-left px-5 py-4 font-black text-[11px] uppercase tracking-widest text-slate-400">Trạng thái</th>
                <th className="text-center px-5 py-4 font-black text-[11px] uppercase tracking-widest text-slate-400">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((apt) => {
                  const badge = STATUS_BADGE[apt.trangThai] || STATUS_BADGE[0];
                  const patientId = apt.benhNhan?.id || apt.benhNhanId || apt.id;
                  const code = `BN-${String(patientId).padStart(3, "0")}`;
                  return (
                    <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-lg">schedule</span>
                          <span className="font-bold text-slate-800">{formatTime(apt.gioBatDau)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getPatientAvatar(apt.benhNhan?.taiKhoan?.anhDaiDien) || `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.benhNhan?.hoTen || "BN")}&size=128&background=f1f5f9&color=64748b`}
                            alt={apt.benhNhan?.hoTen}
                            className="size-9 rounded-full object-cover shrink-0 border border-slate-100"
                            onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.benhNhan?.hoTen || "BN")}&size=128&background=f1f5f9&color=64748b`; }}
                          />
                          <div>
                            <p className="font-bold text-slate-800 leading-tight">{apt.benhNhan?.hoTen || "—"}</p>
                            <p className="text-[10px] font-black text-primary/70 mt-0.5 tracking-widest uppercase">{code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-medium">{apt.benhNhan?.soDienThoai || "—"}</td>
                      <td className="px-5 py-4 text-slate-500 max-w-[200px] truncate italic">{apt.lyDoKham || "—"}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${badge.className}`}>
                            {badge.label}
                          </span>
                          {apt.donThuoc && (
                            <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-tighter shadow-sm">
                              <span className="material-symbols-outlined text-[10px]">pill</span>
                              Đã kê đơn
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Case: Đang chờ (0) */}
                          {apt.trangThai === 0 && (
                            <>
                              <button onClick={() => handleUpdateStatus(apt.id, 1)} title="Xác nhận lịch"
                                className="size-8 rounded-lg flex items-center justify-center text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all">
                                <span className="material-symbols-outlined text-lg font-bold">check</span>
                              </button>
                              <button onClick={() => handleUpdateStatus(apt.id, 3)} title="Từ chối lịch"
                                className="size-8 rounded-lg flex items-center justify-center text-rose-500 bg-rose-50 hover:bg-rose-100 transition-all">
                                <span className="material-symbols-outlined text-lg font-bold">close</span>
                              </button>
                            </>
                          )}
                          {/* Case: Đã xác nhận (1) */}
                          {apt.trangThai === 1 && (
                            <>
                              <button onClick={() => handleUpdateStatus(apt.id, 2)} title="Đánh dấu hoàn thành"
                                className="size-8 rounded-lg flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all">
                                <span className="material-symbols-outlined text-lg font-bold">verified</span>
                              </button>
                              <button onClick={() => handleUpdateStatus(apt.id, 3)} title="Hủy lịch"
                                className="size-8 rounded-lg flex items-center justify-center text-rose-500 bg-rose-50 hover:bg-rose-100 transition-all">
                                <span className="material-symbols-outlined text-lg font-bold">close</span>
                              </button>
                            </>
                          )}
                          {/* Case: Hoàn thành (2) */}
                          {apt.trangThai === 2 && (
                            <Link to={`/doctor/appointments/${apt.id}`}
                              className="px-4 py-1.5 rounded-lg text-[11px] font-black uppercase bg-primary/5 text-primary hover:bg-primary/10 transition-all border border-primary/20">
                              Kết quả
                            </Link>
                          )}
                          {/* Case: Đã hủy (3) */}
                          {apt.trangThai === 3 && (
                            <button onClick={() => handleUpdateStatus(apt.id, 0)}
                              className="px-3 py-1.5 rounded-lg text-[11px] font-black uppercase bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all">
                              Khôi phục
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-20 text-center font-bold text-slate-400 italic">
                    Không có lịch khám nào trong danh sách hiện tại.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CÁC THẺ THỐNG KÊ (Statistics Widgets) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-primary/10 flex items-center justify-between transition-all hover:scale-[1.02]">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng lượt khám</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{stats.total}</p>
          </div>
          <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-2xl">calendar_today</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-amber-200 flex items-center justify-between transition-all hover:scale-[1.02]">
          <div>
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Đang chờ</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{stats.pending}</p>
          </div>
          <div className="size-12 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
            <span className="material-symbols-outlined text-amber-600 text-2xl">hourglass_empty</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-emerald-200 flex items-center justify-between transition-all hover:scale-[1.02]">
          <div>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Hoàn thành</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{stats.completed}</p>
          </div>
          <div className="size-12 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
            <span className="material-symbols-outlined text-emerald-600 text-2xl">task_alt</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-rose-200 flex items-center justify-between transition-all hover:scale-[1.02]">
          <div>
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Đã hủy bỏ</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{stats.cancelled}</p>
          </div>
          <div className="size-12 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100">
            <span className="material-symbols-outlined text-rose-600 text-2xl">cancel</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorAppointmentsPage;

