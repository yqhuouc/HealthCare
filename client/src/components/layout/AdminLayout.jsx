import { useState } from "react";
import { NavLink, useNavigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";

const NAV_ITEMS = [
  { to: "/admin/dashboard", icon: "dashboard", label: "Tổng quan" },
  { to: "/admin/specialties", icon: "category", label: "Quản lý chuyên khoa" },
  { to: "/admin/doctors", icon: "medical_information", label: "Quản lý bác sĩ" },
  { to: "/admin/patients", icon: "group", label: "Quản lý bệnh nhân" },
  { to: "/admin/appointments", icon: "calendar_month", label: "Quản lý lịch khám" },
  { to: "/admin/schedules", icon: "event_available", label: "Lịch làm việc" },
  { to: "/admin/time-slots", icon: "schedule", label: "Khung giờ khám" },
  { to: "/admin/payment-methods", icon: "payments", label: "Thanh toán" },
  { to: "/admin/stats", icon: "bar_chart", label: "Thống kê" },
  { to: "/admin/faqs", icon: "quiz", label: "Quản lý FAQs" },
];

const PAGE_TITLES = {
  "/admin/dashboard": "Dashboard Quản trị",
  "/admin/specialties": "Quản lý chuyên khoa",
  "/admin/specialties/add": "Thêm chuyên khoa",
  "/admin/doctors": "Quản lý bác sĩ",
  "/admin/doctors/add": "Thêm bác sĩ mới",
  "/admin/patients": "Quản lý bệnh nhân",
  "/admin/patients/edit": "Chỉnh sửa bệnh nhân",
  "/admin/appointments": "Quản lý lịch khám",
  "/admin/schedules": "Quản lý lịch làm việc",
  "/admin/time-slots": "Cấu hình khung giờ",
  "/admin/payment-methods": "Hình thức thanh toán",
  "/admin/stats": "Thống kê chi tiết",
  "/admin/faqs": "Quản lý FAQs",
  "/admin/faqs/add": "Thêm câu hỏi mới",
};

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const basePath = "/" + location.pathname.split("/").slice(1, 3).join("/");
  const pageTitle = PAGE_TITLES[basePath] || "Admin";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200
          flex flex-col shrink-0 transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-2xl">medical_services</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary leading-none">HealthCare</h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase mt-1">
              Hệ thống quản trị
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-slate-600 hover:bg-slate-50 font-medium"
                }`
              }
            >
              <span className="material-symbols-outlined text-[22px]">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">logout</span>
            <span className="font-semibold text-sm">Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 truncate">
              {pageTitle}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-primary transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-10 w-px bg-slate-200 hidden md:block" />
            <div className="hidden md:flex items-center gap-3">
              <div className="flex flex-col items-end">
                <p className="text-sm font-bold leading-none">Admin User</p>
                <p className="text-[10px] text-slate-500 mt-0.5">admin@healthcare.com</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                AD
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
