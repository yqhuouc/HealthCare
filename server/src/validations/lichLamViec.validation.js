/**
 * Zod: khung giờ master (HH:mm) + lịch làm việc bác sĩ (ngày + khung + bacSi).
 * POST khung-gio, POST lich-lam-viec, ...
 */
const { z } = require("zod");

const timeRegex = /^\d{2}:\d{2}$/;

// POST /khung-gio — gioBatDau, gioKetThuc
const khungGioSchema = z.object({
  gioBatDau: z.string().regex(timeRegex, "Giờ bắt đầu phải đúng định dạng HH:mm"),
  gioKetThuc: z.string().regex(timeRegex, "Giờ kết thúc phải đúng định dạng HH:mm"),
});

// POST /lich-lam-viec — ngày + bacSi + khung + soBenhNhanToiDa tuỳ chọn
const lichLamViecSchema = z.object({
  ngayLamViec: z.string().min(1, "Ngày làm việc không được để trống"),
  bacSiId: z.union([z.string(), z.number()]).refine((val) => Number(val) > 0, {
    message: "bacSiId phải là số nguyên dương",
  }),
  khungGioId: z.union([z.string(), z.number()]).refine((val) => Number(val) > 0, {
    message: "khungGioId phải là số nguyên dương",
  }),
  soBenhNhanToiDa: z.number().int().min(1).optional(),
});

module.exports = { khungGioSchema, lichLamViecSchema };
