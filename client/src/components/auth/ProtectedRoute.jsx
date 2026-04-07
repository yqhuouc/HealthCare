import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";

/**
 * ProtectedRoute: Hợp phần bảo vệ các tuyến đường riêng tư.
 * 
 * Chức năng:
 * 1. Kiểm tra trạng thái đã đăng nhập (isAuthenticated).
 * 2. Kiểm tra quyền truy cập dựa trên mảng `allowedRoles`.
 * 3. Tự động điều hướng về trang thích hợp nếu không đủ điều kiện.
 * 
 * @param {string[]} allowedRoles - Danh sách các vai trò được phép truy cập (vd: ['admin', 'bac_si'])
 * @param {string} redirectPath - Đường dẫn chuyển hướng khi chưa đăng nhập (mặc định /login)
 */
const ProtectedRoute = ({ allowedRoles = [], redirectPath = "/login" }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  // 1. Khi app đang xác thực session (fetchUser) -> Hiện loading tạm thời
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  // 2. Nếu chưa đăng nhập -> Chuyển về trang login tương ứng
  if (!isAuthenticated) {
    // Nếu là trang bác sĩ/admin, ưu tiên về doctor-login
    const isMedicalRoute = allowedRoles.includes("bac_si") || allowedRoles.includes("admin");
    return <Navigate to={isMedicalRoute ? "/doctor-login" : redirectPath} replace />;
  }

  // 3. Nếu đã đăng nhập nhưng sai vai trò -> Về trang chủ hoặc thông báo lỗi
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.vaiTro)) {
    console.warn(`Access denied: User role [${user?.vaiTro}] is not in [${allowedRoles.join(", ")}]`);
    return <Navigate to="/" replace />;
  }

  // 4. Mọi thứ hợp lệ -> Render trang yêu cầu
  return <Outlet />;
};

export default ProtectedRoute;
