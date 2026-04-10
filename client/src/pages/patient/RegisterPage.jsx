/**
 * ============================================================
 * TRANG: Đăng ký tài khoản bệnh nhân
 * Đường dẫn: /register
 * ============================================================
 *
 * Chức năng:
 * - Form đăng ký: họ tên, email, SĐT, mật khẩu, xác nhận mật khẩu
 * - Validate bằng react-hook-form:
 *   + Email: regex kiểm tra định dạng hợp lệ
 *   + SĐT: regex Việt Nam (0xxx hoặc +84xxx, 10 số)
 *   + Mật khẩu: tối thiểu 6 ký tự
 *   + Xác nhận MK: phải trùng khớp với mật khẩu
 * - Gọi API authService.register() → thông báo thành công → chuyển sang /login
 * - Toggle hiển thị/ẩn cho cả 2 trường mật khẩu
 * - Layout 2 cột giống trang Login
 *
 * State:
 * - showPassword: toggle hiển thị mật khẩu
 * - showConfirm: toggle hiển thị xác nhận mật khẩu
 * - loading: trạng thái đang gọi API
 *
 * Thư viện: react-hook-form, react-toastify, authService
 * ============================================================
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../../validations/authSchema";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authService } from "../../services/authService";

/** Đường dẫn ảnh nền cho panel trái (dùng chung với LoginPage) */
const IMAGE_URL = "/images/login-bg.jpg";

const INPUT_CLASS =
  "w-full px-4 py-3.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all";
const LABEL_CLASS = "block text-sm font-semibold text-slate-700 mb-2";

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  // Xử lý đăng ký: gọi API → thông báo thành công → chuyển sang trang đăng nhập
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.register({
        hoTen: data.fullName,
        email: data.email,
        soDienThoai: data.phone,
        matKhau: data.password,
      });
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (err) {
      toast.error(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
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

          {/* Cột phải: Form đăng ký */}
          <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center bg-white">
            {/* Logo hiển thị trên mobile */}
            <div className="mb-8 lg:hidden flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-3xl">medical_services</span>
              <span className="text-xl font-bold">HealthCare</span>
            </div>

            <div className="max-w-md mx-auto w-full">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Đăng ký tài khoản</h2>
              <p className="text-slate-500 mb-8">Tạo tài khoản để đặt lịch khám bệnh dễ dàng.</p>

              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                {/* Họ và tên */}
                <div>
                  <label className={LABEL_CLASS}>Họ và tên</label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className={`${INPUT_CLASS} ${errors.fullName ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
                    {...register("fullName")}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
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

                {/* Số điện thoại */}
                <div>
                  <label className={LABEL_CLASS}>Số điện thoại</label>
                  <input
                    type="tel"
                    placeholder="0912 345 678"
                    className={`${INPUT_CLASS} ${errors.phone ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                  )}
                </div>

                {/* Mật khẩu — có toggle hiển thị/ẩn */}
                <div>
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

                {/* Xác nhận mật khẩu — validate phải trùng với trường mật khẩu */}
                <div>
                  <label className={LABEL_CLASS}>Xác nhận mật khẩu</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      className={`${INPUT_CLASS} pr-12 ${errors.confirmPassword ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      <span className="material-symbols-outlined">
                        {showConfirm ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
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
                    "Đăng ký"
                  )}
                </button>
              </form>

              {/* Link chuyển sang trang đăng nhập */}
              <div className="mt-10 text-center">
                <p className="text-slate-600">
                  Đã có tài khoản?
                  <Link
                    to="/login"
                    className="text-primary font-bold hover:underline underline-offset-4 ml-1"
                  >
                    Đăng nhập
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

export default RegisterPage;
