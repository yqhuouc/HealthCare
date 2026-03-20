const { z } = require("zod");

const cauHoiThuongGapSchema = z.object({
  cauHoi: z
    .string()
    .min(1, "Câu hỏi không được để trống")
    .max(255, "Câu hỏi tối đa 255 ký tự"),
  traLoi: z.string().min(1, "Trả lời không được để trống"),
  dangHoatDong: z.number().int().min(0).max(1).optional(),
});

module.exports = { cauHoiThuongGapSchema };
