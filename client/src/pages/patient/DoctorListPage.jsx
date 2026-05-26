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
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 6; // Hiển thị 6 bác sĩ mỗi trang (phù hợp với lưới 3 cột)

  // TanStack Query: Lấy chuyên khoa (auto-cache, chỉ fetch 1 lần)
  const { data: specRes } = useSpecialties();
  const specialties = specRes?.data || [];

  // TanStack Query: Lấy bác sĩ theo filter (auto-refetch khi filter đổi)
  const filters = { page: currentPage, limit };
  if (searchQuery) filters.search = searchQuery;
  if (selectedSpecialty) filters.chuyenKhoaId = selectedSpecialty;
  const { data: docRes, isLoading: loading } = useDoctors(filters);
  const doctors = docRes?.data || [];
  const pagination = docRes?.pagination || null;

  const totalPages = pagination?.totalPages || 1;

  // Xử lý thay đổi tìm kiếm
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
  };

  // Xử lý thay đổi chuyên khoa
  const handleSpecialtyChange = (e) => {
    setSelectedSpecialty(e.target.value);
    setCurrentPage(1); // Reset về trang 1 khi đổi chuyên khoa
  };

  // Tạo mảng hiển thị các số trang
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Luôn hiển thị trang 1
      pageNumbers.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) {
        end = 4;
      } else if (currentPage >= totalPages - 1) {
        start = totalPages - 3;
      }

      if (start > 2) {
        pageNumbers.push("...");
      }

      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      if (end < totalPages - 1) {
        pageNumbers.push("...");
      }

      // Luôn hiển thị trang cuối
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

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
              onChange={handleSearchChange}
              className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          <select
            value={selectedSpecialty}
            onChange={handleSpecialtyChange}
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
                Hiển thị {doctors.length} / {pagination.total} bác sĩ (Trang {currentPage} / {totalPages})
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

            {/* Điều khiển phân trang */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                {/* Nút Previous */}
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:hover:bg-white disabled:hover:border-slate-200 transition cursor-pointer disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-xl">chevron_left</span>
                </button>

                {/* Các số trang */}
                {getPageNumbers().map((pageNum, idx) => {
                  if (pageNum === "...") {
                    return (
                      <span
                        key={`ellipsis-${idx}`}
                        className="w-10 h-10 flex items-center justify-center text-slate-400"
                      >
                        ...
                      </span>
                    );
                  }

                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={`page-${pageNum}`}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium text-sm transition cursor-pointer flex items-center justify-center ${
                        isActive
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Nút Next */}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:hover:bg-white disabled:hover:border-slate-200 transition cursor-pointer disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-xl">chevron_right</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
