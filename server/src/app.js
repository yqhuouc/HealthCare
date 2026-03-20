/**
 * ============================================================
 * Entry point - Express Application
 * ============================================================
 */
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const config = require("./config");
const routes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middlewares/error.middleware");

const app = express();

// ===== SECURITY MIDDLEWARE =====
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 100, // Giới hạn 100 requests / 15 phút / IP
    message: { success: false, message: "Quá nhiều request. Vui lòng thử lại sau." },
  })
);

// ===== PARSER MIDDLEWARE =====
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true, // Cho phép gửi cookie cross-origin
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ===== ROUTES =====
app.use("/api", routes);

// ===== 404 HANDLER =====
app.use(notFoundHandler);

// ===== ERROR HANDLER =====
app.use(errorHandler);

// ===== START SERVER =====
app.listen(config.port, () => {
  console.log(`\n🚀 Server đang chạy tại http://localhost:${config.port}`);
  console.log(`📋 API health: http://localhost:${config.port}/api/health\n`);
});

module.exports = app;
