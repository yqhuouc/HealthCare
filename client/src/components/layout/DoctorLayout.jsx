import { useState } from "react";
import { NavLink, useNavigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import { CURRENT_DOCTOR } from "../../data/mockDoctorData";

const NAV_ITEMS = [
  { to: "/doctor/dashboard", icon: "dashboard", label: "Tổng quan" },
  { to: "/doctor/schedule", icon: "calendar_month", label: "Lịch làm việc" },
  { to: "/doctor/appointments", icon: "pending_actions", label: "Lịch khám hôm nay" },
  { to: "/doctor/history", icon: "history", label: "Lịch sử khám" },
  { to: "/doctor/profile", icon: "person", label: "Hồ sơ cá nhân" },
];

const PAGE_TITLES = {
  "/doctor/dashboard": { title: "Dashboard Bác sĩ", subtitle: `Chào mừng quay trở lại, ${CURRENT_DOCTOR.fullName}.` },
  "/doctor/schedule": { title: "Quản lý lịch làm việc", subtitle: "Xem và quản lý các ca trực trong tháng" },
  "/doctor/appointments": { title: "Quản lý lịch khám", subtitle: new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) },
  "/doctor/history": { title: "Lịch sử khám bệnh", subtitle: "Quản lý và tra cứu hồ sơ khám bệnh của bệnh nhân." },
  "/doctor/profile": { title: "Hồ sơ cá nhân", subtitle: "Quản lý và cập nhật thông tin chuyên môn của bạn." },
  "/doctor/schedule/add": { title: "Thêm ca làm việc", subtitle: "Khởi tạo ca trực mới trong hệ thống." },
};

function DoctorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/doctor/login");
  };

  const basePath = "/" + location.pathname.split("/").slice(1, 3).join("/");
  const pageInfo = PAGE_TITLES[basePath] || { title: "Doctor Portal", subtitle: "" };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200
          flex flex-col shrink-0 transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-2xl">medical_services</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary leading-none">HealthCare</h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase mt-1">
              Hệ thống quản lý y tế
            </p>
          </div>
        </div>

        {/* Doctor info */}
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 p-2">
            <div
              className="w-10 h-10 rounded-full bg-slate-200 bg-cover bg-center ring-2 ring-slate-100"
              style={{ backgroundImage: `url(${CURRENT_DOCTOR.image})` }}
            />
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate">
                {user?.fullName || CURRENT_DOCTOR.fullName}
              </span>
              <span className="text-xs text-slate-500 truncate">
                {CURRENT_DOCTOR.specialty}
              </span>
            </div>
          </div>
        </div>

        {/* Nav links */}
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
              <span className="material-symbols-outlined text-[22px]">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-3 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">logout</span>
            <span className="font-semibold text-sm">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 truncate">
                {pageInfo.title}
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm font-medium truncate hidden sm:block">{pageInfo.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-primary transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-10 w-px bg-slate-200 hidden md:block" />
            <div className="hidden md:flex items-center gap-3">
              <div className="flex flex-col items-end">
                <p className="text-sm font-bold leading-none">
                  {user?.fullName || CURRENT_DOCTOR.fullName}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">{CURRENT_DOCTOR.specialty}</p>
              </div>
              <div
                className="w-10 h-10 rounded-full bg-cover bg-center border-2 border-primary/20"
                style={{ backgroundImage: `url(${CURRENT_DOCTOR.image})` }}
              />
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DoctorLayout;
