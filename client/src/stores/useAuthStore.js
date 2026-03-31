import { create } from "zustand";
import { authService } from "../services/authService";

/**
 * Auth Store (Zustand) — Quản lý trạng thái đăng nhập toàn app.
 *
 * NGUYÊN TẮC:
 * - KHÔNG dùng localStorage để lưu token (backend dùng HttpOnly Cookie).
 * - Trạng thái đăng nhập xác định bằng `user !== null`.
 * - Khi app khởi động, gọi `fetchUser()` để kiểm tra session từ cookie.
 *   Nếu cookie hợp lệ → server trả user, nếu không → user = null.
 */
const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // true khi đang kiểm tra session lúc app khởi động

  /**
   * Kiểm tra session khi app mount.
   * Gọi GET /auth/me — nếu cookie hợp lệ sẽ trả user, không thì 401.
   */
  fetchUser: async () => {
    try {
      const res = await authService.getMe();
      const userData = res.data;

      // Resolve hoTen dựa trên vaiTro
      let hoTen = "Admin";
      if (userData.benhNhan) hoTen = userData.benhNhan.hoTen;
      if (userData.bacSi) hoTen = userData.bacSi.tenBacSi;

      const user = {
        ...userData,
        hoTen,
        // Giữ tương thích với code cũ dùng fullName
        fullName: hoTen,
      };

      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      // Cookie hết hạn hoặc chưa đăng nhập — bình thường
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  /**
   * Đăng nhập: gọi API → server set cookie → lưu user vào store.
   * @param {{ email: string, password: string }} credentials
   * @returns {object} user data từ server
   */
  login: async (credentials) => {
    const res = await authService.login(credentials);
    const user = {
      ...res.data.user,
      fullName: res.data.user.hoTen, // Tương thích code cũ
    };
    set({ user, isAuthenticated: true });
    return user;
  },

  /**
   * Đăng xuất: gọi API → server xóa cookie → clear state.
   */
  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // Vẫn clear state ngay cả khi API lỗi (ví dụ token đã hết hạn)
    }
    set({ user: null, isAuthenticated: false });
  },

  /**
   * Cập nhật thông tin user trong store (sau khi sửa profile).
   */
  setUser: (user) => set({ user: { ...user, fullName: user.hoTen || user.fullName } }),
}));

export default useAuthStore;
