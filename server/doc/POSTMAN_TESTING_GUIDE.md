# Hướng dẫn kiểm thử API bằng Postman

> Tài liệu hướng dẫn chi tiết cách sử dụng Postman để kiểm thử tất cả API  
> của hệ thống Đặt lịch Khám bệnh Trực tuyến.

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
13. [Kiểm thử lỗi & Edge cases](#13-kiểm-thử-lỗi--edge-cases)
14. [Checklist kiểm thử](#14-checklist-kiểm-thử)

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
- 8 khung giờ
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
# Connection Pooling (Transaction mode) - dùng cho ứng dụng chạy
DATABASE_URL="postgresql://postgres.abcdefghijk:MyStr0ng!Pass2026@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct Connection - dùng cho Prisma Migrate/Push
DIRECT_URL="postgresql://postgres.abcdefghijk:MyStr0ng!Pass2026@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# ===== JWT =====
JWT_SECRET="mot_chuoi_bi_mat_bat_ky_dai_hon_32_ky_tu"
JWT_EXPIRES_IN="7d"
```

> Thay `postgres.abcdefghijk` và `MyStr0ng!Pass2026` bằng thông tin thực từ Supabase.

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
3. Bạn sẽ thấy **10 bảng** đã được tạo:

```
TaiKhoan, ChuyenKhoa, BacSi, BenhNhan, KhungGio,
LichLamViecBacSi, HinhThucThanhToan, DatLich, DonThuoc, CauHoiThuongGap
```

Nếu thấy đủ 10 bảng → kết nối thành công!

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
📋 API docs: http://localhost:5000/api/health
```

Mở trình duyệt, truy cập `http://localhost:5000/api/health`:
```json
{
  "success": true,
  "message": "Server đang hoạt động!",
  "timestamp": "2026-03-10T..."
}
```

### 2.9 Xem dữ liệu trực quan với Prisma Studio

Prisma Studio là giao diện web để xem/sửa dữ liệu trực tiếp:

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

### 3.2 Tạo Environment

1. Click biểu tượng **⚙️ (Environments)** ở sidebar trái
2. Click **"+"** để tạo environment mới, đặt tên: `Local`
3. Thêm các biến:

| Variable | Initial Value | Description |
|----------|---------------|-------------|
| `base_url` | `http://localhost:5000/api` | URL gốc của API |
| `admin_token` | _(để trống, sẽ lấy sau)_ | JWT token của admin |
| `doctor_token` | _(để trống)_ | JWT token của bác sĩ |
| `patient_token` | _(để trống)_ | JWT token của bệnh nhân |

4. Click **"Save"** → Chọn environment `Local` ở dropdown góc trên phải

### 3.3 Cách sử dụng biến

Trong Postman, dùng `{{ten_bien}}` để reference biến. Ví dụ:
- URL: `{{base_url}}/auth/login`
- Header: `Bearer {{admin_token}}`

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
  "timestamp": "2026-03-10T..."
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
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 11,
      "email": "nguyenvana@gmail.com",
      "vaiTro": "benh_nhan",
      "hoTen": "Nguyễn Văn A"
    }
  }
}
```

**Kiểm thử lỗi**:
- Gửi lại cùng email → `409` "Email đã được sử dụng"
- Bỏ trống email → `400` "Email không được để trống"
- Mật khẩu < 6 ký tự → `400` "Mật khẩu phải có ít nhất 6 ký tự"

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
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "email": "admin@clinic.vn",
      "vaiTro": "admin",
      "hoTen": "Admin"
    }
  }
}
```

> **Quan trọng**: Copy giá trị `token` từ response → Paste vào biến `admin_token` trong Environment.

**Kiểm thử lỗi**:
- Sai mật khẩu → `401` "Email hoặc mật khẩu không đúng"
- Email không tồn tại → `401` "Email hoặc mật khẩu không đúng"

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

> Copy `token` → Paste vào biến `doctor_token`.

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

> Copy `token` → Paste vào biến `patient_token`.

---

### 4.6 Lấy thông tin user hiện tại

```
GET {{base_url}}/auth/me
```

**Headers**:
| Key | Value |
|-----|-------|
| Authorization | Bearer {{admin_token}} |

**Kết quả mong đợi** (Status: `200 OK`):
```json
{
  "success": true,
  "message": "Lấy thông tin thành công",
  "data": {
    "id": 1,
    "email": "admin@clinic.vn",
    "vaiTro": "admin",
    ...
  }
}
```

**Kiểm thử lỗi**:
- Không gửi token → `401` "Không có token xác thực"
- Token sai/hết hạn → `401` "Token không hợp lệ hoặc đã hết hạn"

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
  "message": "Lấy danh sách chuyên khoa thành công",
  "data": [
    {
      "id": 1,
      "tenChuyenKhoa": "Tim mạch",
      "anhChuyenKhoa": null,
      "moTaChuyenKhoa": "Khám và điều trị các bệnh về tim, mạch máu",
      "_count": { "bacSis": 2 }
    },
    ...
  ]
}
```

---

### 5.2 Lấy chi tiết chuyên khoa (Public)

```
GET {{base_url}}/chuyen-khoa/1
```

Kết quả kèm danh sách bác sĩ thuộc chuyên khoa.

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
  "moTaChuyenKhoa": "Khám và điều trị các bệnh về xương khớp, cơ bắp"
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
    ...
  }
}
```

**Kiểm thử phân quyền**:
- Dùng `doctor_token` → `403` "Bạn không có quyền truy cập"
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
  "moTaChuyenKhoa": "Điều trị chấn thương thể thao, gãy xương, thoái hóa khớp"
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
- ID không tồn tại → `404`

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
  "message": "Lấy danh sách bác sĩ thành công",
  "data": {
    "bacSis": [ ... ],
    "pagination": {
      "total": 8,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

### 6.2 Lấy chi tiết bác sĩ (Public)

```
GET {{base_url}}/bac-si/1
```

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

**Kết quả mong đợi** (Status: `201 Created`)

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

---

## 8. Test Đặt lịch

> Đây là phần quan trọng nhất. Test theo đúng thứ tự để đảm bảo dữ liệu nhất quán.

### 8.1 Tạo lịch hẹn mới (Bệnh nhân)

```
POST {{base_url}}/dat-lich
```

**Headers**: Content-Type: application/json, Authorization: Bearer {{patient_token}}

**Body**:
```json
{
  "ngayDat": "2026-03-20",
  "gioBatDau": "08:00",
  "gioKetThuc": "09:00",
  "lyDoKham": "Đau đầu kéo dài, chóng mặt",
  "bacSiId": 1,
  "benhNhanId": 1,
  "hinhThucThanhToanId": 1
}
```

**Kết quả mong đợi** (Status: `201 Created`):
```json
{
  "success": true,
  "message": "Đặt lịch thành công",
  "data": {
    "id": 1,
    "ngayDat": "2026-03-20T00:00:00.000Z",
    "gioBatDau": "1970-01-01T08:00:00.000Z",
    "gioKetThuc": "1970-01-01T09:00:00.000Z",
    "lyDoKham": "Đau đầu kéo dài, chóng mặt",
    "giaKham": "500000",
    "trangThai": 0,
    "bacSi": { "id": 1, "tenBacSi": "Nguyễn Văn An", ... },
    "benhNhan": { "id": 1, "hoTen": "Nguyễn Bệnh Nhân", ... },
    ...
  }
}
```

> Ghi lại `id` của lịch hẹn vừa tạo (ví dụ: `1`) để dùng cho các test tiếp theo.

---

### 8.2 Test trùng lịch

Gửi lại **cùng request** ở 8.1 (cùng bác sĩ + cùng ngày + cùng giờ):

**Kết quả mong đợi** (Status: `409`):
```json
{
  "success": false,
  "message": "Bác sĩ đã có lịch hẹn vào khung giờ này. Vui lòng chọn giờ khác."
}
```

---

### 8.3 Tạo thêm lịch hẹn (khung giờ khác)

```json
{
  "ngayDat": "2026-03-20",
  "gioBatDau": "09:00",
  "gioKetThuc": "10:00",
  "lyDoKham": "Khám định kỳ",
  "bacSiId": 2,
  "benhNhanId": 1,
  "hinhThucThanhToanId": 2
}
```

---

### 8.4 Lấy tất cả lịch hẹn (Admin)

```
GET {{base_url}}/dat-lich
```

**Headers**: Authorization: Bearer {{admin_token}}

Hỗ trợ filter:
```
GET {{base_url}}/dat-lich?trangThai=0
GET {{base_url}}/dat-lich?ngayDat=2026-03-20
GET {{base_url}}/dat-lich?trangThai=0&page=1&limit=5
```

---

### 8.5 Lấy chi tiết lịch hẹn

```
GET {{base_url}}/dat-lich/1
```

**Headers**: Authorization: Bearer {{patient_token}}

---

### 8.6 Lấy lịch hẹn theo bệnh nhân

```
GET {{base_url}}/dat-lich/benh-nhan/1
```

**Headers**: Authorization: Bearer {{patient_token}}

---

### 8.7 Lấy lịch hẹn theo bác sĩ

```
GET {{base_url}}/dat-lich/bac-si/1
```

**Headers**: Authorization: Bearer {{doctor_token}}

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

> Lưu ý: Sau bước này mới có thể tạo đơn thuốc cho lịch hẹn.

---

### 8.10 Hủy lịch hẹn

```
PUT {{base_url}}/dat-lich/2/trang-thai
```

**Body**:
```json
{
  "trangThai": 3
}
```

---

### 8.11 Xóa lịch hẹn

```
DELETE {{base_url}}/dat-lich/2
```

**Headers**: Authorization: Bearer {{patient_token}}

**Kiểm thử lỗi**:
- Xóa lịch đã xác nhận (trangThai=1) → `400` "Không thể xóa lịch hẹn đã xác nhận hoặc đã khám"

---

## 9. Test Lịch làm việc & Khung giờ

### 9.1 Lấy danh sách khung giờ (Public)

```
GET {{base_url}}/lich-lam-viec/khung-gio
```

**Kết quả mong đợi**: Danh sách 8 khung giờ (07:00-08:00, 08:00-09:00, ...)

---

### 9.2 Tạo khung giờ mới (Admin)

```
POST {{base_url}}/lich-lam-viec/khung-gio
```

**Headers**: Authorization: Bearer {{admin_token}}

**Body**:
```json
{
  "gioBatDau": "17:00",
  "gioKetThuc": "18:00"
}
```

---

### 9.3 Tạo lịch làm việc cho bác sĩ (Admin/BS)

```
POST {{base_url}}/lich-lam-viec
```

**Headers**: Authorization: Bearer {{admin_token}}

**Body**:
```json
{
  "ngayLamViec": "2026-03-20",
  "bacSiId": 1,
  "khungGioId": 1
}
```

**Kiểm thử lỗi**:
- Gửi lại cùng dữ liệu → `409` "Bác sĩ đã có lịch làm việc vào khung giờ này"

---

### 9.4 Lấy lịch làm việc (Public)

```
GET {{base_url}}/lich-lam-viec?bacSiId=1&ngayLamViec=2026-03-20
```

---

### 9.5 Cập nhật trạng thái sẵn sàng

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

---

### 9.6 Xóa lịch làm việc

```
DELETE {{base_url}}/lich-lam-viec/1
```

**Headers**: Authorization: Bearer {{admin_token}}

---

## 10. Test Đơn thuốc

> Yêu cầu: Phải có ít nhất 1 lịch hẹn ở trạng thái "đã khám" (trangThai=2).  
> Xem bước 8.9 để cập nhật trạng thái.

### 10.1 Tạo đơn thuốc (Bác sĩ)

```
POST {{base_url}}/don-thuoc
```

**Headers**: Content-Type: application/json, Authorization: Bearer {{doctor_token}}

**Body**:
```json
{
  "datLichId": 1
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
    "ngayTao": "2026-03-10T...",
    "datLich": {
      "bacSi": { "tenBacSi": "Nguyễn Văn An" },
      "benhNhan": { "hoTen": "Nguyễn Bệnh Nhân" }
    }
  }
}
```

**Kiểm thử lỗi**:
- Lịch hẹn chưa khám (trangThai != 2) → `400` "Chỉ tạo đơn thuốc cho lịch hẹn đã khám xong"
- Đã có đơn thuốc → `409` "Lịch hẹn này đã có đơn thuốc"
- Dùng patient_token → `403` "Bạn không có quyền"

---

### 10.2 Lấy danh sách đơn thuốc (Admin/BS)

```
GET {{base_url}}/don-thuoc
```

**Headers**: Authorization: Bearer {{doctor_token}}

---

### 10.3 Lấy chi tiết đơn thuốc

```
GET {{base_url}}/don-thuoc/1
```

**Headers**: Authorization: Bearer {{patient_token}}

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

---

## 13. Kiểm thử lỗi & Edge cases

### 13.1 Validate dữ liệu đầu vào

| Test case | Request | Kết quả mong đợi |
|-----------|---------|-------------------|
| Email trống | POST register, `"email": ""` | 400 - "Email không được để trống" |
| Email sai format | POST register, `"email": "abc"` | 400 - "Email không hợp lệ" |
| Mật khẩu < 6 ký tự | POST register, `"matKhau": "123"` | 400 - "Mật khẩu phải có ít nhất 6 ký tự" |
| Tên bác sĩ trống | POST bac-si, `"tenBacSi": ""` | 400 - "Tên bác sĩ không được để trống" |
| Ngày đặt sai format | POST dat-lich, `"ngayDat": "abc"` | 400 - "Ngày đặt phải đúng định dạng YYYY-MM-DD" |
| Giờ sai format | POST dat-lich, `"gioBatDau": "8h"` | 400 - "Giờ bắt đầu phải đúng định dạng HH:mm" |
| Trạng thái ngoài khoảng | PUT trang-thai, `"trangThai": 5` | 400 - "Trạng thái phải từ 0-3" |

### 13.2 Phân quyền

| Test case | Request | Kết quả mong đợi |
|-----------|---------|-------------------|
| Bệnh nhân tạo bác sĩ | POST bac-si với patient_token | 403 |
| Bác sĩ xóa chuyên khoa | DELETE chuyen-khoa với doctor_token | 403 |
| Không có token | GET auth/me | 401 |
| Token hết hạn/sai | GET auth/me với token random | 401 |
| Bệnh nhân tạo đơn thuốc | POST don-thuoc với patient_token | 403 |
| Bệnh nhân xem danh sách BN | GET benh-nhan với patient_token | 403 |

### 13.3 Ràng buộc dữ liệu

| Test case | Request | Kết quả mong đợi |
|-----------|---------|-------------------|
| Trùng lịch hẹn | POST dat-lich cùng BS+ngày+giờ | 409 |
| Email đăng ký trùng | POST register cùng email | 409 |
| Xóa chuyên khoa có BS | DELETE chuyen-khoa/1 | 400 |
| Xóa BS có lịch hẹn | DELETE bac-si/1 (khi có lịch) | 400 |
| Tạo đơn thuốc trùng | POST don-thuoc cùng datLichId | 409 |
| ID không tồn tại | GET bac-si/99999 | 404 |

---

## 14. Checklist kiểm thử

Dùng checklist này để đánh dấu các API đã test qua:

### Authentication
- [ ] Health check `GET /api/health`
- [ ] Đăng ký thành công `POST /api/auth/register`
- [ ] Đăng ký lỗi (email trùng, thiếu field)
- [ ] Đăng nhập admin `POST /api/auth/login`
- [ ] Đăng nhập bác sĩ
- [ ] Đăng nhập bệnh nhân
- [ ] Đăng nhập lỗi (sai mật khẩu)
- [ ] Lấy thông tin user `GET /api/auth/me`
- [ ] Lỗi không có token

### Chuyên khoa
- [ ] Lấy danh sách `GET /api/chuyen-khoa`
- [ ] Lấy chi tiết `GET /api/chuyen-khoa/:id`
- [ ] Tạo mới (admin) `POST /api/chuyen-khoa`
- [ ] Cập nhật (admin) `PUT /api/chuyen-khoa/:id`
- [ ] Xóa (admin) `DELETE /api/chuyen-khoa/:id`
- [ ] Phân quyền: bác sĩ/bệnh nhân không tạo được

### Bác sĩ
- [ ] Lấy danh sách `GET /api/bac-si`
- [ ] Lấy danh sách filter theo chuyên khoa
- [ ] Lấy danh sách tìm kiếm theo tên
- [ ] Phân trang
- [ ] Lấy chi tiết `GET /api/bac-si/:id`
- [ ] Tạo mới (admin) `POST /api/bac-si`
- [ ] Cập nhật (admin) `PUT /api/bac-si/:id`
- [ ] Xóa (admin) `DELETE /api/bac-si/:id`

### Bệnh nhân
- [ ] Lấy danh sách (admin) `GET /api/benh-nhan`
- [ ] Lấy chi tiết `GET /api/benh-nhan/:id`
- [ ] Cập nhật `PUT /api/benh-nhan/:id`
- [ ] Xóa (admin) `DELETE /api/benh-nhan/:id`

### Đặt lịch
- [ ] Tạo lịch hẹn `POST /api/dat-lich`
- [ ] Test trùng lịch (cùng BS + ngày + giờ)
- [ ] Lấy tất cả (admin) `GET /api/dat-lich`
- [ ] Filter theo trạng thái, ngày
- [ ] Lấy chi tiết `GET /api/dat-lich/:id`
- [ ] Lấy theo bệnh nhân `GET /api/dat-lich/benh-nhan/:id`
- [ ] Lấy theo bác sĩ `GET /api/dat-lich/bac-si/:id`
- [ ] Cập nhật trạng thái: chờ → xác nhận
- [ ] Cập nhật trạng thái: xác nhận → đã khám
- [ ] Cập nhật trạng thái: hủy
- [ ] Xóa lịch chờ xác nhận
- [ ] Không xóa được lịch đã xác nhận

### Lịch làm việc
- [ ] Lấy khung giờ `GET /api/lich-lam-viec/khung-gio`
- [ ] Tạo khung giờ (admin) `POST /api/lich-lam-viec/khung-gio`
- [ ] Tạo lịch làm việc `POST /api/lich-lam-viec`
- [ ] Lấy lịch theo bác sĩ + ngày
- [ ] Cập nhật sẵn sàng `PUT /api/lich-lam-viec/:id`
- [ ] Xóa lịch `DELETE /api/lich-lam-viec/:id`

### Đơn thuốc
- [ ] Tạo đơn thuốc (bác sĩ) `POST /api/don-thuoc`
- [ ] Không tạo được cho lịch chưa khám
- [ ] Không tạo trùng
- [ ] Lấy danh sách (admin/bs) `GET /api/don-thuoc`
- [ ] Lấy chi tiết `GET /api/don-thuoc/:id`

### FAQ
- [ ] Lấy FAQ hoạt động (public) `GET /api/cau-hoi-thuong-gap`
- [ ] Lấy tất cả (admin) `GET /api/cau-hoi-thuong-gap/all`
- [ ] Tạo mới (admin) `POST /api/cau-hoi-thuong-gap`
- [ ] Cập nhật (admin) `PUT /api/cau-hoi-thuong-gap/:id`
- [ ] Xóa (admin) `DELETE /api/cau-hoi-thuong-gap/:id`

### Hình thức thanh toán
- [ ] Lấy danh sách (public) `GET /api/hinh-thuc-thanh-toan`
- [ ] Tạo mới (admin) `POST /api/hinh-thuc-thanh-toan`
- [ ] Xóa (admin) `DELETE /api/hinh-thuc-thanh-toan/:id`

---

## Thứ tự test đề xuất

Để test hiệu quả, nên thực hiện theo thứ tự:

1. **Health check** → Đảm bảo server chạy
2. **Đăng nhập** 3 tài khoản → Lưu token vào Environment
3. **Chuyên khoa** → CRUD (dữ liệu nền tảng)
4. **Bác sĩ** → CRUD + filter (phụ thuộc chuyên khoa)
5. **Bệnh nhân** → Xem + cập nhật
6. **Khung giờ & Lịch làm việc** → Tạo lịch cho bác sĩ
7. **Hình thức thanh toán** → Dữ liệu phụ trợ
8. **Đặt lịch** → Tạo → test trùng → cập nhật trạng thái
9. **Đơn thuốc** → Tạo sau khi lịch đã khám xong
10. **FAQ** → CRUD + ẩn/hiện

---

> **Mẹo**: Trong Postman, bạn có thể dùng tab **"Tests"** trong mỗi request để tự động lưu token.  
> Ví dụ, thêm đoạn script sau vào tab **"Tests"** của request Login Admin:
>
> ```javascript
> if (pm.response.code === 200) {
>     var jsonData = pm.response.json();
>     pm.environment.set("admin_token", jsonData.data.token);
> }
> ```
>
> Sau đó mỗi lần login, token sẽ tự động cập nhật vào Environment.
