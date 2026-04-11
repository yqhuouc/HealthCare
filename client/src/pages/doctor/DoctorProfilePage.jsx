/**
 * ============================================================
 * TRANG: HỒ SƠ NĂNG LỰC BÁC SĨ (PROFILE)
 * Đường dẫn: /doctor/profile
 * ============================================================
 * 
 * CHỨC NĂNG CHÍNH:
 * 1. Hiển thị thông tin định danh (Họ tên, Học vị, Chuyên khoa).
 * 2. Hiển thị thông tin liên hệ (Email, SĐT).
 * 3. Hiển thị tiểu sử công tác và kinh nghiệm chuyên môn.
 * 4. Cập nhật Ảnh đại diện (Avatar).
 * 
 * PHONG CÁCH THIẾT KẾ:
 * - Giao diện "Medical Resume" (Sơ yếu lý lịch y khoa) thanh lịch.
 * - Sử dụng các khối thông tin tách biệt bằng viền (Border-2) đồng nhất.
 * - Hạn chế các hiệu ứng bo góc quá lớn hoặc đổ bóng phức tạp.
 * ============================================================
 */

import { useState } from "react";
import useAuthStore from "../../stores/useAuthStore";
import { authService } from "../../services/authService";
import { toast } from "react-toastify";

/**
 * COMPONENT CON: Hiển thị một mục thông tin đơn lẻ
 */
const ProfileDetailItem = ({ label, value, icon }) => (
  <div className="flex flex-col gap-2 p-5 bg-white border-2 border-slate-100 rounded-2xl hover:border-primary/20 transition-all group">
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-slate-300 text-lg group-hover:text-primary transition-colors">{icon}</span>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-sm font-bold text-slate-700 ml-7">{value || "Chưa cập nhật"}</p>
  </div>
);

function DoctorProfilePage() {
  const { user, setUser } = useAuthStore();
  const doctor = user?.bacSi;
  const [uploading, setUploading] = useState(false);

  /**
   * 1. HÀM XỬ LÝ CẬP NHẬT ẢNH (AVATAR)
   */
  const handleAvatarUpdate = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Ràng buộc 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.warning("Kích thước ảnh không được vượt quá 5MB.");
      return;
    }

    const fd = new FormData();
    fd.append("avatar", file);

    setUploading(true);
    try {
      const res = await authService.capNhatAvatar(fd);
      setUser({ ...user, anhDaiDien: res.anhDaiDien }); // Cập nhật ngay vào Store
      toast.success("Đã thay đổi ảnh đại diện thành công!");
    } catch (err) {
      toast.error("Lỗi khi tải ảnh lên, vui lòng thử lại sau.", err);
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  /**
   * 2. HÀM HỖ TRỢ XỬ LÝ URL ẢNH
   */
  const getFullAvatarPath = (path) => {
    if (!path) return null;
    return path.startsWith("http") ? path : `${import.meta.env.VITE_API_URL}${path}`;
  };

  const finalAvatar = getFullAvatarPath(user?.anhDaiDien) || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor?.tenBacSi || "BS")}&size=200&background=f8fafc&color=94a3b8`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20 animate-in fade-in duration-700 p-4 sm:p-0">
      
      {/* --- CỘT TRÁI (4/12): AVATAR & STATS --- */}
      <div className="lg:col-span-4 space-y-6">
        <section className="bg-white border-2 border-slate-100 rounded-4xl p-8 text-center shadow-sm">
          {/* Avatar Area */}
          <div className="relative inline-block group">
            <div className="size-44 rounded-3xl overflow-hidden border-4 border-slate-50 shadow-inner bg-slate-100">
               <img src={finalAvatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            
            {/* Overlay thay đổi ảnh */}
            <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white rounded-3xl opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm">
              <input type="file" className="hidden" onChange={handleAvatarUpdate} accept="image/*" disabled={uploading} />
              {uploading ? (
                <div className="size-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-4xl mb-1">photo_camera</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Thay đổi ảnh</span>
                </>
              )}
            </label>
          </div>

          <div className="mt-6 space-y-2">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{doctor?.tenBacSi}</h1>
            <p className="text-primary font-bold text-[11px] uppercase tracking-widest">{doctor?.hocViChucDanh || "Bác sĩ Chuyên khoa"}</p>
          </div>

          <div className="mt-8 p-6 bg-slate-50 rounded-2xl border-2 border-slate-100/50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Chi phí phiên khám</span>
            <p className="text-2xl font-bold text-slate-800">
              {Number(doctor?.giaKham || 0).toLocaleString("vi-VN")}
              <span className="text-xs ml-1 text-slate-400 font-medium lowercase">vnđ / lượt</span>
            </p>
          </div>
        </section>
      </div>

      {/* --- CỘT PHẢI (8/12): CHI TIẾT HỒ SƠ --- */}
      <div className="lg:col-span-8 space-y-8">
        <section className="bg-white border-2 border-slate-100 rounded-4xl p-8 sm:p-12 space-y-12">
          
          {/* Thông tin hành chính */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">account_box</span>
              <h2 className="font-bold text-slate-800 tracking-tight uppercase text-xs">Thông tin hành chính</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ProfileDetailItem label="Họ và tên" value={doctor?.tenBacSi} icon="person" />
              <ProfileDetailItem label="Địa chỉ Email" value={user?.email} icon="alternate_email" />
              <ProfileDetailItem label="Số điện thoại" value={doctor?.soDienThoai} icon="smartphone" />
              <ProfileDetailItem label="Giới tính" value={doctor?.gioiTinh === 1 ? "Nam" : "Nữ"} icon="wc" />
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Chuyên môn */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">school</span>
              <h2 className="font-bold text-slate-800 tracking-tight uppercase text-xs">Trình độ & Chuyên môn</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ProfileDetailItem label="Học vị cao nhất" value={doctor?.hocViChucDanh} icon="clinical_notes" />
              <ProfileDetailItem label="Chuyên khoa trực thuộc" value={doctor?.chuyenKhoa?.tenChuyenKhoa} icon="stethoscope" />
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Tiểu sử kinh nghiệm */}
          <div className="space-y-10">
            <div className="space-y-4">
               <div className="flex items-center gap-2">
                 <span className="material-symbols-outlined text-primary text-lg">format_quote</span>
                 <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lời chào nghề nghiệp</h3>
               </div>
               <p className="text-lg font-bold text-slate-700 italic border-l-4 border-primary/20 pl-6 leading-relaxed">
                 "{doctor?.moTaNgan || "Tận tâm đồng hành vì sức khỏe của bạn."}"
               </p>
            </div>

            <div className="space-y-4">
               <div className="flex items-center gap-2">
                 <span className="material-symbols-outlined text-primary text-lg">history_edu</span>
                 <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kinh nghiệm & Quá trình công tác</h3>
               </div>
               <div className="bg-slate-50 border-2 border-slate-100/50 rounded-3xl p-8 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                  {doctor?.moTaChiTiet || "Dữ liệu đang được bác sĩ cập nhật..."}
               </div>
            </div>
          </div>

          {/* Copyright note */}
          <div className="pt-10 flex items-center justify-center gap-4 opacity-20">
            <div className="h-px w-10 bg-slate-400" />
            <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-slate-500">Medical Professional Profile</span>
            <div className="h-px w-10 bg-slate-400" />
          </div>
        </section>
      </div>
    </div>
  );
}

export default DoctorProfilePage;
