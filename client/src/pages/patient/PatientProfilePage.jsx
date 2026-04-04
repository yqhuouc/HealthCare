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

const inputBase =
  "w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-60";
const labelBase = "block text-sm font-semibold text-slate-700 mb-2";

export default function PatientProfilePage() {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Dữ liệu form profile
  const [formData, setFormData] = useState({
    hoTen: "",
    email: "",
    soDienThoai: "",
    gioiTinh: "",
    ngaySinh: "",
    diaChi: "",
  });
  const [snapshot, setSnapshot] = useState(formData);

  // State đổi mật khẩu
  const [passwordData, setPasswordData] = useState({
    matKhauCu: "",
    matKhauMoi: "",
    xacNhanMatKhau: "",
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
        setFormData(profileData);
        setSnapshot(profileData);
      } catch {
        toast.error("Không thể tải thông tin hồ sơ.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    setSnapshot(formData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(snapshot);
    setIsEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authService.capNhatHoSo({
        hoTen: formData.hoTen,
        soDienThoai: formData.soDienThoai,
        email: formData.email,
        gioiTinh: formData.gioiTinh ? Number(formData.gioiTinh) : undefined,
        ngaySinh: formData.ngaySinh || undefined,
        diaChi: formData.diaChi || undefined,
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
      // Cập nhật URL ảnh mới lên trạng thái formData
      setFormData(prev => ({ ...prev, anhDaiDien: res.anhDaiDien }));
      // Cập nhật global state user
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

  const handleChangePassword = async () => {
    if (!passwordData.matKhauCu || !passwordData.matKhauMoi) {
      toast.error("Vui lòng nhập đầy đủ mật khẩu.");
      return;
    }
    if (passwordData.matKhauMoi.length < 6) {
      toast.error("Mật khẩu mới tối thiểu 6 ký tự.");
      return;
    }
    if (passwordData.matKhauMoi !== passwordData.xacNhanMatKhau) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }
    setChangingPassword(true);
    try {
      await authService.doiMatKhau({
        matKhauCu: passwordData.matKhauCu,
        matKhauMoi: passwordData.matKhauMoi,
      });
      toast.success("Đổi mật khẩu thành công!");
      setPasswordData({ matKhauCu: "", matKhauMoi: "", xacNhanMatKhau: "" });
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
            {user?.anhDaiDien || formData.anhDaiDien ? (
              <img
                src={user?.anhDaiDien || formData.anhDaiDien}
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
              {formData.hoTen}
            </h2>
            <p className="text-slate-500 text-sm mt-1">{formData.email}</p>
          </div>
        </div>

        <hr className="border-slate-100 mb-8" />

        {/* Form chỉnh sửa thông tin */}
        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Họ và tên */}
            <div>
              <label className={labelBase}>Họ và tên</label>
              <input
                type="text"
                name="hoTen"
                value={formData.hoTen}
                onChange={handleChange}
                disabled={!isEditing}
                className={`${inputBase} ${isEditing ? "bg-white" : "bg-slate-50"}`}
              />
            </div>

            {/* Email */}
            <div>
              <label className={labelBase}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className={`${inputBase} ${isEditing ? "bg-white" : "bg-slate-50"}`}
              />
            </div>

            {/* Số điện thoại */}
            <div>
              <label className={labelBase}>Số điện thoại</label>
              <input
                type="tel"
                name="soDienThoai"
                value={formData.soDienThoai}
                onChange={handleChange}
                disabled={!isEditing}
                className={`${inputBase} ${isEditing ? "bg-white" : "bg-slate-50"}`}
              />
            </div>

            {/* Giới tính */}
            <div>
              <label className={labelBase}>Giới tính</label>
              <select
                name="gioiTinh"
                value={formData.gioiTinh}
                onChange={handleChange}
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
                name="ngaySinh"
                value={formData.ngaySinh}
                onChange={handleChange}
                disabled={!isEditing}
                className={`${inputBase} ${isEditing ? "bg-white" : "bg-slate-50"}`}
              />
            </div>

            {/* Địa chỉ */}
            <div>
              <label className={labelBase}>Địa chỉ</label>
              <input
                type="text"
                name="diaChi"
                value={formData.diaChi}
                onChange={handleChange}
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

      {/* Card đổi mật khẩu */}
      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Đổi mật khẩu</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className={labelBase}>Mật khẩu hiện tại</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu hiện tại"
              value={passwordData.matKhauCu}
              onChange={(e) =>
                setPasswordData((p) => ({ ...p, matKhauCu: e.target.value }))
              }
              className={inputBase}
            />
          </div>
          <div>
            <label className={labelBase}>Mật khẩu mới</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              value={passwordData.matKhauMoi}
              onChange={(e) =>
                setPasswordData((p) => ({ ...p, matKhauMoi: e.target.value }))
              }
              className={inputBase}
            />
          </div>
          <div>
            <label className={labelBase}>Xác nhận mật khẩu mới</label>
            <input
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={passwordData.xacNhanMatKhau}
              onChange={(e) =>
                setPasswordData((p) => ({
                  ...p,
                  xacNhanMatKhau: e.target.value,
                }))
              }
              className={inputBase}
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={handleChangePassword}
            disabled={changingPassword}
            className="px-6 py-2.5 rounded-lg border border-primary text-primary font-medium text-sm hover:bg-primary/5 transition disabled:opacity-60"
          >
            {changingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
          </button>
        </div>
      </div>
    </section>
  );
}
