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
 * State:
 * - isEditing: boolean — đang ở chế độ xem hay chỉnh sửa
 * - formData: object chứa dữ liệu hiện tại của form
 * - snapshot: bản sao formData lúc bấm "Chỉnh sửa" — dùng để khôi phục khi "Hủy"
 *
 * Dữ liệu: Mock data cục bộ (initialUserData), sẽ thay bằng API
 * ============================================================
 */
import { useState } from "react";
import { toast } from "react-toastify";

/** Dữ liệu mẫu ban đầu — sẽ được thay bằng dữ liệu từ API user profile */
const initialUserData = {
  fullName: "Nguyễn Văn Test",
  email: "test@email.com",
  phone: "0912345678",
  gender: "male",
  dateOfBirth: "1995-06-15",
  address: "Hà Nội, Việt Nam",
};

const inputBase =
  "w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-60";
const labelBase = "block text-sm font-semibold text-slate-700 mb-2";

export default function PatientProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(initialUserData);

  // Lưu bản sao dữ liệu ban đầu để khôi phục khi nhấn "Hủy"
  const [snapshot, setSnapshot] = useState(initialUserData);

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

  const handleSave = (e) => {
    e.preventDefault();
    toast.success("Cập nhật thông tin thành công!");
    setIsEditing(false);
  };

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
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-5xl">
              person
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {formData.fullName}
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
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                disabled={!isEditing}
                className={`${inputBase} ${isEditing ? "bg-white" : "bg-slate-50"}`}
              />
            </div>

            {/* Email — luôn disabled */}
            <div>
              <label className={labelBase}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className={`${inputBase} bg-slate-50`}
              />
            </div>

            {/* Số điện thoại */}
            <div>
              <label className={labelBase}>Số điện thoại</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className={`${inputBase} ${isEditing ? "bg-white" : "bg-slate-50"}`}
              />
            </div>

            {/* Giới tính */}
            <div>
              <label className={labelBase}>Giới tính</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={!isEditing}
                className={`${inputBase} ${isEditing ? "bg-white" : "bg-slate-50"}`}
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            {/* Ngày sinh */}
            <div>
              <label className={labelBase}>Ngày sinh</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
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
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
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
                  className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 transition"
                >
                  Lưu thay đổi
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
              className={inputBase}
            />
          </div>
          <div>
            <label className={labelBase}>Mật khẩu mới</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu mới"
              className={inputBase}
            />
          </div>
          <div>
            <label className={labelBase}>Xác nhận mật khẩu mới</label>
            <input
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              className={inputBase}
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            className="px-6 py-2.5 rounded-lg border border-primary text-primary font-medium text-sm hover:bg-primary/5 transition"
          >
            Đổi mật khẩu
          </button>
        </div>
      </div>
    </section>
  );
}
