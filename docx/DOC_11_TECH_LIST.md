# Danh sách công nghệ sử dụng trong đề tài (Technologies)

Dưới đây là danh sách các công nghệ chính được áp dụng trong quá trình phát triển hệ thống Đặt lịch khám bệnh trực tuyến.

## 1. Công nghệ Frontend (Client-side)
*   **Thư viện chính:** [React 19.2](https://react.dev/) - Thư viện JavaScript mã nguồn mở để xây dựng giao diện người dùng.
*   **Công cụ xây dựng:** [Vite 7.3](https://vitejs.dev/) - Công cụ build nhanh và hiện đại thay thế cho Create React App.
*   **Quản lý trạng thái:** [Zustand 5.0](https://zustand-demo.pmnd.rs/) - Thư viện quản lý state gọn nhẹ, hiệu năng cao.
*   **Xử lý dữ liệu (Server State):** [TanStack React Query v5.90](https://tanstack.com/query/latest) - Quản lý việc fetch, cache và cập nhật dữ liệu từ API.
*   **Định tuyến (Routing):** [React Router v7.13](https://reactrouter.com/) - Thư viện điều hướng trang cho Single Page Application (SPA).
*   **CSS Framework:** [Tailwind CSS v4.2](https://tailwindcss.com/) - Framework CSS theo hướng tiện ích (Utility-first) với engine Oxide mới giúp xây dựng UI nhanh chóng và tối ưu dung lượng file build.
*   **Quản lý Form:** [React Hook Form 7.71](https://react-hook-form.com/) - Giải pháp tối ưu cho việc xử lý dữ liệu trong form mà không gây re-render linh kiện liên tục.
*   **Xác thực dữ liệu (Client Validation):** [Zod 4.3](https://zod.dev/) - Kết hợp với React Hook Form để xác thực dữ liệu đầu vào phía Client theo các Schema quy định sẵn.
*   **Chống Bot & Spam:** [@marsidev/react-turnstile v1.5](https://github.com/marsidev/react-turnstile) - Thư viện tích hợp Cloudflare Turnstile để chống bot spam đăng ký/đăng nhập/quên mật khẩu bằng trí tuệ nhân tạo check ngầm.
*   **HTTP Client:** [Axios 1.13](https://axios-http.com/) - Thư viện gửi yêu cầu HTTP đến Backend API, hỗ trợ cấu hình `withCredentials: true` để gửi kèm cookie tự động.
*   **Thông báo:** [React Toastify 11.0](https://fkhadra.github.io/react-toastify/introduction/) - Hiển thị các thông báo phản hồi sinh động cho người dùng.

## 2. Công nghệ Backend (Server-side)
*   **Nền tảng:** [Node.js](https://nodejs.org/) - Môi trường chạy JavaScript phía server.
*   **Framework:** [Express.js v4.21](https://expressjs.com/) - Framework web tối giản, linh hoạt cho Node.js để xây dựng RESTful API.
*   **ORM (Object-Relational Mapping):** [Prisma v6.4](https://www.prisma.io/) - Công cụ tương tác với Database tự động tạo client an toàn kiểu dữ liệu (type-safe) thông qua schema định nghĩa trước.
*   **Xác thực và Bảo mật:**
    *   **JWT (JSON Web Token - `jsonwebtoken` v9.0):** Cơ chế xác thực phân vai trò bằng Access Token (ngắn hạn) và Refresh Token (dài hạn).
    *   **Cookie-based Auth (`cookie-parser` v1.4):** Lưu trữ token trong `HttpOnly Cookie SameSite=Strict` để phòng chống triệt để tấn công XSS và CSRF.
    *   **Bcryptjs v2.4:** Mã hóa mật khẩu người dùng trước khi lưu trữ vào Database.
    *   **Helmet v8.0:** Thiết lập các HTTP Header bảo mật chống các lỗ hổng web phổ biến (Clickjacking, MIME-sniffing...).
    *   **Express Rate Limit v7.5:** Giới hạn tần suất gọi API từ một địa chỉ IP để chống Brute-force và tấn công từ chối dịch vụ (DoS).
*   **Xác thực dữ liệu (Validation):** [Zod v3.24](https://zod.dev/) - Định nghĩa schemas validate chặt chẽ dữ liệu đầu vào của các request (body, query, params).
*   **Tích hợp cổng thanh toán:** [VNPay SDK (`vnpay` v2.5)](https://github.com/vnpay-developer/vnpay-nodejs) - Tích hợp cổng thanh toán điện tử VNPay cho cả thanh toán phí đặt lịch khám và đơn thuốc, xác thực chữ ký HMAC-SHA512 an toàn, tự động đối soát qua cơ chế IPN.
*   **Tối ưu hiệu năng & Caching:** [Redis (`ioredis` v5.10)](https://redis.io/) - Kết nối dịch vụ lưu trữ bộ nhớ đệm, lưu mã OTP tạm thời cho chức năng quên mật khẩu và cache dữ liệu API.
*   **Gửi Email tự động:** [Nodemailer v8.0](https://nodemailer.com/) - Kết nối với dịch vụ mail SMTP để gửi mã xác nhận OTP, email xác nhận lịch đặt khám thành công, và gửi đơn thuốc điện tử kèm chẩn đoán của bác sĩ cho bệnh nhân.

## 3. Cơ sở dữ liệu và Hạ tầng (Database & Infrastructure)
*   **Hệ quản trị CSDL:** [PostgreSQL](https://www.postgresql.org/) - Cơ sở dữ liệu quan hệ mã nguồn mở mạnh mẽ và đáng tin cậy.
*   **Dịch vụ lưu trữ CSDL:** [Supabase](https://supabase.com/).
*   **Dịch vụ lưu trữ Redis:** [Upstash](https://upstash.com/) - Serverless Redis dành cho các ứng dụng hiện đại.
*   **Quản lý hình ảnh:** [Cloudinary](https://cloudinary.com/) - Lưu trữ và tối ưu hóa ảnh bác sĩ, chuyên khoa.

## 4. Công cụ hỗ trợ và Môi trường
*   **Quản lý mã nguồn:** [Git](https://git-scm.com/) & [GitHub](https://github.com/).
*   **Kiểm thử API:** [Postman](https://www.postman.com/) / [Thunder Client](https://www.thunderclient.com/).
*   **Runtime:** `npm` (Node Package Manager).
*   **Môi trường phát triển:** VS Code.

---

> [!TIP]
> **Tài liệu chuyên sâu phục vụ bảo vệ đồ án:**
> *   [Phân tích kiến trúc & Lựa chọn công nghệ chi tiết](./DOC_03_TECH_STACK.md)
> *   [Chi tiết luồng dữ liệu API & Mô hình phân tầng](./DOC_04_API_SPECIFICATION.md)
