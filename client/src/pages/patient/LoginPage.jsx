/**
 * ============================================================
 * TRANG: Đăng nhập bệnh nhân
 * Đường dẫn: /login
 * ============================================================
 *
 * Chức năng:
 * - Form đăng nhập với email + mật khẩu
 * - Validate bằng react-hook-form (email hợp lệ, password ≥ 6 ký tự)
 * - Gọi API authService.login() → lưu thông tin user vào Zustand store → chuyển hướng theo vai trò (role)
 * - Toggle hiển thị/ẩn mật khẩu
 * - Checkbox "Ghi nhớ đăng nhập" + link "Quên mật khẩu"
 * - Link sang trang đăng ký (/register)
 * - Layout 2 cột: Panel trái (ảnh + slogan) + Panel phải (form)
 *
 * State:
 * - showPassword: boolean toggle hiển thị mật khẩu dạng text/password
 * - loading: boolean trạng thái đang gọi API
 *
 * Thư viện: react-hook-form (validation), react-toastify (thông báo),
 *           Zustand/useAuthStore (quản lý auth), authService (gọi API)
 * ============================================================
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../validations/authSchema";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAuthStore from "../../stores/useAuthStore";

/** Đường dẫn ảnh nền cho panel trái */
const IMAGE_URL = "/images/login-bg.jpg";

const INPUT_CLASS =
  "w-full px-4 py-3.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all";
const LABEL_CLASS = "block text-sm font-semibold text-slate-700 mb-2";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // Xử lý đăng nhập: gọi API → server set cookie → redirect theo vai trò
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await login({ email: data.email, password: data.password });
      toast.success("Đăng nhập thành công!");
      // Redirect theo vai trò từ server
      if (user.vaiTro === "admin") navigate("/admin");
      else if (user.vaiTro === "bac_si") navigate("/doctor/dashboard");
      else navigate("/");
    } catch (err) {
      toast.error(err.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grow flex items-center justify-center py-12 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-stretch justify-center max-w-6xl mx-auto overflow-hidden bg-white rounded-xl shadow-xl">
          {/* Cột trái: Hình ảnh minh họa + slogan thương hiệu */}
          <LeftPanel />

          {/* Cột phải: Form đăng nhập */}
          <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center bg-white">
            {/* Logo hiển thị trên mobile (ẩn trên desktop vì đã có ở cột trái) */}
            <div className="mb-8 lg:hidden flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-3xl">medical_services</span>
              <span className="text-xl font-bold">HealthCare</span>
            </div>

            <div className="max-w-md mx-auto w-full">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Đăng nhập tài khoản</h2>
              <p className="text-slate-500 mb-8">Chào mừng bạn quay trở lại với HealthCare.</p>

              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {/* Trường Email */}
                <div className="space-y-2">
                  <label className={LABEL_CLASS}>Email</label>
                  <input
                    type="email"
                    placeholder="example@gmail.com"
                    className={`${INPUT_CLASS} ${errors.email ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
                    {...register("email")}
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
                      {...register("password")}
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

                {/* Ghi nhớ đăng nhập & quên mật khẩu */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary focus:ring-offset-0 bg-slate-50 transition-all"
                    />
                    <span className="text-sm text-slate-600 group-hover:text-slate-900">
                      Ghi nhớ đăng nhập
                    </span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-semibold text-primary hover:underline underline-offset-4"
                  >
                    Quên mật khẩu?
                  </Link>
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
                    "Đăng nhập"
                  )}
                </button>
              </form>

              {/* Link chuyển sang trang đăng ký */}
              <div className="mt-10 text-center">
                <p className="text-slate-600">
                  Chưa có tài khoản?
                  <Link
                    to="/register"
                    className="text-primary font-bold hover:underline underline-offset-4 ml-1"
                  >
                    Đăng ký ngay
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Panel trái dùng chung: ảnh nền + overlay xanh + logo + slogan */
function LeftPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center p-12 text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-primary/80 z-10 mix-blend-multiply" />
        <img
          alt="Bác sĩ đang tư vấn y tế hiện đại"
          className="w-full h-full object-cover"
          src={IMAGE_URL}
        />
      </div>
      <div className="relative z-20">
        <div className="flex items-center gap-3 mb-8">
          <span className="material-symbols-outlined text-4xl">medical_services</span>
          <h1 className="text-3xl font-black tracking-tight">HealthCare</h1>
        </div>
        <h2 className="text-4xl xl:text-5xl font-extrabold leading-tight mb-6">
          Chăm sóc sức khỏe của bạn mọi lúc, mọi nơi.
        </h2>
        <p className="text-lg text-blue-50 opacity-90 max-w-md">
          Nền tảng y tế kỹ thuật số hiện đại giúp bạn kết nối với bác sĩ hàng đầu chỉ trong vài phút.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
