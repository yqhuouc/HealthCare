/**
 * Config tập trung — đọc .env (PORT, JWT, CORS client).
 * jwtAccessSecret / jwtRefreshSecret bắt buộc khi chạy auth thật.
 */
require("dotenv").config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES || "15m",
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES || "7d",
  redisUrl: process.env.REDIS_URL || "",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  emailHost: process.env.EMAIL_HOST,
  emailPort: process.env.EMAIL_PORT,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
};
