import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingSpinner from "./components/common/LoadingSpinner";
/* Layout */
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import DoctorLayout from "./components/layout/DoctorLayout";
import AdminLayout from "./components/layout/AdminLayout";

/* Routes tập trung */
import {
  publicRoutes,
  privateRoutes,
  doctorStandaloneRoutes,
  doctorRoutes,
  adminRoutes,
  notFoundRoute,
} from "./router";
import useAuthStore from "./stores/useAuthStore";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  const NotFoundComponent = notFoundRoute.component;
  const { fetchUser, isLoading } = useAuthStore();

  // Khôi phục session khi app khởi động: gọi GET /auth/me với cookie
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Hiển thị loading trong khi đang kiểm tra session
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="size-12" color="text-primary" />
          <p className="text-slate-400 font-medium text-sm tracking-wide animate-pulse uppercase">
            Đang khởi tạo hệ thống...
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* ---- Doctor standalone: login (không có layout nào) ---- */}
        {doctorStandaloneRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={<route.component />} />
        ))}

        {/* ---- Doctor portal: sidebar layout (DoctorLayout + ProtectedRoute) ---- */}
        <Route element={<ProtectedRoute allowedRoles={["bac_si", "admin"]} />}>
          <Route path="/doctor" element={<DoctorLayout />}>
            {doctorRoutes.map((route) => (
              <Route key={route.path} path={route.path} element={<route.component />} />
            ))}
          </Route>
        </Route>

        {/* ---- Admin portal: AdminLayout + ProtectedRoute ---- */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            {adminRoutes.map((route) => (
              <Route key={route.path} path={route.path} element={<route.component />} />
            ))}
          </Route>
        </Route>

        {/* ---- Bệnh nhân: Header + Footer layout ---- */}
        <Route
          path="/*"
          element={
            <div className="min-h-screen flex flex-col bg-background-light text-slate-900 antialiased">
              <Header />
              <main className="flex-1">
                <Routes>
                  {publicRoutes.map((route) => (
                    <Route key={route.path} path={route.path} element={<route.component />} />
                  ))}

                  {/* Bảo vệ các trang dành cho bệnh nhân đã đăng nhập */}
                  <Route element={<ProtectedRoute allowedRoles={["benh_nhan"]} />}>
                    {privateRoutes.map((route) => (
                      <Route key={route.path} path={route.path} element={<route.component />} />
                    ))}
                  </Route>

                  <Route path={notFoundRoute.path} element={<NotFoundComponent />} />
                </Routes>
              </main>
              <Footer />
            </div>
          }
        />

      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;
