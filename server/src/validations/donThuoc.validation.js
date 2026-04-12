/**
 * Zod: đơn thuốc gắn datLich + mảng chi tiết thuốc.
 * POST /don-thuoc — body createDonThuocSchema.
 */
const { z } = require("zod");

// Phần tử trong chiTietDonThuoc
const chiTietThuocSchema = z.object({
  tenThuoc: z.string().min(1, "Tên thuốc không được để trống").max(255),
  soLuong: z.number().int().min(1, "Số lượng phải lớn hơn 0").optional(),
  donGia: z.number().min(0, "Đơn giá không được âm").optional(),
  lieuDung: z.string().max(255).optional().nullable(),
  ghiChu: z.string().max(255).optional().nullable(),
});

// POST — datLichId + chanDoan/ghiChu + chiTietDonThuoc[]
const createDonThuocSchema = z.object({
  datLichId: z.union([z.string(), z.number()]).refine((val) => Number(val) > 0, {
    message: "datLichId phải là số nguyên dương",
  }),
  chanDoan: z.string().optional().nullable(),
  ghiChu: z.string().optional().nullable(),
  chiTietDonThuoc: z.array(chiTietThuocSchema).optional().nullable(),
});

// Schema cho API cập nhật (không yêu cầu datLichId)
const updateDonThuocSchema = z.object({
  chanDoan: z.string().optional().nullable(),
  ghiChu: z.string().optional().nullable(),
  chiTietDonThuoc: z.array(chiTietThuocSchema).optional().nullable(),
});

module.exports = { createDonThuocSchema, updateDonThuocSchema };
