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

function App() {
  const NotFoundComponent = notFoundRoute.component;

  return (
    <BrowserRouter>
      <Routes>
        {/* ---- Doctor standalone: login (không có layout nào) ---- */}
        {doctorStandaloneRoutes.map(({ path, component: Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}

        {/* ---- Doctor portal: sidebar layout (DoctorLayout + Outlet) ---- */}
        <Route path="/doctor" element={<DoctorLayout />}>
          {doctorRoutes.map(({ path, component: Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
        </Route>

        {/* ---- Admin portal: AdminLayout + Outlet ---- */}
        <Route path="/admin" element={<AdminLayout />}>
          {adminRoutes.map(({ path, component: Component }) => (
            <Route key={path} path={path} element={<Component />} />
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
                  {publicRoutes.map(({ path, component: Component }) => (
                    <Route key={path} path={path} element={<Component />} />
                  ))}

                  {/* TODO: bọc PrivateRoute khi có auth backend */}
                  {privateRoutes.map(({ path, component: Component }) => (
                    <Route key={path} path={path} element={<Component />} />
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
