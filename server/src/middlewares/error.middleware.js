/**
 * Middleware lỗi dùng chung cho toàn bộ API.
 *
 * Gồm 4 phần chính:
 * - AppError: lỗi nghiệp vụ chủ động ném từ service/controller.
 * - errorHandler: map lỗi hệ thống (Prisma/JWT/Zod/Express) sang HTTP response thống nhất.
 * - asyncHandler: bọc hàm async route handler để tự đẩy lỗi về errorHandler.
 * - notFoundHandler: trả 404 khi không khớp endpoint nào.
 */
const { Prisma } = require("@prisma/client");

// Lỗi nghiệp vụ có statusCode rõ ràng; isOperational giúp phân biệt
// lỗi dự kiến (business) với lỗi bất ngờ (bug hệ thống).
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware bắt lỗi cuối chuỗi:
// - Chuẩn hóa status/message trước khi trả về client
// - Ở môi trường development: log đầy đủ object lỗi để debug nhanh
// - Ở production: log gọn hơn để giảm lộ thông tin nhạy cảm
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Lỗi server nội bộ";

  if (process.env.NODE_ENV === "development") {
    console.error("❌ Error:", err);
  } else {
    console.error(`❌ [${new Date().toISOString()}] Error:`, err.message);
  }

  // Prisma P2002: vi phạm unique constraint (vd: email đã tồn tại).
  // Trả 409 Conflict vì tài nguyên xung đột với dữ liệu hiện có.
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    statusCode = 409;
    const field = err.meta?.target?.join(", ") || "unknown";
    message = `Dữ liệu đã tồn tại (trùng: ${field})`;
  }

  // Prisma P2025: thao tác yêu cầu bản ghi không tồn tại.
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
    statusCode = 404;
    message = "Không tìm thấy bản ghi liên quan";
  }

  // Prisma P2003: vi phạm khóa ngoại (tham chiếu dữ liệu không hợp lệ).
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
    statusCode = 400;
    message = "Không thể thực hiện do liên kết dữ liệu";
  }

  // Prisma P1001/P1002: lỗi kết nối DB hoặc timeout kết nối DB.
  // Trả 503 Service Unavailable để client có thể retry sau.
  if (err.code === "P1001" || err.code === "P1002") {
    statusCode = 503;
    message = "Không thể kết nối database. Vui lòng thử lại sau.";
  }

  // Prisma P2024: query quá thời gian chờ.
  if (err.code === "P2024") {
    statusCode = 408;
    message = "Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại.";
  }

  // Prisma validation: payload đưa vào query không đúng shape/kiểu.
  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Dữ liệu gửi lên không đúng định dạng";
  }

  // Lỗi cạn connection pool (thường khi tải cao hoặc rò rỉ kết nối).
  if (err.message && err.message.includes("Connection pool")) {
    statusCode = 503;
    message = "Server đang quá tải. Vui lòng thử lại sau.";
  }

  // Một số lỗi hạ tầng DB qua PgBouncer/Supabase thường gặp.
  if (
    err.message &&
    (err.message.includes("prepared statement") ||
      err.message.includes("server conn crashed") ||
      err.message.includes("connection terminated"))
  ) {
    statusCode = 503;
    message = "Kết nối database tạm thời gián đoạn. Vui lòng thử lại.";
  }

  // JWT không hợp lệ: chữ ký sai, token hỏng, format sai...
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Token không hợp lệ";
  }

  // JWT hết hạn.
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token đã hết hạn";
  }

  // ZodError: gom toàn bộ message validation thành 1 chuỗi trả về client.
  if (err.name === "ZodError") {
    statusCode = 400;
    message = err.errors.map((e) => e.message).join(", ");
  }

  // body-parser không parse được JSON.
  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Dữ liệu JSON không hợp lệ";
  }

  // Lỗi mạng tầng thấp giữa các service.
  if (err.code === "ECONNRESET" || err.code === "ETIMEDOUT") {
    statusCode = 504;
    message = "Kết nối bị ngắt hoặc timeout. Vui lòng thử lại.";
  }

  // Payload vượt giới hạn cấu hình body parser/server.
  if (err.type === "entity.too.large") {
    statusCode = 413;
    message = "Dữ liệu gửi lên quá lớn";
  }

  // Nếu response đã bắt đầu gửi, chuyển lại cho handler mặc định của Express
  // để tránh lỗi "Cannot set headers after they are sent".
  if (res.headersSent) {
    return next(err);
  }

  // Contract response lỗi thống nhất toàn hệ thống.
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      code: err.code,
      name: err.name,
    }),
  });
};

// Bọc route async để không cần try/catch lặp lại ở từng controller.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Handler cho route không tồn tại (đặt sau tất cả route hợp lệ).
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint không tồn tại: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = { AppError, errorHandler, asyncHandler, notFoundHandler };
