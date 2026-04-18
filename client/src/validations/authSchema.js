import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập Email/Số điện thoại").email("Vui lòng nhập đúng định dạng email"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export const registerSchema = z.object({
  fullName: z.string().min(1, "Họ tên không được để trống"),
  email: z.string().min(1, "Email không được để trống").email("Vui lòng nhập đúng định dạng email"),
  phone: z.string().regex(/^(0|\+84)[0-9]{9}$/, "Số điện thoại không hợp lệ (VD: 0912345678)"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(6, "Vui lòng xác nhận mật khẩu"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export const patientProfileSchema = z.object({
  hoTen: z.string().min(1, "Họ tên không được để trống"),
  soDienThoai: z.string().regex(/^(0|\+84)[0-9]{9}$/, "Số điện thoại không hợp lệ (VD: 0912345678)"),
  email: z.string().email("Vui lòng nhập đúng định dạng email"),
  gioiTinh: z.coerce.number().optional().or(z.literal("")),
  ngaySinh: z.string().optional(),
  diaChi: z.string().optional(),
});

export const passwordChangeSchema = z.object({
  matKhauCu: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
  matKhauMoi: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
  xacNhanMatKhau: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
}).refine((data) => data.matKhauMoi === data.xacNhanMatKhau, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["xacNhanMatKhau"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Vui lòng nhập đúng định dạng email"),
});

export const resetPasswordSchema = z.object({
  matKhauMoi: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
  xacNhanMatKhau: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
}).refine((data) => data.matKhauMoi === data.xacNhanMatKhau, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["xacNhanMatKhau"],
});
