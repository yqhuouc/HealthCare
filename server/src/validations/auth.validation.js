const { z } = require("zod");

const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  matKhau: z
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .max(50, "Mật khẩu tối đa 50 ký tự"),
  hoTen: z
    .string()
    .min(1, "Họ tên không được để trống")
    .max(120, "Họ tên tối đa 120 ký tự"),
  soDienThoai: z.string().max(20, "Số điện thoại tối đa 20 ký tự").optional(),
  gioiTinh: z.number().int().min(1).max(3).optional(),
  ngaySinh: z.string().optional(),
  diaChi: z.string().max(255, "Địa chỉ tối đa 255 ký tự").optional(),
});

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  matKhau: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

const doiMatKhauSchema = z.object({
  matKhauCu: z.string().min(1, "Vui lòng nhập mật khẩu cũ"),
  matKhauMoi: z
    .string()
    .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự")
    .max(50, "Mật khẩu mới tối đa 50 ký tự"),
});

const capNhatHoSoSchema = z.object({
  gioiTinh: z.number().int().min(1).max(3).optional(),
  ngaySinh: z.string().optional(),
  diaChi: z.string().max(255).optional(),
  anhDaiDien: z.string().max(255).optional(),
});

module.exports = { registerSchema, loginSchema, doiMatKhauSchema, capNhatHoSoSchema };
