import { Link } from "react-router-dom";

/* ============================================================
   DỮ LIỆU TĨNH — sẽ thay bằng API khi kết nối backend
   ============================================================ */

/** Danh sách chuyên khoa hiển thị trên trang chủ */
const SPECIALTIES = [
  {
    icon: "favorite",
    name: "Nội khoa",
    description: "Khám tổng quát nội tạng và các bệnh lý nội khoa cơ bản.",
  },
  {
    icon: "child_care",
    name: "Nhi khoa",
    description: "Chăm sóc sức khỏe toàn diện và tiêm chủng cho trẻ em.",
  },
  {
    icon: "pregnant_woman",
    name: "Sản phụ khoa",
    description: "Sức khỏe phụ nữ, khám thai sản và tư vấn tiền hôn nhân.",
  },
  {
    icon: "face",
    name: "Da liễu",
    description: "Điều trị các bệnh lý về da và tư vấn chăm sóc da thẩm mỹ.",
  },
  {
    icon: "hearing",
    name: "Tai Mũi Họng",
    description: "Khám và điều trị các bệnh lý tai, mũi và họng chuyên sâu.",
  },
  {
    icon: "dentistry",
    name: "Răng Hàm Mặt",
    description: "Chăm sóc răng miệng, nhổ răng và phục hình răng thẩm mỹ.",
  },
];

/** Danh sách bác sĩ nổi bật hiển thị trên trang chủ */
const FEATURED_DOCTORS = [
  {
    name: "BS. Nguyễn Văn A",
    specialty: "Chuyên khoa Nội",
    experience: "15 năm kinh nghiệm",
    image: "/images/doctor-1.jpg",
  },
  {
    name: "BS. Trần Thị B",
    specialty: "Chuyên khoa Sản",
    experience: "10 năm kinh nghiệm",
    image: "/images/doctor-2.jpg",
  },
  {
    name: "BS. Lê Hoàng C",
    specialty: "Nhi khoa",
    experience: "12 năm kinh nghiệm",
    image: "/images/doctor-3.jpg",
  },
  {
    name: "BS. Phạm Minh D",
    specialty: "Da liễu",
    experience: "8 năm kinh nghiệm",
    image: "/images/doctor-4.jpg",
  },
];

/* ============================================================
   TRANG CHỦ — Gồm 3 section: Hero, Chuyên khoa, Bác sĩ
   ============================================================ */

function HomePage() {
  return (
    <div>
      <HeroSection />
      <SpecialtiesSection />
      <FeaturedDoctorsSection />
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
                Đặt lịch khám bệnh{" "}
                <span className="text-primary">nhanh chóng</span> và tiện lợi
              </h2>
              <p className="text-lg text-slate-600 max-w-xl">
                Kết nối với đội ngũ bác sĩ uy tín và đặt lịch khám chỉ trong vài
                phút. Giải pháp y tế hiện đại ngay trong tầm tay bạn.
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
   Props: icon (Material Symbols), name, description
   ------------------------------------------------------------ */

function SpecialtyCard({ icon, name, description }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow group border border-slate-100">
      {/* Icon chuyên khoa — đổi màu khi hover */}
      <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <h4 className="text-xl font-bold mb-2">{name}</h4>
      <p className="text-slate-500 text-sm mb-4">{description}</p>
      <Link
        to="/specialties"
        className="text-primary font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all"
      >
        Xem chi tiết{" "}
        <span className="material-symbols-outlined text-sm">arrow_forward</span>
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------
   Specialties Section — Lưới 3 cột hiển thị các chuyên khoa
   ------------------------------------------------------------ */

function SpecialtiesSection() {
  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề section + gạch chân */}
        <div className="mb-12">
          <h3 className="text-3xl font-bold text-slate-900">
            Chuyên khoa phổ biến
          </h3>
          <div className="h-1.5 w-20 bg-primary mt-4 rounded-full"></div>
        </div>

        {/* Grid chuyên khoa: 1 cột mobile → 2 cột tablet → 3 cột desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SPECIALTIES.map((spec) => (
            <SpecialtyCard key={spec.name} {...spec} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------
   Doctor Card — Card hiển thị 1 bác sĩ
   Props: name, specialty, experience, image
   ------------------------------------------------------------ */

function DoctorCard({ name, specialty, experience, image }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all text-center p-6">
      {/* Avatar bác sĩ — hình tròn với viền */}
      <div className="relative w-32 h-32 mx-auto mb-4">
        <img
          alt={name}
          className="w-full h-full object-cover rounded-full border-4 border-primary/20"
          src={image}
        />
      </div>
      <h5 className="text-lg font-bold text-slate-900">{name}</h5>
      <p className="text-primary text-sm font-medium mb-1">{specialty}</p>
      <p className="text-slate-500 text-xs mb-4">{experience}</p>
      <Link
        to="/doctors"
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

function FeaturedDoctorsSection() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header: Tiêu đề + link xem tất cả */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <h3 className="text-3xl font-bold text-slate-900">
              Bác sĩ nổi bật
            </h3>
            <div className="h-1.5 w-20 bg-primary mt-4 rounded-full"></div>
          </div>
          <Link
            to="/doctors"
            className="text-primary font-bold hover:underline hidden sm:block"
          >
            Xem tất cả bác sĩ
          </Link>
        </div>

        {/* Grid bác sĩ: 1 cột mobile → 2 cột tablet → 4 cột desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURED_DOCTORS.map((doc) => (
            <DoctorCard key={doc.name} {...doc} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default HomePage;
