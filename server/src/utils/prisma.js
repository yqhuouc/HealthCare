/**
 * Prisma Client Singleton
 * Đảm bảo chỉ tạo 1 instance PrismaClient trong toàn bộ ứng dụng,
 * tránh lỗi "too many connections" khi dev với hot-reload.
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

// BigInt không serialize được sang JSON mặc định → chuyển thành Number
BigInt.prototype.toJSON = function () {
  return Number(this);
};

module.exports = prisma;
