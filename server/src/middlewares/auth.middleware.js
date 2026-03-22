/**
 * authenticate: bắt buộc cookie accessToken hợp lệ → req.user (taiKhoan + bacSi/benhNhan id).
 * authorize(...roles): chặn nếu req.user.vaiTro không thuộc danh sách.
 * optionalAuth: có token hợp lệ thì gắn user, không có thì next() (không 401).
 */
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");
const config = require("../config");
const { AppError } = require("./error.middleware");

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      throw new AppError("Vui lòng đăng nhập để tiếp tục", 401);
    }

    const decoded = jwt.verify(token, config.jwtAccessSecret);

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

// roles: ví dụ authorize("admin"), authorize("admin", "bac_si")
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
    const token = req.cookies.accessToken;

    if (!token) {
      return next();
    }

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
