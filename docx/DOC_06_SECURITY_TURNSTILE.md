# TÀI LIỆU KỸ THUẬT: CHỐNG BOT VỚI CLOUDFLARE TURNSTILE

Tài liệu này giải thích chi tiết về việc tích hợp Cloudflare Turnstile vào hệ thống HealthCare nhằm bảo vệ các điểm cuối (endpoints) quan trọng khỏi tấn công tự động và spam.

---

## 1. Mục đích ra đời (The "Why")

Trong môi trường internet, các hệ thống có chức năng **Đăng ký**, **Đăng nhập**, và **Quên mật khẩu** luôn là mục tiêu hàng đầu của tin tặc. Nếu không có lớp bảo vệ Turnstile, hệ thống của bạn sẽ phải đối mặt với các nguy cơ:

*   **Tấn công Brute-force:** Bot tự động thử hàng triệu mật khẩu khác nhau trên một tài khoản email cho đến khi trúng.
*   **Spam Đăng ký:** Bot tạo ra hàng nghìn tài khoản "rác" trong vài phút, làm tràn ngập cơ sở dữ liệu và lãng phí tài nguyên máy chủ.
*   **Credential Stuffing:** Kẻ xấu dùng danh sách email/mật khẩu bị lộ từ các web khác để thử đăng nhập vào hệ thống của bạn.

**Mục đích cuối cùng:** Đảm bảo mỗi yêu cầu gửi lên máy chủ đều xuất phát từ một **Con người thực sự** đang thao tác trên trình duyệt, không phải một phần mềm tự động (Bot).

---

## 2. Làm sao Cloudflare biết đâu là Người, đâu là Bot? (The "Magic")

Bạn thắc mắc: *"Tại sao tớ chỉ thấy nó xoay cái là xong mà nó lại biết được?"*. Đây chính là điểm đột phá của Turnstile so với CAPTCHA truyền thống (tìm vạch kẻ đường, đèn giao thông).

Cloudflare sử dụng một loạt các bài kiểm tra "vô hình" (Passive Challenges) dựa trên:

1.  **Phân tích hành vi (Behavioral Analysis):** Cách người dùng di chuyển chuột, tốc độ gõ phím, hoặc cách trình duyệt tải các thành phần trang web. Bot thường thao tác rất "máy móc" và chính xác tuyệt đối, trong khi con người thường có độ trễ và sự ngẫu nhiên.
2.  **Vân tay thiết bị (Device Fingerprinting):** Kiểm tra các thông số kỹ thuật của trình duyệt và hệ điều hành. Các loại Bot thường chạy trên các môi trường giả lập (Headless browser) bị thiếu một số thuộc tính mà trình duyệt thật luôn có.
3.  **Proof of Work (PoW):** Cloudflare sẽ yêu cầu trình duyệt của bạn giải một bài toán đố về toán học siêu nhỏ (ngốn rất ít CPU). Với người dùng thật, việc này mất 0.1 giây. Nhưng với một mạng lưới Bot tấn công hàng triệu lần, việc giải bài toán này sẽ làm chúng bị chậm lại đáng kể hoặc quá tải.

**Kết quả:** Nếu mọi thứ bình thường, bạn chỉ thấy cái vòng xoay (Loading) rồi hiện "Thành công". Nếu nghi ngờ, nó mới hiện ra ô "Check" để bạn nhấn vào.

---

## 3. Luồng hoạt động kỹ thuật (The "Workflow")

Luồng này được chia làm 2 giai đoạn chính:

### Giai đoạn 1: Lấy Token tại Frontend
1.  Khi người dùng vào trang Đăng nhập, `TurnstileWidget` (Frontend) gửi một yêu cầu xác thực tới Cloudflare kèm theo **Site Key**.
2.  Cloudflare thực hiện các bài kiểm tra ngầm trên trình duyệt người dùng.
3.  Nếu vượt qua, Cloudflare trả về một chuỗi mã xác thực duy nhất gọi là **Token** (`cfTurnstileResponse`).

### Giai đoạn 2: Xác thực chéo tại Backend
1.  Người dùng nhấn nút đăng nhập, Frontend gửi (Email + Password + **Token**) cho Backend.
2.  Middleware `verifyTurnstile` tại Backend chặn yêu cầu này lại.
3.  Backend gửi cái **Token** này lên máy chủ Cloudflare một lần nữa, kèm theo mã bí mật **Secret Key** (chỉ bạn mới biết) để hỏi xem Token này có hợp lệ không.
4.  Cloudflare phản hồi `success: true` hoặc `false`.
5.  Nếu thành công, Backend mới cho phép tiếp tục truy cập vào Database để kiểm tra tài khoản.

---

## 4. Tại sao lại chuyên nghiệp hơn CAPTCHA cũ?

*   **Trải nghiệm người dùng (UX):** Không gây ức chế cho người dùng thật vì không phải giải đố.
*   **Bảo mật ưu việt:** Vì nó phân tích hành vi theo thời gian thực (AI), các loại Bot thông minh hiện nay rất khó để bắt chước được sự ngẫu nhiên của con người.
*   **Quyền riêng tư:** Khác với Google reCAPTCHA, Cloudflare Turnstile cam kết không thu thập dữ liệu cá nhân của người dùng để quảng cáo.

---
*Tài liệu này được soạn thảo cho Đồ án Tốt nghiệp - Hệ thống HealthCare.*
