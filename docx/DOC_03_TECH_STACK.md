# Giải Thích Chuyên Sâu Lựa Chọn Công Nghệ (Technical Rationale)

Tài liệu này cung cấp các luận cứ khoa học và kỹ thuật cho việc lựa chọn các thư viện cốt lõi trong dự án, phục vụ cho mục đích bảo vệ đồ án và giải trình hội đồng.

---

## 1. TanStack Query (Quản lý trạng thái Máy chủ)
**Vấn đề:** Native `useEffect` không có khả năng caching, dễ gây ra tình trạng "Over-fetching" (tải dữ liệu thừa) và "Prop Drilling" để truyền trạng thái loading.

**Giải pháp & Ưu điểm:**
*   **Chiến lược Caching:** Sử dụng cơ chế `stale-while-revalidate`. Dữ liệu cũ được hiển thị ngay lập tức để người dùng không phải chờ đợi, trong khi dữ liệu mới được tải ngầm.
*   **Phân tách State:** Tách biệt rõ ràng giữa **Server State** (Dữ liệu từ API) và **Client State** (Dữ liệu UI như đóng/mở menu).
*   **Tự động Invalidation:** Khi thực hiện các hành động thay đổi dữ liệu (Mutation), hệ thống tự động đánh dấu các truy vấn liên quan là "cũ" để cập nhật lại, đảm bảo tính toàn vẹn dữ liệu trên giao diện.

---

## 2. Zod & React Hook Form (Quản lý Biểu mẫu & Xác thực)
**Vấn đề:** Các biểu mẫu (Forms) truyền thống gây ra độ trễ (latency) khi render do quản lý từng ô nhập liệu bằng `useState`. Validation thủ công bằng `if/else` rườm rà và khó bảo trì.

**Giải pháp & Ưu điểm:**
*   **Uncontrolled Components:** React Hook Form giảm thiểu số lần render lại linh kiện, giúp ứng dụng mượt mà ngay cả với các form hàng chục trường dữ liệu.
*   **Schema-based Validation:** Sử dụng Zod để định nghĩa các tập quy tắc (Schemas) tập trung. Điều này giúp tách biệt logic nghiệp vụ (business rules) ra khỏi logic giao diện (UI logic).
*   **Tính tái sử dụng:** Một Schema có thể dùng chung cho cả màn hình "Thêm mới" và "Chỉnh sửa", đảm bảo tính nhất quán (Consistency).

---

## 3. Day.js & Timezone Architecture (Xử lý Thời gian)
**Vấn đề:** Đối tượng `Date` của Javascript có API nghèo nàn và dễ gây nhầm lẫn về múi giờ khi triển khai trên các hạ tầng đám mây (Cloud) dùng giờ UTC.

**Giải pháp & Ưu điểm:**
*   **Lightweight:** Day.js chỉ nặng ~2KB, tối ưu hóa kích thước bundle của ứng dụng.
*   **Immutable:** Các đối tượng thời gian là bất biến, loại bỏ các lỗi logic phát sinh khi biến đổi ngày tháng.
*   **Timezone Consistency:** Sử dụng kiến trúc `dateUtils` tập trung để ép toàn bộ hệ thống (cả Client và Server) hoạt động trên múi giờ `Asia/Ho_Chi_Minh`, giải quyết triệt để bài toán đặt lịch khám bệnh chính xác theo giờ Việt Nam.

---

## 4. Tailwind CSS 4 (Xử lý giao diện Dynamic)
**Vấn đề:** CSS truyền thống dễ gây ra sự phình to của file (bloat) và khó quản lý các trạng thái hover/active/dark mode một cách nhất quán.

**Giải pháp & Ưu điểm:**
*   **Engine "Oxide" mới:** Tốc độ build nhanh gấp nhiều lần, giúp trải nghiệm phát triển mượt mà.
*   **Utility-first:** Cho phép xây dựng giao diện phức tạp ngay trong file HTML/React mà không cần rời mắt khỏi mã nguồn.
*   **Design System nhất quán:** Sử dụng các bộ biến CSS hiện đại, giúp dễ dàng tùy chỉnh theme và đảm bảo tính thẩm mỹ "premium" cho đồ án.

---

## 5. VNPay & Payment Integration (Thanh toán trực tuyến)
**Vấn đề:** Hình thức thanh toán tiền mặt truyền thống có rủi ro và không phù hợp với xu hướng chuyển đổi số y tế.

**Giải pháp & Ưu điểm:**
*   **Cổng thanh toán quốc gia:** VNPay là giải pháp tin cậy tại Việt Nam, hỗ trợ đa dạng ngân hàng và ví điện tử.
*   **Bảo mật HMAC-SHA512:** Đảm bảo toàn vẹn dữ liệu giao dịch giữa hệ thống phòng khám và ngân hàng.
*   **Tự động hóa đối soát:** Giảm tải công việc cho Admin thông qua cơ chế IPN (Server-to-Server) tự động công nhận kết quả thanh toán.

---

## 6. Cloudinary (Lưu trữ hình ảnh Cloud)
**Vấn đề:** Lưu trữ ảnh trực tiếp trên server gây tốn băng thông, khó quản lý scale và không tối ưu hóa được kích thước ảnh cho các thiết bị khác nhau.

**Giải pháp & Ưu điểm:**
*   **Image CDN:** Tự động tối ưu dung lượng và định dạng ảnh (WebP) giúp trang web tải nhanh hơn.
*   **Upload API:** Tích hợp mượt mà với Multer ở Backend, giải phóng tài nguyên cho Server chính.

---

---

## 7. Kiến Trúc Phân Tầng (Multi-layered Architecture)
Dự án áp dụng mô hình phân tầng rõ rệt:
1.  **UI Layer:** Chỉ lo việc hiển thị.
2.  **Validation Layer:** Chỉ lo việc kiểm tra tính đúng đắn của dữ liệu.
3.  **Hook Layer:** Chỉ lo việc giao tiếp và quản lý vòng đời dữ liệu từ Server.
4.  **Service Layer:** Chỉ lo việc định dạng và gửi request.

---

## 8. Redis & Caching Strategy (Tối ưu hiệu năng)
**Vấn đề:** Các truy vấn phức tạp như Thống kê doanh thu hoặc tìm kiếm Bác sĩ tiêu tốn nhiều tài nguyên Database (I/O) nếu thực hiện liên tục.

**Giải pháp & Ưu điểm:**
*   **Upstash Redis:** Giải pháp Serverless Redis giúp quản lý bộ nhớ đệm hiệu quả mà không cần quản trị hạ tầng.
*   **In-memory Performance:** Tốc độ phản hồi đạt mức < 5ms cho các dữ liệu đã được cache, giảm tải cho Database chính tới 80% trong các kịch bản thực tế.
*   **Dynamic Expiration:** Kết hợp linh hoạt giữa TTL (Time-to-Live) và cơ chế tự động xóa cache khi dữ liệu thay đổi (Automatic Invalidation), đảm bảo người dùng luôn thấy thông tin mới nhất mà vẫn đạt tốc độ tối đa.

---

## 9. Cloudflare Turnstile (Bảo mật chống Bot Spam & Brute-force)
**Vấn đề:** Các form đăng nhập, đăng ký và quên mật khẩu luôn bị đe dọa bởi các cuộc tấn công brute-force hoặc spam tài khoản rác từ bot tự động, trong khi các giải pháp CAPTCHA truyền thống (như Google reCAPTCHA v2) làm giảm trải nghiệm người dùng nghiêm trọng vì phải click chọn hình ảnh.

**Giải pháp & Ưu điểm:**
*   **Trải nghiệm người dùng không xâm lấn:** Turnstile hoạt động ngầm để phân tích hành vi của trình duyệt mà không yêu cầu người dùng giải các câu đố phức tạp, tạo cảm giác mượt mà (frictionless UX).
*   **Xác thực phía Server chặt chẽ:** Frontend gửi token nhận được từ Cloudflare lên Backend. Backend sẽ thực hiện gọi API xác minh bảo mật (server-to-server) với Cloudflare trước khi xử lý tiếp các nghiệp vụ nhạy cảm như Đăng nhập, Đăng ký hoặc gửi OTP.
*   **Miễn phí & Bảo mật quyền riêng tư:** Turnstile không theo dõi người dùng như các CAPTCHA khác, tuân thủ các tiêu chuẩn bảo mật dữ liệu nghiêm ngặt.

---

## 10. Nodemailer & Email Service (Thông tin liên lạc tự động)
**Vấn đề:** Các giao dịch y tế số cần được thông báo kịp thời. Bệnh nhân cần nhận được đơn thuốc ngay sau khi khám và cần nhận OTP tức thì khi quên mật khẩu mà không gặp trễ.

**Giải pháp & Ưu điểm:**
*   **Đồng bộ hóa tức thời:** Gửi mã OTP xác nhận đặt lại mật khẩu với thời gian sống (TTL) 5 phút được lưu trữ trong Redis.
*   **Tự động hóa chăm sóc sức khỏe:** Gửi thông tin chi tiết đơn thuốc (bao gồm danh sách thuốc, liều dùng, chẩn đoán của bác sĩ) trực tiếp về email của bệnh nhân ngay khi bác sĩ kê đơn xong, nâng cao tính chuyên nghiệp của phòng khám.
*   **Cấu hình SMTP linh hoạt:** Hỗ trợ kết nối bảo mật qua SSL/TLS với các máy chủ email phổ biến (Gmail, Outlook) thông qua biến môi trường.

**Kết luận:** Việc kết hợp bộ công cụ hiện đại (**React 19 + Tailwind 4 + VNPay + Redis + Cloudflare Turnstile + Nodemailer**) không chỉ giúp đồ án đạt điểm cao về mặt kỹ thuật mà còn mang tính thực tiễn cực lớn, sẵn sàng cho việc triển khai thực tế trong ngành y tế số.
