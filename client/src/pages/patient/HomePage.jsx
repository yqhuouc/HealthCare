/**
 * ============================================================
 * TRANG: Trang chủ (Home)
 * Đường dẫn: /
 * ============================================================
 *
 * Chức năng:
 * - Hero section với tiêu đề, mô tả, CTA
 * - Section chuyên khoa phổ biến (fetch API /api/chuyen-khoa)
 * - Section bác sĩ nổi bật (fetch API /api/bac-si?limit=4)
 *
 * Dữ liệu: API /api/chuyen-khoa, /api/bac-si
 * ============================================================
 */
import { Link } from "react-router-dom";
import { formatPrice } from "../../utils/formatters";
import { useSpecialties } from "../../hooks/queries/useSpecialtyQueries";
import { useDoctors } from "../../hooks/queries/useDoctorQueries";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const DEFAULT_ICON = "medical_services";

function HomePage() {
  // TanStack Query: Lấy chuyên khoa + bác sĩ (auto-parallel)
  const { data: specRes, isLoading: loadingSpec } = useSpecialties();
  const { data: docRes, isLoading: loadingDoc } = useDoctors({ limit: 4 });
  const specialties = specRes?.data || [];
  const doctors = docRes?.data || [];
  const loading = loadingSpec || loadingDoc;

  return (
    <div>
      <HeroSection />
      <SpecialtiesSection specialties={specialties} loading={loading} />
      <FeaturedDoctorsSection doctors={doctors} loading={loading} />
    </div>
  );
}

/* ------------------------------------------------------------
   Hero Section — Banner chính với tiêu đề, mô tả, CTA và ảnh
   ------------------------------------------------------------ */

function HeroSection() {
  return (
    <section className="relative overflow-hidden py-12 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Cột trái: Tiêu đề + mô tả + nút hành động */}
          <div className="space-y-8 flex flex-col justify-center">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl lg:text-[3.25rem] xl:text-6xl font-black leading-tight tracking-tight text-slate-900">
                Đặt lịch khám bệnh <span className="text-primary">nhanh chóng</span> và tiện lợi
              </h2>
              <p className="text-lg text-slate-600 max-w-xl">
                Kết nối với đội ngũ bác sĩ uy tín và đặt lịch khám chỉ trong vài phút. Giải pháp y tế hiện đại ngay
                trong tầm tay bạn.
              </p>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                to="/specialties"
                className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition-transform hover:-translate-y-1"
              >
                Đặt lịch ngay
              </Link>
              <Link
                to="/doctors"
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 px-8 py-4 rounded-lg font-bold text-lg shadow-sm transition-all"
              >
                Tìm bác sĩ
              </Link>
            </div>
          </div>

          {/* Cột phải: Ảnh minh họa đội ngũ y tế */}
          <div className="relative flex items-center">
            {/* Hiệu ứng blur trang trí phía sau ảnh */}
            <div className="absolute -z-10 top-1/2 -translate-y-1/2 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
              <img
                alt="Đội ngũ y tế chuyên nghiệp"
                className="w-full h-auto object-contain"
                src="/images/hero-team.jpg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------
   Specialty Card — Card hiển thị 1 chuyên khoa
   ------------------------------------------------------------ */

function SpecialtyCard({ specialty }) {
  return (
    <div className="group bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <div className="w-14 h-14 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
        <span className="material-symbols-outlined text-3xl">{specialty.icon || DEFAULT_ICON}</span>
      </div>
      <h4 className="text-xl font-bold mb-2">{specialty.tenChuyenKhoa}</h4>
      <p className="text-slate-500 text-sm mb-4 line-clamp-2">
        {specialty.moTaChuyenKhoa || "Chuyên khoa chất lượng cao."}
      </p>
      <Link
        to={`/specialties/${specialty.id}`}
        className="text-primary font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all"
      >
        Xem chi tiết <span className="material-symbols-outlined text-sm">arrow_forward</span>
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------
   Specialties Section — Lưới 3 cột hiển thị các chuyên khoa
   ------------------------------------------------------------ */

function SpecialtiesSection({ specialties, loading }) {
  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề section + gạch chân */}
        <div className="mb-12">
          <h3 className="text-3xl font-bold text-slate-900">Chuyên khoa phổ biến</h3>
          <div className="h-1.5 w-20 bg-primary mt-4 rounded-full"></div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="size-10" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialties.slice(0, 6).map((spec) => (
              <SpecialtyCard key={spec.id} specialty={spec} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------
   Doctor Card — Card hiển thị 1 bác sĩ
   ------------------------------------------------------------ */

function DoctorCard({ doctor }) {
  const getAvatarUrl = (url) => {
    if (!url) return "/images/doctor-placeholder.jpg";
    if (url.startsWith("http")) return url;
    return `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${url}`;
  };
  const avatarUrl = getAvatarUrl(doctor.taiKhoan?.anhDaiDien);
  const specialtyName = doctor.chuyenKhoa?.tenChuyenKhoa || "Chưa phân khoa";

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all text-center p-6">
      {/* Avatar bác sĩ — hình tròn với viền */}
      <div className="relative w-32 h-32 mx-auto mb-4">
        <div className="w-full h-full rounded-full border-4 border-primary/20 bg-primary/5 flex items-center justify-center overflow-hidden">
          {doctor.taiKhoan?.anhDaiDien ? (
            <img alt={doctor.tenBacSi} className="w-full h-full object-cover" src={avatarUrl} />
          ) : (
            <span className="material-symbols-outlined text-5xl text-primary/40">person</span>
          )}
        </div>
      </div>
      <h5 className="text-lg font-bold text-slate-900">{doctor.tenBacSi}</h5>
      <p className="text-primary text-sm font-medium mb-1">{specialtyName}</p>
      {doctor.hocViChucDanh && <p className="text-slate-500 text-xs mb-3">{doctor.hocViChucDanh}</p>}
      {doctor.giaKham && <p className="text-primary font-bold mb-3">{formatPrice(doctor.giaKham)}</p>}
      <Link
        to={`/doctors/${doctor.id}`}
        className="block w-full py-2 bg-slate-50 hover:bg-primary hover:text-white text-primary rounded-lg text-sm font-bold transition-all border border-primary/10"
      >
        Xem chi tiết
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------
   Featured Doctors Section — Lưới 4 cột hiển thị bác sĩ nổi bật
   ------------------------------------------------------------ */

function FeaturedDoctorsSection({ doctors, loading }) {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header: Tiêu đề + link xem tất cả */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <h3 className="text-3xl font-bold text-slate-900">Bác sĩ nổi bật</h3>
            <div className="h-1.5 w-20 bg-primary mt-4 rounded-full"></div>
          </div>
          <Link to="/doctors" className="text-primary font-bold hover:underline hidden sm:block">
            Xem tất cả bác sĩ
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="size-10" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {doctors.map((doc) => (
              <DoctorCard key={doc.id} doctor={doc} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default HomePage;
