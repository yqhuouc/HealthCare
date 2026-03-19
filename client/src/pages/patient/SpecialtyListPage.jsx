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
 * State:
 * - searchQuery: chuỗi tìm kiếm người dùng nhập vào ô search
 *
 * Dữ liệu: SPECIALTIES từ mockDoctors.js (sẽ thay bằng API)
 * ============================================================
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { SPECIALTIES } from "../../data/mockDoctors";

export default function SpecialtyListPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Lọc chuyên khoa theo tên (không phân biệt hoa thường)
  const filteredSpecialties = SPECIALTIES.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="flex-1 flex flex-col items-center">
      <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Tiêu đề trang */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
            Chuyên khoa
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl">
            Đội ngũ chuyên gia hàng đầu cam kết mang đến dịch vụ chăm sóc sức
            khỏe chất lượng cao cho gia đình bạn.
          </p>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="mb-12">
          <label className="text-slate-900 text-sm font-semibold block mb-2">
            Tìm chuyên khoa
          </label>
          <div className="relative max-w-lg">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập tên chuyên khoa cần tìm..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900"
            />
          </div>
        </div>

        {/* Grid danh sách chuyên khoa */}
        {filteredSpecialties.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-slate-300 block mb-4">
              search_off
            </span>
            <p className="text-slate-500 text-lg">
              Không tìm thấy chuyên khoa phù hợp
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {filteredSpecialties.map((specialty) => (
              <div
                key={specialty.id}
                className="group bg-white p-6 rounded-lg border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Icon chuyên khoa — đổi màu khi hover */}
                <div className="w-14 h-14 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <span className="material-symbols-outlined text-3xl">
                    {specialty.icon}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {specialty.name}
                </h3>

                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  {specialty.description}
                </p>

                {/* Số lượng bác sĩ */}
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-primary text-sm">
                    groups
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {specialty.doctorCount} bác sĩ chuyên khoa
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
        )}
      </div>
    </section>
  );
}
