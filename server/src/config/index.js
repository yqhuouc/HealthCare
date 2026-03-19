/**
 * Config tập trung - đọc biến môi trường từ .env
 */
require("dotenv").config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "default_secret_change_me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
};
