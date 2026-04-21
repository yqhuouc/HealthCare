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

### 4.2 Nghiệp vụ Khám bệnh
- `GET /api/chuyen-khoa`: Danh sách chuyên khoa.
- `GET /api/bac-si`: Tìm kiếm & Lọc bác sĩ (Phân trang).
- `GET /api/lich-lam-viec`: Xem lịch trống của bác sĩ.
- `POST /api/dat-lich`: Đặt lịch khám mới (Transaction).
- `GET /api/dat-lich/benh-nhan/:id`: Lịch sử khám của tôi.
- `PUT /api/dat-lich/:id/trang-thai`: Bác sĩ xác nhận/hủy lịch.

### 4.3 Kê đơn & Đơn thuốc
- `POST /api/don-thuoc`: Bác sĩ kê đơn (Tự động tính tổng tiền).
- `GET /api/don-thuoc/:id`: Xem đơn thuốc (Bản rút gọn nếu chưa thanh toán).
- `GET /api/don-thuoc/all`: Admin quản lý kho đơn thuốc.

### 4.4 Thanh toán Online (VNPay)
- `POST /api/vnpay/create_payment_url`: Tạo link thanh toán phí khám/thuốc.
- `GET /api/vnpay/vnpay_return`: Redirect sau khi thanh toán.
- `GET /api/vnpay/vnpay_ipn`: Xử lý giao dịch ngầm (Server-to-Server).

- `CRUD` cho Chuyên khoa, Bác sĩ, Bệnh nhân, FAQ, Khung giờ.

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
