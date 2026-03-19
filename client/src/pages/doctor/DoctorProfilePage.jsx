/**
 * ============================================================
 * TRANG: Hồ sơ cá nhân bác sĩ
 * Đường dẫn: /doctor/profile
 * ============================================================
 *
 * Chức năng:
 * - Layout 2 cột:
 *   + Cột trái: Card tóm tắt (avatar, tên, chuyên khoa, học vấn, nút đổi ảnh, thống kê KN/BN)
 *   + Cột phải: Form chỉnh sửa thông tin (họ tên, email, SĐT, ngày sinh, giới tính, bio, bằng cấp, KN)
 * - Nút "Lưu thay đổi" → toast thành công
 * - Nút "Hủy" → reset formData về dữ liệu ban đầu từ CURRENT_DOCTOR
 * - Avatar có nút camera để đổi ảnh + fallback UI avatar nếu ảnh lỗi
 *
 * State:
 * - formData: object chứa dữ liệu form (khởi tạo từ CURRENT_DOCTOR)
 *
 * Dữ liệu: CURRENT_DOCTOR từ mockDoctorData.js
 * ============================================================
 */
import { useState } from "react";
import { CURRENT_DOCTOR } from "../../data/mockDoctorData";
import { toast } from "react-toastify";

/** Tailwind class dùng chung cho input và label */
const INPUT_CLASS =
  "w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all";
const LABEL_CLASS = "block text-sm font-semibold text-slate-700 mb-2";

function DoctorProfilePage() {
  const [formData, setFormData] = useState({
    fullName: CURRENT_DOCTOR.fullName,
    email: CURRENT_DOCTOR.email,
    phone: CURRENT_DOCTOR.phone,
    dateOfBirth: "1980-05-15",
    gender: "Nam",
    bio: CURRENT_DOCTOR.bio,
    education: CURRENT_DOCTOR.education,
    experience: CURRENT_DOCTOR.bio,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    toast.success("Đã lưu thay đổi thành công!");
  };

  const handleCancel = () => {
    setFormData({
      fullName: CURRENT_DOCTOR.fullName,
      email: CURRENT_DOCTOR.email,
      phone: CURRENT_DOCTOR.phone,
      dateOfBirth: "1980-05-15",
      gender: "Nam",
      bio: CURRENT_DOCTOR.bio,
      education: CURRENT_DOCTOR.education,
      experience: CURRENT_DOCTOR.bio,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      {/* LEFT COLUMN - Basic Info Card */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="h-24 bg-primary/10" />

          <div className="px-6 pb-8 -mt-12 text-center">
            <div className="relative inline-block">
              <img
                src={CURRENT_DOCTOR.image}
                alt={CURRENT_DOCTOR.fullName}
                className="size-32 rounded-full border-4 border-white shadow-lg object-cover mx-auto"
                onError={(e) => {
                  e.target.src =
                    "https://ui-avatars.com/api/?name=" +
                    encodeURIComponent(CURRENT_DOCTOR.fullName) +
                    "&size=128&background=1f89e5&color=fff";
                }}
              />
              <button className="absolute bottom-1 right-1 size-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                <span className="material-symbols-outlined text-base">
                  photo_camera
                </span>
              </button>
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              {CURRENT_DOCTOR.fullName}
            </h2>
            <p className="text-primary font-semibold text-sm">
              {CURRENT_DOCTOR.specialty}
            </p>
            <p className="text-slate-500 text-sm">{CURRENT_DOCTOR.education}</p>

            <div className="mt-6 space-y-3">
              <button className="w-full px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                Đổi ảnh đại diện
              </button>
              <button className="w-full px-4 py-2.5 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors">
                Xem trang công khai
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200 grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {CURRENT_DOCTOR.experience}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Kinh nghiệm (Năm)
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">1.2k</p>
                <p className="text-xs text-slate-500 mt-1">Bệnh nhân</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN - Detailed Form */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border p-5 sm:p-8">
          <div className="flex items-center gap-2 mb-8">
            <span className="material-symbols-outlined text-primary">
              edit_note
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Thông tin cá nhân
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className={LABEL_CLASS}>Họ và tên</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label className={LABEL_CLASS}>Email công việc</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label className={LABEL_CLASS}>Số điện thoại</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label className={LABEL_CLASS}>Ngày sinh</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label className={LABEL_CLASS}>Giới tính</label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                className={INPUT_CLASS}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            <div>
              <label className={LABEL_CLASS}>Giới thiệu bản thân</label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                rows={4}
                className={`${INPUT_CLASS} resize-y`}
              />
            </div>

            <div>
              <label className={LABEL_CLASS}>Bằng cấp & Chứng chỉ</label>
              <input
                type="text"
                value={formData.education}
                onChange={(e) => handleChange("education", e.target.value)}
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label className={LABEL_CLASS}>Kinh nghiệm làm việc</label>
              <textarea
                value={formData.experience}
                onChange={(e) => handleChange("experience", e.target.value)}
                rows={3}
                className={`${INPUT_CLASS} resize-y`}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full sm:w-auto px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold text-sm rounded-lg hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white font-semibold text-sm rounded-lg shadow-lg hover:bg-primary/90 transition-colors"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorProfilePage;
