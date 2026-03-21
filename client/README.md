# Client - Website Đặt lịch Khám bệnh Trực tuyến

Frontend SPA cho hệ thống đặt lịch khám bệnh trực tuyến.

## Tech Stack

| Công nghệ | Mục đích |
|------------|----------|
| **React 19** | UI library |
| **Vite 7** | Build tool + dev server |
| **Tailwind CSS 4** | Utility-first CSS framework |
| **React Router 7** | Routing (SPA) |
| **Zustand 5** | State management (auth store) |
| **TanStack Query 5** | Server state management, caching |
| **Axios** | HTTP client (gọi API) |
| **React Hook Form 7** | Form handling + validation |
| **React Toastify** | Toast notifications |
| **ESLint 9** | Linter |

## Cài đặt

```bash
# 1. Cài dependencies
npm install

# 2. Chạy dev server
npm run dev
```

Dev server chạy tại `http://localhost:3000`.

API requests tự động proxy sang `http://localhost:5000` (cần chạy server trước).

## Scripts

| Script | Mô tả |
|--------|-------|
| `npm run dev` | Chạy dev server (port 3000) |
| `npm run build` | Build production |
| `npm run preview` | Preview bản build |
| `npm run lint` | Kiểm tra linting |

## Cấu trúc thư mục

```
client/
├── public/                    # Static assets
├── src/
│   ├── main.jsx               # Entry point
│   ├── App.jsx                # Root component + Router
│   ├── index.css              # Global styles (Tailwind)
│   ├── components/
│   │   └── layout/            # Layout components
│   │       ├── Header.jsx
│   │       ├── Footer.jsx
│   │       ├── AdminLayout.jsx
│   │       └── DoctorLayout.jsx
│   ├── pages/
│   │   ├── patient/           # 13 trang bệnh nhân
│   │   ├── doctor/            # 8 trang bác sĩ
│   │   └── admin/             # 10 trang admin
│   ├── services/              # API services (axios)
│   │   ├── api.js             # Axios instance + interceptors
│   │   ├── authService.js
│   │   ├── doctorService.js
│   │   └── appointmentService.js
│   ├── stores/
│   │   └── useAuthStore.js    # Zustand auth store
│   ├── router/
│   │   └── index.js           # Route definitions
│   └── data/                  # Mock data (dev)
├── index.html
├── vite.config.js
├── eslint.config.js
└── package.json
```

## Các trang chính

### Bệnh nhân (Public / JWT)
| Trang | Route | Mô tả |
|-------|-------|-------|
| Trang chủ | `/` | Landing page |
| Đăng nhập | `/login` | Đăng nhập bệnh nhân |
| Đăng ký | `/register` | Đăng ký tài khoản |
| Danh sách chuyên khoa | `/specialties` | Xem chuyên khoa |
| Chi tiết chuyên khoa | `/specialties/:id` | Bác sĩ theo chuyên khoa |
| Danh sách bác sĩ | `/doctors` | Tìm kiếm bác sĩ |
| Chi tiết bác sĩ | `/doctors/:id` | Thông tin bác sĩ |
| Đặt lịch | `/booking/:doctorId` | Đặt lịch khám |
| Lịch sử lịch hẹn | `/appointments` | Xem lịch hẹn đã đặt |
| Kết quả khám | `/medical-result` | Đơn thuốc / kết quả |
| Hồ sơ cá nhân | `/profile` | Cập nhật thông tin |
| FAQ | `/faq` | Câu hỏi thường gặp |

### Bác sĩ (`/doctor`)
| Trang | Route | Mô tả |
|-------|-------|-------|
| Dashboard | `/doctor` | Tổng quan |
| Đăng nhập | `/doctor/login` | Đăng nhập bác sĩ |
| Lịch hẹn | `/doctor/appointments` | Danh sách lịch hẹn |
| Chi tiết lịch hẹn | `/doctor/appointments/:id` | Xem + kê đơn thuốc |
| Lịch làm việc | `/doctor/schedule` | Quản lý lịch làm việc |
| Thêm ca | `/doctor/schedule/add` | Đăng ký ca khám |
| Lịch sử | `/doctor/history` | Lịch sử khám bệnh |
| Hồ sơ | `/doctor/profile` | Thông tin cá nhân |

### Admin (`/admin`)
| Trang | Route | Mô tả |
|-------|-------|-------|
| Dashboard | `/admin` | Thống kê tổng quan |
| Chuyên khoa | `/admin/specialties` | CRUD chuyên khoa |
| Bác sĩ | `/admin/doctors` | CRUD bác sĩ |
| Bệnh nhân | `/admin/patients` | Quản lý bệnh nhân |
| Lịch hẹn | `/admin/appointments` | Quản lý lịch hẹn |
| FAQ | `/admin/faqs` | CRUD câu hỏi thường gặp |
| Thống kê | `/admin/stats` | Biểu đồ thống kê |
