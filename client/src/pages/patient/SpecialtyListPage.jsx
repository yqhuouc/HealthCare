/**
 * ============================================================
 * TRANG: Danh sách chuyên khoa (Bệnh nhân)
 * Đường dẫn: /specialties
 * ============================================================
 *
 * Chức năng:
 * - Hiển thị tất cả chuyên khoa dưới dạng grid card
 * - Tìm kiếm chuyên khoa theo tên (lọc realtime khi gõ)
 * - Mỗi card hiển thị: icon, tên, mô tả, số bác sĩ
 * - Click "Xem chi tiết" → chuyển sang trang SpecialtyDetailPage
 *
 * Dữ liệu: API /api/chuyen-khoa
 * ============================================================
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useSpecialties } from "../../hooks/queries/useSpecialtyQueries";

const DEFAULT_ICON = "medical_services";

export default function SpecialtyListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 6; // Hiển thị 6 chuyên khoa mỗi trang (đẹp nhất cho lưới 3 cột)

  const { data: specRes, isLoading: loading } = useSpecialties();
  const specialties = specRes?.data || [];

  // Lọc chuyên khoa theo tên (không phân biệt hoa thường)
  const filteredSpecialties = specialties.filter((s) =>
    s.tenChuyenKhoa.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Tính toán phân trang
  const totalItems = filteredSpecialties.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const startIndex = (currentPage - 1) * limit;
  const paginatedSpecialties = filteredSpecialties.slice(startIndex, startIndex + limit);

  // Xử lý thay đổi tìm kiếm
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm thay đổi
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

  if (loading) {
    return (
      <section className="flex-1 flex items-center justify-center py-20">
        <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
      </section>
    );
  }

  return (
    <section className="flex-1 flex flex-col items-center">
      <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Tiêu đề trang */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Chuyên khoa</h1>
          <p className="text-slate-600 text-lg max-w-2xl">
            Đội ngũ chuyên gia hàng đầu cam kết mang đến dịch vụ chăm sóc sức khỏe chất lượng cao cho gia đình bạn.
          </p>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="mb-12">
          <label className="text-slate-900 text-sm font-semibold block mb-2">Tìm chuyên khoa</label>
          <div className="relative max-w-lg">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Nhập tên chuyên khoa cần tìm..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900"
            />
          </div>
        </div>

        {/* Grid danh sách chuyên khoa */}
        {filteredSpecialties.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-slate-300 block mb-4">search_off</span>
            <p className="text-slate-500 text-lg">Không tìm thấy chuyên khoa phù hợp</p>
          </div>
        ) : (
          <>
            {/* Thông tin số lượng */}
            <p className="text-sm text-slate-500 mb-6">
              Hiển thị {paginatedSpecialties.length} / {totalItems} chuyên khoa (Trang {currentPage} / {totalPages})
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {paginatedSpecialties.map((specialty) => (
                <div
                  key={specialty.id}
                  className="group bg-white p-6 rounded-lg border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Icon chuyên khoa — đổi màu khi hover */}
                  <div className="w-14 h-14 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <span className="material-symbols-outlined text-3xl">{specialty.icon || DEFAULT_ICON}</span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">{specialty.tenChuyenKhoa}</h3>

                  <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2">
                    {specialty.moTaChuyenKhoa || "Chuyên khoa chất lượng cao."}
                  </p>

                  {/* Số lượng bác sĩ */}
                  <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-primary text-sm">groups</span>
                    <span className="text-sm font-semibold text-slate-700">
                      {specialty._count?.bacSiList || 0} bác sĩ chuyên khoa
                    </span>
                  </div>

                  <Link
                    to={`/specialties/${specialty.id}`}
                    className="block w-full py-2.5 rounded-lg border-2 border-primary/10 text-primary font-bold text-sm hover:bg-primary hover:text-white hover:border-primary transition-all text-center"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              ))}
            </div>

            {/* Điều khiển phân trang */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12 mb-20">
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
                      <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-slate-400">
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
