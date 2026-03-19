const { body } = require("express-validator");

const donThuocValidator = [
  body("datLichId")
    .notEmpty().withMessage("datLichId không được để trống")
    .isInt({ min: 1 }).withMessage("datLichId phải là số nguyên dương"),
];

module.exports = { donThuocValidator };
