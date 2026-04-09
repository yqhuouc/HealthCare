/**
 * Zod: tạo / cập nhật bác sĩ (có thể kèm tài khoản khi tạo).
 * Gắn validate middleware trước handler POST /bac-si, PUT /bac-si/:id.
 */
const { z } = require("zod");

// POST — body tạo bác sĩ (bắt buộc nhập email/matKhau và chuyenKhoaId)
const createBacSiSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  matKhau: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự").max(50, "Mật khẩu tối đa 50 ký tự"),
  tenBacSi: z
    .string()
    .min(1, "Tên bác sĩ không được để trống")
    .max(120, "Tên bác sĩ tối đa 120 ký tự"),
  chuyenKhoaId: z.union([z.string(), z.number()], { required_error: "Chuyên khoa không được để trống" }),
  hocViChucDanh: z.string().max(120, "Học vị/chức danh tối đa 120 ký tự").optional(),
  moTaNgan: z.string().max(255).optional(),
  moTaChiTiet: z.string().optional(),
  giaKham: z.union([z.string(), z.number()]).optional(),
  gioiTinh: z.number().int().min(1).max(3).optional(),
  ngaySinh: z.string().optional(),
  diaChi: z.string().max(255).optional(),
});

// PUT — body cập nhật một phần
const updateBacSiSchema = z.object({
  tenBacSi: z.string().min(1).max(120).optional(),
  hocViChucDanh: z.string().max(120).optional(),
  moTaNgan: z.string().max(255).optional(),
  moTaChiTiet: z.string().optional(),
  giaKham: z.union([z.string(), z.number()]).optional(),
  chuyenKhoaId: z.union([z.string(), z.number()]).optional(),
  email: z.string().email("Email không hợp lệ").optional(),
  matKhau: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự").optional(),
  trangThaiTaiKhoan: z.number().int().min(0).max(1).optional(),
});

module.exports = { createBacSiSchema, updateBacSiSchema };
