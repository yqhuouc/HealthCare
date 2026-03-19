const { body } = require("express-validator");

const cauHoiThuongGapValidator = [
  body("cauHoi")
    .notEmpty().withMessage("Câu hỏi không được để trống")
    .isLength({ max: 255 }).withMessage("Câu hỏi tối đa 255 ký tự"),
  body("traLoi")
    .notEmpty().withMessage("Trả lời không được để trống"),
  body("dangHoatDong")
    .optional()
    .isInt({ min: 0, max: 1 }).withMessage("dangHoatDong phải là 0 hoặc 1"),
];

module.exports = { cauHoiThuongGapValidator };
