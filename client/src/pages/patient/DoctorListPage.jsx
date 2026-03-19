/**
 * ============================================================
 * TRANG: Danh sách bác sĩ (Bệnh nhân)
 * Đường dẫn: /doctors
 * ============================================================
 *
 * Chức năng:
 * - Hiển thị tất cả bác sĩ dưới dạng grid card
 * - Tìm kiếm bác sĩ theo tên (realtime)
 * - Lọc theo chuyên khoa bằng dropdown select
 * - Mỗi card: avatar, tên, chuyên khoa, kinh nghiệm, đánh giá, giá khám
 * - 2 nút: "Xem chi tiết" → DoctorDetailPage, "Đặt lịch" → BookingPage
 *
 * State:
 * - searchQuery: chuỗi tìm kiếm theo tên bác sĩ
 * - selectedSpecialty: ID chuyên khoa đang lọc (rỗng = tất cả)
 *
 * Dữ liệu: DOCTORS, SPECIALTIES từ mockDoctors.js
 * ============================================================
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { DOCTORS, SPECIALTIES } from "../../data/mockDoctors";

/** Hàm format giá tiền sang dạng VND: 150000 → "150.000đ" */
const formatPrice = (price) => price.toLocaleString("vi-VN") + "đ";

export default function DoctorListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");

  // Lọc danh sách bác sĩ theo tên (không phân biệt hoa thường) và chuyên khoa
  const filteredDoctors = DOCTORS.filter((doctor) => {
    const matchesName = doctor.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesSpecialty =
      !selectedSpecialty || doctor.specialtyId === Number(selectedSpecialty);
    return matchesName && matchesSpecialty;
  });

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
            {SPECIALTIES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Danh sách bác sĩ hoặc thông báo không tìm thấy */}
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">
              person_search
            </span>
            <p className="text-slate-500 text-lg">
              Không tìm thấy bác sĩ phù hợp
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-white rounded-lg border border-slate-100 shadow-sm hover:shadow-lg transition-shadow p-6 flex flex-col items-center text-center"
              >
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-20 h-20 rounded-full border-4 border-primary/20 object-cover mb-4"
                />

                <h2 className="text-lg font-bold text-slate-800">
                  {doctor.name}
                </h2>

                <p className="text-primary text-sm font-medium mt-1">
                  {doctor.specialty}
                </p>

                <p className="text-slate-500 text-sm mt-2">
                  {doctor.experience} năm kinh nghiệm
                </p>

                {/* Đánh giá sao */}
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <span className="material-symbols-outlined text-amber-400 text-base">
                    star
                  </span>
                  <span className="font-semibold text-slate-700">
                    {doctor.rating}
                  </span>
                  <span className="text-slate-400">
                    ({doctor.totalReviews} đánh giá)
                  </span>
                </div>

                <p className="text-primary font-bold text-lg mt-3">
                  {formatPrice(doctor.price)}
                </p>

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
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
