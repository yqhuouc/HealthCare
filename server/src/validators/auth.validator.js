const { body } = require("express-validator");

const registerValidator = [
  body("email")
    .notEmpty().withMessage("Email không được để trống")
    .isEmail().withMessage("Email không hợp lệ"),
  body("matKhau")
    .notEmpty().withMessage("Mật khẩu không được để trống")
    .isLength({ min: 6 }).withMessage("Mật khẩu phải có ít nhất 6 ký tự"),
  body("hoTen")
    .notEmpty().withMessage("Họ tên không được để trống")
    .isLength({ max: 120 }).withMessage("Họ tên tối đa 120 ký tự"),
];

const loginValidator = [
  body("email")
    .notEmpty().withMessage("Email không được để trống")
    .isEmail().withMessage("Email không hợp lệ"),
  body("matKhau")
    .notEmpty().withMessage("Mật khẩu không được để trống"),
];

module.exports = { registerValidator, loginValidator };
