/**
 * Zod: cập nhật hồ sơ bệnh nhân (admin hoặc chính bệnh nhân).
 * PUT /benh-nhan/:id — body một phần.
 */
const { z } = require("zod");

const updateBenhNhanSchema = z.object({
  hoTen: z.string().min(1).max(120, "Họ tên tối đa 120 ký tự").optional(),
  soDienThoai: z.string().max(20, "Số điện thoại tối đa 20 ký tự").optional(),
  emailLienHe: z.string().email("Email liên hệ không hợp lệ").optional(),
  gioiTinh: z.number().int().min(1).max(3).optional(),
  ngaySinh: z.string().optional(),
  diaChi: z.string().max(255).optional(),
  anhDaiDien: z.string().max(255).optional(),
  trangThaiTaiKhoan: z.number().int().min(0).max(1).optional(),
});

module.exports = { updateBenhNhanSchema };
