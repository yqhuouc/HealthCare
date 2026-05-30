# 🏥 HealthCare - Website Đặt Lịch Khám Bệnh Trực Tuyến

Hệ thống đặt lịch khám bệnh trực tuyến dành cho phòng khám, giúp bệnh nhân dễ dàng đặt lịch hẹn với bác sĩ chuyên khoa. Hệ thống hỗ trợ 3 vai trò người dùng: **Quản trị viên (Admin)**, **Bác sĩ** và **Bệnh nhân**.

## 📋 Mục Lục

- [Kiến Trúc](#-kiến-trúc)
- [Tính Năng Chính](#-tính-năng-chính)
- [Cấu Trúc Thư Mục](#-cấu-trúc-thư-mục)
- [Cơ Sở Dữ Liệu](#-cơ-sở-dữ-liệu)
- [API Endpoints](#-api-endpoints)
- [Yêu Cầu Hệ Thống](#-yêu-cầu-hệ-thống)
- [Cài Đặt](#-cài-đặt)
- [Chạy Dự Án](#-chạy-dự-án)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Tác Giả](#-tác-giả)

## 🏗 Kiến Trúc

Dự án theo mô hình **Client - Server**:

| Thành phần | Công nghệ |
|---|---|
| **Frontend** | React 19 + Vite 7 + Tailwind CSS 4 |
| **Backend** | Node.js + Express 4 + Prisma 6 ORM |
| **Database** | PostgreSQL (Supabase) |
| **Caching & OTP** | Upstash Redis |
| **Cổng thanh toán** | VNPay (HMAC-SHA512) |
| **Lưu trữ hình ảnh** | Cloudinary Cloud |
| **Gửi Email** | Nodemailer (OTP & đơn thuốc) |
| **Chống Bot Spam** | Cloudflare Turnstile |
| **Xác thực** | Dual JWT (Access & Refresh HttpOnly Cookie) |
| **Quản lý State** | Zustand + TanStack React Query |

## ✨ Tính Năng Chính

### 👤 Bệnh Nhân
- Đăng ký / Đăng nhập tài khoản
- Xem danh sách chuyên khoa và bác sĩ
- Xem chi tiết thông tin bác sĩ
- Đặt lịch khám bệnh trực tuyến
- Xem lịch sử khám bệnh
- Xem kết quả khám và đơn thuốc
- Quản lý hồ sơ cá nhân
- Xem câu hỏi thường gặp (FAQ)

### 🩺 Bác Sĩ
- Đăng nhập tài khoản bác sĩ
- Quản lý lịch làm việc (thêm ca trực)
- Xem và xử lý lịch hẹn
- Xem chi tiết lịch hẹn và kê đơn thuốc
- Xem lịch sử khám bệnh
- Quản lý hồ sơ cá nhân

### 🛡 Quản Trị Viên (Admin)
- Dashboard tổng quan hệ thống
- Thống kê chi tiết (biểu đồ, báo cáo)
- Quản lý bác sĩ (CRUD)
- Quản lý bệnh nhân
- Quản lý chuyên khoa (CRUD)
- Quản lý lịch hẹn
- Quản lý câu hỏi thường gặp (CRUD)

## 📁 Cấu Trúc Thư Mục

```
CodeDoAnTotNghiep/
├── client/                          # Frontend - React + Vite + Tailwind CSS
│   ├── public/                      # Tài nguyên tĩnh
│   ├── src/
│   │   ├── components/              # Components dùng chung
│   │   │   ├── layout/              #   Layout components
│   │   │   └── ui/                  #   UI components tái sử dụng
│   │   ├── pages/                   # Các trang chính
│   │   │   ├── admin/               #   Trang quản trị viên (20 pages)
│   │   │   ├── doctor/              #   Trang bác sĩ (7 pages)
│   │   │   └── patient/             #   Trang bệnh nhân (16 pages)
│   │   ├── services/                # Gọi API (Axios)
│   │   ├── stores/                  # Zustand stores (state management)
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── context/                 # React Context
│   │   ├── router/                  # Cấu hình routing
│   │   ├── data/                    # Dữ liệu tĩnh
│   │   └── utils/                   # Hàm tiện ích
│   ├── index.html                   # Entry HTML
│   ├── vite.config.js               # Cấu hình Vite
│   └── package.json
│
├── server/                          # Backend - Express + Prisma
│   ├── src/
│   │   ├── app.js                   # Entry point server
│   │   ├── config/                  # Cấu hình (database, env)
│   │   ├── controllers/             # Xử lý logic nghiệp vụ (11 controllers)
│   │   ├── routes/                  # Định tuyến API (12 route modules)
│   │   ├── middlewares/             # Auth, error handling, validate
│   │   ├── validators/              # Validate dữ liệu đầu vào
│   │   └── utils/                   # Hàm tiện ích
│   ├── prisma/
│   │   ├── schema.prisma            # Prisma schema (10 models)
│   │   └── seed.js                  # Dữ liệu mẫu
│   ├── doc/                         # Tài liệu API
│   ├── .env.example                 # Mẫu biến môi trường
│   └── package.json
│
├── .gitignore
└── README.md
```

## 🗄 Cơ Sở Dữ Liệu

Hệ thống sử dụng **PostgreSQL** (host trên **Supabase**) với **Prisma ORM**. Gồm **12 bảng** chính:

| Bảng (Model) | Mô tả |
|---|---|
| `TaiKhoan` | Tài khoản người dùng (email, mật khẩu, vai trò, thông tin cá nhân) |
| `ChuyenKhoa` | Chuyên khoa y tế (tên, ảnh, mô tả) |
| `BacSi` | Thông tin bác sĩ (họ tên, học vị, mô tả, giá khám) |
| `BenhNhan` | Thông tin bệnh nhân (họ tên, SĐT, email liên hệ) |
| `KhungGio` | Khung giờ khám (giờ bắt đầu, giờ kết thúc) |
| `LichLamViecBacSi` | Lịch làm việc bác sĩ (ngày, khung giờ, trạng thái) |
| `HinhThucThanhToan` | Hình thức thanh toán |
| `DatLich` | Đặt lịch khám (ngày, giờ, lý do, giá, trạng thái) |
| `GiaoDich` | Lưu vết thanh toán VNPay (loại giao dịch, số tiền, trạng thái, mã VNPay) |
| `DonThuoc` | Đơn thuốc (chẩn đoán, ghi chú, tổng tiền thuốc, liên kết với lịch khám) |
| `ChiTietDonThuoc` | Chi tiết thuốc trong đơn (tên thuốc, số lượng, đơn giá, liều dùng) |
| `CauHoiThuongGap` | Câu hỏi thường gặp (FAQ) |

### Quan hệ chính

- `TaiKhoan` ↔ `BacSi` / `BenhNhan` (1:1)
- `ChuyenKhoa` → `BacSi` (1:N)
- `BacSi` → `LichLamViecBacSi` (1:N)
- `BacSi` + `BenhNhan` → `DatLich` (N:1)
- `DatLich` ↔ `DonThuoc` (1:1)
- `DatLich` → `GiaoDich` (1:N)
- `DonThuoc` → `ChiTietDonThuoc` (1:N)

## 🔌 API Endpoints

| Module | Endpoint | Mô tả |
|---|---|---|
| Auth | `/api/auth/*` | Đăng ký, đăng nhập, thông tin tài khoản |
| Bác Sĩ | `/api/bac-si/*` | CRUD bác sĩ |
| Bệnh Nhân | `/api/benh-nhan/*` | CRUD bệnh nhân |
| Chuyên Khoa | `/api/chuyen-khoa/*` | CRUD chuyên khoa |
| Lịch Làm Việc | `/api/lich-lam-viec/*` | Quản lý lịch làm việc bác sĩ |
| Đặt Lịch | `/api/dat-lich/*` | Đặt lịch, hủy lịch, cập nhật trạng thái |
| Đơn Thuốc | `/api/don-thuoc/*` | Quản lý đơn thuốc |
| Thanh Toán | `/api/hinh-thuc-thanh-toan/*` | Hình thức thanh toán |
| FAQ | `/api/cau-hoi-thuong-gap/*` | Câu hỏi thường gặp |
| Thống Kê | `/api/thong-ke/*` | Thống kê doanh thu, lịch hẹn cho Admin |
| VNPay | `/api/vnpay/*` | Tạo link thanh toán VNPay, xử lý IPN và Return |

> 📖 Xem chi tiết hướng dẫn test API tại [`server/doc/POSTMAN_TESTING_GUIDE.md`](server/doc/POSTMAN_TESTING_GUIDE.md)

## 💻 Yêu Cầu Hệ Thống

- **Node.js** >= 18
- **npm** >= 9
- **PostgreSQL** >= 14 (hoặc tài khoản [Supabase](https://supabase.com))

## 🚀 Cài Đặt

### 1. Clone dự án

```bash
git clone <repository-url>
cd CodeDoAnTotNghiep
```

### 2. Cài đặt Server

```bash
cd server
npm install
```

Tạo file `.env` từ file mẫu:

```bash
cp .env.example .env
```

Cập nhật các biến môi trường trong `.env`:

```env
# ===== Server =====
PORT=5000
NODE_ENV=development

# ===== Database (Supabase PostgreSQL) =====
DATABASE_URL="postgresql://postgres.[YOUR_PROJECT_REF]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[YOUR_PROJECT_REF]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# ===== JWT =====
JWT_SECRET="your_super_secret_jwt_key_change_this_in_production"
JWT_EXPIRES_IN="7d"
```

### 3. Khởi tạo Database

```bash
# Đồng bộ schema lên database và seed dữ liệu mẫu
npm run setup
```

Hoặc chạy từng bước:

```bash
npm run prisma:push       # Đẩy schema lên database
npm run prisma:seed       # Seed dữ liệu mẫu
```

### 4. Cài đặt Client

```bash
cd ../client
npm install
```

## ▶ Chạy Dự Án

### Chạy Server (port 5000)

```bash
cd server
npm run dev
```

Kiểm tra server hoạt động: truy cập `http://localhost:5000/api/health`

### Chạy Client (port 5173)

```bash
cd client
npm run dev
```

Truy cập: `http://localhost:5173`

### Các lệnh hữu ích khác

```bash
# Mở Prisma Studio (GUI quản lý database)
cd server
npm run prisma:studio

# Chạy migration
npm run prisma:migrate

# Build production
cd client
npm run build
```

## 🛠 Công Nghệ Sử Dụng

### Frontend

| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| React | 19.2 | UI Framework |
| Vite | 7.3 | Build tool & Dev server |
| Tailwind CSS | 4.2 | Utility-first CSS framework |
| React Router DOM | 7.13 | Routing phía client |
| Zustand | 5.0 | State management |
| TanStack React Query | 5.90 | Server state & data fetching |
| Axios | 1.13 | HTTP client |
| React Hook Form | 7.71 | Quản lý form |
| Zod | 4.3 | Schema Validation ở phía client |
| @marsidev/react-turnstile | 1.5 | Tích hợp khiên chống bot Cloudflare Turnstile |
| React Toastify | 11.0 | Thông báo toast |

### Backend

| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| Express | 4.21 | Web framework |
| Prisma | 6.4 | ORM (Object-Relational Mapping) |
| JSON Web Token | 9.0 | Xác thực người dùng |
| bcryptjs | 2.4 | Mã hóa mật khẩu |
| Zod | 3.24 | Validate dữ liệu request đầu vào |
| vnpay | 2.5 | Tích hợp cổng thanh toán trực tuyến VNPay |
| ioredis | 5.10 | Kết nối và lưu trữ bộ nhớ đệm, OTP trên Redis |
| cloudinary | 1.41 | SDK quản lý lưu trữ hình ảnh trên Cloudinary |
| multer-storage-cloudinary | 4.0 | Engine lưu trữ Multer trực tiếp lên Cloudinary |
| nodemailer | 8.0 | Tiện ích gửi email mã OTP và đơn thuốc |
| cors | 2.8 | Cross-Origin Resource Sharing |
| dotenv | 16.4 | Quản lý biến môi trường |
| express-rate-limit | 7.5 | Giới hạn số lượng request từ một IP để chống spam/DoS |
| helmet | 8.0 | Thiết lập các HTTP Header bảo mật |
| nodemon | 3.1 | Auto-restart server khi dev |

### Database & Hosting

| Công nghệ | Mục đích |
|---|---|
| PostgreSQL | Hệ quản trị CSDL quan hệ |
| Supabase | Database hosting (cloud) |
| Upstash | Dịch vụ serverless Redis hosting |
| Cloudinary | Dịch vụ lưu trữ & tối ưu hình ảnh đám mây |

## 📝 Tác Giả

**Đồ án tốt nghiệp** - Trường Đại Học Mỏ - Địa Chất Hà Nội

---

> 📌 *Dự án được xây dựng phục vụ cho đồ án tốt nghiệp ngành Công nghệ thông tin.*
