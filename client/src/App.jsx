import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
          <p className="mt-4 text-slate-500">Đang tải...</p>
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

        {/* ---- Doctor portal: sidebar layout (DoctorLayout + Outlet) ---- */}
        <Route path="/doctor" element={<DoctorLayout />}>
          {doctorRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={<route.component />} />
          ))}
        </Route>

        {/* ---- Admin portal: AdminLayout + Outlet ---- */}
        <Route path="/admin" element={<AdminLayout />}>
          {adminRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={<route.component />} />
          ))}
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

                  {/* TODO: bọc PrivateRoute khi có auth backend */}
                  {privateRoutes.map((route) => (
                    <Route key={route.path} path={route.path} element={<route.component />} />
                  ))}

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
