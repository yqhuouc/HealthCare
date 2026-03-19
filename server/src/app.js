/**
 * ============================================================
 * Entry point - Express Application
 * ============================================================
 * Khởi tạo Express server, middleware, routes, error handler.
 * ============================================================
 */
const express = require("express");
const cors = require("cors");
const config = require("./config");
const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== ROUTES =====
// Tất cả API đều có prefix /api
app.use("/api", routes);

// ===== ERROR HANDLER =====
// Đặt cuối cùng để bắt mọi lỗi từ các route/controller
app.use(errorHandler);

// ===== START SERVER =====
app.listen(config.port, () => {
  console.log(`\n🚀 Server đang chạy tại http://localhost:${config.port}`);
  console.log(`📋 API docs: http://localhost:${config.port}/api/health\n`);
});

module.exports = app;
