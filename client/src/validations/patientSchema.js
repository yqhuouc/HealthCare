import { z } from "zod";

export const patientProfileSchema = z.object({
  hoTen: z.string().min(1, "Họ tên không được để trống"),
  email: z.string().email("Định dạng email không hợp lệ").optional(),
  soDienThoai: z.string().regex(/^(0|\+84)[0-9]{9}$/, "Số điện thoại không hợp lệ").optional().or(z.literal("")),
  gioiTinh: z.string().optional(),
  ngaySinh: z.string().optional(),
  diaChi: z.string().optional(),
});

export const changePasswordSchema = z.object({
  matKhauCu: z.string().min(1, "Vui lòng nhập mật khẩu cũ"),
  matKhauMoi: z.string().min(6, "Mật khẩu mới tối thiểu 6 ký tự"),
  xacNhanMatKhau: z.string().min(6, "Vui lòng xác nhận mật khẩu mới"),
}).refine((data) => data.matKhauMoi === data.xacNhanMatKhau, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["xacNhanMatKhau"],
});
