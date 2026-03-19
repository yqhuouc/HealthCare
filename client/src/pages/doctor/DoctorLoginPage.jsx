/**
 * ============================================================
 * TRANG: Đăng nhập bác sĩ
 * Đường dẫn: /doctor-login
 * ============================================================
 *
 * Chức năng:
 * - Form đăng nhập riêng dành cho bác sĩ (tách biệt với bệnh nhân)
 * - Validate bằng react-hook-form (email hợp lệ, password ≥ 6 ký tự)
 * - Gọi API authService.login() → lưu token vào Zustand store → chuyển hướng /doctor/dashboard
 * - Toggle hiển thị/ẩn mật khẩu
 * - Layout 2 cột: Form (trái) + Panel gradient với icon y tế (phải)
 *
 * State:
 * - showPassword: toggle hiển thị mật khẩu
 * - loading: trạng thái đang gọi API
 *
 * Khác với LoginPage (bệnh nhân):
 * - Chuyển hướng sau login → /doctor/dashboard (thay vì /)
 * - Panel phải dùng gradient CSS + pattern icon (không dùng ảnh ngoài)
 * - Không có link đăng ký (bác sĩ được admin tạo tài khoản)
 * ============================================================
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authService } from "../../services/authService";
import useAuthStore from "../../stores/useAuthStore";

/** Tailwind class dùng chung cho input và label trong form */
const INPUT_CLASS =
  "w-full px-4 py-3.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all";
const LABEL_CLASS = "block text-sm font-semibold text-slate-700 mb-2";

// Các icon y tế dùng cho pattern trang trí
const MEDICAL_ICONS = ["medical_services", "stethoscope", "local_hospital", "vaccines", "healing"];

function DoctorLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Xử lý đăng nhập bác sĩ: gọi API → lưu token vào store → chuyển hướng đến dashboard
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authService.login(data);
      setAuth(res.user, res.token);
      toast.success("Đăng nhập thành công!");
      navigate("/doctor/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Cột trái: Form đăng nhập */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-16 bg-white">
        <div className="max-w-md mx-auto w-full">
          {/* Logo + tiêu đề */}
          <div className="mb-8 flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-3xl">medical_services</span>
            <span className="text-xl font-bold">HealthCare</span>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-2">Đăng nhập bác sĩ</h2>
          <p className="text-slate-500 mb-8">Chào mừng bác sĩ quay trở lại với hệ thống đặt lịch khám.</p>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Trường Email */}
            <div className="space-y-2">
              <label className={LABEL_CLASS}>Email</label>
              <input
                type="email"
                placeholder="example@gmail.com"
                className={`${INPUT_CLASS} ${errors.email ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
                {...register("email", {
                  required: "Vui lòng nhập email",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Email không hợp lệ",
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Trường Mật khẩu — có nút toggle hiển thị/ẩn */}
            <div className="space-y-2">
              <label className={LABEL_CLASS}>Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`${INPUT_CLASS} pr-12 ${errors.password ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
                  {...register("password", {
                    required: "Vui lòng nhập mật khẩu",
                    minLength: { value: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
                  })}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Nút submit — disabled khi đang loading */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">login</span>
                  Đăng nhập
                </>
              )}
            </button>
          </form>

          {/* Link quay về trang chủ */}
          <div className="mt-10 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Quay về trang chủ
            </Link>
          </div>
        </div>
      </div>

      {/* Cột phải: Nền gradient + pattern icon y tế (không dùng ảnh ngoài) */}
      <RightPanel />
    </div>
  );
}

/** Panel phải: gradient CSS + grid icon y tế trang trí */
function RightPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center p-12 text-white overflow-hidden bg-linear-to-br from-primary via-primary/95 to-primary/90">
      {/* Pattern: lưới icon y tế với opacity thấp */}
      <div className="absolute inset-0 flex flex-wrap content-start gap-8 p-8 opacity-15">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className="material-symbols-outlined text-4xl">
            {MEDICAL_ICONS[i % MEDICAL_ICONS.length]}
          </span>
        ))}
      </div>

      {/* Overlay mờ nhẹ để nội dung dễ đọc */}
      <div className="absolute inset-0 bg-white/5" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <span className="material-symbols-outlined text-5xl">medical_services</span>
          <h1 className="text-3xl font-black tracking-tight">HealthCare</h1>
        </div>
        <h2 className="text-4xl xl:text-5xl font-extrabold leading-tight mb-6">
          Kênh đăng nhập dành cho bác sĩ
        </h2>
        <p className="text-lg text-white/90 max-w-md">
          Quản lý lịch khám, bệnh nhân và hồ sơ y tế một cách chuyên nghiệp và hiệu quả.
        </p>
      </div>
    </div>
  );
}

export default DoctorLoginPage;
