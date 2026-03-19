/**
 * Auth Service - Xử lý đăng nhập, đăng ký, đăng xuất
 * TODO: Kết nối với API backend thật (POST /api/auth/login, /api/auth/register)
 */
import api from "./api";

export const authService = {
  /** Đăng nhập - gửi email + password, nhận về token + user info */
  login: async (credentials) => {
    // TODO: return api.post("/auth/login", credentials);
    return { token: "mock-token", user: { id: 1, fullName: "Nguyễn Văn Test", email: credentials.email, role: "patient" } };
  },

  /** Đăng ký tài khoản bệnh nhân */
  register: async (userData) => {
    // TODO: return api.post("/auth/register", userData);
    return { message: "Đăng ký thành công!" };
  },

  /** Lấy thông tin user hiện tại từ token */
  getMe: async () => {
    // TODO: return api.get("/auth/me");
    return { id: 1, fullName: "Nguyễn Văn Test", email: "test@email.com", phone: "0912345678", role: "patient" };
  },
};
