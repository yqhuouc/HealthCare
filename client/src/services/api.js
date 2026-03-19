import axios from "axios";

// Axios instance dùng chung cho toàn bộ request tới backend
// baseURL "/api" thường được proxy qua Vite/Server (tuỳ cấu hình)
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor request: tự động gắn Bearer token nếu đã đăng nhập
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor response:
// - Thành công: trả về thẳng response.data để code gọi API gọn hơn
// - Thất bại: chuẩn hoá message lỗi để UI/toast hiển thị
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || "Co loi xay ra. Vui long thu lai.";
    return Promise.reject(new Error(message));
  }
);

export default api;
