/**
 * Schema Zod cho /api/auth. Dùng: router.METHOD(..., validate(schema), controller).
 * Thông báo lỗi tiếng Việt cho client.
 */
const { z } = require("zod");

// POST /register — đăng ký bệnh nhân
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

// POST /login
const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  matKhau: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

// PUT /doi-mat-khau
const doiMatKhauSchema = z.object({
  matKhauCu: z.string().min(1, "Vui lòng nhập mật khẩu cũ"),
  matKhauMoi: z
    .string()
    .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự")
    .max(50, "Mật khẩu mới tối đa 50 ký tự"),
});

// PUT /cap-nhat-ho-so — chỉ các trường trên taiKhoan
const capNhatHoSoSchema = z.object({
  gioiTinh: z.number().int().min(1).max(3).optional(),
  ngaySinh: z.string().optional(),
  diaChi: z.string().max(255).optional(),
  anhDaiDien: z.string().max(255).optional(),
});

// POST /register-doctor — Admin tạo tài khoản bác sĩ
const createDoctorSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  matKhau: z
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .max(50, "Mật khẩu tối đa 50 ký tự"),
  tenBacSi: z
    .string()
    .min(1, "Tên bác sĩ không được để trống")
    .max(120, "Tên bác sĩ tối đa 120 ký tự"),
  chuyenKhoaId: z.number({ message: "Chuyên khoa không hợp lệ" }).int().positive("Chuyên khoa không hợp lệ"),
  hocViChucDanh: z.string().max(120, "Học vị / chức danh tối đa 120 ký tự").optional(),
  moTaNgan: z.string().max(255, "Mô tả ngắn tối đa 255 ký tự").optional(),
  moTaChiTiet: z.string().optional(),
  giaKham: z.number().positive("Giá khám phải lớn hơn 0").optional(),
});

module.exports = { registerSchema, loginSchema, doiMatKhauSchema, capNhatHoSoSchema, createDoctorSchema };
