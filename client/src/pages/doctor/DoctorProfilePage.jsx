/**
 * ============================================================
 * TRANG: Hồ sơ Cá nhân & Thông tin Chuyên môn (Bác sĩ)
 * Đường dẫn: /doctor/profile
 * ============================================================
 *
 * Chức năng chính:
 * 1. Hiển thị thông tin cá nhân: Họ tên, Email, SĐT, Giới tính.
 * 2. Thông tin chuyên môn (ReadOnly): Học vị, Chuyên khoa, Giá khám.
 * 3. Chỉnh sửa mô tả:
 *    - Mô tả ngắn: Giới thiệu nhanh (Slogan hoặc tóm tắt).
 *    - Mô tả chi tiết: Quá trình công tác, kinh nghiệm, chuyên sâu.
 * 4. Quản lý Ảnh đại diện (Avatar):
 *    - Tải ảnh mới lên Server thông qua authService.capNhatAvatar.
 *    - Cập nhật Real-time vào Store để đồng bộ toàn ứng dụng.
 *
 * Dữ liệu: Lấy từ useAuthStore (Thông tin đăng nhập tập trung).
 * ============================================================
 */
import { useState } from "react";
import useAuthStore from "../../stores/useAuthStore";
import { authService } from "../../services/authService";
import { toast } from "react-toastify";

// Các thành phần UI nhỏ để tái sử dụng (Static Only)
const InfoItem = ({ label, value, icon }) => (
  <div className="flex flex-col space-y-2 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 transition-all hover:border-primary/20 hover:bg-white group">
    <div className="flex items-center gap-2">
      {icon && (
        <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-primary transition-colors">
          {icon}
        </span>
      )}
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
        {label}
      </label>
    </div>
    <p className="text-sm font-bold text-slate-700 ml-0.5">{value || "---"}</p>
  </div>
);

function DoctorProfilePage() {
  // Lấy dữ liệu người dùng từ Zustand Store
  const { user, setUser } = useAuthStore();
  const doctor = user?.bacSi;
  const account = user;

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  /**
   * XỬ LÝ THAY ĐỔI ẢNH ĐẠI DIỆN (Avatar Upload)
   */
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra dung lượng file (Giới hạn 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh quá lớn! Vui lòng chọn ảnh có dung lượng dưới 5MB.");
      return;
    }

    const formDataToUpload = new FormData();
    formDataToUpload.append("avatar", file);

    setIsUploadingAvatar(true);
    try {
      // 1. Gửi file lên Server
      const res = await authService.capNhatAvatar(formDataToUpload);

      // 2. Cập nhật URL ảnh mới vào Store để các Component khác (Sidebar, Header) cũng thay đổi theo
      setUser({ ...user, anhDaiDien: res.anhDaiDien });

      toast.success("Cập nhật ảnh đại diện thành công!");
    } catch (err) {
      toast.error(err.message || "Không thể tải ảnh lên vào lúc này.");
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = null; // Reset input file để có thể chọn lại cùng 1 file nếu muốn
    }
  };

  /**
   * Helper: Xây dựng URL ảnh đầy đủ từ Path tương đối
   */
  const getAvatarUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${url}`;
  };

  // Xác định URL ảnh sẽ hiển thị (Ưu tiên ảnh trong User -> Bác Sĩ -> Ảnh mặc định)
  const avatarUrl =
    getAvatarUrl(user?.anhDaiDien) ||
    getAvatarUrl(doctor?.anhDaiDien) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor?.tenBacSi || "BS")}&size=128&background=1f89e5&color=fff`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
      {/* CỘT TRÁI: AVATAR & THÔNG TIN CHUNG (CARD TÓM TẮT) */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden sticky top-6">
          <div className="h-40 bg-linear-to-br from-primary/10 to-transparent relative">
            <div className="absolute top-6 right-6 flex gap-2">
              <span className="px-3 py-1 bg-white/80 backdrop-blur-md rounded-full text-[9px] font-black text-primary uppercase tracking-widest border border-white/50">
                Active
              </span>
            </div>
          </div>

          <div className="px-8 pb-10 -mt-20 text-center">
            <div className="relative inline-block group">
              <label className="relative cursor-pointer block">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={isUploadingAvatar}
                />
                <div className="size-40 rounded-[2.5rem] p-1.5 bg-white shadow-2xl border border-slate-50 transition-transform group-hover:scale-105 duration-500">
                  <img
                    src={avatarUrl}
                    alt={doctor?.tenBacSi}
                    className="size-full rounded-[2.2rem] object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor?.tenBacSi || "BS")}&size=160&background=1f89e5&color=fff`;
                    }}
                  />
                </div>

                {/* Overlay upload hiện đại */}
                <div
                  className={`absolute inset-0 rounded-[2.5rem] flex flex-col items-center justify-center transition-all bg-black/40 text-white backdrop-blur-[2px] ${
                    isUploadingAvatar
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {isUploadingAvatar ? (
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-4xl font-bold">
                        progress_activity
                      </span>
                      <p className="text-[10px] font-black uppercase tracking-tighter">
                        Updating...
                      </p>
                    </div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-4xl font-light">
                        photo_camera
                      </span>
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-widest">
                        Đổi ảnh
                      </p>
                    </>
                  )}
                </div>
              </label>
            </div>

            <div className="mt-8 space-y-2">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                {doctor?.hocViChucDanh} {doctor?.tenBacSi}
              </h1>
              <div className="flex items-center justify-center gap-2">
                <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                <p className="text-primary font-black text-[11px] uppercase tracking-[0.2em]">
                  {doctor?.chuyenKhoa?.tenChuyenKhoa || "Chuyên gia y tế"}
                </p>
              </div>
            </div>

            {/* Price badge (Giản dị, tinh tế) */}
            <div className="mt-10 p-6 rounded-3xl bg-slate-50/50 border border-dashed border-slate-200 flex flex-col items-center gap-1 group transition-all hover:bg-emerald-50/30 hover:border-emerald-200">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-emerald-600 transition-colors">
                Phí khám công khai
              </p>
              <p className="text-2xl font-black text-slate-800 group-hover:text-emerald-700 transition-colors">
                {doctor?.giaKham
                  ? Number(doctor.giaKham).toLocaleString("vi-VN")
                  : "0"}
                <span className="text-sm ml-1 font-medium text-slate-400">
                  VNĐ
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CỘT PHẢI: CHI TIẾT HỒ SƠ (DẠNG RESUME/PROFILE) */}
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 sm:p-12 space-y-12">
          {/* Section: Thông tin Liên hệ & Định danh */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined font-bold">
                  badge
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">
                Thông tin Cơ bản & Liên hệ
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem
                label="Họ và Tên"
                value={doctor?.tenBacSi}
                icon="person"
              />
              <InfoItem label="Email Liên hệ" value={account?.email} icon="alternate_email" />
              <InfoItem label="Số điện thoại" value={doctor?.soDienThoai} icon="call" />
              <InfoItem label="Giới tính" value={doctor?.gioiTinh === 1 ? "Nam" : doctor?.gioiTinh === 2 ? "Nữ" : "Khác"} icon="wc" />
            </div>
          </section>

          <div className="h-px bg-slate-100" />

          {/* Section: Chuyên môn & Học vấn */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined font-bold">
                  school
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">
                Học vấn & Chuyên môn
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem label="Học vị / Chức danh" value={doctor?.hocViChucDanh} icon="clinical_notes" />
              <InfoItem label="Chuyên khoa" value={doctor?.chuyenKhoa?.tenChuyenKhoa} icon="stethoscope" />
            </div>
          </section>

          <div className="h-px bg-slate-100" />

          {/* Section: Mô tả & Tiểu sử */}
          <section className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined font-bold">
                  format_quote
                </span>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Lời chào & Châm ngôn
                </h3>
              </div>
              <p className="text-lg font-bold text-slate-700 italic leading-relaxed pl-4 border-l-4 border-primary/20">
                "{doctor?.moTaNgan || "Xin chào, tôi là bác sĩ chăm sóc sức khỏe của bạn."}"
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined font-bold">
                  history_edu
                </span>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Quá trình Công tác & Kinh nghiệm
                </h3>
              </div>
              <div className="p-8 rounded-4xl bg-slate-50/50 border border-slate-100 text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                {doctor?.moTaChiTiet || "Hiện chưa có thông tin kinh nghiệm chi tiết được cập nhật."}
              </div>
            </div>
          </section>

          {/* Footer note: Tinh tế & Giản dị */}
          <div className="pt-10 flex items-center justify-center gap-3 opacity-30">
            <div className="h-px w-10 bg-slate-300" />
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
              Medical Professional Profile
            </p>
            <div className="h-px w-10 bg-slate-300" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorProfilePage;
