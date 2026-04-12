/**
 * ============================================================
 * TRANG: Hồ sơ cá nhân bệnh nhân
 * Đường dẫn: /profile
 * ============================================================
 *
 * Chức năng:
 * - Hiển thị thông tin cá nhân: họ tên, email, SĐT, giới tính, ngày sinh, địa chỉ
 * - Chế độ xem / chỉnh sửa toggle (isEditing)
 * - Khi nhấn "Hủy" → khôi phục dữ liệu về trạng thái trước khi sửa (snapshot)
 * - Form đổi mật khẩu riêng biệt (mật khẩu cũ + mới + xác nhận)
 * - Email luôn disabled (không cho phép sửa)
 *
 * Dữ liệu: API /auth/me, /auth/cap-nhat-ho-so, /auth/doi-mat-khau
 * ============================================================
 */
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { authService } from "../../services/authService";
import useAuthStore from "../../stores/useAuthStore";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientProfileSchema, passwordChangeSchema } from "../../validations/authSchema";

const inputBase =
  "w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-60";
const labelBase = "block text-sm font-semibold text-slate-700 mb-2";

export default function PatientProfilePage() {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Form profile
  const profileForm = useForm({
    resolver: zodResolver(patientProfileSchema),
    defaultValues: {
      hoTen: "",
      email: "",
      soDienThoai: "",
      gioiTinh: "",
      ngaySinh: "",
      diaChi: "",
    }
  });

  const { control: profileControl } = profileForm;
  const watchedHoTen = useWatch({ control: profileControl, name: "hoTen" });
  const watchedEmail = useWatch({ control: profileControl, name: "email" });
  
  const [snapshot, setSnapshot] = useState(profileForm.getValues());

  // Form password
  const passwordForm = useForm({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      matKhauCu: "",
      matKhauMoi: "",
      xacNhanMatKhau: "",
    }
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Fetch profile khi mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authService.getMe();
        const data = res.data;
        const hoTen = data.benhNhan?.hoTen || data.bacSi?.tenBacSi || "Admin";
        const soDienThoai = data.benhNhan?.soDienThoai || "";
        const profileData = {
          hoTen,
          email: data.email,
          soDienThoai,
          gioiTinh: data.gioiTinh || "",
          ngaySinh: data.ngaySinh ? data.ngaySinh.split("T")[0] : "",
          diaChi: data.diaChi || "",
        };
        profileForm.reset(profileData);
        setSnapshot(profileData);
      } catch {
        toast.error("Không thể tải thông tin hồ sơ.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleEdit = () => {
    setSnapshot(profileForm.getValues());
    setIsEditing(true);
  };

  const handleCancel = () => {
    profileForm.reset(snapshot);
    setIsEditing(false);
  };

  const onProfileSubmit = async (data) => {
    setSaving(true);
    try {
      const res = await authService.capNhatHoSo({
        hoTen: data.hoTen,
        soDienThoai: data.soDienThoai,
        email: data.email,
        gioiTinh: data.gioiTinh ? Number(data.gioiTinh) : undefined,
        ngaySinh: data.ngaySinh || undefined,
        diaChi: data.diaChi || undefined,
      });
      toast.success("Cập nhật thông tin thành công!");
      // Cập nhật store
      setUser({ ...user, ...res.data });
      setIsEditing(false);
    } catch (err) {
      toast.error(err.message || "Cập nhật thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (vd: limit 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh quá lớn, vui lòng chọn ảnh < 5MB");
      return;
    }

    const formDataToUpload = new FormData();
    formDataToUpload.append("avatar", file);

    setIsUploadingAvatar(true);
    try {
      const res = await authService.capNhatAvatar(formDataToUpload);
      // Cập nhật URL ảnh mới lên store và không cần setState cho form
      setUser({ ...user, anhDaiDien: res.anhDaiDien });
      toast.success("Tải ảnh đại diện thành công!");
    } catch (err) {
      toast.error(err.message || "Lỗi khi tải ảnh lên");
    } finally {
      setIsUploadingAvatar(false);
      // Clear value input để có thể chọn lại cùng 1 file
      e.target.value = null;
    }
  };

  const onPasswordSubmit = async (data) => {
    setChangingPassword(true);
    try {
      await authService.doiMatKhau({
        matKhauCu: data.matKhauCu,
        matKhauMoi: data.matKhauMoi,
      });
      toast.success("Đổi mật khẩu thành công!");
      passwordForm.reset({ matKhauCu: "", matKhauMoi: "", xacNhanMatKhau: "" });
    } catch (err) {
      toast.error(err.message || "Đổi mật khẩu thất bại.");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <section className="max-w-4xl mx-auto py-12 px-4 text-center">
        <span className="material-symbols-outlined text-5xl text-primary animate-spin">
          progress_activity
        </span>
        <p className="mt-4 text-slate-500">Đang tải hồ sơ...</p>
      </section>
    );
  }

  return (
    <section className="max-w-4xl mx-auto py-12 px-4">
      {/* Tiêu đề trang */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-800">Hồ sơ cá nhân</h1>
        <div className="h-1.5 w-20 bg-primary rounded-full mt-3" />
      </div>

      {/* Card thông tin cá nhân */}
      <div className="bg-white rounded-lg shadow p-8">
        {/* Avatar + tên + email */}
        <div className="flex items-center gap-5 mb-6">
          <label className="relative cursor-pointer group rounded-full">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={isUploadingAvatar}
            />
            {user?.anhDaiDien ? (
              <img
                src={user?.anhDaiDien}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-5xl">
                  person
                </span>
              </div>
            )}
            
            {/* Dark overlay khi hover hoặc đang upload */}
            <div className={`absolute inset-0 rounded-full flex flex-col items-center justify-center transition-all bg-black/50 text-white ${isUploadingAvatar ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              {isUploadingAvatar ? (
                <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-2xl">photo_camera</span>
                  <span className="text-[10px] font-medium mt-1 uppercase">Đổi ảnh</span>
                </>
              )}
            </div>
          </label>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {watchedHoTen}
            </h2>
            <p className="text-slate-500 text-sm mt-1">{watchedEmail}</p>
          </div>
        </div>

        <hr className="border-slate-100 mb-8" />

        {/* Form chỉnh sửa thông tin */}
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Họ và tên */}
            <div>
              <label className={labelBase}>Họ và tên</label>
              <input
                type="text"
                {...profileForm.register("hoTen")}
                disabled={!isEditing}
                className={`${inputBase} ${isEditing ? "bg-white" : "bg-slate-50"} ${profileForm.formState.errors.hoTen ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
              />
              {profileForm.formState.errors.hoTen && <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.hoTen.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className={labelBase}>Email</label>
              <input
                type="email"
                {...profileForm.register("email")}
                disabled={!isEditing}
                className={`${inputBase} ${isEditing ? "bg-white" : "bg-slate-50"} ${profileForm.formState.errors.email ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
              />
              {profileForm.formState.errors.email && <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.email.message}</p>}
            </div>

            {/* Số điện thoại */}
            <div>
              <label className={labelBase}>Số điện thoại</label>
              <input
                type="tel"
                {...profileForm.register("soDienThoai")}
                disabled={!isEditing}
                className={`${inputBase} ${isEditing ? "bg-white" : "bg-slate-50"} ${profileForm.formState.errors.soDienThoai ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
              />
              {profileForm.formState.errors.soDienThoai && <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.soDienThoai.message}</p>}
            </div>

            {/* Giới tính */}
            <div>
              <label className={labelBase}>Giới tính</label>
              <select
                {...profileForm.register("gioiTinh")}
                disabled={!isEditing}
                className={`${inputBase} ${isEditing ? "bg-white" : "bg-slate-50"}`}
              >
                <option value="">Chưa cập nhật</option>
                <option value="1">Nam</option>
                <option value="2">Nữ</option>
                <option value="3">Khác</option>
              </select>
            </div>

            {/* Ngày sinh */}
            <div>
              <label className={labelBase}>Ngày sinh</label>
              <input
                type="date"
                {...profileForm.register("ngaySinh")}
                disabled={!isEditing}
                className={`${inputBase} ${isEditing ? "bg-white" : "bg-slate-50"}`}
              />
            </div>

            {/* Địa chỉ */}
            <div>
              <label className={labelBase}>Địa chỉ</label>
              <input
                type="text"
                {...profileForm.register("diaChi")}
                disabled={!isEditing}
                placeholder="Nhập địa chỉ..."
                className={`${inputBase} ${isEditing ? "bg-white" : "bg-slate-50"}`}
              />
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex justify-end gap-3 mt-8">
            {!isEditing ? (
              <button
                type="button"
                onClick={handleEdit}
                className="px-6 py-2.5 rounded-lg border border-primary text-primary font-medium text-sm hover:bg-primary/5 transition"
              >
                Chỉnh sửa
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 transition disabled:opacity-60"
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </>
            )}
          </div>
        </form>
      </div>

      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="bg-white rounded-lg shadow p-6 mt-8">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Đổi mật khẩu</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className={labelBase}>Mật khẩu hiện tại</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu hiện tại"
              {...passwordForm.register("matKhauCu")}
              className={`${inputBase} ${passwordForm.formState.errors.matKhauCu ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
            />
            {passwordForm.formState.errors.matKhauCu && <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.matKhauCu.message}</p>}
          </div>
          <div>
            <label className={labelBase}>Mật khẩu mới</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              {...passwordForm.register("matKhauMoi")}
              className={`${inputBase} ${passwordForm.formState.errors.matKhauMoi ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
            />
            {passwordForm.formState.errors.matKhauMoi && <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.matKhauMoi.message}</p>}
          </div>
          <div>
            <label className={labelBase}>Xác nhận mật khẩu mới</label>
            <input
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              {...passwordForm.register("xacNhanMatKhau")}
              className={`${inputBase} ${passwordForm.formState.errors.xacNhanMatKhau ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
            />
            {passwordForm.formState.errors.xacNhanMatKhau && <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.xacNhanMatKhau.message}</p>}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={changingPassword}
            className="px-6 py-2.5 rounded-lg border border-primary text-primary font-medium text-sm hover:bg-primary/5 transition disabled:opacity-60"
          >
            {changingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
          </button>
        </div>
      </form>
    </section>
  );
}
