import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

// Kích hoạt plugin múi giờ
dayjs.extend(utc);
dayjs.extend(timezone);

export { dayjs };

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
  return dayjs(timeInput).tz("Asia/Ho_Chi_Minh").format("HH:mm");
}

/**
 * Định dạng ngày tháng năm (DD/MM/YYYY) đảm bảo đúng múi giờ Việt Nam
 * @param {string|Date} dateInput - Chuỗi ngày hoặc đối tượng Date
 * @returns {string} Ngày định dạng DD/MM/YYYY
 */
export function formatDate(dateInput) {
  if (!dateInput) return "";
  return dayjs(dateInput).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY");
}

/**
 * Lấy ra chuỗi yyyy-mm-dd theo chuẩn input date
 */
export function toDateString(dateInput) {
  if (!dateInput) return "";
  return dayjs(dateInput).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD");
}
