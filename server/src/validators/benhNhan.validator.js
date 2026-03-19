const { body } = require("express-validator");

const benhNhanValidator = [
  body("hoTen")
    .notEmpty().withMessage("Họ tên không được để trống")
    .isLength({ max: 120 }).withMessage("Họ tên tối đa 120 ký tự"),
  body("soDienThoai")
    .optional()
    .isLength({ max: 20 }).withMessage("Số điện thoại tối đa 20 ký tự"),
  body("emailLienHe")
    .optional()
    .isEmail().withMessage("Email liên hệ không hợp lệ"),
];

module.exports = { benhNhanValidator };
