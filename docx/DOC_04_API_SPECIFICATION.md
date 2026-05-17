# TỔNG QUAN BACKEND & ĐẶC TẢ API (DOC_04)

> Tài liệu mô tả kiến trúc tầng Backend, hệ thống cơ sở dữ liệu và chi tiết danh sách API của dự án **ClinicBooking**.
> **Công nghệ**: Node.js + Express + Prisma ORM + PostgreSQL (Supabase) + VNPay.

---

## 1. Kiến trúc tổng quan

Dự án tuân thủ mô hình phân lớp rõ ràng nhằm tách biệt trách nhiệm (Separation of Concerns):

```
Client (React)  ──HTTP──►  Express Server (Node.js)  ──Prisma──►  PostgreSQL
                                        │
                                        ├── Routes        → Định tuyến URL
                                        ├── Validations   → Kiểm tra dữ liệu (Zod)
                                        ├── Middlewares    → Auth, Phân quyền, Logger
                                        ├── Controllers    → Điều phối logic
                                        ├── Services       → Nghiệp vụ & DB
                                        └── Prisma ORM     → SQL Generator
```

### Luồng xử lý 1 request
1. **Route**: Nhận request và định tuyến.
2. **Middleware (Validate)**: Dùng **Zod** kiểm tra kiểu dữ liệu và ràng buộc đầu vào.
3. **Middleware (Auth)**: Kiểm tra **JWT** trong HttpOnly Cookie để xác định danh tính và vai trò.
4. **Controller**: Trích xuất dữ liệu từ `req.body`, `req.params`, `req.query`.
5. **Service**: Thực hiện logic nghiệp vụ phức tạp và gọi **Prisma** để tương tác database.
6. **Response**: Trả về JSON theo định dạng chuẩn { success, message, data }.

---

## 2. Cấu trúc Database (12 Model)

Hệ thống sử dụng PostgreSQL (Supabase) với 12 bảng dữ liệu quan hệ mãnh liệt:

| # | Model | Bảng DB | Vai trò |
|---|-------|---------|---------|
| 1 | **TaiKhoan** | TaiKhoan | Central Auth (Admin, Bác sĩ, Bệnh nhân) |
| 2 | **ChuyenKhoa** | ChuyenKhoa | Danh mục chuyên khoa & icon hiển thị |
| 3 | **BacSi** | BacSi | Thông tin chi tiết, học vị, giá khám |
| 4 | **BenhNhan** | BenhNhan | Hồ sơ bệnh nhân, SĐT, Email liên hệ |
| 5 | **KhungGio** | KhungGio | Master data khung giờ (07:00 -> 17:00) |
| 6 | **LichLamViecBacSi** | LichLamViecBacSi | Ca làm việc cụ thể của bác sĩ theo ngày + khung giờ |
| 7 | **HinhThucThanhToan** | HinhThucThanhToan | Ví điện tử (VNPay), Tiền mặt, Chuyển khoản |
| 8 | **DatLich** | DatLich | Lịch hẹn (Trạng thái khám, Trạng thái thanh toán) |
| 9 | **GiaoDich** | GiaoDich | Lịch sử thanh toán thực tế qua cổng VNPay |
| 10 | **DonThuoc** | DonThuoc | Chẩn đoán & Tổng tiền đơn thuốc |
| 11 | **ChiTietDonThuoc** | ChiTietDonThuoc | Danh sách thuốc, liều dùng, đơn giá |
| 12 | **CauHoiThuongGap** | CauHoiThuongGap | Quản lý nội dung FAQ hệ thống |

---

## 3. Hệ thống Xác thực & Bảo mật (Dual JWT)

Hệ thống sử dụng cơ chế **Token Rotation** để đảm bảo an toàn tối đa:

- **Access Token (15m)**: Lưu trong **HttpOnly Cookie** (`accessToken`). Tự động hết hạn và xóa khi đóng/refresh nếu không dùng rotation.
- **Refresh Token (7d)**: Lưu trong **HttpOnly Cookie** (`refreshToken`) và **Database**. Dùng để cấp Access Token mới mà người dùng không cần đăng nhập lại.
- **Security Middlewares**: 
  - `authenticate`: Xác thực JWT.
  - `authorize(roles)`: Kiểm tra vai trò (admin, bac_si, benh_nhan).
  - `ownershipCheck`: Bệnh nhân chỉ được xem/sửa dữ liệu của chính mình.

---

## 4. Chi tiết API Endpoints

### 4.1 Hệ thống (Auth & Profile)
- `POST /api/auth/register`: Đăng ký bệnh nhân.
- `POST /api/auth/login`: Đăng nhập (Set Dual Cookie).
- `POST /api/auth/refresh`: Làm mới token (Token Rotation).
- `POST /api/auth/logout`: Đăng xuất (Clear Cookie + Nullify DB).
- `GET /api/auth/me`: Lấy thông tin phiên làm việc hiện tại.
- `PUT /api/auth/doi-mat-khau`: Đổi mật khẩu.
- `PUT /api/auth/cap-nhat-ho-so`: Cập nhật Profile.
- `PUT /api/auth/cap-nhat-avatar`: Upload ảnh lên Cloudinary.
- `POST /api/auth/forgot-password`: Yêu cầu gửi mã OTP đặt lại mật khẩu.
- `POST /api/auth/reset-password`: Xác thực mã OTP và đặt lại mật khẩu mới.

### 4.2 Chuyên Khoa (`/api/chuyen-khoa`)
- `GET /api/chuyen-khoa`: Danh sách chuyên khoa.
- `GET /api/chuyen-khoa/:id`: Chi tiết chuyên khoa.
- `POST /api/chuyen-khoa`: Thêm chuyên khoa mới.
- `PUT /api/chuyen-khoa/:id`: Cập nhật chuyên khoa.
- `DELETE /api/chuyen-khoa/:id`: Xóa chuyên khoa.
- `PUT /api/chuyen-khoa/:id/upload-anh`: Tải ảnh chuyên khoa.

### 4.3 Bác Sĩ (`/api/bac-si`)
- `GET /api/bac-si`: Danh sách bác sĩ.
- `GET /api/bac-si/:id`: Chi tiết bác sĩ.
- `POST /api/bac-si`: Thêm bác sĩ mới.
- `PUT /api/bac-si/:id`: Cập nhật bác sĩ.
- `DELETE /api/bac-si/:id`: Xóa bác sĩ.

### 4.4 Bệnh Nhân (`/api/benh-nhan`)
- `GET /api/benh-nhan`: Danh sách bệnh nhân (Admin).
- `GET /api/benh-nhan/:id`: Chi tiết bệnh nhân.
- `PUT /api/benh-nhan/:id`: Cập nhật hồ sơ bệnh nhân.
- `DELETE /api/benh-nhan/:id`: Xóa bệnh nhân.

### 4.5 Lịch Làm Việc & Khung Giờ (`/api/lich-lam-viec`)
- `GET /api/lich-lam-viec/khung-gio`: Danh sách ca làm việc.
- `POST /api/lich-lam-viec/khung-gio`: Thêm ca làm việc mới.
- `DELETE /api/lich-lam-viec/khung-gio/:id`: Xóa ca làm việc.
- `GET /api/lich-lam-viec`: Danh sách lịch làm việc của bác sĩ.
- `POST /api/lich-lam-viec`: Đăng ký lịch làm việc mới.
- `PUT /api/lich-lam-viec/:id`: Cập nhật lịch làm việc (Tạm ngưng/Sẵn sàng).
- `DELETE /api/lich-lam-viec/:id`: Xóa lịch làm việc.

### 4.6 Đặt Lịch Hẹn (`/api/dat-lich`)
- `GET /api/dat-lich/slot-trong`: Lấy danh sách slot khám trống.
- `GET /api/dat-lich`: Lấy tất cả lịch hẹn (Admin).
- `GET /api/dat-lich/benh-nhan/:id`: Lịch sử khám của bệnh nhân.
- `GET /api/dat-lich/bac-si/:id`: Danh sách lịch khám của bác sĩ.
- `GET /api/dat-lich/:id`: Xem chi tiết lịch hẹn.
- `POST /api/dat-lich`: Đặt lịch khám mới.
- `PUT /api/dat-lich/:id/trang-thai`: Cập nhật trạng thái lịch hẹn (Xác nhận/Hủy/Đã khám).
- `PUT /api/dat-lich/:id/thanh-toan`: Cập nhật trạng thái thanh toán.
- `PATCH /api/dat-lich/:id/payment-method`: Đổi phương thức thanh toán.
- `DELETE /api/dat-lich/:id`: Xóa lịch hẹn.

### 4.7 Đơn Thuốc (`/api/don-thuoc`)
- `GET /api/don-thuoc`: Danh sách đơn thuốc.
- `GET /api/don-thuoc/:id`: Xem chi tiết đơn thuốc.
- `POST /api/don-thuoc`: Bác sĩ kê đơn mới.
- `PUT /api/don-thuoc/:id`: Bác sĩ cập nhật đơn thuốc.
- `DELETE /api/don-thuoc/:id`: Xóa đơn thuốc.

### 4.8 Câu Hỏi Thường Gặp (FAQ) (`/api/cau-hoi-thuong-gap`)
- `GET /api/cau-hoi-thuong-gap`: Lấy FAQ đang hoạt động (Public).
- `GET /api/cau-hoi-thuong-gap/all`: Lấy tất cả FAQ (Admin).
- `GET /api/cau-hoi-thuong-gap/:id`: Chi tiết FAQ.
- `POST /api/cau-hoi-thuong-gap`: Thêm FAQ mới.
- `PUT /api/cau-hoi-thuong-gap/:id`: Cập nhật FAQ.
- `DELETE /api/cau-hoi-thuong-gap/:id`: Xóa FAQ.

### 4.9 Hình Thức Thanh Toán (`/api/hinh-thuc-thanh-toan`)
- `GET /api/hinh-thuc-thanh-toan`: Danh sách hình thức.
- `POST /api/hinh-thuc-thanh-toan`: Thêm hình thức thanh toán mới.
- `DELETE /api/hinh-thuc-thanh-toan/:id`: Xóa hình thức thanh toán.

### 4.10 Thống Kê & Báo Cáo (`/api/thong-ke`)
- `GET /api/thong-ke/tong-quan`: Dashboard tổng quan (Admin).
- `GET /api/thong-ke/lich-hen`: Thống kê lịch hẹn theo ngày/bác sĩ.
- `GET /api/thong-ke/doanh-thu`: Thống kê doanh thu theo tháng.

### 4.11 Thanh Toán Online VNPay (`/api/vnpay`)
- `POST /api/vnpay/create-payment`: Tạo link thanh toán VNPay.
- `GET /api/vnpay/return`: Redirect URL sau khi thanh toán.
- `GET /api/vnpay/ipn`: Webhook xử lý giao dịch ngầm.
- `POST /api/vnpay/verify`: Chủ động xác thực kết quả thanh toán.

---

## 5. Chiến lược Caching (Redis Optimization)

Để đảm bảo hiệu năng cao, hệ thống áp dụng cơ chế Caching tích cực cho các Endpoint có tần suất truy cập lớn:

| Loại Cache | Endpoints tiêu biểu | Cơ chế Invalidation |
| :--- | :--- | :--- |
| **Static Cache** | `/api/chuyen-khoa`, `/api/cau-hoi-thuong-gap` | Xóa khi Admin cập nhật danh mục. |
| **Dynamic Cache** | `/api/bac-si`, `/api/dat-lich/slot-trong` | Xóa theo Prefix khi bác sĩ thay đổi lịch trực/hồ sơ. |
| **Dashboard Stats** | `/api/thong-ke/tong-quan` | Xóa khi có các thay đổi về Tài chính hoặc Đăng ký. |

---

## 6. Định dạng Response chuẩn

Hệ thống luôn trả về JSON thống nhất giúp Frontend xử lý dễ dàng:

```json
{
  "success": true,
  "message": "Thao tác thành công",
  "data": { ... },
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

---
*Tài liệu này là một phần của hồ sơ đồ án tốt nghiệp - Năm học 2025-2026.*
