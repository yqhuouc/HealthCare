const { z } = require("zod");

const hinhThucThanhToanSchema = z.object({
  tenHinhThuc: z
    .string()
    .min(1, "Tên hình thức thanh toán không được để trống")
    .max(120, "Tên hình thức thanh toán tối đa 120 ký tự"),
});

module.exports = { hinhThucThanhToanSchema };
