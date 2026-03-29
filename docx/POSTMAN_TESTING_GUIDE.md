# Hướng dẫn kiểm thử API bằng Postman

> Tài liệu hướng dẫn chi tiết cách sử dụng Postman để kiểm thử tất cả API
> của hệ thống Đặt lịch Khám bệnh Trực tuyến.
> Hệ thống sử dụng **Dual JWT** (Access Token + Refresh Token HttpOnly Cookie).

---

## Mục lục

1. [Chuẩn bị](#1-chuẩn-bị)
2. [Kết nối Supabase](#2-kết-nối-supabase)
3. [Thiết lập Postman](#3-thiết-lập-postman)
4. [Test Authentication](#4-test-authentication)
5. [Test Chuyên khoa](#5-test-chuyên-khoa)
6. [Test Bác sĩ](#6-test-bác-sĩ)
7. [Test Bệnh nhân](#7-test-bệnh-nhân)
8. [Test Đặt lịch](#8-test-đặt-lịch)
9. [Test Lịch làm việc & Khung giờ](#9-test-lịch-làm-việc--khung-giờ)
10. [Test Đơn thuốc](#10-test-đơn-thuốc)
11. [Test FAQ](#11-test-faq)
12. [Test Hình thức thanh toán](#12-test-hình-thức-thanh-toán)
13. [Test Thống kê](#13-test-thống-kê)
14. [Kiểm thử lỗi & Edge cases](#14-kiểm-thử-lỗi--edge-cases)
15. [Checklist kiểm thử](#15-checklist-kiểm-thử)

---

## 1. Chuẩn bị

### 1.1 Cài đặt Postman

Tải và cài đặt từ: https://www.postman.com/downloads/

### 1.2 Hoàn tất kết nối Supabase

Trước khi test, bạn cần hoàn tất việc kết nối database Supabase.
Xem chi tiết tại **[Mục 2. Kết nối Supabase](#2-kết-nối-supabase)**.

Sau khi hoàn tất mục 2, hệ thống sẽ có sẵn:
- 1 tài khoản admin
- 8 bác sĩ (kèm tài khoản)
- 1 bệnh nhân mẫu
- 8 chuyên khoa
- 8 khung giờ (07:00 → 17:00)
- 3 hình thức thanh toán
- 5 câu hỏi thường gặp

---

## 2. Kết nối Supabase

> Supabase là nền tảng cung cấp PostgreSQL database miễn phí trên cloud.
> Phần này hướng dẫn chi tiết từ tạo project đến kết nối thành công.

### 2.1 Tạo tài khoản Supabase

1. Truy cập https://supabase.com
2. Click **"Start your project"** (hoặc **"Sign Up"**)
3. Đăng nhập bằng **GitHub** (khuyến nghị) hoặc email

### 2.2 Tạo project mới

1. Sau khi đăng nhập, click **"New Project"**
2. Điền thông tin:
   - **Name**: `clinic-booking` (hoặc tên tùy ý)
   - **Database Password**: đặt mật khẩu mạnh (ví dụ: `MyStr0ng!Pass2026`)
     > **Quan trọng**: Ghi nhớ mật khẩu này, sẽ dùng cho connection string
   - **Region**: chọn **Southeast Asia (Singapore)** để tốc độ nhanh nhất từ Việt Nam
3. Click **"Create new project"**
4. Đợi 1-2 phút để Supabase khởi tạo project

### 2.3 Lấy Connection String

Sau khi project được tạo xong:

1. Vào **Project Settings** (biểu tượng ⚙️ ở sidebar trái)
2. Chọn **Database** trong menu bên trái
3. Kéo xuống phần **"Connection string"**
4. Bạn sẽ thấy 2 loại connection:

#### a) Connection Pooling (Transaction mode) — dùng cho ứng dụng

- Tab **"URI"** → Copy chuỗi dạng:
  ```
  postgresql://postgres.[PROJECT_REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
  ```
- Đây là `DATABASE_URL` trong file `.env`

#### b) Direct Connection — dùng cho Prisma Migrate

- Chuyển sang **"Direct connection"** (có nút toggle hoặc tab riêng)
- Copy chuỗi dạng:
  ```
  postgresql://postgres.[PROJECT_REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
  ```
- Đây là `DIRECT_URL` trong file `.env`

> **Lưu ý**: Thay `[YOUR-PASSWORD]` bằng mật khẩu bạn đặt ở bước 2.2.
> Nếu mật khẩu có ký tự đặc biệt (như `@`, `#`, `!`), cần URL-encode chúng.

### 2.4 Cấu hình file .env

Trong thư mục `server/`, tạo file `.env` (copy từ `.env.example`):

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Hoặc tạo thủ công
```

Mở file `.env` và sửa nội dung:

```env
# ===== Server =====
PORT=5000
NODE_ENV=development

# ===== Database (Supabase PostgreSQL) =====
# Connection Pooling (Transaction mode) - thêm ?pgbouncer=true
DATABASE_URL="postgresql://postgres.abcdefghijk:MyStr0ng!Pass2026@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct Connection - dùng cho Prisma Migrate/Push
DIRECT_URL="postgresql://postgres.abcdefghijk:MyStr0ng!Pass2026@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# ===== JWT (Dual Token) =====
# Tạo chuỗi ngẫu nhiên >= 32 ký tự cho mỗi secret
JWT_ACCESS_SECRET=your_access_secret_key_here_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key_here_min_32_chars
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# ===== CORS =====
CLIENT_URL=http://localhost:5173
```

> Thay `postgres.abcdefghijk` và `MyStr0ng!Pass2026` bằng thông tin thực từ Supabase.
> `JWT_ACCESS_SECRET` và `JWT_REFRESH_SECRET` phải là 2 chuỗi **khác nhau**.

### 2.5 Đẩy schema lên Supabase

Chạy lần lượt các lệnh sau trong thư mục `server/`:

```bash
# Bước 1: Tạo Prisma Client từ schema
npx prisma generate
```

Nếu thành công sẽ hiện: `✔ Generated Prisma Client`

```bash
# Bước 2: Đẩy schema lên Supabase (tạo các bảng)
npx prisma db push
```

Nếu thành công sẽ hiện:
```
🚀  Your database is now in sync with your Prisma schema.
```

> **Nếu lỗi "Can't reach database server"**:
> - Kiểm tra lại connection string trong `.env`
> - Đảm bảo mật khẩu đúng
> - Thử dùng DIRECT_URL thay cho DATABASE_URL

### 2.6 Kiểm tra trên Supabase Dashboard

1. Quay lại Supabase Dashboard
2. Click **"Table Editor"** ở sidebar trái
3. Bạn sẽ thấy **11 bảng** đã được tạo:

```
TaiKhoan, ChuyenKhoa, BacSi, BenhNhan, KhungGio,
LichLamViecBacSi, HinhThucThanhToan, DatLich, DonThuoc, ChiTietDonThuoc, CauHoiThuongGap
```

Nếu thấy đủ 11 bảng → kết nối thành công!

### 2.7 Seed dữ liệu mẫu

```bash
npm run prisma:seed
```

Kết quả mong đợi:
```
🌱 Bắt đầu seed dữ liệu...

✅ Tạo tài khoản admin: admin@clinic.vn
✅ Tạo 8 chuyên khoa
✅ Tạo 8 bác sĩ
✅ Tạo 1 bệnh nhân mẫu
✅ Tạo 8 khung giờ
✅ Tạo 3 hình thức thanh toán
✅ Tạo 5 câu hỏi thường gặp

🎉 Seed dữ liệu hoàn tất!

📌 Tài khoản đăng nhập:
   Admin:     admin@clinic.vn / admin123
   Bác sĩ 1:  bacsi1@clinic.vn / doctor123
   Bệnh nhân: benhnhan@gmail.com / patient123
```

Kiểm tra trên Supabase → **Table Editor** → Click vào bảng `TaiKhoan` → Sẽ thấy 10 records (1 admin + 8 bác sĩ + 1 bệnh nhân).

### 2.8 Chạy server

```bash
npm run dev
```

Kết quả:
```
🚀 Server đang chạy tại http://localhost:5000
📋 API health: http://localhost:5000/api/health
```

Mở trình duyệt, truy cập `http://localhost:5000/api/health`:
```json
{
  "success": true,
  "message": "Server đang hoạt động!",
  "timestamp": "2026-03-20T..."
}
```

### 2.9 Xem dữ liệu trực quan với Prisma Studio

```bash
npx prisma studio
```

Mở `http://localhost:5555` → Bạn có thể duyệt tất cả bảng, xem dữ liệu, thêm/sửa/xóa record.

### 2.10 Xử lý lỗi thường gặp khi kết nối

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| `Can't reach database server` | Sai connection string hoặc mật khẩu | Kiểm tra lại DATABASE_URL và DIRECT_URL trong `.env` |
| `P1001: Can't reach database` | Firewall chặn hoặc Supabase project bị pause | Vào Supabase Dashboard → kiểm tra project có đang active |
| `password authentication failed` | Sai mật khẩu database | Vào Supabase → Settings → Database → Reset database password |
| `relation "TaiKhoan" does not exist` | Chưa chạy `prisma db push` | Chạy `npx prisma db push` |
| `Unique constraint failed` khi seed | Đã seed rồi, dữ liệu trùng | Xóa dữ liệu cũ trên Supabase hoặc chạy seed lại |
| `prisma generate` lỗi | Chưa cài prisma | Chạy `npm install` trong thư mục server |
| `DIRECT_URL is not defined` | Thiếu biến DIRECT_URL trong .env | Thêm DIRECT_URL vào file .env (xem bước 2.4) |

> **Mẹo**: Nếu project Supabase bị **pause** (do không hoạt động quá 7 ngày trên free plan),
> vào Dashboard → click **"Restore project"** để kích hoạt lại.

---

## 3. Thiết lập Postman

### 3.1 Tạo Collection mới

1. Mở Postman → Click **"New"** → chọn **"Collection"**
2. Đặt tên: `ClinicBooking API`
3. Tạo các folder con bên trong:
   - `Auth`
   - `Chuyen Khoa`
   - `Bac Si`
   - `Benh Nhan`
   - `Dat Lich`
   - `Lich Lam Viec`
   - `Don Thuoc`
   - `FAQ`
   - `Hinh Thuc Thanh Toan`
   - `Thong Ke`

### 3.2 Tạo Environment

1. Click biểu tượng **⚙️ (Environments)** ở sidebar trái
2. Click **"+"** để tạo environment mới, đặt tên: `Local`
3. Thêm các biến:

| Variable | Initial Value | Description |
|----------|---------------|-------------|
| `base_url` | `http://localhost:5000/api` | URL gốc của API |

4. Click **"Save"** → Chọn environment `Local` ở dropdown góc trên phải

> **Lưu ý**: Không cần biến `admin_token`, `doctor_token`, `patient_token` nữa vì token được lưu trong **HttpOnly Cookie** do Postman tự quản lý.

### 3.3 Cách sử dụng biến

Trong Postman, dùng `{{ten_bien}}` để reference biến. Ví dụ:
- URL: `{{base_url}}/auth/login`

### 3.4 Lưu ý về Dual JWT (HttpOnly Cookie)

Hệ thống sử dụng **Dual JWT** với **cả 2 token đều lưu trong HttpOnly Cookie**:
- **Access Token**: set vào cookie `accessToken` (HttpOnly, 15 phút)
- **Refresh Token**: set vào cookie `refreshToken` (HttpOnly, 7 ngày)
- Response JSON **KHÔNG trả token** — chỉ trả thông tin user

**Khi gọi API cần xác thực**: Postman **tự gửi cookie** kèm request (không cần header `Authorization`).

> **Quan trọng**: Đảm bảo trong Postman đã bật **"Automatically follow redirects"** và **cookies được lưu** cho domain `localhost`.

---

## 4. Test Authentication

### 4.1 Health Check

> Kiểm tra server có đang chạy không

```
GET {{base_url}}/health
```

**Kết quả mong đợi** (Status: `200 OK`):
```json
{
  "success": true,
  "message": "Server đang hoạt động!",
  "timestamp": "2026-03-20T..."
}
```

---

### 4.2 Đăng ký tài khoản mới

```
POST {{base_url}}/auth/register
```

**Headers**:
| Key | Value |
|-----|-------|
| Content-Type | application/json |

**Body** (raw → JSON):
```json
{
  "email": "nguyenvana@gmail.com",
  "matKhau": "123456",
  "hoTen": "Nguyễn Văn A",
  "soDienThoai": "0912345678",
  "gioiTinh": 1,
  "ngaySinh": "1998-05-20",
  "diaChi": "Hà Nội"
}
```

**Kết quả mong đợi** (Status: `201 Created`):
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "id": 11,
    "email": "nguyenvana@gmail.com",
    "vaiTro": "benh_nhan",
    "hoTen": "Nguyễn Văn A"
  }
}
```

> **Lưu ý**: Đăng ký chỉ trả thông tin user, **không trả token**. Người dùng cần đăng nhập sau khi đăng ký.

**Kiểm thử lỗi**:
- Gửi lại cùng email → `409` "Email đã được sử dụng"
- Bỏ trống email → `400` "Email không hợp lệ"
- Mật khẩu < 6 ký tự → `400` "Mật khẩu phải có ít nhất 6 ký tự"
- Bỏ trống họ tên → `400` "Họ tên không được để trống"

---

### 4.3 Đăng nhập Admin

```
POST {{base_url}}/auth/login
```

**Body** (raw → JSON):
```json
{
  "email": "admin@clinic.vn",
  "matKhau": "admin123"
}
```

**Kết quả mong đợi** (Status: `200 OK`):
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@clinic.vn",
      "vaiTro": "admin",
      "hoTen": "Admin"
    }
  }
}
```

> **Quan trọng**:
> 1. Response **không chứa token** — token được set vào cookie tự động
> 2. Kiểm tra tab **"Cookies"** trong Postman → sẽ thấy **2 cookie**: `accessToken` và `refreshToken` cho `localhost`
> 3. Postman sẽ **tự gửi cookie** này trong các request tiếp theo

**Kiểm thử lỗi**:
- Sai mật khẩu → `401` "Email hoặc mật khẩu không đúng"
- Email không tồn tại → `401` "Email hoặc mật khẩu không đúng"
- Tài khoản bị khóa → `403` "Tài khoản đã bị khóa. Vui lòng liên hệ admin."

---

### 4.4 Đăng nhập Bác sĩ

```
POST {{base_url}}/auth/login
```

**Body**:
```json
{
  "email": "bacsi1@clinic.vn",
  "matKhau": "doctor123"
}
```

> Đăng nhập thành công → Postman tự lưu cookie cho các request tiếp theo.

---

### 4.5 Đăng nhập Bệnh nhân

```
POST {{base_url}}/auth/login
```

**Body**:
```json
{
  "email": "benhnhan@gmail.com",
  "matKhau": "patient123"
}
```

> Đăng nhập thành công → Postman tự lưu cookie cho các request tiếp theo.

---

### 4.6 Làm mới Access Token (Refresh)

> Khi Access Token hết hạn (sau 15 phút), dùng endpoint này để làm mới cả 2 cookie.
> Cookie refreshToken được Postman tự gửi.

```
POST {{base_url}}/auth/refresh
```

Không cần header Authorization, không cần body.

**Kết quả mong đợi** (Status: `200 OK`):
```json
{
  "success": true,
  "message": "Token đã được làm mới"
}
```

> Cả 2 cookie `accessToken` và `refreshToken` được cập nhật tự động (Token Rotation).

**Kiểm thử lỗi**:
- Không có cookie refreshToken → `401` "Refresh token không hợp lệ"
- Cookie refreshToken đã bị xóa / sai → `401` "Refresh token không hợp lệ hoặc đã hết hạn"

---

### 4.7 Lấy thông tin user hiện tại

```
GET {{base_url}}/auth/me
```

Không cần header `Authorization` — cookie `accessToken` được Postman tự gửi.

**Kết quả mong đợi** (Status: `200 OK`):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@clinic.vn",
    "vaiTro": "admin",
    "gioiTinh": 1,
    "ngaySinh": null,
    "diaChi": null,
    "anhDaiDien": null,
    "ngayTao": "2026-03-20T...",
    "trangThaiTaiKhoan": 1,
    "bacSi": null,
    "benhNhan": null
  }
}
```

> Thử đổi token sang `patient_token` hoặc `doctor_token` để xem thông tin khác nhau.
> Bệnh nhân sẽ có trường `benhNhan: { id, hoTen, ... }`, bác sĩ sẽ có trường `bacSi: { id, ... }`.

**Kiểm thử lỗi**:
- Không gửi token → `401` "Vui lòng đăng nhập để tiếp tục"
- Token sai/hết hạn → `401` "Token không hợp lệ" hoặc "Token đã hết hạn"
- Token của tài khoản bị khóa → `403` "Tài khoản đã bị khóa"

---

### 4.8 Đổi mật khẩu

```
PUT {{base_url}}/auth/doi-mat-khau
```

**Headers**:
| Key | Value |
|-----|-------|
| Content-Type | application/json |

> Cookie `accessToken` được Postman tự gửi kèm request.

**Body**:
```json
{
  "matKhauCu": "patient123",
  "matKhauMoi": "newpassword123"
}
```

**Kết quả mong đợi** (Status: `200 OK`):
```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công"
}
```

**Kiểm thử lỗi**:
- Mật khẩu cũ sai → `400` "Mật khẩu cũ không đúng"
- Mật khẩu mới < 6 ký tự → `400` "Mật khẩu mới phải có ít nhất 6 ký tự"

> Sau khi test, đổi lại mật khẩu cũ để tiện test tiếp.

---

### 4.9 Cập nhật hồ sơ cá nhân

```
PUT {{base_url}}/auth/cap-nhat-ho-so
```

**Headers**:
| Key | Value |
|-----|-------|
| Content-Type | application/json |

> Cookie `accessToken` được Postman tự gửi kèm request.

**Body**:
```json
{
  "gioiTinh": 1,
  "ngaySinh": "1995-05-15",
  "diaChi": "123 Phố Huế, Hà Nội",
  "anhDaiDien": "https://example.com/avatar.jpg"
}
```

**Kết quả mong đợi** (Status: `200 OK`):
```json
{
  "success": true,
  "message": "Cập nhật hồ sơ thành công",
  "data": {
    "id": 10,
    "email": "benhnhan@gmail.com",
    "vaiTro": "benh_nhan",
    "gioiTinh": 1,
    "ngaySinh": "1995-05-15T00:00:00.000Z",
    "diaChi": "123 Phố Huế, Hà Nội",
    "anhDaiDien": "https://example.com/avatar.jpg"
  }
}
```

---

### 4.10 Đăng xuất

```
POST {{base_url}}/auth/logout
```

Không cần header — cookie `accessToken` được Postman tự gửi.

**Kết quả mong đợi** (Status: `200 OK`):
```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

> Sau khi logout, cả 2 cookie `accessToken` và `refreshToken` bị xóa, Refresh Token trong DB cũng bị xóa.
> Mọi request sau đều sẽ nhận `401`.

---

## 5. Test Chuyên khoa

### 5.1 Lấy danh sách chuyên khoa (Public)

```
GET {{base_url}}/chuyen-khoa
```

Không cần token. Kết quả trả về mảng chuyên khoa kèm số lượng bác sĩ.

**Kết quả mong đợi** (Status: `200 OK`):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tenChuyenKhoa": "Tim mạch",
      "anhChuyenKhoa": null,
      "moTaChuyenKhoa": "Khám và điều trị các bệnh về tim, mạch máu",
      "thoiLuongKham": 20,
      "_count": { "bacSiList": 2 }
    }
  ]
}
```

---

### 5.2 Lấy chi tiết chuyên khoa (Public)

```
GET {{base_url}}/chuyen-khoa/1
```

Kết quả kèm danh sách bác sĩ thuộc chuyên khoa (id, tenBacSi, hocViChucDanh, moTaNgan, giaKham).

---

### 5.3 Tạo chuyên khoa mới (Admin)

```
POST {{base_url}}/chuyen-khoa
```

**Headers**:
| Key | Value |
|-----|-------|
| Content-Type | application/json |
| Authorization | Bearer {{admin_token}} |

**Body**:
```json
{
  "tenChuyenKhoa": "Chấn thương chỉnh hình",
  "moTaChuyenKhoa": "Khám và điều trị các bệnh về xương khớp, cơ bắp",
  "thoiLuongKham": 30
}
```

**Kết quả mong đợi** (Status: `201 Created`):
```json
{
  "success": true,
  "message": "Tạo chuyên khoa thành công",
  "data": {
    "id": 9,
    "tenChuyenKhoa": "Chấn thương chỉnh hình",
    "anhChuyenKhoa": null,
    "moTaChuyenKhoa": "Khám và điều trị các bệnh về xương khớp, cơ bắp",
    "thoiLuongKham": 30
  }
}
```

**Kiểm thử phân quyền**:
- Dùng `doctor_token` → `403` "Bạn không có quyền thực hiện hành động này"
- Không gửi token → `401`

---

### 5.4 Cập nhật chuyên khoa (Admin)

```
PUT {{base_url}}/chuyen-khoa/9
```

**Headers**: Authorization: Bearer {{admin_token}}

**Body**:
```json
{
  "tenChuyenKhoa": "Chấn thương chỉnh hình - Cơ Xương Khớp",
  "moTaChuyenKhoa": "Điều trị chấn thương thể thao, gãy xương, thoái hóa khớp",
  "thoiLuongKham": 25
}
```

---

### 5.5 Xóa chuyên khoa (Admin)

```
DELETE {{base_url}}/chuyen-khoa/9
```

**Headers**: Authorization: Bearer {{admin_token}}

**Kiểm thử lỗi**:
- Xóa chuyên khoa có bác sĩ → `400` "Không thể xóa vì có X bác sĩ thuộc chuyên khoa này"
- ID không tồn tại → `404` "Không tìm thấy chuyên khoa"

---

## 6. Test Bác sĩ

### 6.1 Lấy danh sách bác sĩ (Public)

```
GET {{base_url}}/bac-si
```

Hỗ trợ query params:

```
GET {{base_url}}/bac-si?page=1&limit=5
GET {{base_url}}/bac-si?chuyenKhoaId=1
GET {{base_url}}/bac-si?search=Nguyễn
GET {{base_url}}/bac-si?chuyenKhoaId=1&search=An&page=1&limit=10
```

**Kết quả mong đợi**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tenBacSi": "Nguyễn Văn An",
      "hocViChucDanh": "PGS.TS",
      "giaKham": "500000",
      "chuyenKhoa": { "id": 1, "tenChuyenKhoa": "Tim mạch" },
      "taiKhoan": { "id": 2, "email": "bacsi1@clinic.vn", "anhDaiDien": null, "trangThaiTaiKhoan": 1 }
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### 6.2 Lấy chi tiết bác sĩ (Public)

```
GET {{base_url}}/bac-si/1
```

Trả chi tiết bác sĩ kèm chuyên khoa đầy đủ + thông tin tài khoản (email, ảnh, giới tính, ngày sinh, địa chỉ).

---

### 6.3 Tạo bác sĩ mới (Admin)

```
POST {{base_url}}/bac-si
```

**Headers**: Content-Type: application/json, Authorization: Bearer {{admin_token}}

**Body**:
```json
{
  "tenBacSi": "Trần Quốc Khánh",
  "hocViChucDanh": "TS.BS",
  "moTaNgan": "Bác sĩ chuyên khoa Tim mạch",
  "moTaChiTiet": "Tốt nghiệp Đại học Y Hà Nội, 15 năm kinh nghiệm",
  "giaKham": 450000,
  "chuyenKhoaId": 1,
  "email": "bacsi.khanh@clinic.vn",
  "matKhau": "doctor123",
  "gioiTinh": 1,
  "ngaySinh": "1980-03-15"
}
```

> Backend sẽ tự tạo TaiKhoan (vaiTro = bac_si) + BacSi trong transaction.
> Nếu không truyền email/matKhau, hệ thống tự generate email dạng `doctor_<timestamp>@clinic.local` và mật khẩu mặc định `doctor123`.

**Kiểm thử lỗi**:
- Email trùng → `409` "Email đã được sử dụng"
- Thiếu tên bác sĩ → `400` "Tên bác sĩ không được để trống"

---

### 6.4 Cập nhật bác sĩ (Admin)

```
PUT {{base_url}}/bac-si/1
```

**Headers**: Authorization: Bearer {{admin_token}}

**Body**:
```json
{
  "tenBacSi": "Nguyễn Văn An (Cập nhật)",
  "giaKham": 600000
}
```

---

### 6.5 Xóa bác sĩ (Admin)

```
DELETE {{base_url}}/bac-si/9
```

**Kiểm thử lỗi**:
- Bác sĩ có lịch hẹn → `400` "Không thể xóa vì bác sĩ có X lịch hẹn"
- ID không tồn tại → `404` "Không tìm thấy bác sĩ"

---

## 7. Test Bệnh nhân

### 7.1 Lấy danh sách bệnh nhân (Admin)

```
GET {{base_url}}/benh-nhan
```

**Headers**: Authorization: Bearer {{admin_token}}

Hỗ trợ: `?search=Nguyễn&page=1&limit=10`

**Kiểm thử phân quyền**:
- Dùng `patient_token` → `403`

---

### 7.2 Lấy chi tiết bệnh nhân

```
GET {{base_url}}/benh-nhan/1
```

**Headers**: Authorization: Bearer {{patient_token}}

---

### 7.3 Cập nhật thông tin bệnh nhân

```
PUT {{base_url}}/benh-nhan/1
```

**Headers**: Authorization: Bearer {{patient_token}}

**Body**:
```json
{
  "hoTen": "Nguyễn Bệnh Nhân (Đã cập nhật)",
  "soDienThoai": "0987654321",
  "gioiTinh": 1,
  "diaChi": "123 Phố Huế, Hà Nội"
}
```

> **Ownership check**: Bệnh nhân chỉ sửa được hồ sơ của chính mình. Nếu bệnh nhân A sửa hồ sơ bệnh nhân B → `403`.

---

### 7.4 Xóa bệnh nhân (Admin)

```
DELETE {{base_url}}/benh-nhan/1
```

**Headers**: Authorization: Bearer {{admin_token}}

**Kiểm thử lỗi**:
- Bệnh nhân có lịch hẹn → `400` "Không thể xóa vì bệnh nhân có X lịch hẹn"

---

## 8. Test Đặt lịch

> Đây là phần quan trọng nhất. Test theo đúng thứ tự để đảm bảo dữ liệu nhất quán.
> **Yêu cầu**: Phải tạo lịch làm việc cho bác sĩ trước khi đặt lịch (xem mục 9).

### 8.1 Lấy danh sách slot trống (Public)

> Khách hàng xem danh sách các slot khám tự sinh từ ca làm việc để chọn đặt.

```
GET {{base_url}}/dat-lich/slot-trong?bacSiId=1&ngayDat=2026-03-25
```

**Kết quả mong đợi** (Status: `200 OK`):
```json
{
  "success": true,
  "data": {
    "bacSi": {
      "id": 1,
      "tenBacSi": "Nguyễn Văn An",
      "chuyenKhoa": "Tim mạch",
      "thoiLuongKham": 20
    },
    "ngayDat": "2026-03-25",
    "slots": [
      {
        "gioBatDau": "08:00",
        "gioKetThuc": "08:20",
        "daDat": false,
        "lichLamViecId": 1,
        "conTrong": true
      },
      {
        "gioBatDau": "08:20",
        "gioKetThuc": "08:40",
        "daDat": false,
        "lichLamViecId": 1,
        "conTrong": true
      }
    ],
    "slotTrong": [ ... các slot chưa đặt ... ]
  }
}
```

---

### 8.2 Tạo lịch hẹn mới

```
POST {{base_url}}/dat-lich
```

**Headers**: Content-Type: application/json, Authorization: Bearer {{patient_token}}

**Body** (chú ý: không truyền `gioKetThuc`):
```json
{
  "ngayDat": "2026-03-25",
  "gioBatDau": "08:00",
  "lyDoKham": "Đau đầu kéo dài, chóng mặt",
  "bacSiId": 1,
  "benhNhanId": 1,
  "hinhThucThanhToanId": 1,
  "trangThaiThanhToan": 0
}
```

> **Ghi chú:** `trangThaiThanhToan` có thể là: `0` (Chưa trả), `1` (Đã trả phí khám).

**Kết quả mong đợi** (Status: `201 Created`):
```json
{
  "success": true,
  "message": "Đặt lịch thành công",
  "data": {
    "id": 1,
    "ngayDat": "2026-03-25T00:00:00.000Z",
    "gioBatDau": "1970-01-01T08:00:00.000Z",
    "gioKetThuc": "1970-01-01T08:20:00.000Z",
    "lyDoKham": "Đau đầu kéo dài, chóng mặt",
    "giaKham": "500000",
    "trangThai": 0,
    "trangThaiThanhToan": 0,
    "lichLamViecId": "1",
    "bacSi": {
      "id": 1,
      "tenBacSi": "Nguyễn Văn An",
      "hocViChucDanh": "PGS.TS",
      "chuyenKhoa": { "tenChuyenKhoa": "Tim mạch", "thoiLuongKham": 20 }
    },
    "benhNhan": { "id": 1, "hoTen": "Nguyễn Bệnh Nhân", "soDienThoai": "0912345678" }
  }
}
```

> Tạo thành công thì sức chứa `soBenhNhanHienTai` của ca làm việc tương ứng sẽ tự động tăng 1.

**Kiểm thử lỗi**:
- Bác sĩ không có lịch làm việc ngày đó / khung giờ đó không nằm trong ca → `400`
- Ca làm việc đã đầy (`soBenhNhanHienTai` >= `soBenhNhanToiDa`) → `400`
- Trùng lịch (slot đã có người đặt) → `409`
- **Bảo mật**: Bệnh nhân dùng Token của mình nhưng truyền `benhNhanId` của người khác → `403` "Bạn không có quyền đặt lịch khám cho bệnh nhân khác"

---

### 8.3 Test trùng lịch

Gửi lại **cùng request** ở 8.1 (cùng bác sĩ + cùng ngày + cùng giờ bắt đầu):

**Kết quả mong đợi** (Status: `409`):
```json
{
  "success": false,
  "message": "Bác sĩ đã có lịch hẹn vào khung giờ này. Vui lòng chọn giờ khác."
}
```

---

### 8.4 Tạo thêm lịch hẹn (khung giờ khác)

```json
{
  "ngayDat": "2026-03-25",
  "gioBatDau": "08:20",
  "lyDoKham": "Khám định kỳ",
  "bacSiId": 2,
  "benhNhanId": 1,
  "hinhThucThanhToanId": 2
}
```

---

### 8.5 Lấy tất cả lịch hẹn (Admin)

```
GET {{base_url}}/dat-lich
```

**Headers**: Authorization: Bearer {{admin_token}}

Hỗ trợ filter:
```
GET {{base_url}}/dat-lich?trangThai=0
GET {{base_url}}/dat-lich?ngayDat=2026-03-25
GET {{base_url}}/dat-lich?trangThai=0&page=1&limit=5
```

---

### 8.5 Lấy chi tiết lịch hẹn

```
GET {{base_url}}/dat-lich/1
```

**Headers**: Cookie chứa accessToken (tự động gửi)

> **Phân quyền Data Ownership (Bảo mật mới):**
> - **Admin**: Xem được tất cả lịch hẹn.
> - **Bác sĩ**: Chỉ xem được lịch hẹn do **chính mình** là người khám. Nếu lịch hẹn thuộc về bác sĩ khác → `403 Forbidden`.
> - **Bệnh nhân**: Chỉ xem được lịch hẹn của **chính mình**. Nếu lịch hẹn thuộc về bệnh nhân khác → `403 Forbidden`.
> - **Ẩn đơn thuốc**: Nếu bệnh nhân xem lịch hẹn mà `trangThaiThanhToan < 2`, phần `donThuoc` sẽ bị ẩn và thay bằng thông báo yêu cầu thanh toán.

**Test case bảo mật:**
- Đăng nhập Bác sĩ A, xem lịch của Bác sĩ B → `403` "Bạn không có quyền xem lịch hẹn này"
- Đăng nhập Bệnh nhân X, xem lịch của Bệnh nhân Y → `403` "Bạn không có quyền xem lịch hẹn này"

---

### 8.6 Lấy lịch hẹn theo bệnh nhân

```
GET {{base_url}}/dat-lich/benh-nhan/1
```

**Headers**: Cookie chứa accessToken (tự động gửi)

> **Phân quyền Data Ownership (Bảo mật mới):**
> - **Admin**: Xem được lịch của bất kỳ bệnh nhân nào.
> - **Bệnh nhân**: Chỉ xem được lịch của **chính mình**. Thay ID khác → `403`.
> - **Bác sĩ**: **KHÔNG được phép** gọi API này (bảo mật y tế, không cho rình lịch sử bệnh nhân) → `403`.

**Test case bảo mật:**
- Bệnh nhân ID=1 gọi `/benh-nhan/2` → `403` "Bạn không có quyền xem lịch hẹn của bệnh nhân khác"
- Bác sĩ gọi `/benh-nhan/1` → `403` "Bác sĩ không có quyền xem toàn bộ lịch sử khám của bệnh nhân"

---

### 8.7 Lấy lịch hẹn theo bác sĩ

```
GET {{base_url}}/dat-lich/bac-si/1
```

**Headers**: Cookie chứa accessToken (tự động gửi)

> **Phân quyền Data Ownership (Bảo mật mới):**
> - **Admin**: Xem được lịch của bất kỳ bác sĩ nào.
> - **Bác sĩ**: Chỉ xem được lịch khám do **chính mình** phụ trách. Thay ID khác → `403`.
> - **Bệnh nhân**: **KHÔNG được phép** gọi API này → `403`.

**Test case bảo mật:**
- Bác sĩ ID=1 gọi `/bac-si/2` → `403` "Bạn không có quyền xem lịch khám của bác sĩ khác"
- Bệnh nhân gọi `/bac-si/1` → `403` "Bệnh nhân không có quyền xem danh sách lịch khám của bác sĩ"

---

### 8.8 Xác nhận lịch hẹn (Admin/Bác sĩ)

```
PUT {{base_url}}/dat-lich/1/trang-thai
```

**Headers**: Content-Type: application/json, Authorization: Bearer {{admin_token}}

**Body**:
```json
{
  "trangThai": 1
}
```

**Kết quả**: trạng thái chuyển từ `0` (chờ) → `1` (đã xác nhận)

---

### 8.9 Đánh dấu đã khám xong (Admin/Bác sĩ)

```
PUT {{base_url}}/dat-lich/1/trang-thai
```

**Body**:
```json
{
  "trangThai": 2
}
```

> **Quan trọng**: Sau bước này mới có thể tạo đơn thuốc cho lịch hẹn.

---

### 8.10 Cập nhật Trạng thái Thanh toán (Admin / Online Payment)

> Dùng để xác nhận BN đã trả phí khám hoặc trả nốt tiền thuốc.

```
PUT {{base_url}}/dat-lich/1/thanh-toan
```

**Headers**: Authorization: Bearer {{admin_token}}

**Body**:
```json
{
  "trangThaiThanhToan": 2
}
```

> **Giá trị mẫu:** `1` (Đã trả phí khám), `2` (Đã trả toàn bộ - bao gồm tiền thuốc).

---

### 8.11 Hủy lịch hẹn

```
PUT {{base_url}}/dat-lich/2/trang-thai
```

**Body**:
```json
{
  "trangThai": 3
}
```

> Nếu chuyển sang hủy, sức chứa `soBenhNhanHienTai` của ca sẽ giảm 1.

**Kiểm thử bảo mật Data Ownership:**
- **Bác sĩ**: Chỉ được đổi trạng thái (`1`, `2`, `3`) cho lịch hẹn do chính mình phụ trách. Nếu lấy ID lịch hẹn của bác sĩ khác và gửi Request → `403` "Bạn không có quyền cập nhật trạng thái lịch hẹn của bác sĩ khác"
- **Admin**: Đổi trạng thái lịch của bất kỳ bác sĩ nào cũng thành công.

---

### 8.12 Xóa lịch hẹn

```
DELETE {{base_url}}/dat-lich/2
```

**Headers**: Authorization: Bearer {{patient_token}}

**Kiểm thử lỗi**:
- Xóa lịch đã xác nhận (trangThai=1) → `400` "Không thể xóa lịch hẹn đã xác nhận hoặc đã khám"
- Xóa lịch đã khám (trangThai=2) → `400` "Không thể xóa lịch hẹn đã xác nhận hoặc đã khám"
- **Bệnh nhân bảo mật**: Bệnh nhân A xóa lịch của bệnh nhân B → `403` "Bạn không có quyền can thiệp vào lịch hẹn này"
- **Bác sĩ bảo mật**: Bác sĩ A lạm quyền mở Postman xóa lịch của bác sĩ B → `403` "Bạn không có quyền xóa lịch khám của bệnh nhân thuộc bác sĩ khác"

---

## 9. Test Lịch làm việc & Khung giờ

### 9.1 Lấy danh sách khung giờ (ca làm việc) (Public)

```
GET {{base_url}}/lich-lam-viec/khung-gio
```

**Kết quả mong đợi**: Danh sách khung giờ đóng vai trò là ca làm việc (VD: Ca Sáng 07:00-11:00, Ca Chiều 13:00-17:00)

---

### 9.2 Tạo ca làm việc mới (Admin)

```
POST {{base_url}}/lich-lam-viec/khung-gio
```

**Headers**: Authorization: Bearer {{admin_token}}

**Body** (phải đảm bảo gioBatDau < gioKetThuc):
```json
{
  "gioBatDau": "18:00",
  "gioKetThuc": "21:00"
}
```

---

### 9.3 Xóa khung giờ (Admin)

```
DELETE {{base_url}}/lich-lam-viec/khung-gio/9
```

**Headers**: Authorization: Bearer {{admin_token}}

**Kiểm thử lỗi**:
- Khung giờ đang được sử dụng → `400` "Không thể xóa vì khung giờ đang được X lịch sử dụng"

---

### 9.4 Tạo lịch làm việc cho bác sĩ (Admin/BS)

> **Quan trọng**: Phải tạo lịch làm việc TRƯỚC khi đặt lịch hẹn.

```
POST {{base_url}}/lich-lam-viec
```

**Headers**: Authorization: Bearer {{admin_token}}

**Body** (Nếu không kèm `soBenhNhanToiDa`, backend sẽ tự tính dựa vào `thoiLuongKham` của chuyên khoa):
```json
{
  "ngayLamViec": "2026-03-25",
  "bacSiId": 1,
  "khungGioId": 1
}
```

> `khungGioId: 1` tương ứng ca 07:00-11:00 (4 tiếng).

**Kết quả mong đợi** (Status: `201 Created`):
```json
{
  "success": true,
  "message": "Tạo lịch làm việc thành công",
  "data": {
    "id": 1,
    "ngayLamViec": "2026-03-25T00:00:00.000Z",
    "soBenhNhanHienTai": 0,
    "soBenhNhanToiDa": 12,
    "sanSang": 1,
    "bacSi": { "id": 1, "tenBacSi": "Nguyễn Văn An" },
    "khungGio": {
      "id": 1,
      "gioBatDau": "1970-01-01T07:00:00.000Z",
      "gioKetThuc": "1970-01-01T11:00:00.000Z"
    }
  }
}
```

**Kiểm thử lỗi**:
- Gửi lại cùng dữ liệu → `409` "Bác sĩ đã có lịch làm việc vào khung giờ này"
- bacSiId không tồn tại → `404` "Không tìm thấy bác sĩ"
- khungGioId không tồn tại → `404` "Không tìm thấy khung giờ"
- Bác sĩ A đăng ký gửi lịch cho Bác sĩ B → `403` "Bạn không có quyền đăng ký lịch làm việc cho bác sĩ khác"

---

### 9.5 Lấy lịch làm việc (Public)

```
GET {{base_url}}/lich-lam-viec?bacSiId=1&ngayLamViec=2026-03-25
```

---

### 9.6 Cập nhật trạng thái sẵn sàng (Admin/BS)

```
PUT {{base_url}}/lich-lam-viec/1
```

**Headers**: Authorization: Bearer {{doctor_token}}

**Body**:
```json
{
  "sanSang": 0
}
```

> Đặt `sanSang: 0` → bác sĩ tạm thời không nhận bệnh nhân ở khung giờ này.

**Kiểm thử lỗi**:
- Bác sĩ A gửi ID lịch của Bác sĩ B (phá hoại) → `403` "Bạn không có quyền chỉnh sửa lịch làm việc của bác sĩ khác"

---

### 9.7 Lấy danh sách slot trống (BN đặt lịch)

> **Mẹo**: Nếu bạn muốn test tính năng **"Nới ca / Thêm người khám ngoài giờ"**, hãy tăng `soBenhNhanToiDa` ở bước 9.6 lên cao hơn công suất thực tế. Lúc này gọi API này sẽ thấy xuất hiện thêm các slot mới lố giờ hành chính (kèm cờ `isOvertime: true`).

```
GET {{base_url}}/dat-lich/slot-trong?bacSiId=1&ngayDat=2026-03-25
```

**Phản hồi**: Trả về danh sách object slot { gioBatDau, gioKetThuc, conTrong, isOvertime }.

---

### 9.8 Xóa lịch làm việc (Admin/BS)

```
DELETE {{base_url}}/lich-lam-viec/1
```

**Headers**: Authorization: Bearer {{doctor_token}}

**Kiểm thử lỗi**:
- Ca đang có người đặt rồi → `400` "Từ chối hủy Ca: Đang có (X) bệnh nhân hẹn khám..."
- Bác sĩ A xóa càn lịch của Bác sĩ B → `403` "Bạn không có quyền hủy lịch làm việc của bác sĩ khác" 

---

## 10. Test Đơn thuốc

> **Yêu cầu**: Phải có ít nhất 1 lịch hẹn ở trạng thái "đã khám" (trangThai=2).
> Xem bước 8.9 để cập nhật trạng thái.

### 10.1 Tạo đơn thuốc (Bác sĩ)

```
POST {{base_url}}/don-thuoc
```

**Headers**: Content-Type: application/json, Authorization: Bearer {{doctor_token}}

**Body**:
```json
{
  "datLichId": 1,
  "chanDoan": "Viêm họng cấp, sốt nhẹ",
  "ghiChu": "Uống nhiều nước ấm, nghỉ ngơi, tái khám sau 5 ngày nếu không giảm",
  "chiTietDonThuoc": [
    {
      "tenThuoc": "Amoxicillin 500mg",
      "soLuong": 21,
      "donGia": 15000,
      "lieuDung": "1 viên x 3 lần/ngày",
      "ghiChu": "Uống sau ăn"
    },
    {
      "tenThuoc": "Paracetamol 500mg",
      "soLuong": 10,
      "donGia": 2000,
      "lieuDung": "1 viên khi sốt > 38.5°C",
      "ghiChu": "Cách 4-6 tiếng mới uống tiếp"
    },
    {
      "tenThuoc": "Vitamin C 1000mg",
      "soLuong": 14,
      "donGia": 5000,
      "lieuDung": "1 viên/ngày",
      "ghiChu": "Uống buổi sáng"
    }
  ]
}
```

**Kết quả mong đợi** (Status: `201 Created`):
```json
{
  "success": true,
  "message": "Tạo đơn thuốc thành công",
  "data": {
    "id": 1,
    "datLichId": 1,
    "chanDoan": "Viêm họng cấp, sốt nhẹ",
    "ghiChu": "Uống nhiều nước ấm, nghỉ ngơi...",
    "tongTien": "385000",
    "ngayTao": "2026-03-20T...",
    "chiTietDonThuoc": [
      { "id": 1, "tenThuoc": "Amoxicillin 500mg", "soLuong": 21, "donGia": "15000", ... },
      { "id": 2, "tenThuoc": "Paracetamol 500mg", "soLuong": 10, "donGia": "2000", ... }
    ]
  }
}
```

> **Lưu ý:** `tongTien` được Backend tự động tính toán từ `Sum(soLuong * donGia)`.

**Kiểm thử lỗi**:
- Lịch hẹn chưa khám (trangThai != 2) → `400` "Chỉ tạo đơn thuốc cho lịch hẹn đã khám xong (trạng thái = 2)"
- Đã có đơn thuốc cho lịch này → `409` "Lịch hẹn này đã có đơn thuốc"
- Dùng `patient_token` → `403` "Bạn không có quyền thực hiện hành động này"
- **Bảo mật Data Ownership**: Bác sĩ A truyền `datLichId` của Bác sĩ B → `403` "Bạn không có quyền kê đơn thuốc cho lịch khám của bác sĩ khác"
- datLichId không tồn tại → `404` "Không tìm thấy lịch hẹn"

---

### 10.2 Tạo đơn thuốc đơn giản (không có chi tiết thuốc)

```json
{
  "datLichId": 2,
  "chanDoan": "Cảm cúm nhẹ",
  "ghiChu": "Nghỉ ngơi, uống nước ấm"
}
```

> Có thể tạo đơn thuốc chỉ với chẩn đoán + ghi chú, không bắt buộc có chi tiết thuốc.

---

### 10.3 Lấy danh sách đơn thuốc (Admin/BS)

```
GET {{base_url}}/don-thuoc
```

**Headers**: Authorization: Bearer {{doctor_token}}

Hỗ trợ phân trang: `?page=1&limit=10`

---

### 10.4 Lấy chi tiết đơn thuốc

```
GET {{base_url}}/don-thuoc/1
```

**Headers**: Cookie `accessToken` được Postman tự gửi.

#### Kịch bản 1: Bệnh nhân chưa thanh toán xong (`trangThaiThanhToan < 2`)

**Kết quả mong đợi** (Status: `200 OK`):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "chanDoan": "Viêm họng cấp, sốt nhẹ",
    "ghiChu": "Uống nhiều nước ấm...",
    "tongTien": "385000",
    "chiTietDonThuoc": [],
    "_thongBao": "Vui lòng thanh toán để xem chi tiết đơn thuốc."
  }
}
```

> **Chú ý:** `chiTietDonThuoc` trống và có trường `_thongBao` yêu cầu thanh toán.

#### Kịch bản 2: Bệnh nhân đã thanh toán xong (`trangThaiThanhToan === 2`)

Sau khi Admin cập nhật `PUT /api/dat-lich/:id/thanh-toan` với `{ "trangThaiThanhToan": 2 }`, gọi lại:

**Kết quả mong đợi** (Status: `200 OK`):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "chanDoan": "Viêm họng cấp, sốt nhẹ",
    "tongTien": "385000",
    "chiTietDonThuoc": [
      { "id": 1, "tenThuoc": "Amoxicillin 500mg", "soLuong": 21, "donGia": "15000", ... },
      { "id": 2, "tenThuoc": "Paracetamol 500mg", "soLuong": 10, "donGia": "2000", ... }
    ]
  }
}
```

> **Lưu ý:** Admin và Bác sĩ luôn xem được toàn bộ chi tiết thuốc bất kể trạng thái thanh toán.
> **Security:** Bệnh nhân và Bác sĩ chỉ xem được đơn thuốc của chính mình / do chính mình kê. Cố tình nhập ID của người khác sẽ bị lỗi `403`.

---

### 10.5 Cập nhật đơn thuốc (Bác sĩ/Admin)

```text
PUT {{base_url}}/don-thuoc/1
```

**Headers**: Authorization: Cookie `accessToken` tự động gửi

> **Logic:** Hành động này sẽ thay đổi chẩn đoán, ghi chú và **xóa toàn bộ** danh sách thuốc cũ, thay bằng danh sách mới truyền lên (giống cập nhật giỏ hàng).

**Body** (JSON):
```json
{
  "chanDoan": "Viêm họng cấp (Đã cập nhật)",
  "ghiChu": "Khách hàng dặn dị ứng với Paracetamol, đã đổi thuốc",
  "chiTietDonThuoc": [
    { "tenThuoc": "Amoxicillin 500mg", "soLuong": 30, "donGia": 15000, "lieuDung": "1 viên/ngày" }
  ]
}
```

**Kiểm thử lỗi**:
- Bệnh nhân đã thanh toán xong (`trangThaiThanhToan == 2`) → `400` "Đơn thuốc này đã được bệnh nhân thanh toán, không thể chỉnh sửa thêm" (Trừ phi dùng quyền Admin).
- Bác sĩ khác sửa đơn → `403` "Bạn không có quyền chỉnh sửa đơn thuốc do bác sĩ khác kê".

---

### 10.6 Xóa đơn thuốc (Admin)

```text
DELETE {{base_url}}/don-thuoc/1
```

**Headers**: Authorization: Cookie `accessToken` tự động (của Admin)

> ChiTietDonThuoc sẽ tự xóa nhờ `onDelete: Cascade` trong schema.

---

## 11. Test FAQ

### 11.1 Lấy FAQ đang hoạt động (Public)

```
GET {{base_url}}/cau-hoi-thuong-gap
```

Chỉ trả về FAQ có `dangHoatDong = 1`.

---

### 11.2 Lấy tất cả FAQ kể cả ẩn (Admin)

```
GET {{base_url}}/cau-hoi-thuong-gap/all
```

**Headers**: Authorization: Bearer {{admin_token}}

Hỗ trợ phân trang: `?page=1&limit=20`

---

### 11.3 Tạo FAQ mới (Admin)

```
POST {{base_url}}/cau-hoi-thuong-gap
```

**Headers**: Authorization: Bearer {{admin_token}}

**Body**:
```json
{
  "cauHoi": "Tôi có thể đổi lịch khám không?",
  "traLoi": "Bạn cần hủy lịch cũ và đặt lịch mới. Chức năng đổi lịch trực tiếp đang được phát triển.",
  "dangHoatDong": 1
}
```

---

### 11.4 Cập nhật FAQ (Admin)

```
PUT {{base_url}}/cau-hoi-thuong-gap/6
```

**Headers**: Authorization: Bearer {{admin_token}}

**Body**:
```json
{
  "cauHoi": "Tôi có thể đổi lịch khám đã đặt không?",
  "traLoi": "Hiện tại bạn cần hủy lịch cũ và đặt lịch mới.",
  "dangHoatDong": 0
}
```

> Đặt `dangHoatDong: 0` để ẩn FAQ khỏi trang public.

---

### 11.5 Xóa FAQ (Admin)

```
DELETE {{base_url}}/cau-hoi-thuong-gap/6
```

**Headers**: Authorization: Bearer {{admin_token}}

---

## 12. Test Hình thức thanh toán

### 12.1 Lấy danh sách (Public)

```
GET {{base_url}}/hinh-thuc-thanh-toan
```

---

### 12.2 Tạo mới (Admin)

```
POST {{base_url}}/hinh-thuc-thanh-toan
```

**Headers**: Authorization: Bearer {{admin_token}}

**Body**:
```json
{
  "tenHinhThuc": "Thẻ tín dụng/ghi nợ"
}
```

---

### 12.3 Xóa (Admin)

```
DELETE {{base_url}}/hinh-thuc-thanh-toan/4
```

**Kiểm thử lỗi**:
- Hình thức thanh toán đang được lịch hẹn sử dụng → `400` "Không thể xóa vì có X lịch hẹn đang sử dụng"

---

## 13. Test Thống kê

### 13.1 Dashboard tổng quan (Admin)

```
GET {{base_url}}/thong-ke/tong-quan
```

**Headers**: Authorization: Bearer {{admin_token}}

**Kết quả mong đợi** (Status: `200 OK`):
```json
{
  "success": true,
  "data": {
    "tongBenhNhan": 2,
    "tongBacSi": 8,
    "tongLichHen": 3,
    "tongChuyenKhoa": 8,
    "doanhThu": "1000000",
    "lichHenTheoTrangThai": [
      { "trangThai": 0, "soLuong": 1 },
      { "trangThai": 1, "soLuong": 0 },
      { "trangThai": 2, "soLuong": 1 },
      { "trangThai": 3, "soLuong": 1 }
    ]
  }
}
```

> `doanhThu` = tổng `giaKham` của tất cả lịch hẹn có trangThai = 2 (đã khám).

---

### 13.2 Thống kê lịch hẹn theo khoảng thời gian (Admin)

```
GET {{base_url}}/thong-ke/lich-hen?tuNgay=2026-03-01&denNgay=2026-03-31
```

**Headers**: Authorization: Bearer {{admin_token}}

**Kết quả mong đợi**:
```json
{
  "success": true,
  "data": {
    "lichHenTheoNgay": [
      { "ngay": "2026-03-25T00:00:00.000Z", "soLuong": 2 }
    ],
    "lichHenTheoBacSi": [
      { "bacSiId": 1, "tenBacSi": "Nguyễn Văn An", "soLuong": 1 },
      { "bacSiId": 2, "tenBacSi": "Trần Thị Bình", "soLuong": 1 }
    ]
  }
}
```

> Top 10 bác sĩ có nhiều lịch hẹn nhất trong khoảng thời gian chỉ định.

---

## 14. Kiểm thử lỗi & Edge cases

### 14.1 Validate dữ liệu đầu vào (Zod)

| Test case | Request | Kết quả mong đợi |
|-----------|---------|-------------------|
| Email sai format | POST register, `"email": "abc"` | 400 - "Email không hợp lệ" |
| Mật khẩu < 6 ký tự | POST register, `"matKhau": "123"` | 400 - "Mật khẩu phải có ít nhất 6 ký tự" |
| Họ tên trống | POST register, `"hoTen": ""` | 400 - "Họ tên không được để trống" |
| Tên bác sĩ trống | POST bac-si, `"tenBacSi": ""` | 400 - "Tên bác sĩ không được để trống" |
| Giờ sai format | POST dat-lich, `"gioBatDau": "8h"` | 400 - "Giờ bắt đầu phải đúng định dạng HH:mm" |
| Trạng thái ngoài khoảng | PUT trang-thai, `"trangThai": 5` | 400 - "Trạng thái phải từ 0-3" |
| Tên thuốc trống | POST don-thuoc, `chiTietDonThuoc: [{ "tenThuoc": "" }]` | 400 - "Tên thuốc không được để trống" |
| Tên hình thức trống | POST hinh-thuc-thanh-toan, `"tenHinhThuc": ""` | 400 - "Tên hình thức thanh toán không được để trống" |

### 14.2 Phân quyền

| Test case | Request | Kết quả mong đợi |
|-----------|---------|-------------------|
| Bệnh nhân tạo bác sĩ | POST bac-si với patient_token | 403 |
| Bác sĩ xóa chuyên khoa | DELETE chuyen-khoa với doctor_token | 403 |
| Không có token | GET auth/me | 401 |
| Token hết hạn/sai | GET auth/me với token random | 401 |
| Bệnh nhân tạo đơn thuốc | POST don-thuoc với patient_token | 403 |
| Bệnh nhân xem danh sách BN | GET benh-nhan với patient_token | 403 |
| Bệnh nhân xem thống kê | GET thong-ke/tong-quan với patient_token | 403 |
| Bác sĩ xem thống kê | GET thong-ke/tong-quan với doctor_token | 403 |
| Tài khoản bị khóa | Bất kỳ API nào cần auth | 403 "Tài khoản đã bị khóa" |

### 14.3 Ownership check

| Test case | Request | Kết quả mong đợi |
|-----------|---------|-------------------|
| BN A xem lịch BN B | GET dat-lich/benh-nhan/2 với patient_token (BN id=1) | 403 |
| BS A xem lịch BS B | GET dat-lich/bac-si/2 với doctor_token (BS id=1) | 403 |
| BN A sửa hồ sơ BN B | PUT benh-nhan/2 với patient_token (BN id=1) | 403 |
| BN A xóa lịch BN B | DELETE dat-lich/X (lịch của BN B) với patient_token | 403 |

### 14.4 Ràng buộc dữ liệu

| Test case | Request | Kết quả mong đợi |
|-----------|---------|-------------------|
| Trùng lịch hẹn | POST dat-lich cùng BS+ngày+giờ | 409 |
| Email đăng ký trùng | POST register cùng email | 409 |
| Trùng lịch làm việc | POST lich-lam-viec cùng BS+ngày+khung giờ | 409 |
| Xóa chuyên khoa có BS | DELETE chuyen-khoa/1 | 400 |
| Xóa BS có lịch hẹn | DELETE bac-si/1 (khi có lịch) | 400 |
| Xóa BN có lịch hẹn | DELETE benh-nhan/1 (khi có lịch) | 400 |
| Xóa khung giờ đang dùng | DELETE lich-lam-viec/khung-gio/1 (khi có lịch) | 400 |
| Xóa HTTT đang dùng | DELETE hinh-thuc-thanh-toan/1 (khi có lịch) | 400 |
| Tạo đơn thuốc trùng | POST don-thuoc cùng datLichId | 409 |
| Đơn thuốc cho lịch chưa khám | POST don-thuoc, datLich.trangThai != 2 | 400 |
| Xóa lịch đã xác nhận | DELETE dat-lich/1 (trangThai=1) | 400 |
| ID không tồn tại | GET bac-si/99999 | 404 |

---

## 15. Thống Kê / Dashboard (Dành cho Admin)

> **Yêu cầu**: Phải luôn đăng nhập bằng tài khoản Admin để có `admin_token`.

### 15.1 Xem Tổng quan hệ thống (Dashboard Cards & Pie Chart)

```
GET {{base_url}}/thong-ke/tong-quan
```

**Headers**: Authorization: Bearer {{admin_token}}

**Kết quả mong đợi:**
Trả về tổng số bệnh nhân, bác sĩ, lịch hẹn, doanh thu khám (những lịch có `trangThaiThanhToan >= 1`), doanh thu thuốc (những lịch có `trangThaiThanhToan == 2`) và phân bổ trạng thái lịch hẹn dạng phần trăm để vẽ Pie Chart.

### 15.2 Xu hướng Đặt Lịch & Top Bác sĩ

```
GET {{base_url}}/thong-ke/lich-hen?tuNgay=2026-03-01&denNgay=2026-03-31
```

**Headers**: Authorization: Bearer {{admin_token}}

> **Lưu ý**: Có thể truyền hoặc không truyền `tuNgay` và `denNgay`. Nếu không truyền sẽ lấy toàn bộ.

**Kết quả mong đợi:**
Trả về 2 mảng:
1. `lichHenTheoNgay`: Số lượng lịch khám gom nhóm theo từng ngày để vẽ Biểu đồ đường (Line Chart).
2. `lichHenTheoBacSi`: Top các bác sĩ có lịch hẹn nhiều nhất để vẽ Bar Chart.

### 15.3 Doanh Thu Hàng Tháng (Biểu đồ Tồn Tài Chính)

```
GET {{base_url}}/thong-ke/doanh-thu?nam=2026
```

**Headers**: Authorization: Bearer {{admin_token}}

> **Lưu ý**: Nếu tham số `nam` không được truyền, hệ thống sẽ tự động dùng năm hiện tại.

**Kết quả mong đợi:**
Cung cấp số liệu tài chính của 12 tháng phân tách 2 loại tiền để vẽ Stacked Bar Chart.
```json
{
  "success": true,
  "data": {
    "nam": 2026,
    "thongKeThang": [
      {
        "thang": 1,
        "doanhThuKham": 400000,
        "doanhThuThuoc": 120500,
        "tongDoanhThu": 520500
      },
      ...
    ]
  }
}
```

---

## 16. Checklist kiểm thử

Dùng checklist này để đánh dấu các API đã test qua:

### Authentication (7 endpoints)
- [ ] Health check `GET /api/health`
- [ ] Đăng ký thành công `POST /api/auth/register`
- [ ] Đăng ký lỗi (email trùng, thiếu field, mật khẩu yếu)
- [ ] Đăng nhập admin `POST /api/auth/login`
- [ ] Đăng nhập bác sĩ
- [ ] Đăng nhập bệnh nhân
- [ ] Đăng nhập lỗi (sai mật khẩu, tài khoản bị khóa)
- [ ] Làm mới token `POST /api/auth/refresh`
- [ ] Lấy thông tin user `GET /api/auth/me`
- [ ] Đổi mật khẩu `PUT /api/auth/doi-mat-khau`
- [ ] Đổi mật khẩu lỗi (sai mật khẩu cũ)
- [ ] Cập nhật hồ sơ `PUT /api/auth/cap-nhat-ho-so`
- [ ] Đăng xuất `POST /api/auth/logout`
- [ ] Lỗi không có token / token sai / token hết hạn

### Chuyên khoa (5 endpoints)
- [ ] Lấy danh sách `GET /api/chuyen-khoa`
- [ ] Lấy chi tiết `GET /api/chuyen-khoa/:id`
- [ ] Tạo mới (admin) `POST /api/chuyen-khoa` (kèm thoiLuongKham)
- [ ] Cập nhật (admin) `PUT /api/chuyen-khoa/:id` (kèm thoiLuongKham)
- [ ] Xóa (admin) `DELETE /api/chuyen-khoa/:id`
- [ ] Phân quyền: bác sĩ/bệnh nhân không tạo/sửa/xóa được

### Bác sĩ (5 endpoints)
- [ ] Lấy danh sách `GET /api/bac-si`
- [ ] Filter theo chuyên khoa `?chuyenKhoaId=`
- [ ] Tìm kiếm theo tên `?search=`
- [ ] Phân trang `?page=&limit=`
- [ ] Lấy chi tiết `GET /api/bac-si/:id`
- [ ] Tạo mới (admin) `POST /api/bac-si`
- [ ] Cập nhật (admin) `PUT /api/bac-si/:id`
- [ ] Xóa (admin) `DELETE /api/bac-si/:id`
- [ ] Không xóa được khi có lịch hẹn

### Bệnh nhân (4 endpoints)
- [ ] Lấy danh sách (admin) `GET /api/benh-nhan`
- [ ] Lấy chi tiết `GET /api/benh-nhan/:id`
- [ ] Cập nhật `PUT /api/benh-nhan/:id`
- [ ] Ownership check: BN không sửa hồ sơ BN khác
- [ ] Xóa (admin) `DELETE /api/benh-nhan/:id`
- [ ] Không xóa được khi có lịch hẹn

### Đặt lịch (8 endpoints)
- [ ] Tạo lịch hẹn `POST /api/dat-lich` (hỗ trợ `trangThaiThanhToan`)
- [ ] Test trùng lịch (cùng BS + ngày + giờ bắt đầu)
- [ ] Test BS không có lịch làm việc ngày đó
- [ ] Lấy tất cả (admin) `GET /api/dat-lich`
- [ ] Filter theo trạng thái, ngày, phân trang
- [ ] Lấy chi tiết `GET /api/dat-lich/:id`
- [ ] Lấy theo bệnh nhân `GET /api/dat-lich/benh-nhan/:id` + ownership
- [ ] Lấy theo bác sĩ `GET /api/dat-lich/bac-si/:id` + ownership
- [ ] Cập nhật trạng thái: chờ → xác nhận (1)
- [ ] Cập nhật trạng thái: xác nhận → đã khám (2)
- [ ] Cập nhật trạng thái: hủy (3)
- [ ] Cập nhật thanh toán `PUT /api/dat-lich/:id/thanh-toan` (0->1->2)
- [ ] Xóa lịch chờ xác nhận/đã hủy
- [ ] Không xóa được lịch đã xác nhận/đã khám
- [ ] Ownership check: BN không xóa lịch BN khác

### Lịch làm việc & Đặt lịch (10 endpoints)
- [ ] Lấy khung giờ `GET /api/lich-lam-viec/khung-gio`
- [ ] Tạo khung giờ (admin) `POST /api/lich-lam-viec/khung-gio` (validate thời gian trước sau)
- [ ] Lấy slot khám trống (BN đặt lịch) `GET /api/dat-lich/slot-trong`
- [ ] Lỗi đặt lịch nếu xóa/hủy khung giờ đã có lịch
- [ ] Tạo lịch làm việc `POST /api/lich-lam-viec` (chờ tự tính `soBenhNhanToiDa`)
- [ ] Tạo lịch hẹn `POST /api/dat-lich` (chỉ cần `gioBatDau`, sức chứa ca tự tăng)
- [ ] Cập nhật trạng thái lịch hẹn: chờ → xác nhận (1), đến đã khám (2), hủy (3 - sức chứa tự giảm)
- [ ] Validate trùng lịch hẹn
- [ ] Lấy lịch hẹn, lấy lịch làm việc theo BS
- [ ] Xóa lịch `DELETE /api/lich-lam-viec/:id` (lỗi nếu có lịch hẹn ko)

### Đơn thuốc (4 endpoints)
- [ ] Tạo đơn thuốc (bác sĩ) `POST /api/don-thuoc` với chi tiết thuốc
- [ ] Tạo đơn thuốc đơn giản (chỉ chẩn đoán + ghi chú)
- [ ] Không tạo được cho lịch chưa khám (trangThai != 2)
- [ ] Không tạo trùng (lịch đã có đơn thuốc)
- [ ] Lấy danh sách (admin/bs) `GET /api/don-thuoc`
- [ ] Lấy chi tiết `GET /api/don-thuoc/:id`
- [ ] Xóa (admin) `DELETE /api/don-thuoc/:id`

### FAQ (6 endpoints)
- [ ] Lấy FAQ hoạt động (public) `GET /api/cau-hoi-thuong-gap`
- [ ] Lấy tất cả (admin) `GET /api/cau-hoi-thuong-gap/all`
- [ ] Tạo mới (admin) `POST /api/cau-hoi-thuong-gap`
- [ ] Cập nhật (admin) `PUT /api/cau-hoi-thuong-gap/:id`
- [ ] Ẩn/hiện FAQ bằng dangHoatDong
- [ ] Xóa (admin) `DELETE /api/cau-hoi-thuong-gap/:id`

### Hình thức thanh toán (3 endpoints)
- [ ] Lấy danh sách (public) `GET /api/hinh-thuc-thanh-toan`
- [ ] Tạo mới (admin) `POST /api/hinh-thuc-thanh-toan`
- [ ] Xóa (admin) `DELETE /api/hinh-thuc-thanh-toan/:id`
- [ ] Không xóa được khi đang được sử dụng

### Thống kê (2 endpoints)
- [ ] Dashboard tổng quan (admin) `GET /api/thong-ke/tong-quan`
- [ ] Thống kê lịch hẹn (admin) `GET /api/thong-ke/lich-hen?tuNgay=&denNgay=`
- [ ] Phân quyền: chỉ admin mới xem được thống kê

---

## Thứ tự test đề xuất

Để test hiệu quả, nên thực hiện theo thứ tự:

1. **Health check** → Đảm bảo server chạy
2. **Đăng nhập** 3 tài khoản → Lưu access token vào Environment
3. **Chuyên khoa** → CRUD (dữ liệu nền tảng)
4. **Bác sĩ** → CRUD + filter (phụ thuộc chuyên khoa)
5. **Bệnh nhân** → Xem + cập nhật
6. **Khung giờ & Lịch làm việc** → Tạo lịch cho bác sĩ
7. **Hình thức thanh toán** → Dữ liệu phụ trợ
8. **Đặt lịch** → Tạo → test trùng → cập nhật trạng thái (0 → 1 → 2)
9. **Thanh toán phí khám** → Cập nhật `trangThaiThanhToan = 1`
10. **Đơn thuốc** → Tạo sau khi lịch đã khám xong (trangThai = 2) + truyền `donGia`
11. **Thanh toán toàn bộ** → Cập nhật `trangThaiThanhToan = 2` sau khi có đơn thuốc
12. **FAQ** → CRUD + ẩn/hiện
13. **Thống kê** → Xem dashboard + thống kê lịch hẹn
14. **Auth nâng cao** → Đổi mật khẩu, cập nhật hồ sơ, refresh token, logout
15. **Edge cases** → Phân quyền, ownership, ràng buộc dữ liệu

---

## Mẹo sử dụng Postman

### Auto-save token khi login

Trong tab **"Tests"** (hoặc **"Scripts > Post-response"**) của request Login Admin, thêm script:

```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("admin_token", jsonData.data.accessToken);
}
```

Tương tự cho Login Bác sĩ → save vào `doctor_token`, Login Bệnh nhân → save vào `patient_token`.

### Auto-save token khi refresh

```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    // Cập nhật token cho tài khoản đang dùng
    pm.environment.set("admin_token", jsonData.data.accessToken);
}
```

### Kiểm tra cookie

Postman → tab **"Cookies"** (bên cạnh Headers, Body) → xem cookie `refreshToken` cho domain `localhost`.

### Collection Runner

Bạn có thể dùng **Collection Runner** để chạy hàng loạt request theo thứ tự đã sắp xếp, tự động kiểm tra kết quả.
