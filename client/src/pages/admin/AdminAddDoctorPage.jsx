import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useCreateDoctor } from "../../hooks/queries/useDoctorQueries";
import { useSpecialties } from "../../hooks/queries/useSpecialtyQueries";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { doctorSchema } from "../../validations/adminSchema";
import LoadingSpinner from "../../components/common/LoadingSpinner";

/**
 * Trang AdminAddDoctorPage - Quản trị viên thêm bác sĩ mới
 * Cho phép tạo tài khoản và hồ sơ chuyên môn cho bác sĩ trong hệ thống.
 */
function AdminAddDoctorPage() {
  const navigate = useNavigate();

  // TanStack Query: Lấy danh sách chuyên khoa (auto-cache)
  const { data: specRes } = useSpecialties();
  const specialties = specRes?.data || [];

  // TanStack Query: Mutation tạo bác sĩ mới (auto-invalidate list)
  const createMutation = useCreateDoctor();
  const loading = createMutation.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      tenBacSi: "",
      email: "",
      matKhau: "",
      chuyenKhoaId: "",
      hocViChucDanh: "",
      giaKham: "",
      moTaNgan: "",
      moTaChiTiet: "",
    },
  });

  const onSubmit = (data) => {
    createMutation.mutate(
      { ...data, giaKham: data.giaKham ? Number(data.giaKham) : null },
      {
        onSuccess: () => {
          toast.success(`Đã thêm bác sĩ "${data.tenBacSi}" thành công!`);
          navigate("/admin/doctors");
        },
        onError: (error) => {
          toast.error(error.message || "Có lỗi xảy ra khi thêm bác sĩ!");
        },
      },
    );
  };

  return (
    <div className="max-w-4xl mx-auto pb-10 font-sans">
      {/* Breadcrumbs - Đường dẫn điều hướng */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link to="/admin/doctors" className="text-slate-500 hover:text-primary transition-colors font-medium">
          Quản lý bác sĩ
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-bold tracking-tight">Thêm bác sĩ mới</span>
      </div>

      {/* Header - Tiêu đề trang */}
      <div className="mb-10 text-center sm:text-left">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Thêm bác sĩ mới</h2>
        <p className="text-slate-500 text-sm mt-2">Khởi tạo tài khoản và hồ sơ bác sĩ vào hệ thống chuyên môn.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 sm:p-12 space-y-10">
          {/* Section: Thông tin cơ bản (Họ tên, Chuyên khoa) */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary ring-4 ring-primary/10"></span>
              Thông tin cơ bản
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Họ tên bác sĩ <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register("tenBacSi")}
                  placeholder="VD: PGS. TS. Nguyễn Văn A"
                  className={`w-full px-5 py-3.5 rounded-2xl border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-primary/10 transition-all font-medium ${errors.tenBacSi ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
                />
                {errors.tenBacSi && <p className="text-red-500 text-xs mt-1">{errors.tenBacSi.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Chuyên khoa <span className="text-rose-500">*</span>
                </label>
                <select
                  {...register("chuyenKhoaId")}
                  className={`w-full px-5 py-3.5 rounded-2xl border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-primary/10 transition-all font-medium appearance-none cursor-pointer ${errors.chuyenKhoaId ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
                >
                  <option value="">-- Chọn chuyên khoa --</option>
                  {specialties.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.tenChuyenKhoa}
                    </option>
                  ))}
                </select>
                {errors.chuyenKhoaId && <p className="text-red-500 text-xs mt-1">{errors.chuyenKhoaId.message}</p>}
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section: Tài khoản (Email, Mật khẩu) */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="size-2 rounded-full bg-amber-500 ring-4 ring-amber-100"></span>
              Tài khoản đăng nhập
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Email công tác <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  {...register("email")}
                  placeholder="doctor@example.com"
                  className={`w-full px-5 py-3.5 rounded-2xl border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-primary/10 transition-all font-medium ${errors.email ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Mật khẩu khởi tạo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  {...register("matKhau")}
                  placeholder="Bảo mật tối thiểu 6 ký tự"
                  className={`w-full px-5 py-3.5 rounded-2xl border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-primary/10 transition-all font-medium ${errors.matKhau ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
                />
                {errors.matKhau && <p className="text-red-500 text-xs mt-1">{errors.matKhau.message}</p>}
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section: Chuyên môn & Chi phí (Học vị, Giá khám, Mô tả) */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="size-2 rounded-full bg-green-500 ring-4 ring-green-100"></span>
              Chuyên môn & Chi phí
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Học vị / Chức danh</label>
                <input
                  type="text"
                  {...register("hocViChucDanh")}
                  placeholder="VD: Bác sĩ chuyên khoa II, ThS..."
                  className={`w-full px-5 py-3.5 rounded-2xl border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-primary/10 transition-all font-medium ${errors.hocViChucDanh ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
                />
                {errors.hocViChucDanh && <p className="text-red-500 text-xs mt-1">{errors.hocViChucDanh.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Giá khám bệnh (VNĐ)</label>
                <input
                  type="number"
                  {...register("giaKham")}
                  placeholder="VD: 500000"
                  className={`w-full px-5 py-3.5 rounded-2xl border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-primary/10 transition-all font-bold text-primary ${errors.giaKham ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
                />
                {errors.giaKham && <p className="text-red-500 text-xs mt-1">{errors.giaKham.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Mô tả ngắn gọn chuyên môn</label>
              <input
                {...register("moTaNgan")}
                placeholder="VD: Chuyên gia hàng đầu về tim mạch can thiệp với hơn 20 năm kinh nghiệm."
                className={`w-full px-5 py-4 rounded-2xl border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-primary/10 transition-all font-medium ${errors.moTaNgan ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
              />
              {errors.moTaNgan && <p className="text-red-500 text-xs mt-1">{errors.moTaNgan.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Giới thiệu chi tiết</label>
              <textarea
                {...register("moTaChiTiet")}
                rows={10}
                placeholder="Nhập quá trình công tác, đào tạo và các thành tựu của bác sĩ..."
                className={`w-full px-5 py-4 rounded-2xl border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-primary/10 transition-all font-medium resize-none leading-relaxed ${errors.moTaChiTiet ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
              />
              {errors.moTaChiTiet && <p className="text-red-500 text-xs mt-1">{errors.moTaChiTiet.message}</p>}
            </div>
          </div>
        </div>

        {/* Action bar - Các nút hành động phía dưới */}
        <div className="bg-slate-50/80 px-8 sm:px-12 py-6 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100">
          <button
            onClick={() => navigate("/admin/doctors")}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className={`w-full sm:w-auto px-12 py-3.5 rounded-2xl text-white text-sm font-black transition-all flex items-center justify-center gap-2 shadow-xl ${
              loading ? "bg-slate-300" : "bg-primary hover:bg-primary/90 shadow-primary/20"
            }`}
          >
            {loading ? (
              <LoadingSpinner size="size-5" color="text-white" />
            ) : (
              <span className="material-symbols-outlined text-sm">how_to_reg</span>
            )}
            Xác nhận thêm bác sĩ
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminAddDoctorPage;
