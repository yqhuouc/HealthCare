import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.jsx";

// Khởi tạo React Query client để quản lý cache + fetch data cho toàn ứng dụng
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tránh tự refetch khi user chuyển tab/window (giảm request không cần thiết)
      refetchOnWindowFocus: false,
      // Nếu request lỗi thì retry 1 lần
      retry: 1,
      // Dữ liệu được coi là "fresh" trong 5 phút
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Mount React app vào div#root (trong index.html)
createRoot(document.getElementById("root")).render(
  // StrictMode giúp cảnh báo các pattern không tốt trong môi trường dev
  <StrictMode>
    {/* Provider bọc App để mọi component dùng được React Query hooks */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
