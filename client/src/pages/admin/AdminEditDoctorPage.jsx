import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useDoctor, useUpdateDoctor } from "../../hooks/queries/useDoctorQueries";
import { useSpecialties } from "../../hooks/queries/useSpecialtyQueries";
import LoadingSpinner from "../../components/common/LoadingSpinner";

/**
 * Trang AdminEditDoctorPage - Chỉnh sửa thông tin Bác sĩ (Admin)
 * 
 * Kiến trúc: Tách thành 2 lớp component:
 * - AdminEditDoctorPage (wrapper): Chịu trách nhiệm fetch data, hiển thị loading.
 * - EditDoctorForm (child): Nhận initialData qua props, khởi tạo form state trực tiếp.
 * 
 * Lý do: React 19 cảnh báo nếu gọi setState trong useEffect (cascading render).
 * Bằng cách truyền data qua props, form state chỉ khởi tạo 1 lần khi mount → không cần useEffect sync.
 */
function AdminEditDoctorPage() {
  const { id } = useParams();
  
  // TanStack Query: Lấy chi tiết bác sĩ (auto-cache)
  const { data: docRes, isLoading: loadingDoc } = useDoctor(id);

  // Hiển thị vòng xoay nếu đang tải dữ liệu
  if (loadingDoc) {
    return (
      <div className="flex justify-center py-40">
        <LoadingSpinner size="size-12" />
      </div>
    );
  }

  // Render form chỉ khi data đã sẵn sàng. Key={id} đảm bảo form re-mount nếu chuyển sang id khác.
  return <EditDoctorForm doctorData={docRes?.data} doctorId={id} />;
}

/**
 * Component con EditDoctorForm — Chứa toàn bộ form và logic submit.
 * Nhận doctorData từ props → khởi tạo state form trực tiếp (không cần useEffect sync).
 */
function EditDoctorForm({ doctorData, doctorId }) {
  const navigate = useNavigate();
  
  // TanStack Query: Lấy danh sách chuyên khoa (auto-cache)
  const { data: specRes } = useSpecialties();
  const specialties = specRes?.data || [];

  // TanStack Query: Mutation cập nhật bác sĩ (auto-invalidate list + detail)
  const updateMutation = useUpdateDoctor();
  const saving = updateMutation.isPending;

  const [showPassword, setShowPassword] = useState(false);
  
  // Khởi tạo form state trực tiếp từ props — KHÔNG cần useEffect
  const doc = doctorData || {};
  const [form, setForm] = useState({
    tenBacSi: doc.tenBacSi || "",
    chuyenKhoaId: doc.chuyenKhoaId?.toString() || "",
    hocViChucDanh: doc.hocViChucDanh || "",
    giaKham: doc.giaKham || "",
    moTaNgan: doc.moTaNgan || "",
    moTaChiTiet: doc.moTaChiTiet || "",
    email: doc.taiKhoan?.email || "",
    matKhau: "",
  });

  /**
   * Cập nhật state form khi người dùng nhập liệu vào các ô input
   */
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /**
   * Xử lý gửi yêu cầu cập nhật thông tin lên Server
   */
  const handleSave = () => {
    if (!form.tenBacSi.trim() || !form.chuyenKhoaId || !form.email.trim()) {
      toast.warn("Vui lòng nhập đầy đủ: Họ tên, Chuyên khoa và Email.");
      return;
    }

    const updateData = {
      ...form,
      giaKham: form.giaKham ? Number(form.giaKham) : null,
    };
    
    if (!form.matKhau.trim()) {
      delete updateData.matKhau;
    }

    updateMutation.mutate(
      { id: doctorId, data: updateData },
      {
        onSuccess: () => toast.success(`Cập nhật bác sĩ "${form.tenBacSi}" thành công!`),
        onError: (err) => toast.error(err.message || "Có lỗi xảy ra khi cập nhật!"),
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto pb-10 font-sans">
      {/* Breadcrumb dẫn hướng */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link to="/admin/doctors" className="text-slate-500 hover:text-primary transition-colors font-medium">
          Quản lý bác sĩ
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-bold tracking-tight">Cập nhật hồ sơ bác sĩ</span>
      </div>

      {/* Header trang */}
      <div className="mb-10 flex flex-col sm:flex-row items-end justify-between gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Chỉnh sửa bác sĩ</h2>
          <p className="text-slate-500 text-sm mt-2">Cập nhật thông tin chuyên môn và tài khoản đăng nhập cho BS{doctorId}.</p>
        </div>
        <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-200">
          Chế độ chỉnh sửa
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 sm:p-12 space-y-10">
          
          {/* SECTION: Tài khoản đăng nhập (Email & Mật khẩu) */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="size-2 rounded-full bg-slate-400 ring-4 ring-slate-100"></span>
              Thông tin tài khoản
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Email đăng nhập <span className="text-rose-500">*</span></label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="VD: doctor@example.com"
                  className="w-full px-5 py-3.5 rounded-2xl border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Mật khẩu mới (Tùy chọn)</label>
                <div className="relative">
                  <input
                    name="matKhau"
                    type={showPassword ? "text" : "password"}
                    value={form.matKhau}
                    onChange={handleChange}
                    placeholder="Để trống nếu không thay đổi"
                    className="w-full px-5 py-3.5 rounded-2xl border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">info</span>
              Thay đổi email sẽ thay đổi tên đăng nhập. Để trống ô mật khẩu nếu bạn muốn giữ nguyên mật khẩu cũ.
            </p>
          </div>

          <hr className="border-slate-100" />
          
          {/* SECTION: Thông tin công tác (Tên, Chuyên khoa) */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary ring-4 ring-primary/10"></span>
              Thông tin công tác
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Họ tên bác sĩ <span className="text-rose-500">*</span></label>
                <input
                  name="tenBacSi"
                  value={form.tenBacSi}
                  onChange={handleChange}
                  placeholder="VD: PGS. TS. Nguyễn Văn A"
                  className="w-full px-5 py-3.5 rounded-2xl border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Chuyên khoa <span className="text-rose-500">*</span></label>
                <select
                  name="chuyenKhoaId"
                  value={form.chuyenKhoaId}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 rounded-2xl border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-primary/10 transition-all font-medium appearance-none cursor-pointer"
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
          </div>

          <hr className="border-slate-100" />

          {/* SECTION: Chuyên môn & Chi phí khám */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="size-2 rounded-full bg-green-500 ring-4 ring-green-100"></span>
              Chuyên môn & Chi phí
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Học vị / Chức danh</label>
                <input
                  name="hocViChucDanh"
                  value={form.hocViChucDanh}
                  onChange={handleChange}
                  placeholder="VD: Bác sĩ chuyên khoa II, ThS..."
                  className="w-full px-5 py-3.5 rounded-2xl border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Giá khám bệnh (VNĐ)</label>
                <input
                  name="giaKham"
                  type="number"
                  value={form.giaKham}
                  onChange={handleChange}
                  placeholder="VD: 500000"
                  className="w-full px-5 py-3.5 rounded-2xl border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-primary/10 transition-all font-bold text-primary"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Mô tả ngắn gọn chuyên môn</label>
              <input
                name="moTaNgan"
                value={form.moTaNgan}
                onChange={handleChange}
                placeholder="VD: Chuyên gia hàng đầu về tim mạch can thiệp với hơn 20 năm kinh nghiệm."
                className="w-full px-5 py-4 rounded-2xl border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-primary/10 transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Giới thiệu chi tiết</label>
              <textarea
                name="moTaChiTiet"
                value={form.moTaChiTiet}
                onChange={handleChange}
                rows={10}
                placeholder="Nhập quá trình công tác, đào tạo và các thành tựu của bác sĩ..."
                className="w-full px-5 py-4 rounded-2xl border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-primary/10 transition-all font-medium resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Action bar - Chứa các nút hủy và lưu */}
        <div className="bg-slate-50/80 px-8 sm:px-12 py-6 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100">
          <button
            onClick={() => navigate("/admin/doctors")}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full sm:w-auto px-12 py-3.5 rounded-2xl text-white text-sm font-black transition-all flex items-center justify-center gap-2 shadow-xl ${
              saving ? "bg-slate-300" : "bg-primary hover:bg-primary/90 shadow-primary/20"
            }`}
          >
            {saving ? (
              <LoadingSpinner size="size-5" color="text-white" />
            ) : (
              <span className="material-symbols-outlined text-sm">save</span>
            )}
            Lưu thay đổi hồ sơ
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminEditDoctorPage;
