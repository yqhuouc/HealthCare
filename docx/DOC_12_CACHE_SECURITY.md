# Tối ưu hiệu năng và Bảo mật nâng cao (Performance & Security)

Tài liệu này mô tả các kỹ thuật chuyên sâu được áp dụng để tối ưu hệ thống và bảo đảm an toàn dữ liệu cho dự án Đặt lịch khám bệnh.

## 1. Tối ưu hiệu năng với Redis Caching

Hệ thống sử dụng **Redis** (thông qua dịch vụ **Upstash**) làm lớp đệm dữ liệu (Caching Layer) nằm giữa Backend và Database (PostgreSQL).

### Cơ chế hoạt động:
*   **Lazy Loading (Cache-Aside):** Khi có một yêu cầu API, hệ thống sẽ kiểm tra trong Redis trước. Nếu có dữ liệu (Cache Hit), dữ liệu sẽ được trả về ngay lập tức (~2-5ms). Nếu chưa có (Cache Miss), hệ thống sẽ truy vấn từ Database, sau đó lưu lại vào Redis để phục vụ các yêu cầu sau.
*   **Chiến lược Invalidation (Xóa cache):** Để đảm bảo tính đồng bộ, các tệp Cache sẽ được tự động xóa khi dữ liệu gốc trong Database thay đổi (thêm, sửa, hoặc xóa dữ liệu).

### Các thành phần được áp dụng Cache:
| Thành phần | TTL (Thời gian sống) | Mục đích |
| :--- | :--- | :--- |
| **Dữ liệu tĩnh** | 1 tiếng (3600s) | Chuyên khoa, FAQ, Hình thức thanh toán, Khung giờ làm việc. |
| **Bác sĩ** | 10 - 15 phút | Danh sách bác sĩ tham khảo, chi tiết thông tin bác sĩ. |
| **Slot khám trống** | 5 phút (300s) | Hiển thị các ô thời gian còn trống để đặt lịch (Cập nhật cực nhanh). |
| **Thống kê** | 15 phút (900s) | Tổng hợp các số liệu Dashboard cho Admin (Đếm, tính tổng doanh thu). |

## 2. Bảo mật nâng cao

### Xác thực mã OTP (Firebase/Redis-based OTP)
*   **Luồng Quên mật khẩu:** Thay vì sử dụng liên kết JWT truyền thống, hệ thống áp dụng mã OTP 6 số.
*   **Cơ chế:** Mã OTP được sinh ngẫu nhiên và lưu tạm trong Redis với thời gian hết hạn cực ngắn (5 phút), giúp ngăn chặn việc đánh cắp hoặc tái sử dụng liên kết reset.

### Chống Bot với Cloudflare Turnstile
*   **Vị trí áp dụng:** Trang Đăng ký, Đăng nhập, và Đặt lịch khám.
*   **Lợi ích:** Thay thế cho CAPTCHA truyền thống gây khó chịu, Turnstile giúp ngăn chặn các cuộc tấn công spam lịch hẹn giả hoặc Brute-force tài khoản một cách tinh tế và hiệu quả hơn.

---

> [!NOTE]
> Sự kết hợp giữa **Redis Caching** và **Cloudflare Turnstile** giúp hệ thống không chỉ nhanh hơn mà còn có khả năng chịu tải tốt hơn trước các cuộc tấn công tự động (Bot attacks).
