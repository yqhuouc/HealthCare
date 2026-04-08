/**
 * Lấy chữ cái đầu của tên bệnh nhân để làm Avatar nền (Ví dụ: "Nguyễn Văn An" -> "NA")
 * @param {string} name - Họ và tên bệnh nhân
 * @returns {string} 1 hoặc 2 chữ cái đầu viết hoa
 */
export const getInitials = (name) => {
  if (!name) return "P";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Lấy chữ cái đầu của tên Bác sĩ, tự động loại bỏ tiền tố "BS."
 * @param {string} name - Tên bác sĩ (Ví dụ: "BS. Nguyễn Văn A")
 * @returns {string} 2 chữ cái đầu viết hoa (Ví dụ: "NA")
 */
export const getDoctorInitials = (name) => {
  if (!name) return "BS";
  const parts = name.replace(/^BS\.\s*/i, "").trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

/**
 * Định dạng thời gian (HH:mm) đảm bảo đúng múi giờ Việt Nam
 * @param {string|Date} timeInput - Giờ hoặc đối tượng Date
 * @returns {string} Giờ định dạng HH:mm
 */
export function formatTime(timeInput) {
  if (!timeInput) return "";
  // Nếu là định dạng HH:mm:ss thuần (không có T của ISO)
  if (
    typeof timeInput === "string" &&
    !timeInput.includes("T") &&
    timeInput.includes(":")
  ) {
    return timeInput.substring(0, 5);
  }
  const d = new Date(timeInput);
  if (isNaN(d.getTime())) return timeInput;
  d.setFullYear(2024); // Ép năm cố định để tránh lỗi lệch múi giờ lịch sử
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

/**
 * Định dạng ngày tháng năm (DD/MM/YYYY) đảm bảo đúng múi giờ Việt Nam
 * @param {string|Date} dateInput - Chuỗi ngày hoặc đối tượng Date
 * @returns {string} Ngày định dạng DD/MM/YYYY
 */
export function formatDate(dateInput) {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return dateInput;
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

/**
 * Định dạng tiền tệ VNĐ (Ví dụ: 100000 -> "100.000đ")
 * @param {number|string} val - Số tiền
 * @returns {string} Số tiền đã định dạng
 */
export function formatPrice(val) {
  return Number(val || 0).toLocaleString("vi-VN") + "đ";
}
