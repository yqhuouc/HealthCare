/**
 * ============================================================
 * TRANG: Chi tiết bác sĩ (Bệnh nhân)
 * Đường dẫn: /doctors/:id
 * ============================================================
 *
 * Chức năng:
 * - Hiển thị hồ sơ chi tiết 1 bác sĩ (avatar, tên, chuyên khoa, KN, đánh giá, học vấn, giá)
 * - Breadcrumb điều hướng: Trang chủ > Bác sĩ > [Tên BS]
 * - Card thông tin chính + nút "Đặt lịch khám" → BookingPage
 * - Phần giới thiệu (mô tả) + sidebar thông tin tóm tắt
 * - Xử lý trường hợp không tìm thấy bác sĩ (404 fallback)
 *
 * Params:
 * - id (URL param): ID của bác sĩ, dùng useParams() để lấy
 *
 * Dữ liệu: DOCTORS từ mockDoctors.js
 * ============================================================
 */
import { useParams, Link } from "react-router-dom";
import { DOCTORS } from "../../data/mockDoctors";

/** Hàm format giá tiền sang dạng VND: 150000 → "150.000đ" */
const formatPrice = (price) => price.toLocaleString("vi-VN") + "đ";

export default function DoctorDetailPage() {
  const { id } = useParams();

  // Tìm bác sĩ theo id từ URL params
  const doctor = DOCTORS.find((d) => d.id === Number(id));

  // Trường hợp không tìm thấy bác sĩ
  if (!doctor) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">
            person_off
          </span>
          <h2 className="text-2xl font-bold text-slate-700 mb-2">
            Không tìm thấy bác sĩ
          </h2>
          <p className="text-slate-500 mb-6">
            Bác sĩ bạn tìm kiếm không tồn tại hoặc đã bị xoá.
          </p>
          <Link
            to="/doctors"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition"
          >
            <span className="material-symbols-outlined text-xl">
              arrow_back
            </span>
            Quay lại danh sách bác sĩ
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb điều hướng */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link to="/" className="hover:text-primary transition">
            Trang chủ
          </Link>
          <span className="material-symbols-outlined text-base">
            chevron_right
          </span>
          <Link to="/doctors" className="hover:text-primary transition">
            Bác sĩ
          </Link>
          <span className="material-symbols-outlined text-base">
            chevron_right
          </span>
          <span className="text-slate-800 font-medium">{doctor.name}</span>
        </nav>

        {/* Card thông tin chính của bác sĩ */}
        <div className="bg-white p-8 rounded-lg shadow mb-10">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <img
              src={doctor.image}
              alt={doctor.name}
              className="w-40 h-40 rounded-full border-4 border-primary/20 object-cover shrink-0"
            />

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-slate-800">
                {doctor.name}
              </h1>

              <p className="text-primary font-medium mt-1">
                {doctor.specialty}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 mt-4 text-sm text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-primary">
                    work
                  </span>
                  {doctor.experience} năm kinh nghiệm
                </span>

                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-amber-400">
                    star
                  </span>
                  {doctor.rating} ({doctor.totalReviews} đánh giá)
                </span>

                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-primary">
                    school
                  </span>
                  {doctor.education}
                </span>
              </div>

              <p className="text-primary font-bold text-xl mt-4">
                {formatPrice(doctor.price)}
              </p>

              <Link
                to={`/booking/${doctor.id}`}
                className="inline-flex items-center gap-2 mt-6 px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition"
              >
                <span className="material-symbols-outlined text-xl">
                  calendar_month
                </span>
                Đặt lịch khám
              </Link>
            </div>
          </div>
        </div>

        {/* Nội dung chi tiết: giới thiệu & thông tin */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột trái: giới thiệu bác sĩ */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-lg shadow">
              <h2 className="text-xl font-bold text-slate-800 mb-1">
                Giới thiệu
              </h2>
              <div className="h-1 w-12 bg-primary rounded-full mb-5" />
              <p className="text-slate-600 leading-relaxed">
                {doctor.description}
              </p>
            </div>
          </div>

          {/* Cột phải: card tóm tắt thông tin */}
          <div>
            <div className="bg-white p-8 rounded-lg shadow">
              <h2 className="text-xl font-bold text-slate-800 mb-1">
                Thông tin
              </h2>
              <div className="h-1 w-12 bg-primary rounded-full mb-5" />

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">
                    school
                  </span>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">
                      Học vấn
                    </p>
                    <p className="text-slate-700 font-medium">
                      {doctor.education}
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">
                    work
                  </span>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">
                      Kinh nghiệm
                    </p>
                    <p className="text-slate-700 font-medium">
                      {doctor.experience} năm
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">
                    medical_services
                  </span>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">
                      Chuyên khoa
                    </p>
                    <p className="text-slate-700 font-medium">
                      {doctor.specialty}
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">
                    payments
                  </span>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">
                      Phí khám
                    </p>
                    <p className="text-primary font-bold">
                      {formatPrice(doctor.price)}
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
