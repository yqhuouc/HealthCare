/**
 * ============================================================
 * Error Handler Middleware
 * ============================================================
 * - AppError: custom error class với statusCode
 * - errorHandler: global error handler
 * - asyncHandler: bọc async functions tự bắt lỗi
 * - notFoundHandler: xử lý 404
 * ============================================================
 */
const { Prisma } = require("@prisma/client");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Lỗi server nội bộ";

  if (process.env.NODE_ENV === "development") {
    console.error("❌ Error:", err);
  } else {
    console.error(`❌ [${new Date().toISOString()}] Error:`, err.message);
  }

  // Prisma: unique constraint (email trùng, lịch trùng...)
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    statusCode = 409;
    const field = err.meta?.target?.join(", ") || "unknown";
    message = `Dữ liệu đã tồn tại (trùng: ${field})`;
  }

  // Prisma: record not found
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
    statusCode = 404;
    message = "Không tìm thấy bản ghi liên quan";
  }

  // Prisma: foreign key constraint
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
    statusCode = 400;
    message = "Không thể thực hiện do liên kết dữ liệu";
  }

  // Prisma: database connection
  if (err.code === "P1001" || err.code === "P1002") {
    statusCode = 503;
    message = "Không thể kết nối database. Vui lòng thử lại sau.";
  }

  // Prisma: query timeout
  if (err.code === "P2024") {
    statusCode = 408;
    message = "Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại.";
  }

  // Prisma: validation
  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Dữ liệu gửi lên không đúng định dạng";
  }

  // Connection pool
  if (err.message && err.message.includes("Connection pool")) {
    statusCode = 503;
    message = "Server đang quá tải. Vui lòng thử lại sau.";
  }

  // PgBouncer/Supabase
  if (
    err.message &&
    (err.message.includes("prepared statement") ||
      err.message.includes("server conn crashed") ||
      err.message.includes("connection terminated"))
  ) {
    statusCode = 503;
    message = "Kết nối database tạm thời gián đoạn. Vui lòng thử lại.";
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Token không hợp lệ";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token đã hết hạn";
  }

  // Zod validation errors
  if (err.name === "ZodError") {
    statusCode = 400;
    message = err.errors.map((e) => e.message).join(", ");
  }

  // JSON parse error
  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Dữ liệu JSON không hợp lệ";
  }

  // Network errors
  if (err.code === "ECONNRESET" || err.code === "ETIMEDOUT") {
    statusCode = 504;
    message = "Kết nối bị ngắt hoặc timeout. Vui lòng thử lại.";
  }

  // Payload too large
  if (err.type === "entity.too.large") {
    statusCode = 413;
    message = "Dữ liệu gửi lên quá lớn";
  }

  if (res.headersSent) {
    return next(err);
  }

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

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint không tồn tại: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = { AppError, errorHandler, asyncHandler, notFoundHandler };
