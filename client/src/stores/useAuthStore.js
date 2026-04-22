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
   * Hàm helper rút trích thông tin hoTen/fullName dựa trên vaiTro
   * Giúp đồng bộ dữ liệu ngay lập tức sau khi login mà không cần F5.
   */
  processUserData: (userData) => {
    let hoTen = "Người dùng";
    if (userData.vaiTro === "admin") hoTen = "Quản trị viên";
    if (userData.benhNhan) hoTen = userData.benhNhan.hoTen;
    if (userData.bacSi) hoTen = userData.bacSi.tenBacSi;

    return {
      ...userData,
      hoTen: hoTen,
    };
  },

  /**
   * Kiểm tra session khi app mount.
   * Gọi GET /auth/me — nếu cookie hợp lệ sẽ trả user, không thì 401.
   */
  fetchUser: async () => {
    const { processUserData } = useAuthStore.getState();
    try {
      const res = await authService.getMe();
      const user = processUserData(res.data);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      // Cookie hết hạn hoặc chưa đăng nhập — bình thường
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  /**
   * Đăng nhập: gọi API → server set cookie → gọi fetchUser để lấy profile đầy đủ → lưu user vào store.
   * @param {{ email: string, password: string }} credentials
   * @returns {object} user data đầy đủ (sau khi đã fetch profile)
   */
  login: async (credentials, turnstileToken) => {
    // 1. Gọi login API để xác thực và nhận cookie
    await authService.login(credentials, turnstileToken);

    // 2. Ngay sau khi login thành công (server đã set cookie),
    // Gọi fetchUser để lấy đầy đủ thông tin (bacSi, chuyên khoa...)
    // Việc này giúp đồng bộ dữ liệu ngay lập tức mà không cần F5.
    const { fetchUser } = useAuthStore.getState();
    await fetchUser();
    
    // Trả về user mới nhất từ store
    return useAuthStore.getState().user;
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
  setUser: (user) =>
    set({ user: { ...user, fullName: user.hoTen || user.fullName } }),
}));

export default useAuthStore;
