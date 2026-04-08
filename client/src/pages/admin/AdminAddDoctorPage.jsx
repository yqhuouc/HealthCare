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
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { doctorService } from "../../services/doctorService";
import { specialtyService } from "../../services/specialtyService";

function AdminAddDoctorPage() {
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    tenBacSi: "",
    email: "",
    matKhau: "",
    chuyenKhoaId: "",
    hocViChucDanh: "",
    giaKham: "",
    moTaNgan: "",
    moTaChiTiet: "",
  });

  useEffect(() => {
    // Lấy danh sách chuyên khoa
    const fetchSpecialties = async () => {
      try {
        const res = await specialtyService.getAll();
        if (res.success) {
          setSpecialties(res.data);
        }
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải danh sách chuyên khoa!");
      }
    };
    fetchSpecialties();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.tenBacSi.trim() || !form.chuyenKhoaId || !form.email || !form.matKhau) {
      toast.warn("Vui lòng nhập đầy đủ: Họ tên, Chuyên khoa, Email, Mật khẩu.");
      return;
    }
    
    setLoading(true);
    try {
      await doctorService.create({
        ...form,
        giaKham: form.giaKham ? Number(form.giaKham) : null,
      });
      toast.success(`Đã thêm bác sĩ "${form.tenBacSi}" thành công!`);
      navigate("/admin/doctors");
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi thêm bác sĩ!");
    } finally {
      setLoading(false);
    }
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
                name="tenBacSi"
                value={form.tenBacSi}
                onChange={handleChange}
                placeholder="VD: Nguyễn Văn A"
                className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Chuyên khoa <span className="text-red-500">*</span>
              </label>
              <select
                name="chuyenKhoaId"
                value={form.chuyenKhoaId}
                onChange={handleChange}
                className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
              >
                <option value="">-- Chọn chuyên khoa --</option>
                {specialties.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.tenChuyenKhoa}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email / Tên đăng nhập <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="bacsi_a@example.com"
                className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                name="matKhau"
                type="password"
                value={form.matKhau}
                onChange={handleChange}
                placeholder="Mật khẩu ít nhất 6 ký tự"
                className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Chức danh / Học vị
              </label>
              <input
                name="hocViChucDanh"
                value={form.hocViChucDanh}
                onChange={handleChange}
                placeholder="VD: ThS. BS."
                className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Giá khám (VNĐ)
              </label>
              <input
                name="giaKham"
                type="number"
                value={form.giaKham}
                onChange={handleChange}
                placeholder="VD: 300000"
                className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Mô tả ngắn
            </label>
            <input
              name="moTaNgan"
              value={form.moTaNgan}
              onChange={handleChange}
              placeholder="VD: Bác sĩ chuyên khoa nội uy tín..."
              className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary mb-5"
            />

            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Mô tả chi tiết
            </label>
            <textarea
              name="moTaChiTiet"
              value={form.moTaChiTiet}
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
            disabled={loading}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
              loading ? "bg-slate-300" : "bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
            }`}
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-sm">save</span>
            )}
            Lưu bác sĩ
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminAddDoctorPage;
