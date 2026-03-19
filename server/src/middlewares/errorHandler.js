/**
 * Global Error Handler.
 * Bắt tất cả lỗi từ controllers/routes, trả về response JSON chuẩn.
 * Xử lý riêng cho lỗi Prisma (validation, not found, unique constraint).
 */
const { Prisma } = require("@prisma/client");

const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err.message);
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  // Lỗi unique constraint (VD: email đã tồn tại, trùng lịch)
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    const field = err.meta?.target?.join(", ") || "unknown";
    return res.status(409).json({
      success: false,
      message: `Dữ liệu đã tồn tại (trùng: ${field})`,
    });
  }

  // Lỗi foreign key không tồn tại
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy bản ghi liên quan",
    });
  }

  // Lỗi validation Prisma
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu gửi lên không đúng định dạng",
    });
  }

  // Lỗi chung
  const statusCode = err.statusCode || 500;
  const message = err.message || "Lỗi hệ thống. Vui lòng thử lại sau.";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
