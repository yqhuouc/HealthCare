# Tổng quan Backend - Hệ thống Đặt lịch Khám bệnh Trực tuyến

> **Đồ án tốt nghiệp** - Trường Đại học Mỏ - Địa chất Hà Nội  
> **Công nghệ**: Node.js + Express + Prisma ORM + PostgreSQL (Supabase)

---

## 1. Kiến trúc tổng quan

```
Client (React)  ──HTTP──►  Express Server  ──Prisma──►  PostgreSQL (Supabase)
                              │
                              ├── Routes      → Định tuyến URL
                              ├── Validators  → Kiểm tra dữ liệu đầu vào
                              ├── Middlewares  → Xác thực JWT, phân quyền, xử lý lỗi
                              ├── Controllers  → Logic nghiệp vụ
                              └── Prisma ORM   → Truy vấn database
```

### Luồng xử lý 1 request

```
Request → Route → [Validator] → [Validate Middleware] → [Auth Middleware] → Controller → Prisma → Database
                                                                                ↓
Response ◄──────────────────────────────────── JSON {success, message, data} ◄──┘
```

---

## 2. Cấu trúc thư mục

```
server/
├── prisma/
│   ├── schema.prisma              # Định nghĩa 10 bảng database
│   └── seed.js                    # Dữ liệu mẫu ban đầu
│
├── src/
│   ├── app.js                     # Entry point - khởi tạo Express
│   │
│   ├── config/
│   │   └── index.js               # Đọc biến môi trường (.env)
│   │
│   ├── utils/
│   │   ├── prisma.js              # Prisma Client singleton
│   │   ├── response.js            # Helper: sendSuccess(), sendError()
│   │   └── asyncHandler.js        # Wrapper bắt lỗi async tự động
│   │
│   ├── middlewares/
│   │   ├── auth.js                # authenticate (JWT) + authorize (phân quyền)
│   │   ├── validate.js            # Chạy express-validator, trả lỗi 400
│   │   └── errorHandler.js        # Bắt mọi lỗi, xử lý lỗi Prisma
│   │
│   ├── validators/                # Quy tắc validate cho từng module
│   │   ├── auth.validator.js
│   │   ├── bacSi.validator.js
│   │   ├── benhNhan.validator.js
│   │   ├── chuyenKhoa.validator.js
│   │   ├── datLich.validator.js
│   │   ├── lichLamViec.validator.js
│   │   ├── donThuoc.validator.js
│   │   └── cauHoiThuongGap.validator.js
│   │
│   ├── controllers/               # Logic nghiệp vụ cho từng module
│   │   ├── auth.controller.js
│   │   ├── bacSi.controller.js
│   │   ├── benhNhan.controller.js
│   │   ├── chuyenKhoa.controller.js
│   │   ├── datLich.controller.js
│   │   ├── lichLamViec.controller.js
│   │   ├── donThuoc.controller.js
│   │   ├── cauHoiThuongGap.controller.js
│   │   └── hinhThucThanhToan.controller.js
│   │
│   └── routes/                    # Định tuyến API
│       ├── index.js               # Router gốc, gom tất cả routes
│       ├── auth.routes.js
│       ├── bacSi.routes.js
│       ├── benhNhan.routes.js
│       ├── chuyenKhoa.routes.js
│       ├── datLich.routes.js
│       ├── lichLamViec.routes.js
│       ├── donThuoc.routes.js
│       ├── cauHoiThuongGap.routes.js
│       └── hinhThucThanhToan.routes.js
│
├── .env                           # Biến môi trường (KHÔNG commit lên git)
├── .env.example                   # Mẫu file .env
└── package.json
```

---

## 3. Database Schema (10 bảng)

### Sơ đồ quan hệ

```
TaiKhoan (1)──────(1) BacSi (N)──────(1) ChuyenKhoa
    │                    │
    │                    │ (1)
    │                    ▼ (N)
    │              LichLamViecBacSi (N)──────(1) KhungGio
    │                    │
    │                    │
(1) │              (1)   │
    ▼                    ▼
BenhNhan (1)────(N) DatLich (1)──────(1) DonThuoc
                       │
                       │ (N)
                       ▼ (1)
                 HinhThucThanhToan

                 CauHoiThuongGap (độc lập)
```

### Chi tiết các bảng

| # | Bảng | Mô tả | Số cột |
|---|------|--------|--------|
| 1 | **TaiKhoan** | Tài khoản đăng nhập (admin, bác sĩ, bệnh nhân) | 11 |
| 2 | **ChuyenKhoa** | Danh mục chuyên khoa (Tim mạch, Thần kinh, ...) | 4 |
| 3 | **BacSi** | Thông tin bác sĩ, liên kết tài khoản + chuyên khoa | 8 |
| 4 | **BenhNhan** | Thông tin bệnh nhân, liên kết tài khoản | 5 |
| 5 | **KhungGio** | Khung giờ khám (07:00-08:00, 08:00-09:00, ...) | 3 |
| 6 | **LichLamViecBacSi** | Lịch làm việc: bác sĩ nào, ngày nào, khung giờ nào | 6 |
| 7 | **HinhThucThanhToan** | Tiền mặt, chuyển khoản, ví điện tử | 2 |
| 8 | **DatLich** | Lịch hẹn khám bệnh (bảng quan trọng nhất) | 10 |
| 9 | **DonThuoc** | Đơn thuốc (1 đơn thuốc ↔ 1 lịch hẹn) | 3 |
| 10 | **CauHoiThuongGap** | FAQ hiển thị cho bệnh nhân | 4 |

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

**Ràng buộc chống trùng lịch**:
- `UNIQUE(bacSiId, ngayDat, gioBatDau)` – 1 bác sĩ không thể có 2 lịch cùng ngày cùng giờ

---

## 4. Hệ thống xác thực & phân quyền

### Quy trình xác thực (Authentication)

```
Đăng ký/Đăng nhập → Server trả JWT token
                        ↓
Client lưu token → Gửi kèm header: Authorization: Bearer <token>
                        ↓
Server giải mã token → Lấy {id, email, vaiTro} → Gắn vào req.user
```

### Phân quyền (Authorization)

| API | Ai được truy cập |
|-----|-------------------|
| Xem chuyên khoa, bác sĩ, FAQ, khung giờ | **Tất cả** (public) |
| Đặt lịch, xem lịch cá nhân, cập nhật profile | **Đã đăng nhập** (JWT) |
| Tạo/sửa/xóa bác sĩ, chuyên khoa, FAQ | **Admin** |
| Xác nhận/hủy lịch hẹn | **Admin + Bác sĩ** |
| Tạo lịch làm việc | **Admin + Bác sĩ** |
| Tạo đơn thuốc | **Bác sĩ** |
| Xem danh sách bệnh nhân, tất cả lịch hẹn | **Admin** |

---

## 5. Tổng quan API Endpoints

**Base URL**: `http://localhost:5000/api`

### 5.1 Xác thực (`/api/auth`) - 3 endpoints

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| `POST` | `/auth/register` | Đăng ký tài khoản bệnh nhân mới |
| `POST` | `/auth/login` | Đăng nhập, trả về JWT token |
| `GET` | `/auth/me` | Lấy thông tin user đang đăng nhập |

### 5.2 Chuyên khoa (`/api/chuyen-khoa`) - 5 endpoints

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|--------|-------|
| `GET` | `/chuyen-khoa` | Danh sách tất cả chuyên khoa | Public |
| `GET` | `/chuyen-khoa/:id` | Chi tiết chuyên khoa + bác sĩ | Public |
| `POST` | `/chuyen-khoa` | Tạo chuyên khoa mới | Admin |
| `PUT` | `/chuyen-khoa/:id` | Cập nhật chuyên khoa | Admin |
| `DELETE` | `/chuyen-khoa/:id` | Xóa chuyên khoa | Admin |

### 5.3 Bác sĩ (`/api/bac-si`) - 5 endpoints

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|--------|-------|
| `GET` | `/bac-si?chuyenKhoaId=&search=&page=&limit=` | Danh sách + filter + phân trang | Public |
| `GET` | `/bac-si/:id` | Chi tiết bác sĩ | Public |
| `POST` | `/bac-si` | Tạo bác sĩ (kèm tạo tài khoản) | Admin |
| `PUT` | `/bac-si/:id` | Cập nhật thông tin | Admin |
| `DELETE` | `/bac-si/:id` | Xóa bác sĩ + tài khoản | Admin |

### 5.4 Bệnh nhân (`/api/benh-nhan`) - 4 endpoints

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|--------|-------|
| `GET` | `/benh-nhan?search=&page=&limit=` | Danh sách bệnh nhân | Admin |
| `GET` | `/benh-nhan/:id` | Chi tiết bệnh nhân | JWT |
| `PUT` | `/benh-nhan/:id` | Cập nhật thông tin | JWT |
| `DELETE` | `/benh-nhan/:id` | Xóa bệnh nhân | Admin |

### 5.5 Đặt lịch (`/api/dat-lich`) - 7 endpoints

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|--------|-------|
| `GET` | `/dat-lich?trangThai=&ngayDat=&page=&limit=` | Tất cả lịch hẹn | Admin |
| `GET` | `/dat-lich/:id` | Chi tiết lịch hẹn | JWT |
| `GET` | `/dat-lich/benh-nhan/:id` | Lịch hẹn của 1 bệnh nhân | JWT |
| `GET` | `/dat-lich/bac-si/:id` | Lịch hẹn của 1 bác sĩ | JWT |
| `POST` | `/dat-lich` | Tạo lịch hẹn mới | JWT |
| `PUT` | `/dat-lich/:id/trang-thai` | Cập nhật trạng thái | Admin/BS |
| `DELETE` | `/dat-lich/:id` | Xóa lịch hẹn | JWT |

### 5.6 Lịch làm việc (`/api/lich-lam-viec`) - 7 endpoints

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|--------|-------|
| `GET` | `/lich-lam-viec/khung-gio` | Danh sách khung giờ | Public |
| `POST` | `/lich-lam-viec/khung-gio` | Tạo khung giờ | Admin |
| `DELETE` | `/lich-lam-viec/khung-gio/:id` | Xóa khung giờ | Admin |
| `GET` | `/lich-lam-viec?bacSiId=&ngayLamViec=` | Lịch làm việc | Public |
| `POST` | `/lich-lam-viec` | Tạo lịch làm việc | Admin/BS |
| `PUT` | `/lich-lam-viec/:id` | Cập nhật sẵn sàng | Admin/BS |
| `DELETE` | `/lich-lam-viec/:id` | Xóa lịch làm việc | Admin/BS |

### 5.7 Đơn thuốc (`/api/don-thuoc`) - 4 endpoints

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|--------|-------|
| `GET` | `/don-thuoc` | Danh sách đơn thuốc | Admin/BS |
| `GET` | `/don-thuoc/:id` | Chi tiết đơn thuốc | JWT |
| `POST` | `/don-thuoc` | Tạo đơn thuốc | BS |
| `DELETE` | `/don-thuoc/:id` | Xóa đơn thuốc | Admin |

### 5.8 Câu hỏi thường gặp (`/api/cau-hoi-thuong-gap`) - 6 endpoints

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|--------|-------|
| `GET` | `/cau-hoi-thuong-gap` | FAQ đang hoạt động | Public |
| `GET` | `/cau-hoi-thuong-gap/all` | Tất cả FAQ (kể cả ẩn) | Admin |
| `GET` | `/cau-hoi-thuong-gap/:id` | Chi tiết FAQ | Public |
| `POST` | `/cau-hoi-thuong-gap` | Tạo FAQ mới | Admin |
| `PUT` | `/cau-hoi-thuong-gap/:id` | Cập nhật FAQ | Admin |
| `DELETE` | `/cau-hoi-thuong-gap/:id` | Xóa FAQ | Admin |

### 5.9 Hình thức thanh toán (`/api/hinh-thuc-thanh-toan`) - 3 endpoints

| Method | Endpoint | Mô tả | Quyền |
|--------|----------|--------|-------|
| `GET` | `/hinh-thuc-thanh-toan` | Danh sách hình thức | Public |
| `POST` | `/hinh-thuc-thanh-toan` | Tạo mới | Admin |
| `DELETE` | `/hinh-thuc-thanh-toan/:id` | Xóa | Admin |

**Tổng cộng: 44 endpoints**

---

## 6. Format Response chuẩn

Mọi API đều trả JSON theo cấu trúc:

```json
{
  "success": true,
  "message": "Thông báo kết quả",
  "data": { ... }
}
```

Khi lỗi:

```json
{
  "success": false,
  "message": "Mô tả lỗi",
  "errors": [
    { "field": "email", "message": "Email không hợp lệ" }
  ]
}
```

---

## 7. Công nghệ sử dụng

| Công nghệ | Phiên bản | Mục đích |
|------------|-----------|----------|
| **Node.js** | >= 18 | Runtime JavaScript |
| **Express** | 4.x | Web framework |
| **Prisma** | 6.x | ORM - thao tác database |
| **PostgreSQL** | 15+ | Cơ sở dữ liệu (Supabase) |
| **JWT** | - | Xác thực token |
| **bcryptjs** | - | Mã hóa mật khẩu |
| **express-validator** | 7.x | Validate dữ liệu đầu vào |
| **cors** | - | Cho phép cross-origin requests |
| **dotenv** | - | Đọc biến môi trường từ .env |
| **nodemon** | - | Auto restart khi dev |

---

## 8. Cài đặt & Chạy

```bash
# 1. Cài dependencies
cd server
npm install

# 2. Tạo file .env (copy từ .env.example, sửa connection string Supabase)

# 3. Tạo Prisma Client
npx prisma generate

# 4. Đẩy schema lên database
npx prisma db push

# 5. Seed dữ liệu mẫu
npm run prisma:seed

# 6. Chạy server
npm run dev
```

**Tài khoản mẫu sau khi seed**:

| Vai trò | Email | Mật khẩu |
|---------|-------|-----------|
| Admin | admin@clinic.vn | admin123 |
| Bác sĩ | bacsi1@clinic.vn | doctor123 |
| Bệnh nhân | benhnhan@gmail.com | patient123 |

---

## 9. Nguyên tắc thiết kế

1. **DRY (Don't Repeat Yourself)**: Tách helper (`response.js`, `asyncHandler.js`) dùng chung
2. **Separation of Concerns**: Route → Validator → Controller tách riêng
3. **Error Handling tập trung**: Mọi lỗi đều đi qua `errorHandler.js`
4. **Validate đầu vào**: Không tin tưởng dữ liệu từ client, luôn validate
5. **Transaction**: Khi tạo/xóa dữ liệu liên quan nhiều bảng, dùng `$transaction`
6. **Phân quyền rõ ràng**: Mỗi route ghi rõ ai được truy cập
