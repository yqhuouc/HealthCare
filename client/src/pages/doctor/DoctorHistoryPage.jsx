/**
 * ============================================================
 * TRANG: Lịch sử khám bệnh (Bác sĩ)
 * Đường dẫn: /doctor/history
 * ============================================================
 *
 * Chức năng chính:
 * 1. Hiển thị danh sách các ca khám đã HOÀN THÀNH (trangThai = 2).
 * 2. Bộ lọc tìm kiếm:
 *    - Theo tên bệnh nhân hoặc Mã BN (BN-XXX).
 *    - Theo khoảng ngày (Từ ngày... Đến ngày...).
 * 3. Xem nhanh chẩn đoán hoặc lý do khám từ danh sách.
 * 4. Truy cập chi tiết hồ sơ bệnh án/đơn thuốc của từng ca.
 *
 * Dữ liệu: Lấy từ API appointmentService.getByBacSi và lọc tại Client.
 * ============================================================
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppointmentsByDoctor } from "../../hooks/queries/useAppointmentQueries";
import useAuthStore from "../../stores/useAuthStore";
import { getInitials, formatDate } from "../../utils/formatters";



function DoctorHistoryPage() {
  const { user } = useAuthStore();
  const bacSiId = user?.bacSi?.id;

  // TanStack Query: Lấy danh sách lịch hẹn (auto-cache)
  const { data: aptRes, isLoading: loading } = useAppointmentsByDoctor(bacSiId);
  const allAppointments = Array.isArray(aptRes?.data) ? aptRes.data : [];
  // QUAN TRỌNG: Chỉ lấy những lịch có trạng thái Hoàn thành (2)
  const appointments = allAppointments.filter((a) => a.trangThai === 2);

  // State bộ lọc
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  /**
   * Logic Lọc (Filtering): Chạy mỗi khi user nhập search hoặc chọn ngày
   */
  const filtered = appointments.filter((record) => {
    // 1. Lọc theo chuỗi tìm kiếm (Tên hoặc BN-XXX)
    const q = search.trim().toLowerCase();
    const patientId = record.benhNhan?.id || record.benhNhanId || record.id;
    const matchSearch =
      !q ||
      (record.benhNhan?.hoTen || "").toLowerCase().includes(q) ||
      `BN-${String(patientId).padStart(3, "0")}`.toLowerCase().includes(q);

    // 2. Lọc theo khoảng ngày
    const aptDate = new Date(record.ngayDat).toLocaleDateString("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
    const matchFrom = !dateFrom || aptDate >= dateFrom;
    const matchTo = !dateTo || aptDate <= dateTo;

    return matchSearch && matchFrom && matchTo;
  });



  /**
   * Xử lý URL ảnh đại diện bệnh nhân
   */
  const getPatientAvatar = (anhDaiDien) => {
    if (!anhDaiDien) return null;
    if (anhDaiDien.startsWith("http")) return anhDaiDien;
    return `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${anhDaiDien}`;
  };

  // UI Loading
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            Lịch sử khám bệnh
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Hệ thống lưu trữ hồ sơ bệnh án đã hoàn thành
          </p>
        </div>
      </div>

      {/* BỘ LỌC (Filters Section) */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
        <div className="grid md:grid-cols-12 gap-4">
          {/* Ô tìm kiếm */}
          <div className="md:col-span-6">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Tìm kiếm nhanh
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                search
              </span>
              <input
                type="text"
                placeholder="Nhập tên bệnh nhân hoặc mã BN (VD: BN-045)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary text-sm font-medium outline-none transition-all"
              />
            </div>
          </div>

          {/* Lọc ngày: Từ ngày */}
          <div className="md:col-span-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Từ ngày
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl font-light">
                calendar_today
              </span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100/50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-sm font-medium outline-none"
              />
            </div>
          </div>

          {/* Lọc ngày: Đến ngày */}
          <div className="md:col-span-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Đến ngày
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl font-light">
                calendar_today
              </span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100/50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-sm font-medium outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* DANH SÁCH KẾT QUẢ (History Content) */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Mobile: Hiển thị dạng Card */}
        <div className="block md:hidden divide-y divide-slate-100 italic">
          {filtered.length > 0 ? (
            filtered.map((record) => {
              const patientId =
                record.benhNhan?.id || record.benhNhanId || record.id;
              const code = `BN-${String(patientId).padStart(3, "0")}`;
              return (
                <div key={record.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {record.benhNhan?.taiKhoan?.anhDaiDien ? (
                        <img
                          src={getPatientAvatar(
                            record.benhNhan.taiKhoan.anhDaiDien,
                          )}
                          alt={record.benhNhan?.hoTen}
                          className="size-10 rounded-full object-cover shrink-0 border-2 border-white shadow-sm"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(record.benhNhan?.hoTen || "BN")}&size=128&background=f1f5f9&color=64748b`;
                          }}
                        />
                      ) : (
                        <div className="size-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center text-xs font-black shrink-0 border border-slate-100">
                          {getInitials(record.benhNhan?.hoTen)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate leading-tight">
                          {record.benhNhan?.hoTen || "—"}
                        </p>
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                          {code}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-black text-slate-400">
                        {formatDate(record.ngayDat)}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 bg-slate-50 p-2 rounded">
                    <span className="font-bold text-slate-700">Chẩn đoán:</span>{" "}
                    {record.donThuoc?.chanDoan || record.lyDoKham || "—"}
                  </p>
                  <Link
                    to={`/doctor/appointments/${record.id}`}
                    className="flex items-center justify-center gap-2 w-full bg-primary text-white text-xs font-black uppercase py-2.5 rounded-lg hover:bg-primary/90 transition-all border border-primary/20 shadow-lg shadow-primary/10"
                  >
                    Xem hồ sơ chi tiết
                    <span className="material-symbols-outlined text-sm">
                      arrow_forward
                    </span>
                  </Link>
                </div>
              );
            })
          ) : (
            <div className="px-6 py-12 text-center text-slate-400 text-sm font-medium">
              Không có dữ liệu lịch sử nào phù hợp.
            </div>
          )}
        </div>

        {/* Desktop: Hiển thị dạng Bảng (Table) */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="text-left px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Ngày khám
                </th>
                <th className="text-left px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Mã Bệnh Nhân
                </th>
                <th className="text-left px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Họ tên Bệnh Nhân
                </th>
                <th className="text-left px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Chẩn đoán / Lý do
                </th>
                <th className="text-center px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((record) => {
                const patientId =
                  record.benhNhan?.id || record.benhNhanId || record.id;
                const code = `BN-${String(patientId).padStart(3, "0")}`;
                return (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4 text-sm font-bold text-slate-600 italic group-hover:text-primary transition-colors">
                      {formatDate(record.ngayDat)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-black text-primary/80 bg-primary/5 px-2 py-1 rounded border border-primary/10 tracking-widest uppercase">
                        {code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {record.benhNhan?.taiKhoan?.anhDaiDien ? (
                          <img
                            src={getPatientAvatar(
                              record.benhNhan.taiKhoan.anhDaiDien,
                            )}
                            alt={record.benhNhan?.hoTen}
                            className="size-9 rounded-full object-cover shrink-0 border border-slate-100"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(record.benhNhan?.hoTen || "BN")}&size=128&background=f1f5f9&color=64748b`;
                            }}
                          />
                        ) : (
                          <div className="size-9 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center text-xs font-black shrink-0 border border-slate-100">
                            {getInitials(record.benhNhan?.hoTen)}
                          </div>
                        )}
                        <span className="text-sm font-bold text-slate-800">
                          {record.benhNhan?.hoTen || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate italic">
                      {record.donThuoc?.chanDoan || record.lyDoKham || "—"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/doctor/appointments/${record.id}`}
                        className="inline-flex items-center gap-2 bg-white text-primary text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-lg border border-primary/20 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                      >
                        Hồ sơ bệnh án
                        <span className="material-symbols-outlined text-sm font-bold">
                          description
                        </span>
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {/* Thông báo nếu không có dữ liệu sau khi lọc */}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-20 text-center text-slate-400 font-bold italic"
                  >
                    Không tìm thấy lịch sử khám phù hợp với tiêu chí lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PHẦN FOOTER TỔNG KẾT */}
        <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-4 flex items-center justify-between">
          <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">
            Trình quản lý lịch sử: {filtered.length} bản ghi hoàn thành
          </span>
          <span className="material-symbols-outlined text-slate-300">
            history_edu
          </span>
        </div>
      </div>
    </div>
  );
}

export default DoctorHistoryPage;
