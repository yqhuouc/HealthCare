/**
 * ============================================================
 * TRANG: Quên mật khẩu
 * Đường dẫn: /forgot-password
 * ============================================================
 *
 * Chức năng:
 * - Form nhập email để yêu cầu đặt lại mật khẩu
 * - Gọi API authService.forgotPassword() → gửi email chứa link reset
 * - Hiển thị trạng thái thành công / lỗi
 * - Layout 2 cột giống trang Login/Register
 *
 * State:
 * - loading: boolean trạng thái đang gọi API
 * - submitted: boolean đã gửi thành công hay chưa
 *
 * Thư viện: react-hook-form (validation), react-toastify (thông báo), authService (gọi API)
 * ============================================================
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "../../validations/authSchema";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authService } from "../../services/authService";

/** Đường dẫn ảnh nền cho panel trái (dùng chung với LoginPage) */
const IMAGE_URL = "/images/login-bg.jpg";

const INPUT_CLASS =
  "w-full px-4 py-3.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all";
const LABEL_CLASS = "block text-sm font-semibold text-slate-700 mb-2";

function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data.email);
      toast.success("Mã OTP đã được gửi về email của bạn!");
      navigate("/reset-password", { state: { email: data.email } });
    } catch (err) {
      toast.error(err.message || "Có lỗi xảy ra. Vui lòng thử lại.");
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

          {/* Cột phải: Form quên mật khẩu */}
          <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center bg-white">
            {/* Logo hiển thị trên mobile */}
            <div className="mb-8 lg:hidden flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-3xl">medical_services</span>
              <span className="text-xl font-bold">HealthCare</span>
            </div>

            <div className="max-w-md mx-auto w-full">
              {/* Icon + Tiêu đề */}
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-4xl text-primary">lock_reset</span>
                <h2 className="text-3xl font-bold text-slate-900">Quên mật khẩu</h2>
              </div>
              <p className="text-slate-500 mb-8">
                Nhập email bạn đã đăng ký, chúng tôi sẽ gửi mã xác thực (OTP) cho bạn.
              </p>

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
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                {/* Nút submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">send</span>
                      Gửi yêu cầu
                    </>
                  )}
                </button>
              </form>

              {/* Link quay về đăng nhập */}
              <div className="mt-10 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-slate-600 hover:text-primary font-semibold transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  Quay lại đăng nhập
                </Link>
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
        <img alt="Bác sĩ đang tư vấn y tế hiện đại" className="w-full h-full object-cover" src={IMAGE_URL} />
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

export default ForgotPasswordPage;
