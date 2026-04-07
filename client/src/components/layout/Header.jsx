import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";

/** Các link chính trên thanh nav */
const NAV_LINKS = [
  { to: "/", label: "Trang chủ" },
  { to: "/specialties", label: "Chuyên khoa" },
  { to: "/doctors", label: "Bác sĩ" },
  { to: "/faq", label: "FAQ" },
];

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const { isAuthenticated, user, logout } = useAuthStore();

  const isActive = (path) => location.pathname === path;

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [prevPathname, setPrevPathname] = useState(location.pathname);

  // Đóng các menu popup/dropdown mỗi khi đường dẫn thay đổi (chuyển trang)
  // Thực hiện trong lúc render (render phase) thay vì useEffect để tránh render dư thừa
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-3xl font-bold">
              medical_services
            </span>
            <h1 className="text-xl font-extrabold tracking-tight">
              HealthCare
            </h1>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium hover:text-primary transition-colors ${
                  isActive(link.to)
                    ? "text-primary font-semibold"
                    : "text-slate-700"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Hiển thị theo trạng thái đăng nhập */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-primary transition-colors cursor-pointer"
                >
                  {user?.anhDaiDien ? (
                    <img src={user.anhDaiDien} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <span className="material-symbols-outlined text-xl">
                      account_circle
                    </span>
                  )}
                  <span className="max-w-[120px] truncate">
                    {user?.hoTen || user?.fullName || "Tài khoản"}
                  </span>
                  <span className="material-symbols-outlined text-lg">
                    expand_more
                  </span>
                </button>

                {/* Dropdown menu tài khoản */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 py-2.5 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                    
                    {/* Mục BỆNH NHÂN */}
                    {user?.vaiTro === "benh_nhan" && (
                      <>
                        <Link to="/appointments" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-primary transition-all">
                          <span className="material-symbols-outlined text-xl text-slate-400">calendar_month</span>
                          Lịch sử đặt khám
                        </Link>
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-primary transition-all">
                          <span className="material-symbols-outlined text-xl text-slate-400">person</span>
                          Hồ sơ cá nhân
                        </Link>
                      </>
                    )}

                    {/* Mục BÁC SĨ / ADMIN (Dẫn về trang quản lý) */}
                    {(user?.vaiTro === "bac_si" || user?.vaiTro === "admin") && (
                      <Link 
                        to={user?.vaiTro === "bac_si" ? "/doctor/dashboard" : "/admin/dashboard"} 
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 transition-all"
                      >
                        <span className="material-symbols-outlined text-xl">dashboard</span>
                        Bảng điều khiển
                      </Link>
                    )}

                    <div className="border-t border-slate-50 my-2" />
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {isLoggingOut ? (
                        <>
                          <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                          Đang đăng xuất...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-xl">logout</span>
                          Đăng xuất
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-md"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="material-symbols-outlined">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 border-t border-slate-100">
            <div className="flex flex-col gap-2 pt-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? "text-primary bg-primary/5 font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  {/* Mục BỆNH NHÂN */}
                  {user?.vaiTro === "benh_nhan" && (
                    <>
                      <Link to="/appointments" className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-primary/5 hover:text-primary transition-all">
                        Lịch sử đặt khám
                      </Link>
                      <Link to="/profile" className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-primary/5 hover:text-primary transition-all">
                        Hồ sơ cá nhân
                      </Link>
                    </>
                  )}

                  {/* Mục BÁC SĨ / ADMIN */}
                  {(user?.vaiTro === "bac_si" || user?.vaiTro === "admin") && (
                    <Link 
                      to={user?.vaiTro === "bac_si" ? "/doctor/dashboard" : "/admin/dashboard"} 
                      className="px-3 py-2 rounded-lg text-sm font-semibold text-primary bg-primary/5 transition-all"
                    >
                      Bảng điều khiển
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="mx-3 mt-2 flex justify-center items-center gap-2 border border-red-300 text-red-500 text-center px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoggingOut ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-sm">
                          progress_activity
                        </span>
                        Đang xuất...
                      </>
                    ) : (
                      "Đăng xuất"
                    )}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="mx-3 mt-2 bg-primary text-white text-center px-5 py-2 rounded-lg text-sm font-bold"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;
