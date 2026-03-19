/**
 * Mock data cho Doctor Portal
 * TODO: Thay bằng API thật khi kết nối backend
 */

/** Thông tin bác sĩ đang đăng nhập */
export const CURRENT_DOCTOR = {
  id: 1,
  fullName: "BS. Nguyễn Văn A",
  email: "nguyenvana@healthcare.vn",
  phone: "0912345678",
  specialty: "Nội khoa",
  specialtyId: 1,
  experience: 15,
  education: "Tiến sĩ Y khoa - Đại học Y Hà Nội",
  image: "/images/doctor-1.jpg",
  bio: "Bác sĩ chuyên khoa Nội với 15 năm kinh nghiệm, từng công tác tại Bệnh viện Bạch Mai. Chuyên điều trị các bệnh lý tim mạch, tiêu hóa và hô hấp.",
  price: 300000,
  rating: 4.8,
  totalReviews: 124,
};

/** Trạng thái lịch hẹn */
export const APPOINTMENT_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

/** Map trạng thái -> label tiếng Việt + màu sắc */
export const STATUS_CONFIG = {
  [APPOINTMENT_STATUS.PENDING]: {
    label: "Chờ xác nhận",
    color: "bg-yellow-100 text-yellow-700",
    icon: "hourglass_top",
  },
  [APPOINTMENT_STATUS.CONFIRMED]: {
    label: "Đã xác nhận",
    color: "bg-blue-100 text-blue-700",
    icon: "check_circle",
  },
  [APPOINTMENT_STATUS.COMPLETED]: {
    label: "Đã khám",
    color: "bg-green-100 text-green-700",
    icon: "task_alt",
  },
  [APPOINTMENT_STATUS.CANCELLED]: {
    label: "Đã hủy",
    color: "bg-red-100 text-red-700",
    icon: "cancel",
  },
};

/** Danh sách lịch hẹn của bác sĩ */
export const DOCTOR_APPOINTMENTS = [
  // Lịch hôm nay (2026-03-11) - dùng cho Dashboard "Danh sách bệnh nhân hôm nay"
  {
    id: 101,
    patientName: "Trần Văn Minh",
    patientPhone: "0987654321",
    patientAge: 45,
    patientGender: "Nam",
    date: "2026-03-11",
    time: "08:00",
    status: APPOINTMENT_STATUS.PENDING,
    reason: "Đau đầu kéo dài, chóng mặt, mất ngủ",
  },
  {
    id: 102,
    patientName: "Nguyễn Thị Hoa",
    patientPhone: "0911222333",
    patientAge: 32,
    patientGender: "Nữ",
    date: "2026-03-11",
    time: "08:30",
    status: APPOINTMENT_STATUS.CONFIRMED,
    reason: "Khám tổng quát định kỳ",
  },
  {
    id: 103,
    patientName: "Lê Quốc Hùng",
    patientPhone: "0933444555",
    patientAge: 58,
    patientGender: "Nam",
    date: "2026-03-11",
    time: "09:00",
    status: APPOINTMENT_STATUS.CONFIRMED,
    reason: "Tái khám huyết áp cao, tiểu đường",
  },
  {
    id: 104,
    patientName: "Phạm Thị Lan",
    patientPhone: "0966777888",
    patientAge: 28,
    patientGender: "Nữ",
    date: "2026-03-11",
    time: "09:30",
    status: APPOINTMENT_STATUS.PENDING,
    reason: "Ho kéo dài, khó thở khi nằm",
  },
  // Các ngày khác
  {
    id: 1,
    patientName: "Trần Văn Minh",
    patientPhone: "0987654321",
    patientAge: 45,
    patientGender: "Nam",
    date: "2026-03-13",
    time: "08:00",
    status: APPOINTMENT_STATUS.PENDING,
    reason: "Đau đầu kéo dài, chóng mặt, mất ngủ",
  },
  {
    id: 2,
    patientName: "Nguyễn Thị Hoa",
    patientPhone: "0911222333",
    patientAge: 32,
    patientGender: "Nữ",
    date: "2026-03-14",
    time: "08:30",
    status: APPOINTMENT_STATUS.CONFIRMED,
    reason: "Khám tổng quát định kỳ",
  },
  {
    id: 3,
    patientName: "Lê Quốc Hùng",
    patientPhone: "0933444555",
    patientAge: 58,
    patientGender: "Nam",
    date: "2026-03-12",
    time: "09:00",
    status: APPOINTMENT_STATUS.CONFIRMED,
    reason: "Tái khám huyết áp cao, tiểu đường",
  },
  {
    id: 4,
    patientName: "Phạm Thị Lan",
    patientPhone: "0966777888",
    patientAge: 28,
    patientGender: "Nữ",
    date: "2026-03-13",
    time: "09:30",
    status: APPOINTMENT_STATUS.PENDING,
    reason: "Ho kéo dài, khó thở khi nằm",
  },
  {
    id: 5,
    patientName: "Hoàng Đức Anh",
    patientPhone: "0977888999",
    patientAge: 50,
    patientGender: "Nam",
    date: "2026-03-10",
    time: "14:00",
    status: APPOINTMENT_STATUS.COMPLETED,
    reason: "Đau bụng âm ỉ vùng thượng vị",
    diagnosis: "Viêm dạ dày mãn tính, HP dương tính",
    notes: "Kê đơn thuốc diệt HP phác đồ 14 ngày. Tái khám sau 1 tháng.",
    prescription: [
      { name: "Amoxicillin 500mg", dosage: "2 viên/ngày", duration: "14 ngày" },
      { name: "Clarithromycin 500mg", dosage: "2 viên/ngày", duration: "14 ngày" },
      { name: "Omeprazole 20mg", dosage: "2 viên/ngày", duration: "14 ngày" },
    ],
  },
  {
    id: 6,
    patientName: "Vũ Thị Mai",
    patientPhone: "0944555666",
    patientAge: 35,
    patientGender: "Nữ",
    date: "2026-03-10",
    time: "15:00",
    status: APPOINTMENT_STATUS.COMPLETED,
    reason: "Mệt mỏi, thiếu máu",
    diagnosis: "Thiếu sắt. Kết quả xét nghiệm: Hb 9.5 g/dL, Ferritin 8 ng/mL",
    notes: "Bổ sung sắt + Vitamin C. Hẹn xét nghiệm lại sau 3 tháng.",
    prescription: [
      { name: "Ferrous Sulfate 325mg", dosage: "1 viên/ngày", duration: "90 ngày" },
      { name: "Vitamin C 500mg", dosage: "1 viên/ngày", duration: "90 ngày" },
    ],
  },
  {
    id: 7,
    patientName: "Đỗ Văn Tùng",
    patientPhone: "0922333444",
    patientAge: 40,
    patientGender: "Nam",
    date: "2026-03-12",
    time: "10:00",
    status: APPOINTMENT_STATUS.CANCELLED,
    reason: "Đau khớp gối",
  },
  {
    id: 8,
    patientName: "Bùi Thị Ngọc",
    patientPhone: "0955666777",
    patientAge: 62,
    patientGender: "Nữ",
    date: "2026-03-12",
    time: "08:00",
    status: APPOINTMENT_STATUS.PENDING,
    reason: "Tái khám đái tháo đường type 2",
  },
];

/** Danh sách bệnh nhân (trích từ lịch hẹn, không trùng) */
export const PATIENTS = [
  {
    id: 1,
    name: "Trần Văn Minh",
    phone: "0987654321",
    age: 45,
    gender: "Nam",
    lastVisit: "2026-03-11",
    totalVisits: 3,
  },
  {
    id: 2,
    name: "Nguyễn Thị Hoa",
    phone: "0911222333",
    age: 32,
    gender: "Nữ",
    lastVisit: "2026-03-11",
    totalVisits: 1,
  },
  {
    id: 3,
    name: "Lê Quốc Hùng",
    phone: "0933444555",
    age: 58,
    gender: "Nam",
    lastVisit: "2026-03-11",
    totalVisits: 8,
  },
  {
    id: 4,
    name: "Phạm Thị Lan",
    phone: "0966777888",
    age: 28,
    gender: "Nữ",
    lastVisit: "2026-03-11",
    totalVisits: 1,
  },
  {
    id: 5,
    name: "Hoàng Đức Anh",
    phone: "0977888999",
    age: 50,
    gender: "Nam",
    lastVisit: "2026-03-10",
    totalVisits: 5,
  },
  {
    id: 6,
    name: "Vũ Thị Mai",
    phone: "0944555666",
    age: 35,
    gender: "Nữ",
    lastVisit: "2026-03-10",
    totalVisits: 2,
  },
];

/** Lịch làm việc mẫu (7 ngày tới) */
export const WORK_SCHEDULE = [
  { dayOfWeek: 1, label: "Thứ Hai", morning: true, afternoon: true },
  { dayOfWeek: 2, label: "Thứ Ba", morning: true, afternoon: false },
  { dayOfWeek: 3, label: "Thứ Tư", morning: true, afternoon: true },
  { dayOfWeek: 4, label: "Thứ Năm", morning: false, afternoon: true },
  { dayOfWeek: 5, label: "Thứ Sáu", morning: true, afternoon: true },
  { dayOfWeek: 6, label: "Thứ Bảy", morning: true, afternoon: false },
  { dayOfWeek: 0, label: "Chủ Nhật", morning: false, afternoon: false },
];

/** Thống kê tổng quan */
export const DASHBOARD_STATS = {
  todayAppointments: 4,
  pendingAppointments: 3,
  completedThisWeek: 12,
  totalPatients: 156,
  rating: 4.8,
  totalReviews: 124,
};
