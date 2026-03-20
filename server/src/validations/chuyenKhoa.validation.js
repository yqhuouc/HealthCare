const { z } = require("zod");

const chuyenKhoaSchema = z.object({
  tenChuyenKhoa: z
    .string()
    .min(1, "Tên chuyên khoa không được để trống")
    .max(120, "Tên chuyên khoa tối đa 120 ký tự"),
  anhChuyenKhoa: z.string().max(255).optional(),
  moTaChuyenKhoa: z.string().optional(),
});

module.exports = { chuyenKhoaSchema };
