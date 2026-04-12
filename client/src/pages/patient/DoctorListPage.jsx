/**
 * ============================================================
 * TRANG: Danh sách bác sĩ (Bệnh nhân)
 * Đường dẫn: /doctors
 * ============================================================
 *
 * Chức năng:
 * - Hiển thị tất cả bác sĩ dưới dạng grid card
 * - Tìm kiếm bác sĩ theo tên (gửi query lên server)
 * - Lọc theo chuyên khoa bằng dropdown select
 * - Mỗi card: avatar, tên, chuyên khoa, học vị, giá khám
 * - 2 nút: "Xem chi tiết" → DoctorDetailPage, "Đặt lịch" → BookingPage
 *
 * Dữ liệu: API /api/bac-si, /api/chuyen-khoa
 * ============================================================
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useDoctors } from "../../hooks/queries/useDoctorQueries";
import { useSpecialties } from "../../hooks/queries/useSpecialtyQueries";
import { formatPrice } from "../../utils/formatters";

export default function DoctorListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");

  // TanStack Query: Lấy chuyên khoa (auto-cache, chỉ fetch 1 lần)
  const { data: specRes } = useSpecialties();
  const specialties = specRes?.data || [];

  // TanStack Query: Lấy bác sĩ theo filter (auto-refetch khi filter đổi)
  const filters = { limit: 12 };
  if (searchQuery) filters.search = searchQuery;
  if (selectedSpecialty) filters.chuyenKhoaId = selectedSpecialty;
  const { data: docRes, isLoading: loading } = useDoctors(filters);
  const doctors = docRes?.data || [];
  const pagination = docRes?.pagination || null;

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề trang */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800">Đội ngũ bác sĩ</h1>
          <div className="h-1.5 w-20 bg-primary rounded-full mt-3" />
        </div>

        {/* Thanh tìm kiếm & bộ lọc chuyên khoa */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm bác sĩ theo tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition sm:w-56"
          >
            <option value="">Tất cả chuyên khoa</option>
            {specialties.map((s) => (
              <option key={s.id} value={s.id}>
                {s.tenChuyenKhoa}
              </option>
            ))}
          </select>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">person_search</span>
            <p className="text-slate-500 text-lg">Không tìm thấy bác sĩ phù hợp</p>
          </div>
        ) : (
          <>
            {/* Thông tin số lượng */}
            {pagination && (
              <p className="text-sm text-slate-500 mb-6">
                Hiển thị {doctors.length} / {pagination.total} bác sĩ
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {doctors.map((doctor) => {
                const avatarUrl = doctor.taiKhoan?.anhDaiDien;
                const specialtyName = doctor.chuyenKhoa?.tenChuyenKhoa || "Chưa phân khoa";

                return (
                  <div
                    key={doctor.id}
                    className="bg-white rounded-lg border border-slate-100 shadow-sm hover:shadow-lg transition-shadow p-6 flex flex-col items-center text-center"
                  >
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-full border-4 border-primary/20 bg-primary/5 flex items-center justify-center overflow-hidden mb-4">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={doctor.tenBacSi} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-4xl text-primary/40">person</span>
                      )}
                    </div>

                    <h2 className="text-lg font-bold text-slate-800">{doctor.tenBacSi}</h2>

                    <p className="text-primary text-sm font-medium mt-1">{specialtyName}</p>

                    {doctor.hocViChucDanh && <p className="text-slate-500 text-sm mt-2">{doctor.hocViChucDanh}</p>}

                    {doctor.giaKham && (
                      <p className="text-primary font-bold text-lg mt-3">{formatPrice(doctor.giaKham)}</p>
                    )}

                    {/* Nút hành động */}
                    <div className="flex gap-3 mt-5 w-full">
                      <Link
                        to={`/doctors/${doctor.id}`}
                        className="flex-1 py-2.5 rounded-lg border border-primary text-primary font-medium text-sm hover:bg-primary/5 transition text-center"
                      >
                        Xem chi tiết
                      </Link>
                      <Link
                        to={`/booking/${doctor.id}`}
                        className="flex-1 py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 transition text-center"
                      >
                        Đặt lịch
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
