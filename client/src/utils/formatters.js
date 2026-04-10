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
 * Định dạng tiền tệ VNĐ (Ví dụ: 100000 -> "100.000đ")
 * @param {number|string} val - Số tiền
 * @returns {string} Số tiền đã định dạng
 */
export function formatPrice(val) {
  return Number(val || 0).toLocaleString("vi-VN") + "đ";
}
