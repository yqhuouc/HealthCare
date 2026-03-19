import { create } from "zustand";

// Auth store (Zustand): lưu thông tin đăng nhập dùng chung toàn app
// - token được lưu ở localStorage để giữ phiên sau khi refresh trang
const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),

  // Set trạng thái đăng nhập sau khi login/register thành công
  setAuth: (user, token) => {
    localStorage.setItem("token", token);
    set({ user, token, isAuthenticated: true });
  },

  // Logout: xoá token + reset state
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false });
  },

  // Cập nhật thông tin user (không động đến token)
  setUser: (user) => set({ user }),
}));

export default useAuthStore;
