const { body } = require("express-validator");

const khungGioValidator = [
  body("gioBatDau")
    .notEmpty().withMessage("Giờ bắt đầu không được để trống")
    .matches(/^\d{2}:\d{2}$/).withMessage("Giờ bắt đầu phải đúng định dạng HH:mm"),
  body("gioKetThuc")
    .notEmpty().withMessage("Giờ kết thúc không được để trống")
    .matches(/^\d{2}:\d{2}$/).withMessage("Giờ kết thúc phải đúng định dạng HH:mm"),
];

const lichLamViecValidator = [
  body("ngayLamViec")
    .notEmpty().withMessage("Ngày làm việc không được để trống")
    .isDate().withMessage("Ngày làm việc phải đúng định dạng YYYY-MM-DD"),
  body("bacSiId")
    .notEmpty().withMessage("bacSiId không được để trống")
    .isInt({ min: 1 }).withMessage("bacSiId phải là số nguyên dương"),
  body("khungGioId")
    .notEmpty().withMessage("khungGioId không được để trống")
    .isInt({ min: 1 }).withMessage("khungGioId phải là số nguyên dương"),
];

module.exports = { khungGioValidator, lichLamViecValidator };
