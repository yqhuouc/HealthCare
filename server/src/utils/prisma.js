/**
 * Một PrismaClient cho cả process — tránh mở quá nhiều connection (đặc biệt nodemon).
 * Log query chỉ bật rõ ở development.
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

// Serialize JSON: BigInt mặc định không hợp lệ trong JSON.stringify
BigInt.prototype.toJSON = function () {
  return Number(this);
};

module.exports = prisma;
