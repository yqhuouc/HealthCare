# Tổng quan Backend: Kiến trúc & Đặc tả Nghiệm vụ (Master Doc)

> **Dự án**: ClinicBooking - Hệ thống Đặt lịch Khám bệnh Trực tuyến
> **Chủ sở hữu**: Phía Server (Backend)
> **Cập nhật lần cuối**: 12/04/2026 (Phiên bản đồng bộ 10 tuần ĐATN)

---

## 1. Kiến trúc Hệ thống (Layered Architecture)

Dự án tuân thủ mô hình phân lớp rõ ràng nhằm tách biệt trách nhiệm (Separation of Concerns), giúp hệ thống dễ bảo trì và mở rộng.

```
Request ──HTTP──► [Entry: app.js] ──► [Routes] ──► [Middlewares] ──► [Controllers] ──► [Services] ──► [Prisma] ──► [Database]
```

### Chi tiết các tầng:
- **Routes**: Định nghĩa URL và ánh xạ HTTP method sang Controller.
- **Validations (Zod)**: Kiểm tra cấu trúc dữ liệu gửi lên (Body, Query, Params) trước khi vào logic.
- **Middlewares**:
    - `auth`: Xác thực JWT và kiểm tra vai trò (Admin/Bác sĩ/Bệnh nhân).
    - `error`: Bắt và định dạng mọi lỗi hệ thống (Global Error Handler).
- **Controllers**: Điều phối request, trích xuất dữ liệu và gọi Service tương ứng.
- **Services**: Nơi chứa 100% logic nghiệp vụ. Chỉ ở đây mới có quyền tương tác với Database qua Prisma.
- **Prisma ORM**: Lớp trừu tượng hóa SQL, đảm bảo an toàn kiểu dữ liệu và tối ưu truy vấn.

---

## 2. Mô hình Dữ liệu (12 Model Database)

Hệ thống sử dụng **PostgreSQL** (host trên Supabase) với 12 bảng cốt lõi có quan hệ chặt chẽ:

| STT | Model | Vai trò | Đặc điểm kỹ thuật |
|---|---|---|---|
| 1 | **TaiKhoan** | Lưu trữ danh tính, vai trò và bảo mật. | Dual JWT, Bcrypt mật khẩu. |
| 2 | **ChuyenKhoa** | Danh mục khoa khám. | Có ảnh và icon chuyên khoa. |
| 3 | **BacSi** | Thông tin chuyên môn của bác sĩ. | Quan hệ 1-1 với TaiKhoan. |
| 4 | **BenhNhan** | Thông tin cá nhân bệnh nhân. | Quan hệ 1-1 với TaiKhoan. |
| 5 | **KhungGio** | Danh mục giờ khám master. | Định dạng `HH:mm`. |
| 6 | **LichLamViecBacSi** | Quản lý ca trực thực tế. | Kiểm soát số lượng bệnh nhân tối đa. |
| 7 | **HinhThucThanhToan** | Phương thức thanh toán (VNPay...). | Phân biệt ONLINE/OFFLINE. |
| 8 | **DatLich** | **Bảng trung tâm** quản lý lịch hẹn. | Lưu trạng thái khám & thanh toán. |
| 9 | **GiaoDich** | Lưu vết thanh toán VNPay. | Chứa mã tham chiếu và kết quả IPN. |
| 10 | **DonThuoc** | Kết quả khám bệnh. | Chứa chẩn đoán và tổng tiền thuốc. |
| 11 | **ChiTietDonThuoc** | Danh sách thuốc trong đơn. | Có cơ chế Cascade Delete. |
| 12 | **CauHoiThuongGap** | Quản lý nội dung FAQ. | Hỗ trợ ẩn/hiện tùy chỉnh. |

---

## 3. Hệ thống Bảo mật & Xác thực (Dual JWT)

Chúng tôi sử dụng cơ chế **Token Rotation** để đảm bảo an toàn tối đa cho phiên làm việc.

### Luồng xác thực:
1. **Access Token (15 phút)**: Lưu trong **HttpOnly Cookie**. Dùng để xác thực mọi request API. JS phía Client không thể đọc được (Chống XSS).
2. **Refresh Token (7 ngày)**: Lưu trong **HttpOnly Cookie** và **Database**. Dùng để cấp mới Access Token mà không cần đăng nhập lại.
3. **Token Rotation**: Mỗi khi Refresh Token được sử dụng, hệ thống sẽ cấp một cặp token mới hoàn toàn và vô hiệu hóa token cũ, giúp ngăn chặn việc đánh cắp session.

---

## 4. Tích hợp thanh toán trực tuyến (VNPay Flow)

Hệ thống tích hợp cổng thanh toán VNPay cho cả Phí khám và Tiền thuốc.

### Quy trình nghiệp vụ:
1. **Khởi tạo**: Request `/api/vnpay/create_payment_url` → Tạo bản ghi `GiaoDich` (Chờ) → Trả về link VNPay.
2. **Xử lý ngầm (IPN)**: VNPay gọi về server qua endpoint `/api/vnpay/vnpay_ipn`. Đây là bước quan trọng nhất để **cập nhật Database** dựa trên chữ ký bảo mật SHA512.
3. **Redirect**: Người dùng được trả về web để xem thông báo thành công/thất bại.

---

## 5. Xử lý dữ liệu đặc thù (BigInt & Decimal)

- **BigInt IDs**: Do Prisma dùng kiểu `BigInt` cho các ID tự tăng, chúng tôi thực hiện ghi đè phương thức `toJSON` của `BigInt` để tự động convert sang `String/Number` khi trả lời client, tránh lỗi `Do not know how to serialize a BigInt`.
- **Decimal Currency**: Sử dụng kiểu `Decimal` cho tiền tệ trong DB để đảm bảo độ chính xác tuyệt đối, tránh sai số của kiểu Float/Double.

---

## 6. Xử lý lỗi tập trung

Mọi Controller đều được bao bọc bởi `asyncHandler` để không cần viết block `try/catch` lặp lại. Các lỗi được chuẩn hóa qua lớp `AppError` với:
- `statusCode`: Mã lỗi HTTP (400, 401, 403, 404, 500).
- `message`: Thông báo thân thiện cho người dùng.
- `isOperational`: Phân biệt lỗi nghiệp vụ và lỗi hệ thống.

---

## 7. Caching & OTP (Upstash Redis)

Hệ thống tích hợp **Redis** (host trên **Upstash**) để phục vụ 2 nghiệp vụ chính:
- **Lưu trữ mã OTP:** Khi người dùng yêu cầu đặt lại mật khẩu, hệ thống tạo mã OTP ngẫu nhiên, lưu vào Redis với thời gian sống (TTL) là 5 phút. Khi người dùng nhập OTP, hệ thống truy vấn nhanh từ bộ nhớ đệm để kiểm tra, đảm bảo hiệu năng cao và tự động thu hồi khi hết hạn.
- **Caching dữ liệu:** Các API truy vấn dữ liệu ít thay đổi nhưng tần suất đọc lớn (như thông tin bác sĩ, chuyên khoa, thống kê) được cache trực tiếp trên Redis giúp tốc độ phản hồi giảm xuống mức < 5ms.

---

## 8. Gửi Email tự động (Nodemailer)

Sử dụng thư viện **Nodemailer** để cấu hình luồng gửi mail tự động qua SMTP (Gmail/Outlook):
- **Email OTP:** Gửi mã xác nhận đặt lại mật khẩu bảo mật.
- **Email Đơn Thuốc:** Ngay khi bác sĩ hoàn thành khám và kê đơn thuốc cho bệnh nhân, hệ thống tự động tổng hợp thông tin chẩn đoán, ghi chú, danh sách các loại thuốc kèm liều lượng và đơn giá để gửi trực tiếp đến địa chỉ email liên hệ của bệnh nhân.

---
*Tài liệu Master Doc hỗ trợ bảo vệ ĐATN - Nhóm phát triển Server.*
