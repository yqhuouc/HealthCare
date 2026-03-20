const { z } = require("zod");

const timeRegex = /^\d{2}:\d{2}$/;

const createDatLichSchema = z.object({
  ngayDat: z.string().min(1, "Ngày đặt không được để trống"),
  gioBatDau: z
    .string()
    .regex(timeRegex, "Giờ bắt đầu phải đúng định dạng HH:mm"),
  gioKetThuc: z
    .string()
    .regex(timeRegex, "Giờ kết thúc phải đúng định dạng HH:mm"),
  bacSiId: z.union([z.string(), z.number()]).refine((val) => Number(val) > 0, {
    message: "bacSiId phải là số nguyên dương",
  }),
  benhNhanId: z.union([z.string(), z.number()]).refine((val) => Number(val) > 0, {
    message: "benhNhanId phải là số nguyên dương",
  }),
  lyDoKham: z.string().max(255, "Lý do khám tối đa 255 ký tự").optional(),
  hinhThucThanhToanId: z.union([z.string(), z.number()]).optional(),
  giaKham: z.union([z.string(), z.number()]).optional(),
});

const updateTrangThaiSchema = z.object({
  trangThai: z
    .number()
    .int()
    .min(0, "Trạng thái phải từ 0-3")
    .max(3, "Trạng thái phải từ 0-3 (0=chờ, 1=xác nhận, 2=đã khám, 3=hủy)"),
});

module.exports = { createDatLichSchema, updateTrangThaiSchema };
