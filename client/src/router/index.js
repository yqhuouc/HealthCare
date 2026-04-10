/**
 * Cấu hình routes tập trung cho ứng dụng
 *
 * Cấu trúc:
 *   - publicRoutes / privateRoutes  → Layout bệnh nhân (Header + Footer)
 *   - doctorRoutes                  → Layout bác sĩ (Sidebar via DoctorLayout + Outlet)
 *   - doctorStandaloneRoutes        → Không layout (login page)
 *   - notFoundRoute                 → 404
 *
 * Khi thêm trang mới, chỉ cần sửa file này.
 * TODO: thêm auth guard cho privateRoutes và doctorRoutes khi có backend
 */

/* ---- Trang bệnh nhân ---- */
import HomePage from "../pages/patient/HomePage";
import LoginPage from "../pages/patient/LoginPage";
import RegisterPage from "../pages/patient/RegisterPage";
import DoctorListPage from "../pages/patient/DoctorListPage";
import DoctorDetailPage from "../pages/patient/DoctorDetailPage";
import BookingPage from "../pages/patient/BookingPage";
import AppointmentHistoryPage from "../pages/patient/AppointmentHistoryPage";
import MedicalResultPage from "../pages/patient/MedicalResultPage";
import PatientProfilePage from "../pages/patient/PatientProfilePage";
import PaymentResultPage from "../pages/patient/PaymentResultPage";
import SpecialtyListPage from "../pages/patient/SpecialtyListPage";
import SpecialtyDetailPage from "../pages/patient/SpecialtyDetailPage";
import FAQPage from "../pages/patient/FAQPage";
import NotFoundPage from "../pages/patient/NotFoundPage";

/* ---- Trang bác sĩ ---- */
import DoctorLoginPage from "../pages/doctor/DoctorLoginPage";
import DoctorDashboardPage from "../pages/doctor/DoctorDashboardPage";
import DoctorAppointmentsPage from "../pages/doctor/DoctorAppointmentsPage";
import DoctorAppointmentDetailPage from "../pages/doctor/DoctorAppointmentDetailPage";
import DoctorSchedulePage from "../pages/doctor/DoctorSchedulePage";
import DoctorHistoryPage from "../pages/doctor/DoctorHistoryPage";
import DoctorProfilePage from "../pages/doctor/DoctorProfilePage";
import DoctorAddShiftPage from "../pages/doctor/DoctorAddShiftPage";

/* ---- Trang admin ---- */
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminDoctorsPage from "../pages/admin/AdminDoctorsPage";
import AdminPatientsPage from "../pages/admin/AdminPatientsPage";
import AdminStatsPage from "../pages/admin/AdminStatsPage";
import AdminSpecialtiesPage from "../pages/admin/AdminSpecialtiesPage";
import AdminAppointmentsPage from "../pages/admin/AdminAppointmentsPage";
import AdminFAQsPage from "../pages/admin/AdminFAQsPage";
import AdminAddDoctorPage from "../pages/admin/AdminAddDoctorPage";
import AdminEditDoctorPage from "../pages/admin/AdminEditDoctorPage";
import AdminAddSpecialtyPage from "../pages/admin/AdminAddSpecialtyPage";
import AdminEditSpecialtyPage from "../pages/admin/AdminEditSpecialtyPage";
import AdminAddFAQPage from "../pages/admin/AdminAddFAQPage";
import AdminEditFAQPage from "../pages/admin/AdminEditFAQPage";
import AdminAppointmentDetailPage from "../pages/admin/AdminAppointmentDetailPage";
import AdminPatientDetailPage from "../pages/admin/AdminPatientDetailPage";
import AdminTimeSlotsPage from "../pages/admin/AdminTimeSlotsPage";
import AdminDoctorSchedulesPage from "../pages/admin/AdminDoctorSchedulesPage";
import AdminPaymentMethodsPage from "../pages/admin/AdminPaymentMethodsPage";
import AdminEditPatientPage from "../pages/admin/AdminEditPatientPage";

/* ==========================================================
   ROUTES BỆNH NHÂN — dùng layout Header + Footer
   ========================================================== */

/** Routes công khai — ai cũng truy cập được */
export const publicRoutes = [
  { path: "/", component: HomePage },
  { path: "/login", component: LoginPage },
  { path: "/register", component: RegisterPage },
  { path: "/specialties", component: SpecialtyListPage },
  { path: "/specialties/:id", component: SpecialtyDetailPage },
  { path: "/doctors", component: DoctorListPage },
  { path: "/doctors/:id", component: DoctorDetailPage },
  { path: "/faq", component: FAQPage },
];

/** Routes cần đăng nhập — TODO: bọc PrivateRoute khi có backend */
export const privateRoutes = [
  { path: "/booking/:doctorId", component: BookingPage },
  { path: "/appointments", component: AppointmentHistoryPage },
  { path: "/medical-results/:id", component: MedicalResultPage },
  { path: "/profile", component: PatientProfilePage },
  { path: "/payment/result", component: PaymentResultPage },
];

/* ==========================================================
   ROUTES BÁC SĨ — dùng DoctorLayout (sidebar + Outlet)
   ========================================================== */

/** Routes bác sĩ standalone — KHÔNG dùng layout (login page) */
export const doctorStandaloneRoutes = [
  { path: "/doctor/login", component: DoctorLoginPage },
];

/**
 * Routes bác sĩ nested — render bên trong DoctorLayout (<Outlet />)
 * path ở đây là relative (không có prefix /doctor)
 */
export const doctorRoutes = [
  { path: "dashboard", component: DoctorDashboardPage },
  { path: "appointments", component: DoctorAppointmentsPage },
  { path: "appointments/:id", component: DoctorAppointmentDetailPage },
  { path: "schedule", component: DoctorSchedulePage },
  { path: "schedule/add", component: DoctorAddShiftPage },
  { path: "history", component: DoctorHistoryPage },
  { path: "profile", component: DoctorProfilePage },
];

/* ==========================================================
   ROUTES ADMIN — dùng AdminLayout (sidebar + Outlet)
   ========================================================== */
export const adminRoutes = [
  { path: "", component: AdminDashboardPage },
  { path: "dashboard", component: AdminDashboardPage },
  { path: "specialties", component: AdminSpecialtiesPage },
  { path: "specialties/add", component: AdminAddSpecialtyPage },
  { path: "specialties/edit/:id", component: AdminEditSpecialtyPage },
  { path: "doctors", component: AdminDoctorsPage },
  { path: "doctors/add", component: AdminAddDoctorPage },
  { path: "doctors/edit/:id", component: AdminEditDoctorPage },
  { path: "patients", component: AdminPatientsPage },
  { path: "patients/:id", component: AdminPatientDetailPage },
  { path: "patients/edit/:id", component: AdminEditPatientPage },
  { path: "appointments", component: AdminAppointmentsPage },
  { path: "appointments/:id", component: AdminAppointmentDetailPage },
  { path: "schedules", component: AdminDoctorSchedulesPage },
  { path: "time-slots", component: AdminTimeSlotsPage },
  { path: "payment-methods", component: AdminPaymentMethodsPage },
  { path: "stats", component: AdminStatsPage },
  { path: "faqs", component: AdminFAQsPage },
  { path: "faqs/add", component: AdminAddFAQPage },
  { path: "faqs/edit/:id", component: AdminEditFAQPage },
];

/* ==========================================================
   404
   ========================================================== */
export const notFoundRoute = { path: "*", component: NotFoundPage };
