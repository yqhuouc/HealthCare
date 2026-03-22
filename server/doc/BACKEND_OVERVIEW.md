# Tổng quan Backend - Hệ thống Đặt lịch Khám bệnh Trực tuyến

> **Đồ án tốt nghiệp** - Trường Đại học Mỏ - Địa chất Hà Nội
> **Công nghệ**: Node.js + Express + Prisma ORM + PostgreSQL (Supabase)

---

## 1. Kiến trúc tổng quan

```
Client (React + Vite)  ──HTTP──►  Express Server  ──Prisma──►  PostgreSQL (Supabase)
                                       │
                                       ├── Routes        → Định tuyến URL
                                       ├── Validations   → Kiểm tra dữ liệu (Zod)
                                       ├── Middlewares    → Xác thực JWT, phân quyền, xử lý lỗi
                                       ├── Controllers    → Điều phối request/response
                                       ├── Services       → Logic nghiệp vụ
                                       └── Prisma ORM     → Truy vấn database
```

### Luồng xử lý 1 request

```
Request
  │
  ▼
Route  →  [validate middleware + Zod schema]  →  [authenticate]  →  [authorize]
                                                                        │
                                                                        ▼
                                                                   Controller
                                                                        │
                                                                        ▼
                                                                    Service
                                                                        │
                                                                        ▼
                                                                Prisma → Database
                                                                        │
Response  ◄─────────────  JSON { success, message, data }  ◄───────────┘
```

### Bảo mật

- **Helmet**: bảo vệ HTTP headers
- **Rate Limit**: giới hạn 100 requests / 15 phút / IP
- **CORS**: chỉ cho phép origin từ `CLIENT_URL`
- **Dual JWT**: Access Token (HttpOnly Cookie) + Refresh Token (HttpOnly Cookie)

---

## 2. Cấu trúc thư mục

```
server/
├── prisma/
│   ├── schema.prisma              # Định nghĩa 11 model database
│   └── seed.js                    # Dữ liệu mẫu ban đầu
│
├── src/
│   ├── app.js                     # Entry point - khởi tạo Express + middleware
│   │
│   ├── config/
│   │   └── index.js               # Đọc biến môi trường (.env)
│   │
│   ├── utils/
│   │   ├── prisma.js              # Prisma Client singleton + BigInt serialize
│   │   └── response.js            # Helper: sendSuccess(), sendError()
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js      # authenticate (JWT), authorize (phân quyền), optionalAuth
│   │   ├── validate.middleware.js  # Chạy Zod schema parse, trả lỗi 400
│   │   └── error.middleware.js     # AppError class, errorHandler, asyncHandler, notFoundHandler
│   │
│   ├── validations/               # Zod schemas validate cho từng module
│   │   ├── auth.validation.js
│   │   ├── bacSi.validation.js
│   │   ├── benhNhan.validation.js
│   │   ├── chuyenKhoa.validation.js
│   │   ├── datLich.validation.js
│   │   ├── lichLamViec.validation.js
│   │   ├── donThuoc.validation.js
│   │   ├── cauHoiThuongGap.validation.js
│   │   └── hinhThucThanhToan.validation.js
│   │
│   ├── controllers/               # Điều phối request → gọi service → trả response
│   │   ├── auth.controller.js
│   │   ├── bacSi.controller.js
│   │   ├── benhNhan.controller.js
│   │   ├── chuyenKhoa.controller.js
│   │   ├── datLich.controller.js
│   │   ├── lichLamViec.controller.js
│   │   ├── donThuoc.controller.js
│   │   ├── cauHoiThuongGap.controller.js
│   │   ├── hinhThucThanhToan.controller.js
│   │   └── thongKe.controller.js
│   │
│   ├── services/                  # Logic nghiệp vụ, truy vấn Prisma
│   │   ├── auth.service.js
│   │   ├── bacSi.service.js
│   │   ├── benhNhan.service.js
│   │   ├── chuyenKhoa.service.js
│   │   ├── datLich.service.js
│   │   ├── lichLamViec.service.js
│   │   ├── donThuoc.service.js
│   │   ├── cauHoiThuongGap.service.js
│   │   ├── hinhThucThanhToan.service.js
│   │   └── thongKe.service.js
│   │
│   └── routes/                    # Định tuyến API
│       ├── index.js               # Router gốc, gom tất cả routes + health check
│       ├── auth.routes.js
│       ├── bacSi.routes.js
│       ├── benhNhan.routes.js
│       ├── chuyenKhoa.routes.js
│       ├── datLich.routes.js
│       ├── lichLamViec.routes.js
│       ├── donThuoc.routes.js
│       ├── cauHoiThuongGap.routes.js
│       ├── hinhThucThanhToan.routes.js
│       └── thongKe.routes.js
│
├── doc/                           # Tài liệu dự án
│   ├── BACKEND_OVERVIEW.md
│   ├── FUNCTION_FLOW.md
│   └── POSTMAN_TESTING_GUIDE.md
│
├── .env                           # Biến môi trường (KHÔNG commit lên git)
├── .env.example                   # Mẫu file .env
└── package.json
```

---

## 3. Database Schema (11 model)

### Sơ đồ quan hệ

```
TaiKhoan (1)──────(1) BacSi (N)──────(1) ChuyenKhoa
    │                    │
    │                    │ (1)
    │                    ▼ (N)
    │              LichLamViecBacSi (N)──────(1) KhungGio
    │
(1) │
    ▼
BenhNhan (1)────(N) DatLich (1)──────(1) DonThuoc (1)────(N) ChiTietDonThuoc
                       │
                       │ (N)
                       ▼ (1)
                 HinhThucThanhToan

                 CauHoiThuongGap (độc lập)
```

### Chi tiết các model

| # | Model | Bảng DB | Mô tả | Số cột |
|---|-------|---------|--------|--------|
| 1 | **TaiKhoan** | TaiKhoan | Tài khoản đăng nhập (admin, bác sĩ, bệnh nhân) | 11 |
| 2 | **ChuyenKhoa** | ChuyenKhoa | Danh mục chuyên khoa (Tim mạch, Thần kinh, ...) | 4 |
| 3 | **BacSi** | BacSi | Thông tin bác sĩ, liên kết tài khoản + chuyên khoa | 8 |
| 4 | **BenhNhan** | BenhNhan | Thông tin bệnh nhân, liên kết tài khoản | 5 |
| 5 | **KhungGio** | KhungGio | Khung giờ khám (07:00-08:00, 08:00-09:00, ...) | 3 |
| 6 | **LichLamViecBacSi** | LichLamViecBacSi | Lịch làm việc: bác sĩ + ngày + khung giờ + giới hạn BN | 6 |
| 7 | **HinhThucThanhToan** | HinhThucThanhToan | Tiền mặt, chuyển khoản, ví điện tử | 2 |
| 8 | **DatLich** | DatLich | Lịch hẹn khám bệnh (bảng trung tâm) | 10 |
| 9 | **DonThuoc** | DonThuoc | Đơn thuốc (1 đơn ↔ 1 lịch hẹn) + chẩn đoán + ghi chú | 4 |
| 10 | **ChiTietDonThuoc** | ChiTietDonThuoc | Chi tiết thuốc: tên, số lượng, liều dùng, ghi chú | 5 |
| 11 | **CauHoiThuongGap** | CauHoiThuongGap | FAQ hiển thị cho bệnh nhân | 4 |

### Các giá trị quan trọng

**Vai trò tài khoản (`vaiTro`)**:
- `"admin"` – Quản trị viên
- `"bac_si"` – Bác sĩ
- `"benh_nhan"` – Bệnh nhân

**Trạng thái tài khoản (`trangThaiTaiKhoan`)**:
- `1` = Hoạt động
- `0` = Bị khóa

**Giới tính (`gioiTinh`)**:
- `1` = Nam, `2` = Nữ, `3` = Khác

**Trạng thái lịch hẹn (`DatLich.trangThai`)**:
- `0` = Chờ xác nhận
- `1` = Đã xác nhận
- `2` = Đã khám xong
- `3` = Đã hủy

**Trạng thái sẵn sàng (`LichLamViecBacSi.sanSang`)**:
- `1` = Sẵn sàng nhận bệnh nhân
- `0` = Không nhận bệnh nhân

**Ràng buộc chống trùng lịch**:
- `UNIQUE(bacSiId, ngayDat, gioBatDau)` – 1 bác sĩ không thể có 2 lịch hẹn cùng ngày cùng giờ bắt đầu

**Cascade delete**:
- `ChiTietDonThuoc` tự xóa khi `DonThuoc` bị xóa (`onDelete: Cascade`)

---

## 4. Hệ thống xác thực & phân quyền

### 4.1 Quy trình xác thực - Dual JWT

Hệ thống sử dụng cơ chế **Dual JWT** với **Token Rotation**:

```
┌─────────────────────────────────────────────────────────────┐
│                      ĐĂNG NHẬP                              │
│                                                             │
│  Client gửi email + matKhau                                 │
│       │                                                     │
│       ▼                                                     │
│  Server kiểm tra → tạo 2 token:                            │
│       ├── Access Token  (15 phút) → set HttpOnly Cookie     │
│       └── Refresh Token (7 ngày)  → set HttpOnly Cookie     │
│                                     + lưu vào DB            │
│  Response JSON chỉ trả { user } — KHÔNG trả token          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      GỌI API                                │
│                                                             │
│  Browser tự gửi cookie accessToken kèm request              │
│       │                                                     │
│       ▼                                                     │
│  authenticate middleware:                                   │
│    1. Đọc req.cookies.accessToken                           │
│    2. Verify Access Token (JWT)                             │
│    3. Query DB lấy user đầy đủ                              │
│    4. Kiểm tra trangThaiTaiKhoan !== 0 (không bị khóa)     │
│    5. Gắn user vào req.user                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   LÀM MỚI TOKEN                             │
│                                                             │
│  Khi Access Token hết hạn:                                  │
│    Client gọi POST /api/auth/refresh                        │
│    (Cookie refreshToken tự gửi qua browser)                 │
│       │                                                     │
│       ▼                                                     │
│  Server verify Refresh Token + so khớp DB                   │
│    → Tạo cặp token mới (rotation)                           │
│    → Set 2 cookie mới: accessToken + refreshToken           │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Chi tiết cấu hình JWT

| Loại | Secret | Thời gian sống | Lưu trữ |
|------|--------|----------------|---------|
| **Access Token** | `JWT_ACCESS_SECRET` | 15 phút (mặc định) | HttpOnly Cookie (`accessToken`) |
| **Refresh Token** | `JWT_REFRESH_SECRET` | 7 ngày (mặc định) | HttpOnly Cookie (`refreshToken`) + cột `refreshToken` trong bảng TaiKhoan |

**Cookie options chung cho cả 2 token**:
- `httpOnly: true` – JavaScript không truy cập được → chặn XSS
- `secure: true` (production) – chỉ gửi qua HTTPS
- `sameSite: "strict"` – chống CSRF
- `maxAge`: Access Token = 15 phút, Refresh Token = 7 ngày

### 4.3 Phân quyền (Authorization)

| API | Ai được truy cập |
|-----|-------------------|
| Xem chuyên khoa, bác sĩ, FAQ, khung giờ, lịch làm việc, hình thức thanh toán | **Tất cả** (public) |
| Đặt lịch, xem lịch cá nhân, xem chi tiết bệnh nhân/lịch hẹn/đơn thuốc | **Đã đăng nhập** (JWT) |
| Đổi mật khẩu, cập nhật hồ sơ, đăng xuất | **Đã đăng nhập** (JWT) |
| Tạo/sửa/xóa bác sĩ, chuyên khoa, FAQ, hình thức thanh toán, khung giờ | **Admin** |
| Xem danh sách bệnh nhân, tất cả lịch hẹn, thống kê | **Admin** |
| Xác nhận/hủy lịch hẹn | **Admin + Bác sĩ** |
| Tạo/sửa/xóa lịch làm việc | **Admin + Bác sĩ** |
| Tạo đơn thuốc | **Bác sĩ** |

### 4.4 Ownership check

Ngoài phân quyền theo vai trò, hệ thống còn kiểm tra quyền sở hữu:
- **Bệnh nhân** chỉ xem được lịch hẹn của chính mình (`datLich.service.getByBenhNhan`)
- **Bệnh nhân** chỉ sửa được hồ sơ của chính mình (`benhNhan.service.update`)
- **Bệnh nhân** chỉ xóa được lịch hẹn của chính mình (`datLich.service.remove`)
- **Bác sĩ** chỉ xem được lịch hẹn của chính mình (`datLich.service.getByBacSi`)

---

## 5. Tổng quan API Endpoints

**Base URL**: `http://localhost:5000/api`

### 5.1 Health Check - 1 endpoint

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| `GET` | `/health` | Kiểm tra server đang hoạt động |

### 5.2 Xác thực (`/api/auth`) - 7 endpoints

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|--------|-------|
| `POST` | `/auth/register` | Đăng ký tài khoản bệnh nhân | Public |
| `POST` | `/auth/login` | Đăng nhập → set 2 HttpOnly Cookie (accessToken + refreshToken) | Public |
| `POST` | `/auth/refresh` | Làm mới cả 2 cookie bằng Refresh Cookie | Public |
| `POST` | `/auth/logout` | Đăng xuất, xóa cả 2 cookie + nullify DB | Cookie |
| `GET` | `/auth/me` | Lấy thông tin user đang đăng nhập | JWT |
| `PUT` | `/auth/doi-mat-khau` | Đổi mật khẩu | JWT |
| `PUT` | `/auth/cap-nhat-ho-so` | Cập nhật hồ sơ (giới tính, ngày sinh, địa chỉ, ảnh) | JWT |

### 5.3 Chuyên khoa (`/api/chuyen-khoa`) - 5 endpoints

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|--------|-------|
| `GET` | `/chuyen-khoa` | Danh sách tất cả chuyên khoa (kèm đếm bác sĩ) | Public |
| `GET` | `/chuyen-khoa/:id` | Chi tiết chuyên khoa + danh sách bác sĩ | Public |
| `POST` | `/chuyen-khoa` | Tạo chuyên khoa mới | Admin |
| `PUT` | `/chuyen-khoa/:id` | Cập nhật chuyên khoa | Admin |
| `DELETE` | `/chuyen-khoa/:id` | Xóa chuyên khoa (nếu không có bác sĩ) | Admin |

### 5.4 Bác sĩ (`/api/bac-si`) - 5 endpoints

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|--------|-------|
| `GET` | `/bac-si?chuyenKhoaId=&search=&page=&limit=` | Danh sách + filter + phân trang | Public |
| `GET` | `/bac-si/:id` | Chi tiết bác sĩ (kèm chuyên khoa + tài khoản) | Public |
| `POST` | `/bac-si` | Tạo bác sĩ (tự tạo tài khoản kèm theo) | Admin |
| `PUT` | `/bac-si/:id` | Cập nhật thông tin bác sĩ | Admin |
| `DELETE` | `/bac-si/:id` | Xóa bác sĩ + tài khoản (nếu không có lịch hẹn) | Admin |

### 5.5 Bệnh nhân (`/api/benh-nhan`) - 4 endpoints

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|--------|-------|
| `GET` | `/benh-nhan?search=&page=&limit=` | Danh sách bệnh nhân + phân trang | Admin |
| `GET` | `/benh-nhan/:id` | Chi tiết bệnh nhân | JWT |
| `PUT` | `/benh-nhan/:id` | Cập nhật thông tin (ownership check) | JWT |
| `DELETE` | `/benh-nhan/:id` | Xóa bệnh nhân + tài khoản (nếu không có lịch hẹn) | Admin |

### 5.6 Đặt lịch (`/api/dat-lich`) - 7 endpoints

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|--------|-------|
| `GET` | `/dat-lich?trangThai=&ngayDat=&page=&limit=` | Tất cả lịch hẹn + filter + phân trang | Admin |
| `GET` | `/dat-lich/benh-nhan/:id` | Lịch hẹn của 1 bệnh nhân (ownership check) | JWT |
| `GET` | `/dat-lich/bac-si/:id` | Lịch hẹn của 1 bác sĩ (ownership check) | JWT |
| `GET` | `/dat-lich/:id` | Chi tiết lịch hẹn (kèm bác sĩ, bệnh nhân, đơn thuốc) | JWT |
| `POST` | `/dat-lich` | Tạo lịch hẹn mới (kiểm tra lịch làm việc + trùng lịch) | JWT |
| `PUT` | `/dat-lich/:id/trang-thai` | Cập nhật trạng thái (0→1→2→3) | Admin/BS |
| `DELETE` | `/dat-lich/:id` | Xóa lịch hẹn (chỉ xóa trạng thái 0 hoặc 3) | JWT |

### 5.7 Lịch làm việc (`/api/lich-lam-viec`) - 7 endpoints

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|--------|-------|
| `GET` | `/lich-lam-viec/khung-gio` | Danh sách khung giờ | Public |
| `POST` | `/lich-lam-viec/khung-gio` | Tạo khung giờ mới | Admin |
| `DELETE` | `/lich-lam-viec/khung-gio/:id` | Xóa khung giờ (nếu không có lịch sử dụng) | Admin |
| `GET` | `/lich-lam-viec?bacSiId=&ngayLamViec=` | Lịch làm việc (kèm tên bác sĩ + khung giờ) | Public |
| `POST` | `/lich-lam-viec` | Tạo lịch làm việc (kiểm tra trùng) | Admin/BS |
| `PUT` | `/lich-lam-viec/:id` | Cập nhật (sẵn sàng, số BN hiện tại/tối đa) | Admin/BS |
| `DELETE` | `/lich-lam-viec/:id` | Xóa lịch làm việc | Admin/BS |

### 5.8 Đơn thuốc (`/api/don-thuoc`) - 4 endpoints

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|--------|-------|
| `GET` | `/don-thuoc?page=&limit=` | Danh sách đơn thuốc + phân trang | Admin/BS |
| `GET` | `/don-thuoc/:id` | Chi tiết đơn thuốc (kèm bác sĩ, bệnh nhân, chi tiết thuốc) | JWT |
| `POST` | `/don-thuoc` | Tạo đơn thuốc (chỉ cho lịch hẹn trangThai=2) | BS |
| `DELETE` | `/don-thuoc/:id` | Xóa đơn thuốc (cascade xóa chi tiết thuốc) | Admin |

### 5.9 Câu hỏi thường gặp (`/api/cau-hoi-thuong-gap`) - 6 endpoints

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|--------|-------|
| `GET` | `/cau-hoi-thuong-gap` | FAQ đang hoạt động (dangHoatDong=1) | Public |
| `GET` | `/cau-hoi-thuong-gap/all?page=&limit=` | Tất cả FAQ + phân trang | Admin |
| `GET` | `/cau-hoi-thuong-gap/:id` | Chi tiết FAQ | Public |
| `POST` | `/cau-hoi-thuong-gap` | Tạo FAQ mới | Admin |
| `PUT` | `/cau-hoi-thuong-gap/:id` | Cập nhật FAQ (nội dung + ẩn/hiện) | Admin |
| `DELETE` | `/cau-hoi-thuong-gap/:id` | Xóa FAQ | Admin |

### 5.10 Hình thức thanh toán (`/api/hinh-thuc-thanh-toan`) - 3 endpoints

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|--------|-------|
| `GET` | `/hinh-thuc-thanh-toan` | Danh sách hình thức thanh toán | Public |
| `POST` | `/hinh-thuc-thanh-toan` | Tạo mới | Admin |
| `DELETE` | `/hinh-thuc-thanh-toan/:id` | Xóa (nếu không có lịch hẹn sử dụng) | Admin |

### 5.11 Thống kê (`/api/thong-ke`) - 2 endpoints

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|--------|-------|
| `GET` | `/thong-ke/tong-quan` | Dashboard: tổng BN, BS, lịch hẹn, doanh thu, phân bố trạng thái | Admin |
| `GET` | `/thong-ke/lich-hen?tuNgay=&denNgay=` | Thống kê lịch hẹn theo ngày + top 10 bác sĩ | Admin |

**Tổng cộng: 52 endpoints** (bao gồm health check)

---

## 6. Format Response chuẩn

Mọi API đều trả JSON theo cấu trúc:

**Thành công:**
```json
{
  "success": true,
  "message": "Thông báo kết quả",
  "data": { ... }
}
```

**Thành công có phân trang:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

**Lỗi:**
```json
{
  "success": false,
  "message": "Mô tả lỗi"
}
```

**Lỗi (development mode, kèm debug info):**
```json
{
  "success": false,
  "message": "Mô tả lỗi",
  "stack": "Error: ...",
  "code": "P2002",
  "name": "PrismaClientKnownRequestError"
}
```

### Các HTTP status code sử dụng

| Code | Ý nghĩa | Khi nào trả |
|------|----------|-------------|
| `200` | OK | Request thành công |
| `201` | Created | Tạo mới thành công |
| `400` | Bad Request | Dữ liệu không hợp lệ, vi phạm ràng buộc nghiệp vụ |
| `401` | Unauthorized | Chưa đăng nhập, token sai/hết hạn |
| `403` | Forbidden | Không có quyền, tài khoản bị khóa |
| `404` | Not Found | Không tìm thấy resource, API endpoint không tồn tại |
| `408` | Request Timeout | Query database quá lâu |
| `409` | Conflict | Dữ liệu trùng (email, lịch hẹn, đơn thuốc) |
| `413` | Payload Too Large | Body request quá lớn |
| `429` | Too Many Requests | Vượt quá rate limit |
| `500` | Internal Server Error | Lỗi server không xác định |
| `503` | Service Unavailable | Không kết nối được database, server quá tải |
| `504` | Gateway Timeout | Kết nối bị ngắt/timeout |

---

## 7. Xử lý lỗi tập trung

Mọi lỗi đều đi qua `error.middleware.js`:

| Loại lỗi | Xử lý |
|-----------|--------|
| **AppError** (custom) | Trả đúng statusCode + message đã định nghĩa |
| **Prisma P2002** (unique constraint) | → 409 "Dữ liệu đã tồn tại" |
| **Prisma P2025** (record not found) | → 404 "Không tìm thấy bản ghi" |
| **Prisma P2003** (foreign key) | → 400 "Không thể thực hiện do liên kết dữ liệu" |
| **Prisma P1001/P1002** (connection) | → 503 "Không thể kết nối database" |
| **Prisma P2024** (query timeout) | → 408 "Yêu cầu mất quá nhiều thời gian" |
| **PrismaClientValidationError** | → 400 "Dữ liệu không đúng định dạng" |
| **Connection pool / PgBouncer** | → 503 "Server đang quá tải" |
| **JsonWebTokenError** | → 401 "Token không hợp lệ" |
| **TokenExpiredError** | → 401 "Token đã hết hạn" |
| **ZodError** | → 400 với message chi tiết từ schema |
| **JSON parse error** | → 400 "Dữ liệu JSON không hợp lệ" |
| **ECONNRESET / ETIMEDOUT** | → 504 "Kết nối bị ngắt hoặc timeout" |
| **Payload too large** | → 413 "Dữ liệu gửi lên quá lớn" |

---

## 8. Công nghệ sử dụng

| Công nghệ | Phiên bản | Mục đích |
|------------|-----------|----------|
| **Node.js** | >= 18 | Runtime JavaScript |
| **Express** | 4.x | Web framework |
| **Prisma** | 6.x | ORM - thao tác database |
| **PostgreSQL** | 15+ | Cơ sở dữ liệu (host trên Supabase) |
| **jsonwebtoken** | 9.x | Tạo và verify JWT (Dual Token) |
| **bcryptjs** | 2.x | Mã hóa mật khẩu (salt 10 rounds) |
| **Zod** | 3.x | Validate dữ liệu đầu vào (thay express-validator) |
| **helmet** | 8.x | Bảo vệ HTTP security headers |
| **express-rate-limit** | 7.x | Giới hạn request (chống brute force/DDoS) |
| **cookie-parser** | 1.x | Parse cookie (cho Refresh Token) |
| **cors** | 2.x | Cho phép cross-origin requests |
| **dotenv** | 16.x | Đọc biến môi trường từ .env |
| **nodemon** | 3.x | Auto restart khi dev |

---

## 9. Cài đặt & Chạy

```bash
# 1. Cài dependencies
cd server
npm install

# 2. Tạo file .env (copy từ .env.example, sửa connection string + JWT secrets)
# Xem chi tiết tại POSTMAN_TESTING_GUIDE.md → Mục 2

# 3. Tạo Prisma Client
npx prisma generate

# 4. Đẩy schema lên database
npx prisma db push

# 5. Seed dữ liệu mẫu
npm run prisma:seed

# 6. Chạy server (development)
npm run dev

# 7. (Tùy chọn) Mở Prisma Studio để xem dữ liệu
npx prisma studio
```

**Tài khoản mẫu sau khi seed**:

| Vai trò | Email | Mật khẩu |
|---------|-------|-----------|
| Admin | admin@clinic.vn | admin123 |
| Bác sĩ 1 | bacsi1@clinic.vn | doctor123 |
| Bác sĩ 2-8 | bacsi2@clinic.vn ... bacsi8@clinic.vn | doctor123 |
| Bệnh nhân | benhnhan@gmail.com | patient123 |

**Dữ liệu seed bao gồm**:
- 1 tài khoản admin
- 8 chuyên khoa
- 8 bác sĩ (kèm tài khoản)
- 1 bệnh nhân mẫu (kèm tài khoản)
- 8 khung giờ (07:00-17:00)
- 3 hình thức thanh toán
- 5 câu hỏi thường gặp

**NPM Scripts**:

| Script | Lệnh | Mô tả |
|--------|-------|-------|
| `npm run dev` | `nodemon src/app.js` | Chạy dev (auto-restart) |
| `npm start` | `node src/app.js` | Chạy production |
| `npm run prisma:generate` | `prisma generate` | Tạo Prisma Client |
| `npm run prisma:migrate` | `prisma migrate dev` | Tạo migration |
| `npm run prisma:push` | `prisma db push` | Đẩy schema lên DB |
| `npm run prisma:studio` | `prisma studio` | Mở GUI quản lý DB |
| `npm run prisma:seed` | `node prisma/seed.js` | Seed dữ liệu mẫu |
| `npm run setup` | `prisma db push && seed` | Setup nhanh (push + seed) |

---

## 10. Nguyên tắc thiết kế

1. **Layered Architecture**: Route → Validation → Middleware → Controller → Service → Prisma
2. **Separation of Concerns**: Controller chỉ điều phối, Service chứa logic nghiệp vụ
3. **DRY**: Tách helper (`response.js`, `asyncHandler`), dùng `defaultInclude` trong service
4. **Error Handling tập trung**: Mọi lỗi đều đi qua `errorHandler` trong `error.middleware.js`
5. **Validate đầu vào**: Zod schema validate trước khi vào controller
6. **Transaction**: Khi tạo/xóa dữ liệu liên quan nhiều bảng, dùng Prisma `$transaction`
7. **Phân quyền rõ ràng**: Mỗi route khai báo `authenticate` + `authorize(role)` tường minh
8. **Ownership Check**: Kiểm tra quyền sở hữu (bệnh nhân chỉ xem/sửa/xóa của mình)
9. **Secure by Default**: Helmet, rate limit, CORS strict, HttpOnly cookie cho **cả Access Token + Refresh Token**
10. **BigInt Handling**: Prisma dùng BigInt cho ID, serialize sang Number qua `toJSON` override
