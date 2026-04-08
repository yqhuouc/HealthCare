/**
 * ============================================================
 * TRANG: Đăng nhập dành cho Bác sĩ & Quản trị viên
 * Đường dẫn: /doctor-login
 * ============================================================
 *
 * Chức năng chính:
 * 1. Cung cấp giao diện đăng nhập riêng biệt cho nhân sự y tế.
 * 2. Xác thực (Authentication):
 *    - Sử dụng react-hook-form để quản lý và validate dữ liệu đầu vào.
 *    - Ràng buộc: Email đúng định dạng, Mật khẩu tối thiểu 6 ký tự.
 * 3. Phân quyền (Authorization):
 *    - Sau khi gọi API login, kiểm tra vai trò (Role).
 *    - Chỉ cho phép `bac_si` hoặc `admin` truy cập vào hệ thống nội bộ này.
 *    - Nếu sai vai trò, hệ thống tự động đăng xuất và thông báo lỗi.
 * 4. Điều hướng: Chuyển hướng về `/doctor/dashboard` sau khi đăng nhập thành công.
 *
 * Giao diện:
 * - Thiết kế 2 cột hiện đại.
 * - Cột trái: Form nhập liệu tối giản, tập trung.
 * - Cột phải: Panel trang trí sử dụng Gradient và Pattern icon y tế (Pure CSS).
 * ============================================================
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAuthStore from "../../stores/useAuthStore";

/**
 * Các hằng số Style Tailwind để đảm bảo tính đồng nhất
 */
const INPUT_CLASS =
  "w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 text-slate-800 font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all placeholder:text-slate-300";
const LABEL_CLASS =
  "block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1";

// Danh sách các icon Google Symbols dùng cho trang trí Right Panel
const MEDICAL_ICONS = [
  "medical_services",
  "stethoscope",
  "local_hospital",
  "vaccines",
  "healing",
  "monitor_heart",
  "pills",
  "psychiatry",
];

function DoctorLoginPage() {
  const [showPassword, setShowPassword] = useState(false); // Trạng thái ẩn/hiện mật khẩu
  const [loading, setLoading] = useState(false); // Trạng thái chờ xử lý API
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login); // Hàm login từ Zustand store

  // Khởi tạo react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  /**
   * XỨ LÝ ĐĂNG NHẬP
   */
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // 1. Gọi hàm login từ Store (Xử lý API & Lưu Session)
      const user = await login({ email: data.email, password: data.password });

      // 2. Kiểm tra vai trò người dùng (Chặn bệnh nhân đăng nhập vào trang bác sĩ)
      if (user.vaiTro !== "bac_si" && user.vaiTro !== "admin") {
        toast.error(
          "Truy cập bị từ chối! Tài khoản này không có quyền bác sĩ.",
        );
        await useAuthStore.getState().logout(); // Logout ngay lập tức để xóa session không hợp lệ
        return;
      }

      // 3. Thành công -> Điều hướng vào Dashboard nội bộ
      toast.success("Chào mừng bác sĩ quay trở lại!");
      navigate("/doctor/dashboard");
    } catch (err) {
      // Xử lý lỗi từ Server (Sai pass, email không tồn tại, v.v.)
      toast.error(
        err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* CỘT TRÁI: KHU VỰC FORM ĐĂNG NHẬP */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-20 bg-white shadow-2xl z-10">
        <div className="max-w-md mx-auto w-full space-y-10">
          {/* Logo & Lời chào */}
          <div className="space-y-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 text-primary group transition-all"
            >
              <span className="material-symbols-outlined text-4xl font-black bg-primary/10 p-2 rounded-2xl group-hover:scale-110 transition-transform">
                medical_services
              </span>
              <span className="text-2xl font-black tracking-tighter">
                HealthCare<span className="text-slate-300">.</span>
              </span>
            </Link>
            <div>
              <h2 className="text-4xl font-black text-slate-800 tracking-tight">
                Cổng Nội bộ
              </h2>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2 italic">
                Dành riêng cho Bác sĩ & Quản trị viên
              </p>
            </div>
          </div>

          {/* FORM NHẬP LIỆU */}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Input: Email */}
            <div className="space-y-1">
              <label className={LABEL_CLASS}>Email bác sĩ</label>
              <div className="relative group">
                <input
                  type="email"
                  placeholder="doctor@healthcare.com"
                  className={`${INPUT_CLASS} ${errors.email ? "border-red-200 ring-4 ring-red-500/5 bg-red-50/30" : ""}`}
                  {...register("email", {
                    required: "Vui lòng cung cấp địa chỉ email công vụ",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Định dạng email không hợp lệ",
                    },
                  })}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-300 group-focus-within:text-primary transition-colors">
                  mail
                </span>
              </div>
              {errors.email && (
                <p className="text-red-500 text-[10px] font-black uppercase mt-1.5 ml-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Input: Mật khẩu */}
            <div className="space-y-1">
              <label className={LABEL_CLASS}>Mật khẩu</label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`${INPUT_CLASS} pr-14 ${errors.password ? "border-red-200 ring-4 ring-red-500/5 bg-red-50/30" : ""}`}
                  {...register("password", {
                    required: "Vui lòng nhập mật khẩu truy cập",
                    minLength: {
                      value: 6,
                      message: "Mật khẩu an toàn phải từ 6 ký tự",
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 size-10 flex items-center justify-center text-slate-300 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-[10px] font-black uppercase mt-1.5 ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Nút Đăng nhập */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-[3px] py-5 rounded-2xl shadow-xl shadow-primary/25 flex items-center justify-center gap-3 transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin font-black">
                      progress_activity
                    </span>
                    Đang xác thực bảo mật...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined font-black">
                      verified_user
                    </span>
                    Xác nhận đăng nhập
                  </>
                )}
              </button>
            </div>
          </form>

          {/* CHÂN TRANG: Điều hướng phụ */}
          <div className="pt-10 border-t border-slate-50 flex flex-col items-center gap-6">
            <Link
              to="/"
              className="group inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-all"
            >
              <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">
                west
              </span>
              Quay về cổng Bệnh nhân
            </Link>
            <p className="text-[9px] text-slate-300 font-medium text-center uppercase tracking-tighter">
              Bản quyền thuộc về hệ thống quản lý cơ sở y tế HealthCare © 2024
            </p>
          </div>
        </div>
      </div>

      {/* CỘT PHẢI: TRANG TRÍ (AESTHETIC PANEL) */}
      <RightPanel />
    </div>
  );
}

/**
 * Component trang trí bên phải trang login
 */
function RightPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center p-16 text-white overflow-hidden bg-linear-to-br from-primary via-primary/95 to-slate-900">
      {/* Pattern: lưới icon mờ ảo phía sau */}
      <div className="absolute inset-0 flex flex-wrap content-start gap-12 p-12 opacity-10 rotate-12 scale-125 select-none pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <span key={i} className="material-symbols-outlined text-5xl">
            {MEDICAL_ICONS[i % MEDICAL_ICONS.length]}
          </span>
        ))}
      </div>

      {/* Lớp gradient overlay tăng chiều sâu */}
      <div className="absolute inset-0 bg-radial-at-bl from-white/10 to-transparent pointer-events-none" />

      {/* Nội dung giới thiệu */}
      <div className="relative z-10 space-y-8">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-6xl font-black bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20">
            clinical_notes
          </span>
        </div>
        <div className="space-y-4">
          <h2 className="text-5xl xl:text-6xl font-black leading-[1.1] tracking-tighter italic">
            Nơi sức khỏe <br />
            bắt đầu từ <br />
            <span className="text-white/40 not-italic">sự tận tâm.</span>
          </h2>
          <p className="text-xl text-white/70 font-medium leading-relaxed max-w-sm">
            Công cụ hỗ trợ bác sĩ tối ưu hóa quy trình làm việc, tập trung hoàn
            toàn vào việc chăm sóc sức khỏe cộng đồng.
          </p>
        </div>

        {/* Chỉ số ảo - mockup cho đẹp */}
        <div className="flex gap-10 pt-8 border-t border-white/10">
          <div>
            <p className="text-3xl font-black">2.5k+</p>
            <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">
              Ca khám/tháng
            </p>
          </div>
          <div>
            <p className="text-3xl font-black">99%</p>
            <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">
              Hài lòng
            </p>
          </div>
        </div>
      </div>

      {/* Góc dưới: Decoration */}
      <div className="absolute bottom-10 right-10 flex gap-4 opacity-30 select-none">
        <div className="size-20 rounded-full border border-white" />
        <div className="size-20 rounded-full bg-white/20" />
      </div>
    </div>
  );
}

export default DoctorLoginPage;
