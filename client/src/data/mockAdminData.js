export const ADMIN_STATS = {
  totalDoctors: 150,
  totalPatients: 2840,
  totalAppointments: 12450,
  todayAppointments: 85,
  doctorGrowth: "+5%",
  patientGrowth: "+12%",
  appointmentGrowth: "-2%",
  todayGrowth: "+15%",
};

export const RECENT_APPOINTMENTS = [
  { id: 1, patient: "Nguyễn Văn A", doctor: "BS. Trần Thị B", date: "14/05/2024 - 08:30", status: "confirmed", initials: "NA", color: "bg-slate-200" },
  { id: 2, patient: "Lê Hoàng C", doctor: "BS. Phạm Văn D", date: "14/05/2024 - 09:15", status: "pending", initials: "LC", color: "bg-slate-200" },
  { id: 3, patient: "Trần Minh E", doctor: "BS. Trần Thị B", date: "14/05/2024 - 10:00", status: "in_progress", initials: "TE", color: "bg-slate-200" },
  { id: 4, patient: "Hoàng Diệu F", doctor: "BS. Lê Thị G", date: "14/05/2024 - 11:30", status: "cancelled", initials: "HF", color: "bg-slate-200" },
  { id: 5, patient: "Vũ Đức H", doctor: "BS. Phạm Văn D", date: "14/05/2024 - 14:00", status: "confirmed", initials: "VH", color: "bg-slate-200" },
];

export const APPOINTMENT_STATUS_CONFIG = {
  pending: { label: "Chờ xác nhận", className: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Đã xác nhận", className: "bg-blue-100 text-blue-700" },
  completed: { label: "Đã khám", className: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Đã hủy", className: "bg-rose-100 text-rose-700" },
  in_progress: { label: "Đang khám", className: "bg-blue-100 text-blue-700" },
};

export const CHART_DATA = [
  { month: "T1", height: "60%" },
  { month: "T2", height: "45%" },
  { month: "T3", height: "80%" },
  { month: "T4", height: "55%" },
  { month: "T5", height: "95%" },
  { month: "T6", height: "70%" },
  { month: "T7", height: "65%" },
  { month: "T8", height: "50%" },
  { month: "T9", height: "75%" },
];

export const ADMIN_DOCTORS = [
  { id: 1, name: "BS. Nguyễn Văn A", code: "DOC-2024-001", specialty: "Nội tổng quát", experience: "10 năm", status: "active" },
  { id: 2, name: "BS. Trần Thị B", code: "DOC-2024-042", specialty: "Nhi khoa", experience: "8 năm", status: "active" },
  { id: 3, name: "BS. Lê Văn C", code: "DOC-2024-008", specialty: "Da liễu", experience: "5 năm", status: "on_leave" },
  { id: 4, name: "BS. Phạm Minh D", code: "DOC-2024-112", specialty: "Ngoại thần kinh", experience: "15 năm", status: "active" },
];

export const DOCTOR_STATUS_CONFIG = {
  active: { label: "Đang hoạt động", dotColor: "bg-green-500", className: "bg-green-100 text-green-700" },
  on_leave: { label: "Nghỉ phép", dotColor: "bg-amber-500", className: "bg-amber-100 text-amber-700" },
  inactive: { label: "Ngừng hoạt động", dotColor: "bg-red-500", className: "bg-red-100 text-red-700" },
};

export const ADMIN_PATIENTS = [
  { id: 1, code: "BN001", name: "Nguyễn Văn A", initials: "NA", phone: "0901234567", email: "vanda@gmail.com", date: "12/10/2023" },
  { id: 2, code: "BN002", name: "Trần Thị B", initials: "TB", phone: "0912345678", email: "thib@gmail.com", date: "15/10/2023" },
  { id: 3, code: "BN003", name: "Lê Văn C", initials: "LC", phone: "0987654321", email: "vanc@gmail.com", date: "20/10/2023" },
  { id: 4, code: "BN004", name: "Phạm Minh D", initials: "PD", phone: "0934567890", email: "minhd@gmail.com", date: "22/10/2023" },
  { id: 5, code: "BN005", name: "Hoàng Anh E", initials: "AE", phone: "0945678901", email: "anhe@gmail.com", date: "25/10/2023" },
];

export const ADMIN_SPECIALTIES = [
  { id: 1, name: "Nội tổng quát", icon: "ecg", description: "Khám và điều trị các bệnh lý nội khoa thông thường...", doctorCount: 12 },
  { id: 2, name: "Nhi khoa", icon: "child_care", description: "Chăm sóc sức khỏe toàn diện và tiêm chủng cho trẻ em.", doctorCount: 8 },
  { id: 3, name: "Sản phụ khoa", icon: "female", description: "Dịch vụ chăm sóc sức khỏe phụ nữ và thai sản.", doctorCount: 15 },
  { id: 4, name: "Tai Mũi Họng", icon: "hearing", description: "Điều trị các bệnh lý tai mũi họng nâng cao.", doctorCount: 6 },
];

export const ADMIN_APPOINTMENT_LIST = [
  { id: 1, code: "LK-00124", patient: "Nguyễn Văn An", initials: "NV", initialsColor: "bg-primary/10 text-primary", doctor: "BS. Trần Thị Oanh", dateTime: "08:30 - 24/10/2023", status: "pending" },
  { id: 2, code: "LK-00125", patient: "Lê Thị Bình", initials: "LT", initialsColor: "bg-emerald-500/10 text-emerald-600", doctor: "BS. Phan Mạnh Hùng", dateTime: "09:15 - 24/10/2023", status: "confirmed" },
  { id: 3, code: "LK-00126", patient: "Hoàng Văn Cường", initials: "HV", initialsColor: "bg-indigo-500/10 text-indigo-600", doctor: "BS. Ngô Kiên Định", dateTime: "10:00 - 24/10/2023", status: "completed" },
  { id: 4, code: "LK-00127", patient: "Phạm Thị Duyên", initials: "PT", initialsColor: "bg-rose-500/10 text-rose-600", doctor: "BS. Trần Thị Oanh", dateTime: "14:00 - 24/10/2023", status: "cancelled" },
  { id: 5, code: "LK-00128", patient: "Vũ Hồng Hải", initials: "VH", initialsColor: "bg-primary/10 text-primary", doctor: "BS. Phan Mạnh Hùng", dateTime: "15:30 - 24/10/2023", status: "pending" },
];

export const ADMIN_FAQS = [
  { id: 1, question: "Làm thế nào để đặt lịch hẹn khám bệnh?", category: "Hướng dẫn", categoryColor: "bg-blue-100 text-blue-800", createdAt: "20/10/2023", status: "visible" },
  { id: 2, question: "Chính sách bảo hiểm y tế tại phòng khám", category: "Thanh toán", categoryColor: "bg-purple-100 text-purple-800", createdAt: "18/10/2023", status: "visible" },
  { id: 3, question: "Quy trình xét nghiệm máu và thời gian nhận kết quả", category: "Dịch vụ", categoryColor: "bg-orange-100 text-orange-800", createdAt: "15/10/2023", status: "hidden" },
  { id: 4, question: "Thời gian làm việc của các phòng chuyên khoa", category: "Thông tin", categoryColor: "bg-emerald-100 text-emerald-800", createdAt: "10/10/2023", status: "visible" },
  { id: 5, question: "Hướng dẫn đăng ký tài khoản mới", category: "Hướng dẫn", categoryColor: "bg-blue-100 text-blue-800", createdAt: "08/10/2023", status: "draft" },
  { id: 6, question: "Lịch sử cập nhật dịch vụ năm 2022", category: "Thông tin", categoryColor: "bg-emerald-100 text-emerald-800", createdAt: "01/01/2022", status: "archived" },
];

export const TOP_DOCTORS_STATS = [
  { id: 1, name: "BS. Nguyễn Văn A", code: "DOC-001", specialty: "Nội tổng quát", appointments: 156, rating: 4.9, status: "active" },
  { id: 2, name: "BS. Trần Thị B", code: "DOC-002", specialty: "Nha khoa", appointments: 142, rating: 4.8, status: "active" },
  { id: 3, name: "BS. Lê Hoàng C", code: "DOC-045", specialty: "Da liễu", appointments: 128, rating: 4.7, status: "active" },
  { id: 4, name: "BS. Phạm Minh D", code: "DOC-112", specialty: "Tim mạch", appointments: 115, rating: 4.9, status: "on_leave" },
  { id: 5, name: "BS. Võ Văn E", code: "DOC-089", specialty: "Nhi khoa", appointments: 98, rating: 4.6, status: "active" },
];

export const STATS_OVERVIEW = {
  appointmentsThisMonth: 1284,
  appointmentsLastMonth: 1150,
  completionRate: 87.3,
  completionRateChange: +2.1,
  cancellationRate: 4.8,
  cancellationRateChange: -0.5,
  newPatientsThisMonth: 186,
  newPatientsLastMonth: 162,
};

export const MONTHLY_APPOINTMENTS = [
  { month: "T1", count: 820, label: "Tháng 1" },
  { month: "T2", count: 756, label: "Tháng 2" },
  { month: "T3", count: 980, label: "Tháng 3" },
  { month: "T4", count: 1050, label: "Tháng 4" },
  { month: "T5", count: 1180, label: "Tháng 5" },
  { month: "T6", count: 1090, label: "Tháng 6" },
  { month: "T7", count: 960, label: "Tháng 7" },
  { month: "T8", count: 1020, label: "Tháng 8" },
  { month: "T9", count: 1150, label: "Tháng 9" },
  { month: "T10", count: 1200, label: "Tháng 10" },
  { month: "T11", count: 1284, label: "Tháng 11" },
  { month: "T12", count: 0, label: "Tháng 12" },
];

export const APPOINTMENT_STATUS_STATS = [
  { status: "completed", label: "Đã khám", count: 892, percent: 69.5, color: "bg-emerald-500", textColor: "text-emerald-600" },
  { status: "confirmed", label: "Đã xác nhận", count: 228, percent: 17.8, color: "bg-blue-500", textColor: "text-blue-600" },
  { status: "pending", label: "Chờ xác nhận", count: 102, percent: 7.9, color: "bg-amber-500", textColor: "text-amber-600" },
  { status: "cancelled", label: "Đã hủy", count: 62, percent: 4.8, color: "bg-rose-500", textColor: "text-rose-600" },
];

export const SPECIALTY_APPOINTMENT_STATS = [
  { name: "Nội tổng quát", count: 385, percent: 30 },
  { name: "Nhi khoa", count: 257, percent: 20 },
  { name: "Sản phụ khoa", count: 205, percent: 16 },
  { name: "Da liễu", count: 167, percent: 13 },
  { name: "Tai Mũi Họng", count: 128, percent: 10 },
  { name: "Tim mạch", count: 90, percent: 7 },
  { name: "Khác", count: 52, percent: 4 },
];

export const PEAK_HOURS = [
  { time: "08:00 - 09:00", count: 210, percent: 85 },
  { time: "09:00 - 10:00", count: 248, percent: 100 },
  { time: "10:00 - 11:00", count: 195, percent: 79 },
  { time: "13:30 - 14:30", count: 180, percent: 73 },
  { time: "14:30 - 15:30", count: 165, percent: 67 },
  { time: "15:30 - 16:30", count: 142, percent: 57 },
  { time: "16:30 - 17:00", count: 88, percent: 35 },
];

export const PATIENT_GROWTH = [
  { month: "T1", count: 120 },
  { month: "T2", count: 98 },
  { month: "T3", count: 145 },
  { month: "T4", count: 132 },
  { month: "T5", count: 168 },
  { month: "T6", count: 155 },
  { month: "T7", count: 140 },
  { month: "T8", count: 178 },
  { month: "T9", count: 162 },
  { month: "T10", count: 175 },
  { month: "T11", count: 186 },
  { month: "T12", count: 0 },
];
