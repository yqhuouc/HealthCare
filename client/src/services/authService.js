/**
 * Auth Service — Gọi các API xác thực tới backend.
 *
 * Tất cả token được xử lý qua HttpOnly Cookie bởi server.
 * Client chỉ cần gọi API, không cần lưu/gửi token thủ công.
 *
 * Response format (sau khi unwrap bởi api interceptor):
 *   { success, message, data }
 */
import api from "./api";

export const authService = {
  /**
   * Đăng nhập — server set cookie accessToken + refreshToken
   * @returns {{ success, message, data: { user: { id, email, vaiTro, hoTen } } }}
   */
  login: (credentials) =>
    api.post("/auth/login", {
      email: credentials.email,
      matKhau: credentials.password || credentials.matKhau,
    }),

  /**
   * Đăng ký tài khoản bệnh nhân
   * @returns {{ success, message, data: { id, email, vaiTro, hoTen } }}
   */
  register: (userData) =>
    api.post("/auth/register", {
      email: userData.email,
      matKhau: userData.password || userData.matKhau,
      hoTen: userData.fullName || userData.hoTen,
      soDienThoai: userData.phone || userData.soDienThoai || undefined,
      gioiTinh: userData.gioiTinh || undefined,
      ngaySinh: userData.ngaySinh || undefined,
      diaChi: userData.diaChi || undefined,
    }),

  /**
   * Lấy thông tin user đang đăng nhập (từ cookie)
   * @returns {{ success, data: { id, email, vaiTro, gioiTinh, ngaySinh, diaChi, anhDaiDien, bacSi, benhNhan, ... } }}
   */
  getMe: () => api.get("/auth/me"),

  /**
   * Đăng xuất — server xóa cookie + refresh token trong DB
   */
  logout: () => api.post("/auth/logout"),

  /**
   * Đổi mật khẩu
   */
  doiMatKhau: ({ matKhauCu, matKhauMoi }) =>
    api.put("/auth/doi-mat-khau", { matKhauCu, matKhauMoi }),

  /**
   * Cập nhật hồ sơ cá nhân (giới tính, ngày sinh, địa chỉ, ảnh đại diện)
   */
  capNhatHoSo: (data) => api.put("/auth/cap-nhat-ho-so", data),

  /**
   * Cập nhật ảnh đại diện thông qua form data
   */
  capNhatAvatar: (formData) => api.put("/auth/cap-nhat-avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  }),
};
