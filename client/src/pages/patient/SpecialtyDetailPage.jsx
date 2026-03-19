/**
 * ============================================================
 * TRANG: Chi tiết chuyên khoa (Bệnh nhân)
 * Đường dẫn: /specialties/:id
 * ============================================================
 *
 * Chức năng:
 * - Hiển thị thông tin chi tiết của 1 chuyên khoa cụ thể
 * - Banner hero với hình nền, badge, mô tả
 * - Giới thiệu chuyên khoa + trang thiết bị (nếu có)
 * - Sidebar cam kết chất lượng + nút CTA đặt lịch
 * - Danh sách bác sĩ thuộc chuyên khoa (lọc theo specialtyId)
 * - Xử lý trường hợp không tìm thấy (404 fallback)
 *
 * Params:
 * - id (URL param): ID của chuyên khoa, dùng useParams() để lấy
 *
 * Dữ liệu: SPECIALTIES, DOCTORS từ mockDoctors.js
 * ============================================================
 */
import { useParams, Link } from "react-router-dom";
import { SPECIALTIES, DOCTORS } from "../../data/mockDoctors";

/** Hàm format giá tiền sang dạng VND: 150000 → "150.000đ" */
const formatPrice = (price) => price.toLocaleString("vi-VN") + "đ";

/** Danh sách cam kết hiển thị ở sidebar */
const COMMITMENTS = [
  "Thời gian chờ khám dưới 15 phút khi đặt lịch trước.",
  "Bác sĩ trực tiếp tư vấn 1:1 kỹ lưỡng.",
  "Minh bạch về chi phí và phác đồ điều trị.",
  "Hệ thống quản lý bệnh án điện tử bảo mật.",
];

export default function SpecialtyDetailPage() {
  const { id } = useParams();
  const specialty = SPECIALTIES.find((s) => s.id === Number(id));

  // Lấy danh sách bác sĩ thuộc chuyên khoa này
  const doctors = DOCTORS.filter((d) => d.specialtyId === Number(id));

  if (!specialty) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-300 block mb-4">
          search_off
        </span>
        <h2 className="text-2xl font-bold text-slate-700 mb-2">
          Không tìm thấy chuyên khoa
        </h2>
        <p className="text-slate-500 mb-6">
          Chuyên khoa bạn tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <Link
          to="/specialties"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          Quay lại danh sách chuyên khoa
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/" className="hover:text-primary transition">
          Trang chủ
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <Link to="/specialties" className="hover:text-primary transition">
          Chuyên khoa
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-slate-900 font-medium">{specialty.name}</span>
      </nav>

      {/* Hero banner với hình nền + overlay */}
      <section className="relative rounded-xl overflow-hidden mb-12 shadow-sm">
        <div
          className="h-80 w-full bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.2)), url('${specialty.image}')`,
          }}
        />
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12 text-white max-w-2xl">
          <span className="bg-primary px-3 py-1 rounded-full text-xs font-bold w-fit mb-4">
            CHUYÊN KHOA MŨI NHỌN
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {specialty.name}
          </h2>
          <p className="text-slate-100 text-lg leading-relaxed mb-6">
            {specialty.description}
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg">
              <span className="material-symbols-outlined text-primary">
                verified
              </span>
              <span className="text-sm">Tiêu chuẩn quốc tế</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg">
              <span className="material-symbols-outlined text-primary">
                biotech
              </span>
              <span className="text-sm">Máy móc hiện đại</span>
            </div>
          </div>
        </div>
      </section>

      {/* Thông tin chi tiết + sidebar cam kết */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <div className="lg:col-span-2 space-y-6">
          {/* Giới thiệu chuyên khoa */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                info
              </span>
              Giới thiệu chuyên khoa
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {specialty.detailDescription}
            </p>
          </div>

          {/* Trang thiết bị */}
          {specialty.equipment && specialty.equipment.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {specialty.equipment.map((equip, idx) => (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-xl border border-slate-100 flex gap-4"
                >
                  <div className="bg-primary/10 p-3 rounded-lg h-fit text-primary">
                    <span className="material-symbols-outlined">
                      {equip.icon}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">{equip.name}</h4>
                    <p className="text-sm text-slate-500">{equip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: cam kết + CTA đặt lịch */}
        <div className="bg-primary text-white p-8 rounded-xl shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-6">Cam kết của chúng tôi</h3>
            <ul className="space-y-4">
              {COMMITMENTS.map((text, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="material-symbols-outlined mt-0.5">
                    check_circle
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/doctors"
              className="block w-full mt-8 bg-white text-primary font-bold py-3 rounded-lg hover:bg-slate-50 transition-colors text-center"
            >
              Đặt lịch tư vấn ngay
            </Link>
          </div>
          {/* Icon trang trí nền */}
          <div className="absolute -bottom-10 -right-10 opacity-20">
            <span className="material-symbols-outlined text-[160px]">
              medical_information
            </span>
          </div>
        </div>
      </section>

      {/* Danh sách bác sĩ thuộc chuyên khoa */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Đội ngũ Bác sĩ Chuyên khoa
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Các bác sĩ giàu kinh nghiệm, tận tâm với nghề
            </p>
          </div>
        </div>

        {doctors.length === 0 ? (
          <p className="text-slate-500 text-center py-10">
            Chưa có bác sĩ nào trong chuyên khoa này.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-white rounded-xl overflow-hidden border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex gap-4 items-start mb-4">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-lg text-slate-900">
                        {doctor.name}
                      </h4>
                      <p className="text-sm text-primary font-medium mb-1">
                        {doctor.specialty}
                      </p>
                      <div className="flex items-center gap-1 text-sm">
                        <span className="material-symbols-outlined text-amber-400 text-base">
                          star
                        </span>
                        <span className="font-semibold text-slate-700">
                          {doctor.rating}
                        </span>
                        <span className="text-slate-400 text-xs ml-1">
                          ({doctor.totalReviews} đánh giá)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Giá khám */}
                  <div className="flex items-center justify-between py-3 border-t border-slate-100">
                    <span className="text-sm text-slate-500">Giá khám:</span>
                    <span className="font-bold text-primary">
                      {formatPrice(doctor.price)}
                    </span>
                  </div>

                  {/* Nút hành động */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <Link
                      to={`/doctors/${doctor.id}`}
                      className="py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition text-center"
                    >
                      Xem chi tiết
                    </Link>
                    <Link
                      to={`/booking/${doctor.id}`}
                      className="py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary/90 transition text-center"
                    >
                      Đặt lịch ngay
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Link xem tất cả bác sĩ */}
        <div className="mt-10 text-center">
          <Link
            to="/doctors"
            className="text-primary font-medium hover:underline inline-flex items-center gap-2"
          >
            Xem tất cả bác sĩ chuyên khoa
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
