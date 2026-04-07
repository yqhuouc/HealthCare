/**
 * ============================================================
 * TRANG: Chi tiết bác sĩ (Bệnh nhân)
 * Đường dẫn: /doctors/:id
 * ============================================================
 *
 * Chức năng:
 * - Hiển thị hồ sơ chi tiết 1 bác sĩ (avatar, tên, chuyên khoa, học vị, giá)
 * - Breadcrumb điều hướng: Trang chủ > Bác sĩ > [Tên BS]
 * - Card thông tin chính + nút "Đặt lịch khám" → BookingPage
 * - Phần giới thiệu (mô tả) + sidebar thông tin tóm tắt
 *
 * Dữ liệu: API /api/bac-si/:id
 * ============================================================
 */
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { doctorService } from "../../services/doctorService";
import useAuthStore from "../../stores/useAuthStore";

/** Hàm format giá tiền sang dạng VND: 150000 → "150.000đ" */
const formatPrice = (price) => Number(price).toLocaleString("vi-VN") + "đ";

export default function DoctorDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await doctorService.getById(id);
        setDoctor(res.data);
      } catch {
        setDoctor(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  // Loading
  if (loading) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 text-center py-20">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">
            progress_activity
          </span>
          <p className="mt-4 text-slate-500">Đang tải thông tin bác sĩ...</p>
        </div>
      </section>
    );
  }

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

  const specialtyName = doctor.chuyenKhoa?.tenChuyenKhoa || "Chưa phân khoa";
  const avatarUrl = doctor.taiKhoan?.anhDaiDien;

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
          <span className="text-slate-800 font-medium">{doctor.tenBacSi}</span>
        </nav>

        {/* Card thông tin chính của bác sĩ */}
        <div className="bg-white p-8 rounded-lg shadow mb-10">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Avatar */}
            <div className="w-40 h-40 rounded-full border-4 border-primary/20 bg-primary/5 flex items-center justify-center overflow-hidden shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={doctor.tenBacSi}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-7xl text-primary/40">person</span>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-slate-800">
                {doctor.tenBacSi}
              </h1>

              <p className="text-primary font-medium mt-1">
                {specialtyName}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 mt-4 text-sm text-slate-600">
                {doctor.hocViChucDanh && (
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-primary">
                      school
                    </span>
                    {doctor.hocViChucDanh}
                  </span>
                )}

                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-primary">
                    medical_services
                  </span>
                  {specialtyName}
                </span>
              </div>

              {doctor.moTaNgan && (
                <p className="text-slate-600 mt-4 text-sm leading-relaxed italic border-l-4 border-primary pl-4 md:text-left">
                  {doctor.moTaNgan}
                </p>
              )}

              {doctor.giaKham && (
                <p className="text-primary font-bold text-xl mt-4">
                  {formatPrice(doctor.giaKham)}
                </p>
              )}

              {/* Nút đặt lịch: Ẩn nếu là Bác sĩ/Admin */}
              {(!user || user.vaiTro === "benh_nhan") ? (
                <Link
                  to={`/booking/${doctor.id}`}
                  className="inline-flex items-center gap-2 mt-6 px-8 py-3 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span className="material-symbols-outlined text-xl">
                    calendar_month
                  </span>
                  Đặt lịch khám ngay
                </Link>
              ) : (
                <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 inline-flex items-center gap-3 text-slate-400">
                  <span className="material-symbols-outlined">info</span>
                  <p className="text-[10px] font-black uppercase tracking-tight">Tài khoản nhân viên không thể đặt lịch khám</p>
                </div>
              )}
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
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {doctor.moTaChiTiet || "Thông tin chi tiết về bác sĩ sẽ được cập nhật sớm."}
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
                {doctor.hocViChucDanh && (
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-0.5">
                      school
                    </span>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide">
                        Học vấn
                      </p>
                      <p className="text-slate-700 font-medium">
                        {doctor.hocViChucDanh}
                      </p>
                    </div>
                  </li>
                )}

                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">
                    medical_services
                  </span>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">
                      Chuyên khoa
                    </p>
                    <p className="text-slate-700 font-medium">
                      {specialtyName}
                    </p>
                  </div>
                </li>

                {doctor.giaKham && (
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-0.5">
                      payments
                    </span>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide">
                        Phí khám
                      </p>
                      <p className="text-primary font-bold">
                        {formatPrice(doctor.giaKham)}
                      </p>
                    </div>
                  </li>
                )}

                {doctor.taiKhoan?.email && (
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-0.5">
                      mail
                    </span>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide">
                        Email
                      </p>
                      <p className="text-slate-700 font-medium">
                        {doctor.taiKhoan.email}
                      </p>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
