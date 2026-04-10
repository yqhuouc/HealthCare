/**
 * =============================================================================
 * TRANG: QUẢN LÝ CHI TIẾT LỊCH KHÁM (DÀNH CHO BÁC SĨ)
 * Đường dẫn: /doctor/appointments
 * =============================================================================
 * 
 * CHỨC NĂNG CHÍNH:
 * 1. QUẢN LÝ DANH SÁCH: Hiển thị tất cả lịch hẹn mà bệnh nhân đã đặt với bác sĩ này.
 * 2. BỘ LỌC THÔNG MINH (3 Lớp):
 *    - Lọc theo Ngày: Có các nút nhanh (Hôm nay, Ngày mai) hoặc chọn ngày bất kỳ.
 *    - Lọc theo Trạng thái: Đang chờ, Đã xác nhận, Hoàn thành, Đã hủy.
 *    - Tìm kiếm: Tìm theo Tên bệnh nhân hoặc Mã định danh (Ví dụ: BN-001).
 * 3. THAO TÁC TRẠNG THÁI: Bác sĩ có thể Xác nhận, Từ chối, hoặc Đánh dấu Hoàn thành ca khám.
 * 4. THỐNG KÊ NHANH: Các thẻ ở cuối trang tổng kết số lượng ca theo từng loại.
 * =============================================================================
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAppointmentsByDoctor, useUpdateAppointmentStatus } from "../../hooks/queries/useAppointmentQueries";
import useAuthStore from "../../stores/useAuthStore";
import { toast } from "react-toastify";
import { formatTime, toDateString, dayjs } from "../../utils/dateUtils";

/** 
 * CẤU HÌNH NHÃN (BADGE): Định nghĩa màu sắc và nội dung cho từng trạng thái
 */
const STATUS_BADGE = {
  0: { label: "Đang chờ", className: "bg-amber-100 text-amber-600 border border-amber-200" },
  1: { label: "Đã xác nhận", className: "bg-blue-100 text-blue-600 border border-blue-200" },
  2: { label: "Hoàn thành", className: "bg-emerald-100 text-emerald-600 border border-emerald-200" },
  3: { label: "Đã hủy", className: "bg-rose-100 text-rose-600 border border-rose-200" },
};

/** 
 * DANH SÁCH CÁC TAB LỌC: Để người dùng bấm chọn nhanh trạng thái muốn xem
 */
const STATUS_FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: 0, label: "Đang chờ" },
  { value: 1, label: "Đã xác nhận" },
  { value: 2, label: "Hoàn thành" },
  { value: 3, label: "Đã hủy" },
];



/**
 * HÀM HỖ TRỢ: Xử lý đường dẫn ảnh đại diện của bệnh nhân
 * Nếu là ảnh Cloud thì dùng trực tiếp, nếu ảnh nội bộ thì nối thêm URL Backend.
 */
function getPatientAvatar(anhDaiDien) {
  if (!anhDaiDien) return null;
  if (anhDaiDien.startsWith("http")) return anhDaiDien;
  return `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${anhDaiDien}`;
}

function DoctorAppointmentsPage() {
  const { user } = useAuthStore();
  const bacSiId = user?.bacSi?.id;

  // TanStack Query: Lấy danh sách lịch hẹn (auto-cache)
  const { data: aptRes, isLoading: loading } = useAppointmentsByDoctor(bacSiId);
  const appointments = Array.isArray(aptRes?.data) ? aptRes.data : [];
  
  // TanStack Query: Mutation cập nhật trạng thái
  const statusMutation = useUpdateAppointmentStatus();
  
  // QUẢN LÝ BỘ LỌC (STATE)
  const [activeDate, setActiveDate] = useState("today");
  const [dateInput, setDateInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { today, tomorrow } = useMemo(() => {
    const now = dayjs();
    return {
      today: toDateString(now),
      tomorrow: toDateString(now.add(1, 'day')),
    };
  }, []);

  const selectedDate =
    activeDate === "today" ? today :
    activeDate === "tomorrow" ? tomorrow :
    dateInput;

  const filtered = appointments.filter((apt) => {
    const aptDate = toDateString(apt.ngayDat);
    const matchDate = !selectedDate || aptDate === selectedDate;
    const matchStatus = statusFilter === "all" || apt.trangThai === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const patientId = apt.benhNhan?.id || apt.benhNhanId || apt.id;
    const matchSearch = !q ||
      (apt.benhNhan?.hoTen || "").toLowerCase().includes(q) ||
      `BN-${String(patientId).padStart(3, "0")}`.toLowerCase().includes(q);
    return matchDate && matchStatus && matchSearch;
  });

  const stats = {
    total: filtered.length,
    pending: filtered.filter((a) => a.trangThai === 0).length,
    completed: filtered.filter((a) => a.trangThai === 2).length,
    cancelled: filtered.filter((a) => a.trangThai === 3).length,
  };

  const handleUpdateStatus = (id, newStatus) => {
    const labels = { 0: "Đã hoàn tác (về chờ)", 1: "Đã xác nhận lịch", 2: "Đã hoàn thành khám", 3: "Đã hủy lịch" };
    statusMutation.mutate(
      { id, trangThai: newStatus },
      {
        onSuccess: () => toast.success(labels[newStatus] || "Cập nhật thành công"),
        onError: (err) => toast.error(err.message || "Lỗi cập nhật trạng thái"),
      }
    );
  };

  // Trạng thái chờ tải dữ liệu
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* TIÊU ĐỀ TRANG */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Lịch khám bệnh nhân</h1>
          <p className="text-slate-500 text-sm font-medium">Quản lý danh sách và tiến độ khám chữa bệnh</p>
        </div>
      </div>

      {/* THANH BỘ LỌC (Control Bar) */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 italic md:not-italic">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Lọc nhanh theo Ngày */}
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
            <button
              onClick={() => { setActiveDate("today"); setDateInput(""); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
                activeDate === "today" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Hôm nay
            </button>
            <button
              onClick={() => { setActiveDate("tomorrow"); setDateInput(""); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
                activeDate === "tomorrow" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Ngày mai
            </button>
          </div>

          {/* Ô chọn ngày cụ thể */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">calendar_today</span>
            <input
              type="date"
              value={dateInput}
              onChange={(e) => { setDateInput(e.target.value); setActiveDate("custom"); }}
              className="pl-10 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 font-bold focus:ring-2 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all"
            />
          </div>

          <div className="h-8 w-px bg-slate-100 hidden sm:block" />

          {/* Ô Tìm kiếm theo tên/Mã BN */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input
              type="text"
              placeholder="Tìm tên hoặc Mã BN (BN-XXX)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all"
            />
          </div>

          <div className="h-8 w-px bg-slate-100 hidden sm:block" />

          {/* Cụm Tab bộ lọc Trạng thái */}
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={String(f.value)}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                  statusFilter === f.value
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                    : "bg-white text-slate-400 hover:text-slate-600 border-slate-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DANH SÁCH HIỂN THỊ */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* --- PHIÊN BẢN MOBILE: Dạng Card dọc --- */}
        <div className="block md:hidden">
          {filtered.length > 0 ? (
            <div className="divide-y divide-slate-50">
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
                          alt="Avatar"
                          className="size-10 rounded-full object-cover shrink-0 border-2 border-white shadow-sm"
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
                    <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                        {formatTime(apt.gioBatDau)}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <span className="material-symbols-outlined text-sm text-slate-400 font-normal">call</span>
                        {apt.benhNhan?.soDienThoai}
                      </span>
                    </div>
                    
                    {/* Các nút thao tác nhanh cho Mobile */}
                    <div className="flex items-center gap-2 pt-1">
                      {apt.trangThai === 0 && (
                        <>
                          <button onClick={() => handleUpdateStatus(apt.id, 1)} className="flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase text-blue-600 bg-blue-50 border border-blue-100">Xác nhận</button>
                          <button onClick={() => handleUpdateStatus(apt.id, 3)} className="flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase text-rose-500 bg-rose-50 border border-rose-100">Hủy</button>
                        </>
                      )}
                      {apt.trangThai === 1 && (
                        <>
                          <Link to={`/doctor/appointments/${apt.id}`} className="flex-1 text-center py-1.5 rounded-lg text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 border border-emerald-100">Khám bệnh</Link>
                          <button onClick={() => handleUpdateStatus(apt.id, 0)} className="flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase text-slate-500 bg-slate-50 border border-slate-100">Hoàn tác</button>
                        </>
                      )}
                      {apt.trangThai === 2 && (
                        <Link to={`/doctor/appointments/${apt.id}`} className="flex-1 text-center py-1.5 rounded-lg text-[10px] font-black uppercase text-primary bg-primary/5 border border-primary/10 tracking-widest">Xem hồ sơ</Link>
                      )}
                      {apt.trangThai === 3 && (
                        <button onClick={() => handleUpdateStatus(apt.id, 1)} className="flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase text-primary bg-primary/5 border border-primary/10">Khôi phục</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-5 py-20 text-center">
              <p className="text-slate-400 font-bold italic text-sm">Không tìm thấy lịch khám nào.</p>
            </div>
          )}
        </div>

        {/* --- PHIÊN BẢN DESKTOP: Dạng Bảng ngang --- */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="text-left px-6 py-4 font-black text-[10px] uppercase tracking-widest text-slate-400">Giờ khám</th>
                <th className="text-left px-6 py-4 font-black text-[10px] uppercase tracking-widest text-slate-400">Bệnh nhân</th>
                <th className="text-left px-6 py-4 font-black text-[10px] uppercase tracking-widest text-slate-400">Số điện thoại</th>
                <th className="text-left px-6 py-4 font-black text-[10px] uppercase tracking-widest text-slate-400">Lý do khám</th>
                <th className="text-left px-6 py-4 font-black text-[10px] uppercase tracking-widest text-slate-400">Trạng thái</th>
                <th className="text-center px-6 py-4 font-black text-[10px] uppercase tracking-widest text-slate-400">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 italic md:not-italic">
              {filtered.length > 0 ? (
                filtered.map((apt) => {
                  const badge = STATUS_BADGE[apt.trangThai] || STATUS_BADGE[0];
                  const patientId = apt.benhNhan?.id || apt.benhNhanId || apt.id;
                  const code = `BN-${String(patientId).padStart(3, "0")}`;
                  return (
                    <tr key={apt.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-6 py-4 font-bold text-primary">
                        {formatTime(apt.gioBatDau)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getPatientAvatar(apt.benhNhan?.taiKhoan?.anhDaiDien) || `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.benhNhan?.hoTen || "BN")}&size=128&background=f1f5f9&color=64748b`}
                            alt="Avatar"
                            className="size-9 rounded-full object-cover shrink-0 border border-slate-100"
                          />
                          <div>
                            <p className="font-bold text-slate-800 leading-tight">{apt.benhNhan?.hoTen || "—"}</p>
                            <p className="text-[9px] font-black text-primary/70 mt-0.5 tracking-widest uppercase">{code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium font-mono">{apt.benhNhan?.soDienThoai || "—"}</td>
                      <td className="px-6 py-4 text-slate-400 max-w-[200px] truncate italic text-xs">{apt.lyDoKham || "—"}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${badge.className}`}>
                            {badge.label}
                          </span>
                          {apt.donThuoc && (
                            <span className="flex items-center gap-1 text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-tighter">
                              <span className="material-symbols-outlined text-[10px]">pill</span>
                              Đã kê đơn
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Case: Đang chờ xác nhận */}
                          {apt.trangThai === 0 && (
                            <>
                              <button onClick={() => handleUpdateStatus(apt.id, 1)} title="Xác nhận lịch"
                                className="size-8 rounded-lg flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-all">
                                <span className="material-symbols-outlined text-lg font-bold">check_circle</span>
                              </button>
                              <button onClick={() => handleUpdateStatus(apt.id, 3)} title="Hủy lịch"
                                className="size-8 rounded-lg flex items-center justify-center text-rose-400 hover:bg-rose-50 transition-all">
                                <span className="material-symbols-outlined text-lg font-bold">cancel</span>
                              </button>
                            </>
                          )}
                          {/* Case: Đã xác nhận - Chờ khám */}
                          {apt.trangThai === 1 && (
                            <>
                              <Link to={`/doctor/appointments/${apt.id}`} title="Bắt đầu khám bệnh"
                                className="size-8 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-all">
                                <span className="material-symbols-outlined text-lg font-bold">medical_services</span>
                              </Link>
                              <button onClick={() => handleUpdateStatus(apt.id, 0)} title="Hoàn tác về chờ"
                                className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all">
                                <span className="material-symbols-outlined text-lg font-bold">undo</span>
                              </button>
                              <button onClick={() => handleUpdateStatus(apt.id, 3)} title="Hủy lịch"
                                className="size-8 rounded-lg flex items-center justify-center text-rose-400 hover:bg-rose-50 transition-all">
                                <span className="material-symbols-outlined text-lg font-bold">cancel</span>
                              </button>
                            </>
                          )}
                          {/* Case: Đã khám xong */}
                          {apt.trangThai === 2 && (
                            <Link to={`/doctor/appointments/${apt.id}`}
                              className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase bg-primary/5 text-primary hover:bg-primary/10 transition-all border border-primary/10 tracking-widest">
                              Xem hồ sơ
                            </Link>
                          )}
                          {/* Case: Đã hủy lịch */}
                          {apt.trangThai === 3 && (
                            <button onClick={() => handleUpdateStatus(apt.id, 1)} title="Khôi phục lịch"
                              className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase bg-slate-50 text-primary hover:bg-primary/5 transition-all border border-slate-200">
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
                  <td colSpan={6} className="px-6 py-20 text-center font-bold text-slate-300 italic">
                    Không có lịch khám nào trong danh sách.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CÁC THẺ THỐNG KÊ (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-50 flex items-center justify-between transition-all hover:scale-[1.02]">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Tổng kết quả lọc</p>
            <p className="text-2xl font-black text-slate-800 mt-2">{stats.total}</p>
          </div>
          <div className="size-11 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
            <span className="material-symbols-outlined text-primary text-xl">list_alt</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-50 flex items-center justify-between transition-all hover:scale-[1.02]">
          <div>
            <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest leading-none">Đang chờ xử lý</p>
            <p className="text-2xl font-black text-slate-800 mt-2">{stats.pending}</p>
          </div>
          <div className="size-11 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
            <span className="material-symbols-outlined text-amber-600 text-xl">hourglass_empty</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-50 flex items-center justify-between transition-all hover:scale-[1.02]">
          <div>
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none">Đã hoàn thành</p>
            <p className="text-2xl font-black text-slate-800 mt-2">{stats.completed}</p>
          </div>
          <div className="size-11 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
            <span className="material-symbols-outlined text-emerald-600 text-xl">task_alt</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-50 flex items-center justify-between transition-all hover:scale-[1.02]">
          <div>
            <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest leading-none">Số ca đã hủy</p>
            <p className="text-2xl font-black text-slate-800 mt-2">{stats.cancelled}</p>
          </div>
          <div className="size-11 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100">
            <span className="material-symbols-outlined text-rose-600 text-xl">cancel</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorAppointmentsPage;

