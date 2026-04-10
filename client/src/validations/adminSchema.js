import { z } from "zod";

export const doctorSchema = z.object({
  tenBacSi: z.string().min(1, "Vui lòng nhập tên bác sĩ"),
  chuyenKhoaId: z.string().min(1, "Vui lòng chọn chuyên khoa"),
  email: z.string().min(1, "Vui lòng nhập email").email("Định dạng email không hợp lệ"),
  matKhau: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự").optional().or(z.literal("")),
  hocViChucDanh: z.string().optional(),
  giaKham: z.coerce.number().min(0, "Giá khám phải lớn hơn hoặc bằng 0").optional(),
  moTaNgan: z.string().optional(),
  moTaChiTiet: z.string().optional(),
});

export const specialtySchema = z.object({
  tenChuyenKhoa: z.string().min(1, "Tên chuyên khoa không được để trống"),
  moTa: z.string().optional(),
  icon: z.string().optional(),
  thoiLuongKham: z.coerce.number().min(1, "Thời lượng khám phải lớn hơn 0").optional(),
});

export const faqSchema = z.object({
  cauHoi: z.string().min(1, "Vui lòng nhập câu hỏi"),
  traLoi: z.string().min(1, "Vui lòng nhập câu trả lời"),
  chuyenMucId: z.string().optional().or(z.literal("")),
  dangHoatDong: z.coerce.number().optional(),
});

export const patientSchema = z.object({
  hoTen: z.string().min(1, "Họ tên không được để trống"),
  soDienThoai: z.string().regex(/^(0|\+84)[0-9]{9}$/, "Số điện thoại không hợp lệ").optional().or(z.literal("")),
  cccd: z.string().optional(),
  email: z.string().optional(),
  diaChi: z.string().optional(),
  ngaySinh: z.string().optional(),
  gioiTinh: z.coerce.number().optional(),
});
