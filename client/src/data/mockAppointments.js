/**
 * Mock data - Lịch hẹn khám bệnh
 * TODO: Thay thế bằng API thật khi kết nối backend
 */

/** Trạng thái lịch hẹn */
export const APPOINTMENT_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

/** Map trạng thái -> hiển thị tiếng Việt + màu sắc */
export const STATUS_CONFIG = {
  [APPOINTMENT_STATUS.PENDING]: {
    label: "Chờ xác nhận",
    color: "bg-yellow-100 text-yellow-700",
  },
  [APPOINTMENT_STATUS.CONFIRMED]: {
    label: "Đã xác nhận",
    color: "bg-blue-100 text-blue-700",
  },
  [APPOINTMENT_STATUS.COMPLETED]: {
    label: "Đã khám",
    color: "bg-green-100 text-green-700",
  },
  [APPOINTMENT_STATUS.CANCELLED]: {
    label: "Đã hủy",
    color: "bg-red-100 text-red-700",
  },
};

export const APPOINTMENTS = [
  {
    id: 1,
    doctorName: "BS. Nguyễn Văn A",
    doctorImage:
      "/images/doctor-1.jpg",
    specialty: "Nội khoa",
    date: "2026-03-15",
    time: "09:00",
    status: APPOINTMENT_STATUS.CONFIRMED,
    reason: "Đau đầu kéo dài, chóng mặt",
  },
  {
    id: 2,
    doctorName: "BS. Trần Thị B",
    doctorImage:
      "/images/doctor-2.jpg",
    specialty: "Sản phụ khoa",
    date: "2026-03-10",
    time: "14:00",
    status: APPOINTMENT_STATUS.COMPLETED,
    reason: "Khám thai định kỳ",
    notes: "Thai 28 tuần, phát triển bình thường.",
  },
  {
    id: 3,
    doctorName: "BS. Lê Hoàng C",
    doctorImage:
      "/images/doctor-3.jpg",
    specialty: "Nhi khoa",
    date: "2026-03-05",
    time: "10:30",
    status: APPOINTMENT_STATUS.COMPLETED,
    reason: "Trẻ sốt cao, ho kéo dài",
    notes: "Viêm phế quản cấp. Đã kê đơn thuốc.",
  },
  {
    id: 4,
    doctorName: "BS. Phạm Minh D",
    doctorImage:
      "/images/doctor-4.jpg",
    specialty: "Da liễu",
    date: "2026-02-28",
    time: "08:30",
    status: APPOINTMENT_STATUS.CANCELLED,
    reason: "Nổi mẩn đỏ trên da",
  },
];

/** FAQ dùng cho trang Câu hỏi thường gặp */
export const FAQ_DATA = [
  {
    question: "Làm thế nào để đặt lịch khám?",
    answer:
      "Bạn chỉ cần đăng nhập, chọn chuyên khoa hoặc bác sĩ, sau đó chọn ngày giờ phù hợp và xác nhận đặt lịch. Hệ thống sẽ gửi xác nhận qua email và SMS.",
  },
  {
    question: "Tôi có thể hủy hoặc đổi lịch khám không?",
    answer:
      "Có, bạn có thể hủy hoặc đổi lịch khám trước 24 giờ so với giờ hẹn. Vào mục 'Lịch sử đặt khám', chọn lịch hẹn cần thay đổi và thao tác tương ứng.",
  },
  {
    question: "Chi phí khám bệnh là bao nhiêu?",
    answer:
      "Chi phí khám dao động từ 250.000đ - 500.000đ tùy chuyên khoa và bác sĩ. Giá cụ thể sẽ hiển thị khi bạn chọn bác sĩ.",
  },
  {
    question: "Tôi cần mang theo gì khi đi khám?",
    answer:
      "Bạn cần mang CMND/CCCD, thẻ BHYT (nếu có), và các kết quả xét nghiệm trước đó (nếu có). Nhớ đến trước giờ hẹn 15 phút để làm thủ tục.",
  },
  {
    question: "Có hỗ trợ bảo hiểm y tế không?",
    answer:
      "Có, phòng khám chấp nhận nhiều loại bảo hiểm y tế. Vui lòng liên hệ hotline 1900 1234 để biết chi tiết.",
  },
  {
    question: "Kết quả khám bệnh lưu ở đâu?",
    answer:
      "Tất cả kết quả khám, đơn thuốc và lịch sử điều trị đều được lưu trên hệ thống. Bạn có thể xem lại trong mục 'Kết quả khám bệnh' sau khi đăng nhập.",
  },
];
