const { body } = require("express-validator");

const chuyenKhoaValidator = [
  body("tenChuyenKhoa")
    .notEmpty().withMessage("Tên chuyên khoa không được để trống")
    .isLength({ max: 120 }).withMessage("Tên chuyên khoa tối đa 120 ký tự"),
  body("anhChuyenKhoa")
    .optional()
    .isString().withMessage("Ảnh chuyên khoa phải là chuỗi URL"),
  body("moTaChuyenKhoa")
    .optional()
    .isString().withMessage("Mô tả phải là chuỗi"),
];

module.exports = { chuyenKhoaValidator };
