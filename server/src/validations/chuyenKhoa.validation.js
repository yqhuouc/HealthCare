/**
 * Body cho POST/PUT /api/chuyen-khoa (admin).
 */
const { z } = require("zod");

const chuyenKhoaSchema = z.object({
  tenChuyenKhoa: z
    .string()
    .min(1, "Tên chuyên khoa không được để trống")
    .max(120, "Tên chuyên khoa tối đa 120 ký tự"),
  anhChuyenKhoa: z.string().max(255).optional(),
  icon: z.string().max(50).optional(),
  moTaChuyenKhoa: z.string().optional(),
  thoiLuongKham: z.coerce.number().int().min(5, "Thời lượng khám tối thiểu 5 phút").max(120, "Thời lượng khám tối đa 120 phút").optional(),
});

module.exports = { chuyenKhoaSchema };
