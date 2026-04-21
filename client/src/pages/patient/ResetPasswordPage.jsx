/**
 * ============================================================
 * TRANG: Đặt lại mật khẩu
 * Đường dẫn: /reset-password?token=xxx
 * ============================================================
 *
 * Chức năng:
 * - Lấy token từ URL query parameter
 * - Form nhập mật khẩu mới + xác nhận mật khẩu
 * - Gọi API authService.resetPassword() → cập nhật mật khẩu
 * - Hiển thị trạng thái thành công và chuyển hướng về trang đăng nhập
 * - Layout 2 cột giống trang Login/Register
 *
 * State:
 * - showPassword / showConfirm: toggle hiển thị mật khẩu
 * - loading: boolean trạng thái đang gọi API
 * - success: boolean đã đặt lại mật khẩu thành công
 *
 * Thư viện: react-hook-form (validation), react-toastify (thông báo), authService (gọi API)
 * ============================================================
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "../../validations/authSchema";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authService } from "../../services/authService";

/** Đường dẫn ảnh nền cho panel trái (dùng chung với LoginPage) */
const IMAGE_URL = "/images/login-bg.jpg";

const INPUT_CLASS =
  "w-full px-4 py-3.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all";
const LABEL_CLASS = "block text-sm font-semibold text-slate-700 mb-2";

function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    if (!email) {
      toast.error("Thiếu thông tin email. Vui lòng thử lại.");
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(email, data.otp, data.matKhauMoi);
      setSuccess(true);
      toast.success("Đặt lại mật khẩu thành công!");
    } catch (err) {
      toast.error(err.message || "Có lỗi xảy ra. Link có thể đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  // Nếu không có email trong state → hiển thị thông báo yêu cầu làm lại
  if (!email && !success) {
    return (
      <div className="grow flex items-center justify-center py-12">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-red-500">error</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Quy trình không hợp lệ</h2>
          <p className="text-slate-500 mb-6">
            Thiếu thông tin email. Vui lòng thực hiện lại quy trình từ bước đầu tiên.
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-lg transition-all"
          >
            <span className="material-symbols-outlined">lock_reset</span>
            Yêu cầu lại
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grow flex items-center justify-center py-12 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-stretch justify-center max-w-6xl mx-auto overflow-hidden bg-white rounded-xl shadow-xl">
          {/* Cột trái */}
          <LeftPanel />

          {/* Cột phải: Form đặt lại mật khẩu */}
          <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center bg-white">
            {/* Logo hiển thị trên mobile */}
            <div className="mb-8 lg:hidden flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-3xl">medical_services</span>
              <span className="text-xl font-bold">HealthCare</span>
            </div>

            <div className="max-w-md mx-auto w-full">
              {!success ? (
                <>
                  {/* Icon + Tiêu đề */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-4xl text-primary">password</span>
                    <h2 className="text-3xl font-bold text-slate-900">Đặt lại mật khẩu</h2>
                  </div>
                  <p className="text-slate-500 mb-8">
                    Nhập mã OTP gồm 6 chữ số đã được gửi tới email <strong>{email}</strong> và mật khẩu mới cho tài khoản của bạn.
                  </p>

                  <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                    {/* Mã OTP */}
                    <div>
                      <label className={LABEL_CLASS}>Mã xác thực (OTP)</label>
                      <input
                        type="text"
                        placeholder="VD: 123456"
                        maxLength={6}
                        className={`${INPUT_CLASS} text-center tracking-widest font-mono text-lg ${errors.otp ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
                        {...register("otp")}
                      />
                      {errors.otp && <p className="text-red-500 text-xs mt-1 text-center">{errors.otp.message}</p>}
                    </div>

                    {/* Mật khẩu mới */}
                    <div>
                      <label className={LABEL_CLASS}>Mật khẩu mới</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className={`${INPUT_CLASS} pr-12 ${errors.matKhauMoi ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
                          {...register("matKhauMoi")}
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
                      {errors.matKhauMoi && <p className="text-red-500 text-xs mt-1">{errors.matKhauMoi.message}</p>}
                    </div>

                    {/* Xác nhận mật khẩu */}
                    <div>
                      <label className={LABEL_CLASS}>Xác nhận mật khẩu mới</label>
                      <div className="relative">
                        <input
                          type={showConfirm ? "text" : "password"}
                          placeholder="••••••••"
                          className={`${INPUT_CLASS} pr-12 ${errors.xacNhanMatKhau ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
                          {...register("xacNhanMatKhau")}
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
                      {errors.xacNhanMatKhau && (
                        <p className="text-red-500 text-xs mt-1">{errors.xacNhanMatKhau.message}</p>
                      )}
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
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined">lock</span>
                          Đặt lại mật khẩu
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                /* Trạng thái thành công */
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-4xl text-green-600">check_circle</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">Đặt lại mật khẩu thành công!</h2>
                  <p className="text-slate-500 mb-8 leading-relaxed">
                    Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập ngay bằng mật khẩu mới.
                  </p>
                  <button
                    onClick={() => navigate("/login")}
                    className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-primary/20 inline-flex items-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined">login</span>
                    Đăng nhập ngay
                  </button>
                </div>
              )}

              {/* Link quay về đăng nhập */}
              {!success && (
                <div className="mt-10 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-slate-600 hover:text-primary font-semibold transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Quay lại đăng nhập
                  </Link>
                </div>
              )}
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

export default ResetPasswordPage;
