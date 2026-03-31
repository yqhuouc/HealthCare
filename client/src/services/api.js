/**
 * Axios instance cấu hình sẵn cho toàn bộ ứng dụng.
 *
 * ĐẶC ĐIỂM QUAN TRỌNG:
 * - Backend dùng HttpOnly Cookie cho cả access và refresh token.
 * - Client KHÔNG lưu token ở bất kỳ đâu (không localStorage, không state).
 * - Browser tự gửi cookie kèm mọi request nhờ `withCredentials: true`.
 * - Khi access token hết hạn (401), interceptor tự gọi /api/auth/refresh
 *   để server set cookie mới, rồi retry request gốc.
 */
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Bắt buộc: để browser gửi/nhận HttpOnly cookie
});

/* ============================================================
   Hàng đợi retry khi đang refresh token
   ============================================================ */
let isRefreshing = false;
let refreshSubscribers = [];

/** Thông báo cho tất cả request đang chờ rằng refresh đã xong */
const onRefreshed = () => {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
};

/** Đăng ký request vào hàng đợi chờ refresh hoàn tất */
const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

/* ============================================================
   Response interceptor
   - Unwrap response.data (bỏ lớp axios wrapper)
   - Tự động refresh token khi nhận 401
   ============================================================ */
api.interceptors.response.use(
  // Thành công: chỉ trả về response.data (object JSON từ server)
  (response) => response.data,

  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Chỉ thử refresh khi: 401 + chưa từng retry + không phải request refresh/login/register
    const isAuthRoute =
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register");

    const shouldRefresh =
      status === 401 && !originalRequest._retry && !isAuthRoute;

    if (!shouldRefresh) {
      // Trả lỗi gốc từ server (message tiếng Việt) hoặc fallback
      const message =
        error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
      return Promise.reject(new Error(message));
    }

    originalRequest._retry = true;

    // Nếu đang có request refresh chạy rồi → xếp hàng chờ
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh(() => {
          // Retry request gốc (cookie mới đã được set bởi server)
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      // Gọi refresh — server đọc refreshToken từ cookie, set cookie mới
      await axios.post("/api/auth/refresh", {}, { withCredentials: true });

      // Thông báo cho các request đang chờ
      onRefreshed();

      // Retry request gốc (browser tự gửi cookie mới)
      return api(originalRequest);
    } catch {
      // Refresh thất bại → session hết hạn hoàn toàn
      onRefreshed(); // Giải phóng hàng đợi
      return Promise.reject(
        new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại."),
      );
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
