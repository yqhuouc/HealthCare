# Server - API Đặt lịch Khám bệnh Trực tuyến

Backend REST API cho hệ thống đặt lịch khám bệnh trực tuyến.

## Tech Stack

| Công nghệ | Mục đích |
|------------|----------|
| **Node.js** | Runtime |
| **Express 4** | Web framework |
| **Prisma 6** | ORM |
| **PostgreSQL** (Supabase) | Database |
| **Zod** | Validate dữ liệu đầu vào |
| **JWT** (Dual Token) | Xác thực (Access Token + Refresh Token HttpOnly Cookie) |
| **bcryptjs** | Mã hóa mật khẩu |
| **Helmet** | Bảo vệ HTTP headers |
| **express-rate-limit** | Giới hạn request |
| **cookie-parser** | Parse cookie |
| **Nodemon** | Auto-restart khi dev |

## Cài đặt

```bash
# 1. Cài dependencies
npm install

# 2. Tạo file .env từ mẫu
cp .env.example .env
# Sửa lại DATABASE_URL, DIRECT_URL, JWT secrets trong .env

# 3. Tạo Prisma Client
npx prisma generate

# 4. Đẩy schema lên database
npx prisma db push

# 5. Seed dữ liệu mẫu
npm run prisma:seed

# 6. Chạy server
npm run dev
```

Server chạy tại `http://localhost:5000`.

## Biến môi trường (.env)

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://..."       # Connection pooling (Supabase)
DIRECT_URL="postgresql://..."         # Direct connection (cho Prisma Migrate)
JWT_ACCESS_SECRET=...                 # Secret cho Access Token
JWT_REFRESH_SECRET=...                # Secret cho Refresh Token
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
CLIENT_URL=http://localhost:5173
```

## Scripts

| Script | Lệnh | Mô tả |
|--------|-------|-------|
| `npm run dev` | `nodemon src/app.js` | Chạy dev (auto-restart) |
| `npm start` | `node src/app.js` | Chạy production |
| `npm run prisma:generate` | `prisma generate` | Tạo Prisma Client |
| `npm run prisma:push` | `prisma db push` | Đẩy schema lên DB |
| `npm run prisma:seed` | `node prisma/seed.js` | Seed dữ liệu mẫu |
| `npm run prisma:studio` | `prisma studio` | Mở GUI quản lý DB |
| `npm run setup` | push + seed | Setup nhanh |

## Tài khoản mẫu (sau khi seed)

| Vai trò | Email | Mật khẩu |
|---------|-------|-----------|
| Admin | admin@clinic.vn | admin123 |
| Bác sĩ | bacsi1@clinic.vn | doctor123 |
| Bệnh nhân | benhnhan@gmail.com | patient123 |

## Cấu trúc thư mục

```
server/
├── prisma/
│   ├── schema.prisma          # 11 model database
│   └── seed.js                # Dữ liệu mẫu
├── src/
│   ├── app.js                 # Entry point
│   ├── config/                # Biến môi trường
│   ├── utils/                 # Prisma singleton, response helper
│   ├── middlewares/            # Auth (JWT), validate (Zod), error handler
│   ├── validations/           # Zod schemas
│   ├── controllers/           # Điều phối request/response
│   ├── services/              # Logic nghiệp vụ
│   └── routes/                # Định tuyến API
└── doc/                       # Tài liệu chi tiết
```

## API Endpoints (52 endpoints)

| Module | Prefix | Endpoints | Quyền |
|--------|--------|-----------|-------|
| Health | `/api/health` | 1 | Public |
| Auth | `/api/auth` | 7 | Public / JWT |
| Chuyên khoa | `/api/chuyen-khoa` | 5 | Public / Admin |
| Bác sĩ | `/api/bac-si` | 5 | Public / Admin |
| Bệnh nhân | `/api/benh-nhan` | 4 | Admin / JWT |
| Đặt lịch | `/api/dat-lich` | 7 | JWT / Admin+BS |
| Lịch làm việc | `/api/lich-lam-viec` | 7 | Public / Admin+BS |
| Đơn thuốc | `/api/don-thuoc` | 4 | BS / Admin |
| FAQ | `/api/cau-hoi-thuong-gap` | 6 | Public / Admin |
| Hình thức TT | `/api/hinh-thuc-thanh-toan` | 3 | Public / Admin |
| Thống kê | `/api/thong-ke` | 2 | Admin |

## Tài liệu chi tiết

- [`doc/BACKEND_OVERVIEW.md`](doc/BACKEND_OVERVIEW.md) - Tổng quan kiến trúc, schema, phân quyền
- [`doc/FUNCTION_FLOW.md`](doc/FUNCTION_FLOW.md) - Luồng xử lý từng chức năng
- [`doc/POSTMAN_TESTING_GUIDE.md`](doc/POSTMAN_TESTING_GUIDE.md) - Hướng dẫn test API bằng Postman
