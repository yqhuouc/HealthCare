/**
 * Zod: đặt lịch (giờ HH:mm) + PATCH trạng thái lịch.
 * POST /dat-lich; PUT /dat-lich/:id/trang-thai.
 *
 * gioKetThuc đã bị loại bỏ — backend tự tính từ ChuyenKhoa.thoiLuongKham.
 */
const { z } = require("zod");

const timeRegex = /^\d{2}:\d{2}$/;

// POST — ngày + gioBatDau + bacSiId, benhNhanId, ...
// gioKetThuc: backend tự tính = gioBatDau + thoiLuongKham (phút)
const createDatLichSchema = z.object({
  ngayDat: z.string().min(1, "Ngày đặt không được để trống"),
  gioBatDau: z
    .string()
    .regex(timeRegex, "Giờ bắt đầu phải đúng định dạng HH:mm"),
  bacSiId: z.union([z.string(), z.number()]).refine((val) => Number(val) > 0, {
    message: "bacSiId phải là số nguyên dương",
  }),
  benhNhanId: z.union([z.string(), z.number()]).refine((val) => Number(val) > 0, {
    message: "benhNhanId phải là số nguyên dương",
  }),
  lyDoKham: z.string().max(255, "Lý do khám tối đa 255 ký tự").optional(),
  hinhThucThanhToanId: z.union([z.string(), z.number()]).refine((val) => Number(val) > 0, {
    message: "Vui lòng chọn hình thức thanh toán",
  }),
  giaKham: z.union([z.string(), z.number()]).optional(),
  trangThaiThanhToan: z.number().int().min(0).max(1).optional(), // 0=chưa trả, 1=đã trả phí khám (tại lúc đặt)
});

// PUT trạng thái — 0..3
const updateTrangThaiSchema = z.object({
  trangThai: z
    .number()
    .int()
    .min(0, "Trạng thái phải từ 0-3")
    .max(3, "Trạng thái phải từ 0-3 (0=chờ, 1=xác nhận, 2=đã khám, 3=hủy)"),
});

// PUT thanh toán — 0..2
const updateThanhToanSchema = z.object({
  trangThaiThanhToan: z
    .number()
    .int()
    .min(0, "Trạng thái phải từ 0-2")
    .max(2, "Trạng thái phải từ 0-2 (0=chưa, 1=phí khám, 2=toàn bộ)"),
});

module.exports = {
  createDatLichSchema,
  updateTrangThaiSchema,
  updateThanhToanSchema,
};
