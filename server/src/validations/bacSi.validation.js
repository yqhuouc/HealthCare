const { z } = require("zod");

const createBacSiSchema = z.object({
  tenBacSi: z
    .string()
    .min(1, "Tên bác sĩ không được để trống")
    .max(120, "Tên bác sĩ tối đa 120 ký tự"),
  hocViChucDanh: z.string().max(120, "Học vị/chức danh tối đa 120 ký tự").optional(),
  moTaNgan: z.string().max(255).optional(),
  moTaChiTiet: z.string().optional(),
  giaKham: z.union([z.string(), z.number()]).optional(),
  chuyenKhoaId: z.union([z.string(), z.number()]).optional(),
  email: z.string().email("Email không hợp lệ").optional(),
  matKhau: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự").optional(),
  gioiTinh: z.number().int().min(1).max(3).optional(),
  ngaySinh: z.string().optional(),
  diaChi: z.string().max(255).optional(),
});

const updateBacSiSchema = z.object({
  tenBacSi: z.string().min(1).max(120).optional(),
  hocViChucDanh: z.string().max(120).optional(),
  moTaNgan: z.string().max(255).optional(),
  moTaChiTiet: z.string().optional(),
  giaKham: z.union([z.string(), z.number()]).optional(),
  chuyenKhoaId: z.union([z.string(), z.number()]).optional(),
});

module.exports = { createBacSiSchema, updateBacSiSchema };
