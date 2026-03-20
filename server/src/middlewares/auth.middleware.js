/**
 * ============================================================
 * Auth Middleware - Xác thực và phân quyền (Dual JWT)
 * ============================================================
 * - authenticate: verify Access Token → query DB → gắn req.user
 * - authorize: kiểm tra req.user.vaiTro
 * - optionalAuth: không bắt buộc đăng nhập
 * ============================================================
 */
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");
const config = require("../config");
const { AppError } = require("./error.middleware");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Vui lòng đăng nhập để tiếp tục", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.jwtAccessSecret);

    // Query DB để lấy user đầy đủ + kiểm tra trạng thái
    const taiKhoan = await prisma.taiKhoan.findUnique({
      where: { id: BigInt(decoded.id) },
      select: {
        id: true,
        email: true,
        vaiTro: true,
        trangThaiTaiKhoan: true,
        bacSi: { select: { id: true } },
        benhNhan: { select: { id: true } },
      },
    });

    if (!taiKhoan) {
      throw new AppError("Tài khoản không tồn tại", 401);
    }

    if (taiKhoan.trangThaiTaiKhoan === 0) {
      throw new AppError("Tài khoản đã bị khóa", 403);
    }

    req.user = taiKhoan;
    next();
  } catch (error) {
    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Vui lòng đăng nhập", 401));
    }

    if (!roles.includes(req.user.vaiTro)) {
      return next(new AppError("Bạn không có quyền thực hiện hành động này", 403));
    }

    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.jwtAccessSecret);

    const taiKhoan = await prisma.taiKhoan.findUnique({
      where: { id: BigInt(decoded.id) },
      select: {
        id: true,
        email: true,
        vaiTro: true,
        trangThaiTaiKhoan: true,
      },
    });

    if (taiKhoan && taiKhoan.trangThaiTaiKhoan === 1) {
      req.user = taiKhoan;
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = { authenticate, authorize, optionalAuth };
