const { body } = require("express-validator");

const datLichValidator = [
  body("ngayDat")
    .notEmpty().withMessage("Ngày đặt không được để trống")
    .isDate().withMessage("Ngày đặt phải đúng định dạng YYYY-MM-DD"),
  body("gioBatDau")
    .notEmpty().withMessage("Giờ bắt đầu không được để trống")
    .matches(/^\d{2}:\d{2}$/).withMessage("Giờ bắt đầu phải đúng định dạng HH:mm"),
  body("gioKetThuc")
    .notEmpty().withMessage("Giờ kết thúc không được để trống")
    .matches(/^\d{2}:\d{2}$/).withMessage("Giờ kết thúc phải đúng định dạng HH:mm"),
  body("bacSiId")
    .notEmpty().withMessage("bacSiId không được để trống")
    .isInt({ min: 1 }).withMessage("bacSiId phải là số nguyên dương"),
  body("benhNhanId")
    .notEmpty().withMessage("benhNhanId không được để trống")
    .isInt({ min: 1 }).withMessage("benhNhanId phải là số nguyên dương"),
  body("lyDoKham")
    .optional()
    .isLength({ max: 255 }).withMessage("Lý do khám tối đa 255 ký tự"),
  body("hinhThucThanhToanId")
    .optional()
    .isInt({ min: 1 }).withMessage("hinhThucThanhToanId phải là số nguyên dương"),
];

const capNhatTrangThaiValidator = [
  body("trangThai")
    .notEmpty().withMessage("Trạng thái không được để trống")
    .isInt({ min: 0, max: 3 }).withMessage("Trạng thái phải từ 0-3 (0=chờ, 1=xác nhận, 2=đã khám, 3=hủy)"),
];

module.exports = { datLichValidator, capNhatTrangThaiValidator };
