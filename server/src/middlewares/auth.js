/**
 * Middleware xác thực và phân quyền.
 * - authenticate: kiểm tra JWT token hợp lệ, gắn user vào req.user
 * - authorize: kiểm tra req.user.vaiTro có nằm trong danh sách cho phép
 */
const jwt = require("jsonwebtoken");
const config = require("../config");
const { sendError } = require("../utils/response");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "Không có token xác thực. Vui lòng đăng nhập.", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded; // { id, email, vaiTro }
    next();
  } catch (error) {
    return sendError(res, "Token không hợp lệ hoặc đã hết hạn.", 401);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.vaiTro)) {
      return sendError(res, "Bạn không có quyền truy cập tài nguyên này.", 403);
    }
    next();
  };
};

module.exports = { authenticate, authorize };
