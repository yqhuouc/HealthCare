# Danh sách công nghệ sử dụng trong đề tài (Technologies)

Dưới đây là danh sách các công nghệ chính được áp dụng trong quá trình phát triển hệ thống Đặt lịch khám bệnh trực tuyến.

## 1. Công nghệ Frontend (Client-side)
*   **Hư viện chính:** [React 19](https://react.dev/) - Thư viện JavaScript mã nguồn mở để xây dựng giao diện người dùng.
*   **Công cụ xây dựng:** [Vite](https://vitejs.dev/) - Công cụ build nhanh và hiện đại thay thế cho Create React App.
*   **Quản lý trạng thái:** [Zustand](https://zustand-demo.pmnd.rs/) - Thư viện quản lý state nhẹ nhàng, hiệu năng cao.
*   **Xử lý dữ liệu (Server State):** [TanStack React Query v5](https://tanstack.com/query/latest) - Quản lý việc fetch, cache và cập nhật dữ liệu từ API.
*   **Định tuyến (Routing):** [React Router v7](https://reactrouter.com/) - Thư viện điều hướng trang cho Single Page Application (SPA).
*   **CSS Framework:** [Tailwind CSS v4](https://tailwindcss.com/) - Framework CSS theo hướng tiện ích (Utility-first) để xây dựng UI nhanh chóng.
*   **Quản lý Form:** [React Hook Form](https://react-hook-form.com/) - Giải pháp tối ưu cho việc xử lý dữ liệu trong form và validation.
*   **HTTP Client:** [Axios](https://axios-http.com/) - Thư viện gửi yêu cầu HTTP đến Backend API.
*   **Thông báo:** [React Toastify](https://fkhadra.github.io/react-toastify/introduction/) - Hiển thị các thông báo phản hồi cho người dùng.

## 2. Công nghệ Backend (Server-side)
*   **Nền tảng:** [Node.js](https://nodejs.org/) - Môi trường chạy JavaScript phía server.
*   **Framework:** [Express.js](https://expressjs.com/) - Framework web tối giản, linh hoạt cho Node.js.
*   **ORM (Object-Relational Mapping):** [Prisma](https://www.prisma.io/) - Công cụ tương tác với Database thông qua mã nguồn thay vì câu lệnh SQL thuần túy.
*   **Xác thực và Bảo mật:**
    *   **JWT (JSON Web Token):** Sử dụng các thư viện `jsonwebtoken` để tạo và xác thực token.
    *   **Cookie-based Auth:** Lưu trữ token trong `HttpOnly Cookie` để chống tấn công XSS.
    *   **Bcryptjs:** Mã hóa mật khẩu người dùng trước khi lưu trữ.
    *   **Helmet:** Bảo vệ ứng dụng khỏi các lỗ hổng bảo mật phổ biến bằng cách thiết lập các HTTP Header.
    *   **Express Rate Limit:** Hạn chế số lượng yêu cầu từ một IP để ngăn chặn tấn công Brute-force/DoS.
*   **Xác thực dữ liệu (Validation):** [Zod](https://zod.dev/) - Thư viện kiểm tra kiểu dữ liệu và ràng buộc cho các API Request Body.

## 3. Cơ sở dữ liệu (Database)
*   **Hệ quản trị CSDL:** [PostgreSQL](https://www.postgresql.org/) - Cơ sở dữ liệu quan hệ mã nguồn mở mạnh mẽ và đáng tin cậy.
*   **Dịch vụ lưu trữ:** [Supabase](https://supabase.com/) - Cung cấp Database PostgreSQL đám mây với tính năng Connection Pooling.

## 4. Công cụ hỗ trợ và Môi trường
*   **Quản lý mã nguồn:** [Git](https://git-scm.com/) & [GitHub](https://github.com/).
*   **Kiểm thử API:** [Postman](https://www.postman.com/) / [Thunder Client](https://www.thunderclient.com/).
*   **Runtime:** `npm` (Node Package Manager).
*   **Môi trường phát triển:** VS Code.
