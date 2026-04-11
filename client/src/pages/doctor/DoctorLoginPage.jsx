/**
 * ============================================================
 * TRANG: ĐĂNG NHẬP NỘI BỘ (BÁC SĨ & QUẢN TRỊ VIÊN)
 * Đường dẫn: /doctor-login
 * ============================================================
 * 
 * CHỨC NĂNG CHÍNH:
 * 1. Xác thực tài khoản với quyền hạn truy cập hệ thống quản lý.
 * 2. Phân quyền nghiệp vụ: Chỉ cho phép "bac_si" hoặc "admin" tiến sâu.
 * 3. Bảo mật: Ẩn/hiện mật khẩu và kiểm tra định dạng email chuẩn.
 * 
 * PHONG CÁCH THIẾT KẾ:
 * - Giao diện "Institutional" (Cơ quan nhà nước/Bệnh viện lớn): Nghiêm túc, đáng tin cậy.
 * - Cấu trúc 2 cột: Cột trái nhập liệu tinh giản, cột phải minh họa bằng hình ảnh/màu sắc thương hiệu.
 * - Sử dụng các thành phần Border-2 và màu Slate (Xám đá) để tạo cảm giác vững chãi.
 * ============================================================
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAuthStore from "../../stores/useAuthStore";

function DoctorLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  // Cấu hình Form validation
  const { register, handleSubmit, formState: { errors } } = useForm();

  /**
   * 1. HÀM XỬ LÝ ĐĂNG NHẬP
   */
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await login({ email: data.email, password: data.password });

      // Chặn người dùng có vai trò bệnh nhân ở trang này
      if (user.vaiTro !== "bac_si" && user.vaiTro !== "admin") {
        toast.error("Truy cập bị từ chối! Trang này chỉ dành cho nhân sự y tế.");
        await useAuthStore.getState().logout();
        return;
      }

      toast.success("Chào mừng bác sĩ trở lại làm việc!");
      navigate("/doctor/dashboard");
    } catch (err) {
      toast.error(err.message || "Email hoặc mật khẩu không chính xác.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-hidden font-sans">
      
      {/* --- CỘT TRÁI (NHẬP LIỆU) --- */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center bg-white p-8 lg:p-20 shadow-2xl z-10 animate-in slide-in-from-left duration-700">
        <div className="max-w-md mx-auto w-full space-y-12">
          
          {/* Header & Logo */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 text-primary">
              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                <span className="material-symbols-outlined text-3xl font-bold">medical_services</span>
              </div>
              <span className="text-2xl font-black tracking-tight">HealthCare<span className="text-slate-200">.</span></span>
            </Link>
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Cổng nhân vụ</h1>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Dành cho Bác sĩ & Quản trị viên</p>
            </div>
          </div>

          {/* Form nội dung */}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email công tác</label>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="doctor@healthcare.vn"
                  className={`w-full pl-5 pr-12 py-4 bg-slate-50 border-2 rounded-2xl text-sm font-bold transition-all outline-none ${errors.email ? "border-red-200 focus:border-red-500" : "border-slate-50 focus:border-primary/20 focus:bg-white"}`}
                  {...register("email", { required: "Vui lòng nhập Email" })}
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">mail</span>
              </div>
              {errors.email && <p className="text-[10px] text-red-500 font-bold uppercase ml-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mật khẩu</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  className={`w-full pl-5 pr-12 py-4 bg-slate-50 border-2 rounded-2xl text-sm font-bold transition-all outline-none ${errors.password ? "border-red-200 focus:border-red-500" : "border-slate-50 focus:border-primary/20 focus:bg-white"}`}
                  {...register("password", { required: "Vui lòng nhập mật khẩu" })}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-red-500 font-bold uppercase ml-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl text-xs font-bold uppercase tracking-[0.3em] shadow-xl shadow-slate-200 hover:bg-primary transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="size-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">verified_user</span>
                  Xác nhận truy cập
                </>
              )}
            </button>
          </form>

          {/* Footer điều hướng */}
          <div className="pt-10 border-t border-slate-100 flex flex-col items-center gap-6">
             <Link to="/" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2">
               <span className="material-symbols-outlined text-sm">west</span>
               Quay lại trang chủ bệnh nhân
             </Link>
             <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">© 2024 HealthCare Management System</p>
          </div>
        </div>
      </div>

      {/* --- CỘT PHẢI (TRANG TRÍ) --- */}
      <div className="hidden lg:flex w-[55%] bg-primary relative flex-col justify-center px-16 text-white overflow-hidden">
        {/* Layer pattern mờ */}
        <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
          <div className="flex flex-wrap gap-12 p-10 rotate-12 scale-150">
             {Array(20).fill(null).map((_, i) => (
               <span key={i} className="material-symbols-outlined text-6xl">stethoscope</span>
             ))}
          </div>
        </div>

        {/* Nội dung điểm nhấn */}
        <div className="relative z-10 space-y-8 animate-in fade-in slide-in-from-right duration-1000">
          <h2 className="text-6xl font-black leading-[1.1] tracking-tighter">Nền tảng vận hành <br /> y tế chuyên nghiệp.</h2>
          <p className="text-xl text-white/70 font-medium max-w-sm leading-relaxed">Hỗ trợ đội ngũ y bác sĩ quản lý hồ sơ và lịch trình khám chữa bệnh tối ưu, bảo mật và đồng bộ.</p>
          
          {/* Stats mockup */}
          <div className="pt-10 flex gap-16 border-t border-white/20">
            <div>
              <p className="text-3xl font-black">15,000+</p>
              <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Bệnh nhân tin dùng</p>
            </div>
            <div>
              <p className="text-3xl font-black">200+</p>
              <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Chuyên gia hàng đầu</p>
            </div>
          </div>
        </div>

        {/* Decoration circles */}
        <div className="absolute -bottom-20 -right-20 size-80 rounded-full border-2 border-white/5" />
        <div className="absolute -top-10 -right-10 size-40 rounded-full bg-white/5" />
      </div>

    </div>
  );
}

export default DoctorLoginPage;
