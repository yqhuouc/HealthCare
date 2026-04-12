# Tổng quan Frontend: Kiến trúc & Luồng Dữ liệu (Master Doc)

> **Dự án**: ClinicBooking - Hệ thống Đặt lịch Khám bệnh Trực tuyến
> **Chủ sở hữu**: Phía Client (Frontend)
> **Cập nhật lần cuối**: 12/04/2026 (Phiên bản đồng bộ 10 tuần ĐATN)

---

## 1. Công nghệ & Kiến trúc (Modern Stack)

Ứng dụng được xây dựng trên nền tảng React hiện đại với tiêu chí: Hiệu năng cao, Giao diện Premium và Bảo mật tối đa.

- **Framework**: **React 19** kết hợp với **Vite** để tối ưu tốc độ build.
- **Styling**: **Tailwind CSS 4** giúp tùy biến giao diện nhanh với hệ thống Utility-first.
- **State Management**:
    - **Zustand**: Quản lý Global State (Session đăng nhập, Profile).
    - **TanStack Query v5**: Quản lý Server State (Caching API, tự động làm mới dữ liệu).
- **Form Management**: **React Hook Form** kết hợp với **Zod** để validate dữ liệu ngay tại Client.

---

## 2. Các Tầng Kiến Trúc (Project Layers)

Dự án được phân cấp để tách biệt logic xử lý khỏi giao diện:

1.  **UI Layer (Pages & Components)**: Nơi chứa mã JSX hiển thị.
2.  **State Layer (Zustand & TanStack Query)**: Điều phối dữ liệu giữa Server và UI.
3.  **Service Layer (Axios Services)**: Định nghĩa các đầu API và định dạng Payload.
4.  **Validation Layer (Zod Schemas)**: Chứa các quy tắc kiểm tra dữ liệu tập trung.
5.  **Config Layer (Axios Instance)**: Xử lý `baseURL`, `withCredentials` và Interceptor xử lý Token.

---

## 3. Luồng Dữ liệu API (Data Flow)

### 3.1 Luồng Khởi Động (Auth Recovery)
Khi người dùng tải lại trang (F5), `App.jsx` sẽ tự động kích hoạt `fetchUser()` trong `useAuthStore`. 
- Trình duyệt tự động gửi kèm **HttpOnly Cookie** lên Server.
- Nếu Cookie hợp lệ, Server trả về thông tin `user`.
- Zustand cập nhật trạng thái `isAuthenticated = true` để mở khóa các tính năng nội bộ.

### 3.2 Luồng Query (Read Data)
Sử dụng Custom Hooks từ `hooks/queries/`.
- `UI` gọi `useQuery` -> Kiểm tra Cache -> Gọi `Service` -> Trả dữ liệu về UI.
- TanStack Query tự động xử lý trạng thái `isLoading` và `isError`.

### 3.3 Luồng Mutation (Write Data)
Khi người dùng Thêm/Sửa/Xóa:
- `UI` gọi `useMutation.mutate()` -> Gọi `Service` -> Backend trả về Success.
- `onSuccess` sẽ kích hoạt **Mutation Invalidation** (xóa cache cũ), buộc hệ thống phải tự động tải lại dữ liệu mới nhất (Background refetch).

---

## 4. Bảo mật tại Client

- **HttpOnly Cookies**: Tuyệt đối không lưu Token trong `localStorage` hay `sessionStorage`. Toàn bộ việc lưu trữ Token do Trình duyệt quản lý, giúp miễn nhiễm với các cuộc tấn công XSS đánh cắp session.
- **Axios Interceptors**: Cấu hình `withCredentials: true` để đảm bảo Cookie luôn được gửi kèm trong mọi request.
- **Role-based Routing**: Sử dụng Protected Routes để chặn truy cập trái phép dựa trên vai trò `admin`, `bac_si`, `benh_nhan`.

---

## 5. Quy chuẩn Thiết kế UI/UX (Guidelines)

- **Màu sắc**: Sử dụng tông xanh y tế (`clinical-blue`) chủ đạo kết hợp với Dark mode tinh tế.
- **Phản hồi người dùng**: Luôn sử dụng `react-hot-toast` để thông báo kết quả ngay lập tức (Success/Error).
- **Loading State**: Sử dụng Skeleton hoặc Spinner chuyên nghiệp trong khi chờ dữ liệu API, tránh cảm giác "nháy" trang.

---
*Tài liệu Master Doc hỗ trợ bảo vệ ĐATN - Nhóm phát triển Client.*
