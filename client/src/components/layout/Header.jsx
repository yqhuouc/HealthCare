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
    await logout();
    navigate("/");
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
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    account_circle
                  </span>
                  <span className="max-w-[120px] truncate">
                    {user?.hoTen || user?.fullName || "Tài khoản"}
                  </span>
                  <span className="material-symbols-outlined text-lg">
                    expand_more
                  </span>
                </button>

                {/* Dropdown menu tài khoản */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-lg shadow-lg border border-slate-100 py-2 z-50">
                    <Link
                      to="/appointments"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                    >
                      <span className="material-symbols-outlined text-lg text-slate-400">
                        calendar_month
                      </span>
                      Lịch sử đặt khám
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                    >
                      <span className="material-symbols-outlined text-lg text-slate-400">
                        person
                      </span>
                      Hồ sơ cá nhân
                    </Link>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition text-left"
                    >
                      <span className="material-symbols-outlined text-lg">
                        logout
                      </span>
                      Đăng xuất
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
                  <Link
                    to="/appointments"
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Lịch sử đặt khám
                  </Link>
                  <Link
                    to="/profile"
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Hồ sơ cá nhân
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="mx-3 mt-2 border border-red-300 text-red-500 text-center px-5 py-2 rounded-lg text-sm font-medium"
                  >
                    Đăng xuất
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
