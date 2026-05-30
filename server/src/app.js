/**
 * ============================================================
 * Entry point - Express Application
 * File này: tạo app Express, gắn middleware (bảo mật, parse body, CORS),
 * mount toàn bộ API dưới prefix /api, xử lý 404 & lỗi, rồi lắng nghe port.
 * ============================================================
 */

// ----- Framework & thư viện ngoài -----
const express = require("express");
const cors = require("cors"); // Cho phép frontend (origin khác) gọi API
const helmet = require("helmet"); // Thêm header HTTP an toàn (XSS, clickjacking, ...)
const rateLimit = require("express-rate-limit"); // Giới hạn số request / IP / khoảng thời gian
const cookieParser = require("cookie-parser"); // Đọc cookie từ header Cookie → req.cookies

// ----- Cấu hình & route nội bộ -----
const config = require("./config"); // PORT, clientUrl, JWT secret, ...
const routes = require("./routes"); // Router gốc: /health, /auth, /bac-si, ...
const { errorHandler, notFoundHandler } = require("./middlewares/error.middleware");

// Tạo instance ứng dụng Express (mọi app.use / app.listen gắn vào đây)
const app = express();

// ============================================================
// SECURITY MIDDLEWARE — chạy trước khi vào route
// ============================================================

// Helmet: set các HTTP header mặc định giảm rủi ro (không thay thế validate input)
app.use(helmet());

// Rate limit: chống spam / brute-force (ví dụ đăng nhập liên tục)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // cửa sổ 15 phút
    max: 1000, // tối đa 100 request / IP / 15 phút
    message: { success: false, message: "Quá nhiều request. Vui lòng thử lại sau." },
  })
);

// ============================================================
// PARSER + CORS — chuẩn bị req.body & cookie cho controller
// ============================================================

/**
 * CORS: chỉ cho origin của frontend (config.clientUrl) gọi API.
 * credentials: true → browser được gửi/nhận cookie (HttpOnly) khi cross-origin,
 * cần khớp với axios/fetch bên client (withCredentials).
 */
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);

/**
 * express.json()
 * - Đọc body kiểu JSON (Content-Type: application/json).
 * - Parse thành object gán vào req.body (vd: POST /api/auth/login { email, matKhau }).
 */
app.use(express.json());

/**
 * express.urlencoded({ extended: true })
 * - Đọc body kiểu form HTML: application/x-www-form-urlencoded.
 * - extended: true → dùng thư viện qs, hỗ trợ object/array trong form (ít dùng với SPA JSON).
 * - Cũng gán kết quả vào req.body.
 */
app.use(express.urlencoded({ extended: true }));

/**
 * cookieParser()
 * - Đọc header Cookie, parse thành req.cookies.
 * - Cần cho luồng auth của bạn: đọc refreshToken / accessToken từ cookie (vd: /api/auth/refresh).
 */
app.use(cookieParser());

// ============================================================
// ROUTES — mọi API REST nằm dưới prefix /api
// ============================================================

// Ví dụ: GET /api/health, POST /api/auth/login → file routes/index.js + auth.routes.js
app.use("/api", routes);

// ============================================================
// 404 & ERROR — phải đặt SAU các route
// ============================================================

// Không khớp route nào → notFoundHandler trả 404 JSON thống nhất
app.use(notFoundHandler);

// Bắt lỗi từ controller/service (throw AppError, lỗi không mong đợi) → errorHandler
app.use(errorHandler);

// ============================================================
// START SERVER
// ============================================================

app.listen(config.port, () => {
  console.log(`\n🚀 Server đang chạy tại http://localhost:${config.port}`);
  console.log(`📋 API health: http://localhost:${config.port}/api/health\n`);
});

// Export app (để test hoặc dùng ở file khác nếu tách listen ra)
module.exports = app;
