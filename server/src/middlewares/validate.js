/**
 * Middleware chạy validate từ express-validator.
 * Nếu có lỗi → trả về 400 kèm danh sách lỗi.
 * Nếu không lỗi → next() sang controller.
 */
const { validationResult } = require("express-validator");
const { sendError } = require("../utils/response");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return sendError(res, "Dữ liệu không hợp lệ", 400, errorMessages);
  }
  next();
};

module.exports = validate;
