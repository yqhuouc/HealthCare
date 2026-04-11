/**
 * =============================================================================
 * TRANG: QUẢN LÝ DANH SÁCH LỊCH KHÁM (BÁC SĨ)
 * Đường dẫn: /doctor/appointments
 * =============================================================================
 * 
 * CHỨC NĂNG CHÍNH:
 * 1. Hiển thị toàn bộ lịch hẹn mà bệnh nhân đã đặt với bác sĩ.
 * 2. Bộ lọc đa năng: Theo ngày, theo trạng thái, và tìm kiếm theo tên/mã bệnh nhân.
 * 3. Quản lý trạng thái: Xác nhận lịch, Hủy lịch, hoặc đi tới trang khám bệnh.
 * 
 * PHONG CÁC THIẾT KẾ:
 * - Tập trung vào sự tối giản, chuyên nghiệp (Clinical Design).
 * - Sử dụng các đường kẻ (Border) tinh tế thay vì đổ bóng (Shadow) cầu kỳ.
 * - Chú thích code bằng tiếng Việt hỗ trợ việc học tập và bảo vệ đồ án.
 * =============================================================================
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAppointmentsByDoctor, useUpdateAppointmentStatus } from "../../hooks/queries/useAppointmentQueries";
import useAuthStore from "../../stores/useAuthStore";
import { toast } from "react-toastify";
import { getInitials } from "../../utils/formatters";
import { formatTime, toDateString, dayjs } from "../../utils/dateUtils";

/** 
 * CẤU HÌNH NHÃN (BADGE): Định nghĩa màu sắc cho từng trạng thái lịch hẹn.
 */
const STATUS_BADGE = {
  0: { label: "Đang chờ", className: "border-amber-200 text-amber-700 bg-amber-50" },
  1: { label: "Đã xác nhận", className: "border-blue-200 text-blue-700 bg-blue-50" },
  2: { label: "Hoàn thành", className: "border-emerald-200 text-emerald-700 bg-emerald-50" },
  3: { label: "Đã hủy", className: "border-rose-200 text-rose-700 bg-rose-50" },
};

/** 
 * DANH SÁCH CÁC LỰA CHỌN LỌC TRẠNG THÁI
 */
const STATUS_FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: 0, label: "Đang chờ" },
  { value: 1, label: "Đã xác nhận" },
  { value: 2, label: "Hoàn thành" },
  { value: 3, label: "Đã hủy" },
];

/**
 * HÀM HỖ TRỢ: Xử lý đường dẫn ảnh đại diện (Avatar) của bệnh nhân.
 */
function getPatientAvatar(anhDaiDien) {
  if (!anhDaiDien) return null;
  if (anhDaiDien.startsWith("http")) return anhDaiDien;
  return `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${anhDaiDien}`;
}

function DoctorAppointmentsPage() {
  // Lấy ID bác sĩ từ kho lưu trữ thông tin đăng nhập
  const { user } = useAuthStore();
  const bacSiId = user?.bacSi?.id;

  /**
   * 1. GỌI API LẤY DANH SÁCH LỊCH HẸN
   */
  const { data: aptRes, isLoading: loading } = useAppointmentsByDoctor(bacSiId);
  const appointments = Array.isArray(aptRes?.data) ? aptRes.data : [];
  
  /**
   * 2. KHỞI TẠO CÁC MUTATION (CẬP NHẬT DỮ LIỆU)
   */
  const statusMutation = useUpdateAppointmentStatus();
  
  /**
   * 3. QUẢN LÝ CÁC BỘ LỌC (STATE)
   */
  const [activeDateTab, setActiveDateTab] = useState("today"); // Mặc định xem hôm nay
  const [customDate, setCustomDate] = useState("");            // Ngày do người dùng chọn
  const [searchKey, setSearchKey] = useState("");              // Từ khóa tìm kiếm
  const [statusFilter, setStatusFilter] = useState("all");     // Bộ lọc trạng thái

  // Tính toán chuỗi ngày Hôm nay và Ngày mai một lần duy nhất để tối ưu
  const { todayStr, tomorrowStr } = useMemo(() => {
    const now = dayjs();
    return {
      todayStr: toDateString(now),
      tomorrowStr: toDateString(now.add(1, 'day')),
    };
  }, []);

  // Xác định ngày cuối cùng được chọn để lọc dữ liệu
  const effectiveDate =
    activeDateTab === "today" ? todayStr :
    activeDateTab === "tomorrow" ? tomorrowStr :
    customDate;

  /**
   * 4. LOGIC LỌC DỮ LIỆU TẠI CLIENT
   * Phối hợp đồng thời các bộ lọc: Ngày, Trạng thái, và Tìm kiếm.
   */
  const filteredAppointments = appointments.filter((apt) => {
    const aptDate = toDateString(apt.ngayDat);
    
    // Kiểm tra khớp ngày
    const isMatchDate = !effectiveDate || aptDate === effectiveDate;
    
    // Kiểm tra khớp trạng thái
    const isMatchStatus = statusFilter === "all" || apt.trangThai === statusFilter;
    
    // Kiểm tra khớp từ khóa tìm kiếm (Tên hoặc Mã BN)
    const q = searchKey.trim().toLowerCase();
    const patientId = apt.benhNhan?.id || apt.benhNhanId || apt.id;
    const isMatchSearch = !q ||
      (apt.benhNhan?.hoTen || "").toLowerCase().includes(q) ||
      `BN-${String(patientId).padStart(3, "0")}`.toLowerCase().includes(q);

    return isMatchDate && isMatchStatus && isMatchSearch;
  });

  /**
   * 5. TÍNH TOÁN CÁC CON SỐ THỐNG KÊ NHANH
   */
  const stats = {
    total: filteredAppointments.length,
    pending: filteredAppointments.filter((a) => a.trangThai === 0).length,
    completed: filteredAppointments.filter((a) => a.trangThai === 2).length,
    cancelled: filteredAppointments.filter((a) => a.trangThai === 3).length,
  };

  /**
   * Hàm xử lý khi bác sĩ cập nhật trạng thái lịch hẹn
   */
  const handleUpdateStatus = (id, newStatus) => {
    const labels = { 0: "Hoàn tác", 1: "Xác nhận lịch", 2: "Hoàn thành", 3: "Đã hủy lịch" };
    statusMutation.mutate(
      { id, trangThai: newStatus },
      {
        onSuccess: () => toast.success(`Tho rành: ${labels[newStatus]}`),
        onError: (err) => toast.error(err.message || "Lỗi cập nhật trạng thái"),
      }
    );
  };

  // Màn hình loading khi đang tải dữ liệu từ API
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-bold">Đang tải danh sách lịch khám...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* ---------------------------------------------------------
          TIÊU ĐỀ TRANG
          --------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Danh sách lịch khám</h1>
          <p className="text-slate-500 text-sm font-medium">Bác sĩ hãy chọn ngày và bệnh nhân để bắt đầu quy trình khám bệnh</p>
        </div>
      </div>

      {/* ---------------------------------------------------------
          THANH ĐIỀU KHIỂN & BỘ LỌC (FILTER BAR)
          --------------------------------------------------------- */}
      <div className="bg-white p-4 rounded-xl border-2 border-slate-100 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          
          {/* Lọc nhanh theo Ngày (Tabs) */}
          <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => { setActiveDateTab("today"); setCustomDate(""); }}
              className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                activeDateTab === "today" ? "bg-white text-primary border border-slate-200" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Hôm nay
            </button>
            <button
              onClick={() => { setActiveDateTab("tomorrow"); setCustomDate(""); }}
              className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                activeDateTab === "tomorrow" ? "bg-white text-primary border border-slate-200" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Ngày mai
            </button>
          </div>

          {/* Chọn ngày tùy chỉnh */}
          <div className="relative">
            <input
              type="date"
              value={customDate}
              onChange={(e) => { setCustomDate(e.target.value); setActiveDateTab("custom"); }}
              className="pl-4 pr-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 font-bold focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all"
            />
          </div>

          <div className="h-8 w-px bg-slate-100 hidden lg:block" />

          {/* Ô Tìm kiếm (Search) */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input
              type="text"
              placeholder="Tìm tên hoặc Mã BN (VD: BN-001)..."
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all"
            />
          </div>
        </div>

        {/* Lọc theo Trạng thái (Status Pill Filters) */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest self-center mr-2">Bộ lọc trạng thái:</span>
          {STATUS_FILTERS.map((f) => (
            <button
              key={String(f.value)}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border ${
                statusFilter === f.value
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------------
          DANH SÁCH HIỂN THỊ (LIST SESSIONS)
          --------------------------------------------------------- */}
      <div className="bg-white rounded-xl border-2 border-slate-100 overflow-hidden">
        
        {/* --- PHIÊN BẢN MOBILE (DANH SÁCH CARD CHỒNG NHAU) --- */}
        <div className="md:hidden">
          {filteredAppointments.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredAppointments.map((apt) => {
                const badge = STATUS_BADGE[apt.trangThai] || STATUS_BADGE[0];
                const patientCode = `BN-${String(apt.benhNhan?.id || apt.id).padStart(3, "0")}`;
                return (
                  <div key={apt.id} className="p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400">
                          {getInitials(apt.benhNhan?.hoTen)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 leading-none">{apt.benhNhan?.hoTen}</p>
                          <p className="text-[10px] font-bold text-primary mt-1 uppercase tracking-widest">{patientCode}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase leading-none ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                        {formatTime(apt.gioBatDau)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-slate-400">call</span>
                        {apt.benhNhan?.soDienThoai}
                      </div>
                    </div>
                    
                    {/* Thao tác Mobile */}
                    <div className="flex gap-2">
                       {/* Nút hành động thay đổi linh hoạt theo trạng thái */}
                       {apt.trangThai === 0 && (
                        <button onClick={() => handleUpdateStatus(apt.id, 1)} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider">Xác nhận</button>
                      )}
                      {apt.trangThai === 1 && (
                        <Link to={`/doctor/appointments/${apt.id}`} className="flex-1 py-2 bg-emerald-600 text-white text-center rounded-lg text-[10px] font-bold uppercase tracking-wider">Bắt đầu khám</Link>
                      )}
                      {apt.trangThai === 2 && (
                        <Link to={`/doctor/appointments/${apt.id}`} className="flex-1 py-2 border-2 border-primary text-primary text-center rounded-lg text-[10px] font-bold uppercase tracking-wider">Xem hồ sơ</Link>
                      )}
                      
                      <button onClick={() => handleUpdateStatus(apt.id, 3)} className="px-4 py-2 border-2 border-slate-200 text-slate-400 rounded-lg text-[10px] font-bold uppercase">Hủy</button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 font-bold italic text-sm">Trống: Không có lịch khớp với bộ lọc</div>
          )}
        </div>

        {/* --- PHIÊN BẢN DESKTOP (BẢNG NGANG CHUYÊN NGHIỆP) --- */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Thời điểm</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Bệnh nhân</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Số điện thoại</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Lý do</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-widest text-center">Trạng thái</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-widest text-right">Quản lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((apt) => {
                  const badge = STATUS_BADGE[apt.trangThai] || STATUS_BADGE[0];
                  const patientCode = `BN-${String(apt.benhNhan?.id || apt.id).padStart(3, "0")}`;
                  return (
                    <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-primary font-bold">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          {formatTime(apt.gioBatDau)}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={getPatientAvatar(apt.benhNhan?.taiKhoan?.anhDaiDien) || `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.benhNhan?.hoTen || "BN")}&size=128&background=f1f5f9&color=64748b`}
                            alt="Avatar"
                            className="size-9 rounded-lg object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-800 leading-none mb-1">{apt.benhNhan?.hoTen || "—"}</p>
                            <p className="text-[9px] font-bold text-primary uppercase tracking-widest">{patientCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-medium text-slate-500 font-mono tracking-tighter">
                        {apt.benhNhan?.soDienThoai}
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-xs text-slate-400 italic max-w-xs truncate">"{apt.lyDoKham || "..."}"</p>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="inline-flex flex-col gap-1 items-center">
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${badge.className}`}>
                            {badge.label}
                          </span>
                          {apt.donThuoc && (
                            <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1 border border-emerald-100 rounded">ĐÃ KÊ ĐƠN</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="inline-flex gap-2">
                           {/* Luồng hành động tùy biến */}
                           {apt.trangThai === 0 && (
                            <button onClick={() => handleUpdateStatus(apt.id, 1)} title="Xác nhận lịch" 
                              className="size-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center">
                              <span className="material-symbols-outlined text-lg">check</span>
                            </button>
                           )}
                           {apt.trangThai === 1 && (
                            <Link to={`/doctor/appointments/${apt.id}`} title="Thực hiện khám bệnh"
                              className="size-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center">
                              <span className="material-symbols-outlined text-lg">medical_services</span>
                            </Link>
                           )}
                           {apt.trangThai === 2 && (
                            <Link to={`/doctor/appointments/${apt.id}`} title="Xem lại hồ sơ"
                              className="size-8 rounded-lg bg-primary/5 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all flex items-center justify-center">
                              <span className="material-symbols-outlined text-lg">visibility</span>
                            </Link>
                           )}

                           {apt.trangThai !== 3 && (
                            <button onClick={() => handleUpdateStatus(apt.id, 3)} title="Hủy bỏ lịch này"
                              className="size-8 rounded-lg bg-slate-50 text-slate-400 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all flex items-center justify-center">
                              <span className="material-symbols-outlined text-lg">cancel</span>
                            </button>
                           )}
                           {apt.trangThai === 3 && (
                            <button onClick={() => handleUpdateStatus(apt.id, 1)} title="Khôi phục trạng thái"
                              className="h-8 px-3 rounded-lg border-2 border-slate-200 text-xs font-bold text-slate-400 hover:text-primary hover:border-primary transition-all">
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
                  <td colSpan={6} className="py-24 text-center text-slate-400 font-bold italic">Không có dữ liệu lịch khám phù hợp.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------------------------------------------------
          THỐNG KÊ NHANH (SUMMARY STATS CARDS)
          --------------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-10">
        <div className="bg-white p-5 rounded-xl border-2 border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">Đang chọn lọc</p>
          <p className="text-2xl font-bold text-slate-800 leading-none">{stats.total}</p>
        </div>
        <div className="p-5 rounded-xl border-2 border-amber-100 bg-amber-50/20">
          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest leading-none mb-2">Chờ xử lý</p>
          <p className="text-2xl font-bold text-slate-800 leading-none">{stats.pending}</p>
        </div>
        <div className="p-5 rounded-xl border-2 border-emerald-100 bg-emerald-50/20">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none mb-2">Hoàn thành</p>
          <p className="text-2xl font-bold text-slate-800 leading-none">{stats.completed}</p>
        </div>
        <div className="p-5 rounded-xl border-2 border-rose-100 bg-rose-50/20">
          <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest leading-none mb-2">Đã hủy bỏ</p>
          <p className="text-2xl font-bold text-slate-800 leading-none">{stats.cancelled}</p>
        </div>
      </div>
    </div>
  );
}

export default DoctorAppointmentsPage;

