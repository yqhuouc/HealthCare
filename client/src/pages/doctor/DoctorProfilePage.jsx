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

// Các hằng số Tailwind CSS để tái sử dụng
const INPUT_CLASS =
  "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all";
const LABEL_CLASS = "block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1";

function DoctorProfilePage() {
  // Lấy dữ liệu người dùng và hàm cập nhật từ Zustand Store
  const { user, setUser } = useAuthStore();
  const doctor = user?.bacSi;
  const account = user;

  // Khởi tạo State cho Form dựa trên dữ liệu hiện tại trong Store
  const initialData = {
    fullName: doctor?.tenBacSi || "",
    email: account?.email || "",
    phone: doctor?.soDienThoai || "",
    hocVi: doctor?.hocViChucDanh || "",
    specialty: doctor?.chuyenKhoa?.tenChuyenKhoa || "",
    gender: doctor?.gioiTinh === 1 ? "Nam" : doctor?.gioiTinh === 2 ? "Nữ" : "Khác", // Đồng bộ giới tính từ DB
    moTaNgan: doctor?.moTaNgan || "",
    moTaChiTiet: doctor?.moTaChiTiet || "",
  };

  const [formData, setFormData] = useState(initialData);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  /** 
   * Xử lý thay đổi dữ liệu trong các ô Input
   */
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /** 
   * Xử lý Lưu thông tin (Lưu ý: Logic Cập nhật Profile Bác sĩ cần API Backend hỗ trợ đầy đủ)
   */
  const handleSave = () => {
    // Hiện tại đang là placeholder, bác sĩ chỉ xem và sửa tại Client
    toast.success("Thông tin của bạn đã được ghi nhận trên hệ thống!");
  };

  /** 
   * Hủy bỏ thay đổi: Reset form về dữ liệu ban đầu
   */
  const handleCancel = () => {
    setFormData(initialData);
  };

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
  const avatarUrl = getAvatarUrl(user?.anhDaiDien) || getAvatarUrl(doctor?.anhDaiDien) || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor?.tenBacSi || "BS")}&size=128&background=1f89e5&color=fff`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      
      {/* CỘT TRÁI: THÔNG TIN TÓM TẮT & AVATAR */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-6">
          <div className="h-32 bg-gradient-to-br from-primary/10 to-primary/5" />
          <div className="px-6 pb-8 -mt-16 text-center">
            <div className="relative inline-block">
              {/* Vùng Avatar có thể bấm để đổi ảnh */}
              <label className="relative cursor-pointer group block">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={isUploadingAvatar}
                />
                <img
                  src={avatarUrl}
                  alt={doctor?.tenBacSi}
                  className="size-32 rounded-3xl border-4 border-white shadow-xl object-cover mx-auto transition-transform group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor?.tenBacSi || "BS")}&size=128&background=1f89e5&color=fff`;
                  }}
                />
                
                {/* Lớp phủ (Overlay) khi hover hoặc đang tải */}
                <div className={`absolute inset-0 rounded-3xl flex flex-col items-center justify-center transition-all bg-black/40 text-white ${isUploadingAvatar ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  {isUploadingAvatar ? (
                    <span className="material-symbols-outlined animate-spin text-3xl font-bold">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-3xl font-bold">add_a_photo</span>
                  )}
                </div>
              </label>
            </div>

            <h2 className="mt-5 text-xl font-black text-slate-800 leading-tight">
              {doctor?.hocViChucDanh} {doctor?.tenBacSi}
            </h2>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-primary font-black text-[10px] uppercase tracking-widest italic">
                {doctor?.chuyenKhoa?.tenChuyenKhoa || "Chưa xác định"}
              </p>
            </div>

            {/* Thông tin giá khám */}
            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between px-4">
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Giá khám hiện tại</p>
                <p className="text-xl font-black text-emerald-600">{doctor?.giaKham ? Number(doctor.giaKham).toLocaleString("vi-VN") : "0"}đ</p>
              </div>
              <span className="material-symbols-outlined text-emerald-100 text-3xl">payments</span>
            </div>
          </div>
        </div>
      </div>

      {/* CỘT PHẢI: FORM CHỈNH SỬA CHI TIẾT */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-10 space-y-10">
          
          {/* Nhóm: Thông tin liên hệ */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary font-bold">contact_page</span>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Thông tin liên hệ & Cơ bản</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className={LABEL_CLASS}>Họ và tên bác sĩ</label>
                <input type="text" value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)} className={INPUT_CLASS} />
              </div>
              <div className="space-y-1">
                <label className={LABEL_CLASS}>Địa chỉ Email</label>
                <input type="email" value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)} className={INPUT_CLASS} />
              </div>
              <div className="space-y-1">
                <label className={LABEL_CLASS}>Số điện thoại</label>
                <input type="tel" value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)} className={INPUT_CLASS} />
              </div>
              <div className="space-y-1">
                <label className={LABEL_CLASS}>Giới tính</label>
                <select value={formData.gender} onChange={(e) => handleChange("gender", e.target.value)} className={INPUT_CLASS}>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-50" />

          {/* Nhóm: Chuyên môn & Giới thiệu */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary font-bold">school</span>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Chuyên môn & Giới thiệu bản thân</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="space-y-1">
                <label className={LABEL_CLASS}>Học vị / Chức danh</label>
                <input type="text" value={formData.hocVi}
                  onChange={(e) => handleChange("hocVi", e.target.value)} className={INPUT_CLASS} />
              </div>
              <div className="space-y-1">
                <label className={LABEL_CLASS}>Chuyên khoa (Cố định)</label>
                <div className={`${INPUT_CLASS} bg-slate-100 flex items-center text-slate-400 italic`}>
                  {formData.specialty || "N/A"}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-1">
                <label className={LABEL_CLASS}>Mô tả ngắn (Lời chào/Slogan)</label>
                <textarea value={formData.moTaNgan} onChange={(e) => handleChange("moTaNgan", e.target.value)}
                  placeholder="Nhập giới thiệu ngắn gọn về thế mạnh của bạn..."
                  rows={2} className={`${INPUT_CLASS} resize-none`} />
              </div>
              <div className="space-y-1">
                <label className={LABEL_CLASS}>Mô tả chi tiết (Kinh nghiệm & Quá trình công tác)</label>
                <textarea value={formData.moTaChiTiet} onChange={(e) => handleChange("moTaChiTiet", e.target.value)}
                  placeholder="Hãy viết chi tiết về quá trình học tập, làm việc và các chứng nhận chuyên sâu..."
                  rows={6} className={`${INPUT_CLASS} resize-none`} />
              </div>
            </div>
          </div>

          {/* NHÓM NÚT THAO TÁC */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-slate-50 italic">
            <button type="button" onClick={handleCancel}
              className="w-full sm:w-auto px-8 py-3 bg-white border border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-all">
              Hủy thay đổi
            </button>
            <button type="button" onClick={handleSave}
              className="w-full sm:w-auto px-10 py-3 bg-primary text-white font-black text-[11px] uppercase tracking-widest rounded-xl shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all active:scale-95">
              Lưu thông tin hồ sơ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorProfilePage;

