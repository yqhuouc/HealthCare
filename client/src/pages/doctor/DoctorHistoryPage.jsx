/**
 * ============================================================
 * TRANG: LỊCH SỬ KHÁM BỆNH (BÁC SĨ)
 * Đường dẫn: /doctor/history
 * ============================================================
 * 
 * CHỨC NĂNG CHÍNH:
 * 1. Hiển thị danh sách các ca khám đã HOÀN TẤT (Trạng thái 2).
 * 2. Bộ lọc thông minh:
 *    - Tìm kiếm theo tên bệnh nhân hoặc mã BN (BN-XXX).
 *    - Lọc theo khoảng ngày (Từ ngày... Đến ngày...).
 * 3. Truy cập chi tiết hồ sơ bệnh án và đơn thuốc cũ.
 * 
 * PHONG CÁCH THIẾT KẾ:
 * - Giao diện "Archives" (Lưu trữ) trang trọng, tinh giản.
 * - Sử dụng các đường kẻ mảnh (Border-2) thay vì hiệu ứng đổ bóng.
 * - Tối ưu hiển thị bảng dữ liệu (Table) cho Desktop và dạng Thẻ (Card) cho Mobile.
 * ============================================================
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppointmentsByDoctor } from "../../hooks/queries/useAppointmentQueries";
import useAuthStore from "../../stores/useAuthStore";
import { getInitials } from "../../utils/formatters";
import { formatDate, toDateString } from "../../utils/dateUtils";

function DoctorHistoryPage() {
  const { user } = useAuthStore();
  const bacSiId = user?.bacSi?.id;

  /**
   * 1. GỌI DỮ LIỆU TỪ SERVER & LỰC CHỌN TRẠNG THÁI
   */
  const { data: aptRes, isLoading: loading } = useAppointmentsByDoctor(bacSiId);
  const allAppointments = Array.isArray(aptRes?.data) ? aptRes.data : [];
  
  // Chỉ lấy những ca khám đã hoàn thành (Trạng thái 2)
  const historyData = allAppointments.filter((a) => a.trangThai === 2);

  /**
   * 2. QUẢN LÝ BỘ LỌC (FILTER STATE)
   */
  const [keyword, setKeyword] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Logic lọc dữ liệu phía Client
  const filteredRecords = historyData.filter((item) => {
    // Lọc theo từ khóa (Tên hoặc Mã BN)
    const q = keyword.trim().toLowerCase();
    const patientCode = `BN-${String(item.benhNhan?.id || item.benhNhanId).padStart(3, "0")}`.toLowerCase();
    const matchKeyword = !q || (item.benhNhan?.hoTen || "").toLowerCase().includes(q) || patientCode.includes(q);

    // Lọc theo ngày đặt lịch
    const recordDate = toDateString(item.ngayDat);
    const matchFrom = !dateFrom || recordDate >= dateFrom;
    const matchTo = !dateTo || recordDate <= dateTo;

    return matchKeyword && matchFrom && matchTo;
  });

  /**
   * 3. HÀM HỖ TRỢ HIỂN THỊ
   */
  const getAvatar = (path) => {
    if (!path) return null;
    return path.startsWith("http") ? path : `${import.meta.env.VITE_API_URL}${path}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Đang truy xuất kho lưu trữ...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 p-4 sm:p-0">
      
      {/* --- TIÊU ĐỀ --- */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Lịch sử điều trị</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Danh mục các ca khám và đơn thuốc đã được ghi nhận vào hệ thống.</p>
      </div>

      {/* --- BỘ LỌC TÌM KIẾM --- */}
      <section className="bg-white border-2 border-slate-100 rounded-3xl p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          {/* Tìm kiếm */}
          <div className="md:col-span-6 space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tìm bệnh nhân hoặc mã BN</label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">search</span>
              <input 
                type="text" 
                placeholder="Nhập tên, số điện thoại hoặc mã BN-XXX..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary/20 outline-none text-sm font-bold transition-all"
              />
            </div>
          </div>

          {/* Ngày bắt đầu */}
          <div className="md:col-span-3 space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Từ ngày</label>
            <input 
              type="date" 
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary/20 outline-none text-sm font-bold transition-all text-slate-600 uppercase"
            />
          </div>

          {/* Ngày kết thúc */}
          <div className="md:col-span-3 space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Đến ngày</label>
            <input 
              type="date" 
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary/20 outline-none text-sm font-bold transition-all text-slate-600 uppercase"
            />
          </div>
        </div>
      </section>

      {/* --- DANH SÁCH KẾT QUẢ --- */}
      <section className="bg-white border-2 border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        
        {/* MOBILE VIEW: Hiển thị dạng thẻ (Card) */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredRecords.length > 0 ? (
            filteredRecords.map(item => (
              <div key={item.id} className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                      {getAvatar(item.benhNhan?.taiKhoan?.anhDaiDien) ? (
                        <img src={getAvatar(item.benhNhan.taiKhoan.anhDaiDien)} alt="BN" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-slate-400">{getInitials(item.benhNhan?.hoTen)}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{item.benhNhan?.hoTen}</p>
                      <p className="text-[10px] font-bold text-primary tracking-widest">BN-{String(item.benhNhan?.id).padStart(3, "0")}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{formatDate(item.ngayDat)}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Chẩn đoán sau cùng:</p>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">{item.donThuoc?.chanDoan || item.lyDoKham || "Chưa có dữ liệu"}</p>
                </div>
                <Link to={`/doctor/appointments/${item.id}`} className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                  Chi tiết hồ sơ
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            ))
          ) : (
            <div className="py-20 text-center text-slate-400 font-bold text-sm italic">Không tìm thấy hồ sơ nào...</div>
          )}
        </div>

        {/* DESKTOP VIEW: Bảng chuẩn Clinical */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b-2 border-slate-100">
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-5">Ngày công tác</th>
                <th className="px-6 py-5">Bệnh nhân (Mã)</th>
                <th className="px-6 py-5">Kết quả chẩn đoán lý thuyết</th>
                <th className="px-8 py-5 text-center">Tác vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 transition-all">
              {filteredRecords.length > 0 ? (
                filteredRecords.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-700">{formatDate(item.ngayDat)}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                         <div className="size-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                            {getAvatar(item.benhNhan?.taiKhoan?.anhDaiDien) ? (
                              <img src={getAvatar(item.benhNhan.taiKhoan.anhDaiDien)} alt="BN" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400">{getInitials(item.benhNhan?.hoTen)}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{item.benhNhan?.hoTen}</p>
                            <p className="text-[10px] font-bold text-primary tracking-widest uppercase">BN-{String(item.benhNhan?.id).padStart(3, "0")}</p>
                          </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs text-slate-600 font-medium italic line-clamp-1 max-w-xs ring-1 ring-slate-100 bg-slate-50 py-1 px-3 rounded-md">
                        {item.donThuoc?.chanDoan || item.lyDoKham || "—"}
                      </p>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <Link 
                        to={`/doctor/appointments/${item.id}`} 
                        className="px-4 py-2 border-2 border-slate-100 text-[10px] font-bold text-slate-500 uppercase rounded-xl hover:border-primary/20 hover:text-primary hover:bg-primary/5 transition-all inline-flex items-center gap-2 tracking-widest"
                      >
                        Hồ sơ án
                        <span className="material-symbols-outlined text-sm">visibility</span>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-32 text-center text-slate-300 font-bold italic text-sm">Không tìm thấy kết quả phù hợp với bộ lọc</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer ghi nhận */}
        <div className="px-8 py-4 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter italic">Lưu trữ hệ thống @HealthCare</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hiển thị {filteredRecords.length} kết quả</p>
        </div>
      </section>

    </div>
  );
}

export default DoctorHistoryPage;
