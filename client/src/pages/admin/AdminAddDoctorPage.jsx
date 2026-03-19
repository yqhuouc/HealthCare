/**
 * ============================================================
 * TRANG: Thêm bác sĩ mới (Admin)
 * Đường dẫn: /admin/doctors/add
 * ============================================================
 *
 * Chức năng:
 * - Form thêm bác sĩ: họ tên, chuyên khoa (dropdown), email, SĐT, kinh nghiệm, mô tả
 * - Validate: bắt buộc nhập họ tên + chọn chuyên khoa
 * - Breadcrumb: Quản lý bác sĩ / Thêm bác sĩ mới
 * - Nút "Lưu bác sĩ" → toast thành công → quay về /admin/doctors
 * - Nút "Hủy" → quay về /admin/doctors
 *
 * State:
 * - form: { name, specialty, email, phone, experience, description }
 *
 * Dữ liệu: SPECIALTIES (danh sách chuyên khoa cho dropdown)
 * ============================================================
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

/** Danh sách chuyên khoa cho dropdown — sẽ thay bằng API */
const SPECIALTIES = [
  "Nội tổng quát",
  "Nhi khoa",
  "Da liễu",
  "Ngoại thần kinh",
  "Sản phụ khoa",
  "Tai Mũi Họng",
  "Tim mạch",
  "Nha khoa",
];

function AdminAddDoctorPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "",
    experience: "",
    description: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.specialty) {
      toast.warn("Vui lòng nhập đầy đủ họ tên và chuyên khoa.");
      return;
    }
    toast.success(`Đã thêm bác sĩ "${form.name}" thành công!`);
    navigate("/admin/doctors");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link
          to="/admin/doctors"
          className="text-slate-500 hover:text-primary transition-colors"
        >
          Quản lý bác sĩ
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-medium">Thêm bác sĩ mới</span>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Thêm bác sĩ mới</h2>
        <p className="text-slate-500 text-sm mt-1">
          Nhập thông tin bác sĩ để thêm vào hệ thống.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Họ tên bác sĩ <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="VD: BS. Nguyễn Văn A"
                className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Chuyên khoa <span className="text-red-500">*</span>
              </label>
              <select
                name="specialty"
                value={form.specialty}
                onChange={handleChange}
                className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
              >
                <option value="">-- Chọn chuyên khoa --</option>
                {SPECIALTIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="doctor@example.com"
                className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Số điện thoại
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="09xxxxxxxx"
                className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Kinh nghiệm
            </label>
            <input
              name="experience"
              value={form.experience}
              onChange={handleChange}
              placeholder="VD: 10 năm"
              className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Mô tả / Giới thiệu
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Thông tin giới thiệu về bác sĩ..."
              className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        <div className="bg-slate-50 px-6 sm:px-8 py-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-200">
          <button
            onClick={() => navigate("/admin/doctors")}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-semibold shadow-md shadow-primary/20 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">save</span>
            Lưu bác sĩ
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminAddDoctorPage;
