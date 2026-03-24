import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // để gửi cookie refreshToken nếu backend dùng cookie
});

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const serverCode = error.response?.data?.code; // ví dụ backend trả TOKEN_EXPIRED

    // chỉ refresh khi token hết hạn, tránh loop vô hạn
    const shouldRefresh =
      status === 401 &&
      !originalRequest._retry &&
      (serverCode === "TOKEN_EXPIRED" || true); // tạm cho true nếu backend chưa có code

    if (!shouldRefresh) {
      const message =
        error.response?.data?.message || "Co loi xay ra. Vui long thu lai.";
      return Promise.reject(new Error(message));
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          if (!newToken) return reject(new Error("Refresh token failed"));
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      // endpoint refresh: backend trả accessToken mới
      const refreshRes = await axios.post(
        "/api/auth/refresh",
        {},
        { withCredentials: true }
      );

      const newAccessToken = refreshRes.data?.data?.accessToken;
      localStorage.setItem("token", newAccessToken);

      onRefreshed(newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshErr) {
      localStorage.removeItem("token");
      onRefreshed(null);
      return Promise.reject(new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại."));
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;