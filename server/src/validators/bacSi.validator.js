const { body } = require("express-validator");

const bacSiValidator = [
  body("tenBacSi")
    .notEmpty().withMessage("Tên bác sĩ không được để trống")
    .isLength({ max: 120 }).withMessage("Tên bác sĩ tối đa 120 ký tự"),
  body("hocViChucDanh")
    .optional()
    .isLength({ max: 120 }).withMessage("Học vị/chức danh tối đa 120 ký tự"),
  body("giaKham")
    .optional()
    .isDecimal().withMessage("Giá khám phải là số thập phân hợp lệ"),
  body("chuyenKhoaId")
    .optional()
    .isInt({ min: 1 }).withMessage("chuyenKhoaId phải là số nguyên dương"),
  body("taiKhoanId")
    .optional()
    .isInt({ min: 1 }).withMessage("taiKhoanId phải là số nguyên dương"),
];

module.exports = { bacSiValidator };
