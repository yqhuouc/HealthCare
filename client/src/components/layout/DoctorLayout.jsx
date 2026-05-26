import { useState } from "react";
import { NavLink, useNavigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";

/**
 * Danh sách các mục điều hướng ở sidebar cho Bác sĩ
 */
const NAV_ITEMS = [
  { to: "/doctor/dashboard", icon: "dashboard", label: "Tổng quan" },
  { to: "/doctor/schedule", icon: "calendar_month", label: "Lịch làm việc" },
  {
    to: "/doctor/appointments",
    icon: "pending_actions",
    label: "Lịch khám hôm nay",
  },
  { to: "/doctor/history", icon: "history", label: "Lịch sử khám" },
  { to: "/doctor/profile", icon: "person", label: "Hồ sơ cá nhân" },
];

/**
 * Layout chính cho khu vực Bác sĩ (Doctor Portal)
 * Bao gồm Sidebar, Header và vùng nội dung chính (Outlet)
 */
function DoctorLayout() {
  // Quản lý trạng thái đóng/mở sidebar trên thiết bị di động
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // - useNavigate: Dùng để chuyển trang bằng code (ví dụ: quay lại login sau khi logout)
  const navigate = useNavigate();
  // - useLocation: Dùng để lấy URL hiện tại (để hiển thị đúng tiêu đề trang tương ứng)
  const location = useLocation();
  
  // Lấy thông tin người dùng và hàm đăng xuất từ store (Zustand)
  const { user, logout } = useAuthStore();

  // Lấy thông tin chi tiết bác sĩ từ đối tượng user
  const doctor = user?.bacSi;
  const doctorName = doctor
    ? `${doctor.hocViChucDanh || ""} ${doctor.tenBacSi}`.trim()
    : user?.fullName || "Bác sĩ";
  
  // Tên chuyên khoa của bác sĩ
  const specialty = doctor?.chuyenKhoa?.tenChuyenKhoa || "Chuyên khoa";

  /**
   * Hàm xử lý URL ảnh đại diện, kiểm tra xem là URL tuyệt đối hay tương đối
   */
  const getAvatarUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${url}`;
  };

  // Xác định URL ảnh đại diện cuối cùng (ưu tiên ảnh user -> ảnh bác sĩ -> ảnh mặc định theo tên)
  const avatarUrl =
    getAvatarUrl(user?.anhDaiDien) ||
    getAvatarUrl(doctor?.anhDaiDien) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorName)}&size=128&background=1f89e5&color=fff`;

  /**
   * Cấu hình tiêu đề và mô tả cho từng trang dựa trên đường dẫn (URL)
   */
  const PAGE_TITLES = {
    "/doctor/dashboard": {
      title: "Dashboard Bác sĩ",
      subtitle: `Chào mừng quay trở lại, ${doctor?.tenBacSi || "Bác sĩ"}.`,
    },
    "/doctor/schedule": {
      title: "Quản lý lịch làm việc",
      subtitle: "Xem và quản lý các ca trực trong tháng",
    },
    "/doctor/appointments": {
      title: "Quản lý lịch khám",
      subtitle: new Date().toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    },
    "/doctor/history": {
      title: "Lịch sử khám bệnh",
      subtitle: "Quản lý và tra cứu hồ sơ khám bệnh của bệnh nhân.",
    },
    "/doctor/profile": {
      title: "Hồ sơ cá nhân",
      subtitle: "Quản lý và cập nhật thông tin chuyên môn của bạn.",
    },
    "/doctor/schedule/add": {
      title: "Thêm ca làm việc",
      subtitle: "Khởi tạo ca trực mới trong hệ thống.",
    },
  };

  /**
   * Xử lý đăng xuất: Gọi hàm logout từ store và điều hướng về trang login
   */
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Lấy đường dẫn cơ sở để xác định tiêu đề trang (ví dụ: /doctor/schedule/add -> /doctor/schedule)
  const basePath = "/" + location.pathname.split("/").slice(1, 3).join("/");
  const pageInfo = PAGE_TITLES[basePath] || {
    title: "Doctor Portal",
    subtitle: "",
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Lớp phủ mờ khi mở sidebar trên Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* --- Sidebar Sidebar --- */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200
          flex flex-col shrink-0 transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Phần Logo ứng dụng */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-2xl">
              medical_services
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary leading-none">
              HealthCare
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase mt-1">
              Hệ thống quản lý y tế
            </p>
          </div>
        </div>

        {/* Thông tin bác sĩ tóm tắt ở sidebar */}
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 p-2">
            <div
              className="w-10 h-10 rounded-full bg-slate-200 bg-cover bg-center ring-2 ring-slate-100"
              style={{ backgroundImage: `url(${avatarUrl})` }}
            />
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate">
                {doctorName}
              </span>
              <span className="text-xs text-slate-500 truncate">
                {specialty}
              </span>
            </div>
          </div>
        </div>

        {/* Danh sách các link điều hướng */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/30 font-semibold"
                    : "text-slate-600 hover:bg-primary/5 hover:text-primary font-medium"
                }`
              }
            >
              <span className="material-symbols-outlined text-[22px]">
                {icon}
              </span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Nút Đăng xuất ở cuối sidebar */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-3 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">
              logout
            </span>
            <span className="font-semibold text-sm">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* --- Khu vực nội dung chính --- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header phía trên */}
        <header className="h-20 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Nút mở menu cho Mobile */}
            <button
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            {/* Tiêu đề trang hiện tại */}
            <div className="min-w-0">
              <h2 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 truncate">
                {pageInfo.title}
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm font-medium truncate hidden sm:block">
                {pageInfo.subtitle}
              </p>
            </div>
          </div>

          {/* Thông tin bác sĩ ở góc phải Header (chỉ hiện trên màn hình lớn) */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              <div className="flex flex-col items-end">
                <p className="text-sm font-bold leading-none">{doctorName}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{specialty}</p>
              </div>
              <div
                className="w-10 h-10 rounded-full bg-cover bg-center border-2 border-primary/20"
                style={{ backgroundImage: `url(${avatarUrl})` }}
              />
            </div>
          </div>
        </header>

        {/* Nội dung thay đổi của từng trang con */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DoctorLayout;
