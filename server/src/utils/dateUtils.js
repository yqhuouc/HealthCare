const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

// Kích hoạt plugin múi giờ
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Cấu hình mặc định cho dự án: Múi giờ Việt Nam
 * @param {string|Date} date 
 * @returns {dayjs.Dayjs}
 */
const vnDay = (date) => dayjs(date).tz("Asia/Ho_Chi_Minh");

module.exports = {
  dayjs,
  vnDay
};
