# BÁO CÁO CƠ SỞ DỮ LIỆU VÀ HỆ THỐNG API CHI TIẾT (FULL)

Tài liệu này cung cấp danh mục toàn bộ các bảng dữ liệu (kèm trường chi tiết), danh sách đầy đủ các API, cấu trúc thư mục và công nghệ sử dụng trong hệ thống HealthCare.

---

## 1. Công nghệ Sử dụng (Tech Stack)

Hệ thống được xây dựng trên nền tảng công nghệ hiện đại, đảm bảo tính bảo mật, hiệu năng và khả năng mở rộng.

### 1.1. Backend (Server-side)
- **Runtime**: Node.js (v20+)
- **Framework**: Express.js
- **ORM (Object-Relational Mapping)**: Prisma (v6.4.1)
- **Database**: PostgreSQL (Phân tích dữ liệu quan hệ)
- **Xác thực (Auth)**: JSON Web Token (JWT) & Bcryptjs (Hash mật khẩu)
- **Lưu trữ hình ảnh**: Cloudinary (Tích hợp qua Multer)
- **Thanh toán trực tuyến**: VNPay (Môi trường Sandbox)
- **Kiểm định dữ liệu (Validation)**: Zod
- **Xử lý thời gian**: Dayjs
- **Hệ thống Caching**: Redis (Upstash) - Tối ưu tốc độ phản hồi API và giảm tải Database.
- **Bảo mật**: Helmet (Security Headers), CORS, Express Rate Limit.

### 1.2. Frontend (Client-side)
- **Library**: React.js (v19)
- **Build Tool**: Vite (Cực nhanh cho môi trường phát triển)
- **Styling**: Tailwind CSS (Thiết kế Modern & Responsive)
- **Quản lý State toàn cục**: Zustand
- **Quản lý dữ liệu Server (Caching/Fetching)**: TanStack Query (React Query)
- **Điều hướng (Routing)**: React Router DOM (v7)
- **Xử lý Form**: React Hook Form kết hợp Zod.
- **Giao tiếp API**: Axios.
- **Thông báo (UI)**: React Toastify.

---

## 2. Cấu trúc Thư mục Dự án (Project Structure)

Dự án được phân cấp rõ ràng theo mô hình Layered Architecture:

```text
CodeDoAnTotNghiep/
├── client/                     # Mã nguồn Frontend (React)
│   ├── src/
│   │   ├── components/         # Các thành phần giao diện dùng chung
│   │   ├── hooks/              # Custom Hooks (Logic React Query)
│   │   ├── pages/              # Các trang giao diện chính (Admin, Doctor, Patient)
│   │   ├── services/           # Tầng gọi API kết nối Server
│   │   ├── stores/             # Quản lý trạng thái bằng Zustand
│   │   ├── utils/              # Các hàm bổ trợ (Format tiền, ngày tháng)
│   │   ├── validations/        # Schema kiểm tra dữ liệu Form
│   │   ├── App.jsx             # File điều phối chính
│   │   └── main.jsx            # Điểm khởi đầu ứng dụng
│   └── package.json            # Thư viện & Scripts Frontend
├── server/                     # Mã nguồn Backend (Node.js)
│   ├── prisma/                 # Cấu hình Database & Schema
│   │   └── schema.prisma       # File định nghĩa 12 bảng dữ liệu
│   ├── src/
│   │   ├── config/             # Cấu hình Env, Cloudinary, VNPay
│   │   ├── controllers/        # Tiếp nhận request & điều hướng
│   │   ├── middlewares/        # Authenticate, Authorize, xử lý lỗi
│   │   ├── routes/             # Định nghĩa 58 đầu cuối API
│   │   ├── services/           # Logic nghiệp vụ tập trung (quan trọng nhất)
│   │   ├── validations/        # Kiểm tra tính hợp lệ của dữ liệu API
│   │   └── app.js              # Khởi tạo Server Express
│   └── package.json            # Thư viện & Scripts Backend
└── README.md                   # Hướng dẫn cài đặt dự án
```

---

## 3. Chi tiết Cơ sở dữ liệu (PostgreSQL - 12 Bảng)

### 3.1. Bảng `TaiKhoan` (Quản lý người dùng)
- **id**: BigInt (Khóa chính - Tự tăng)
- **email**: String (Duy nhất - Dùng để đăng nhập)
- **matKhau**: String (Đã mã hóa Bcrypt)
- **refreshToken**: String (Dùng để duy trì phiên đăng nhập)
- **vaiTro**: String (admin, bac_si, benh_nhan)
- **trangThaiTaiKhoan**: Int (1: Hoạt động, 0: Khóa)
- **ngayTao**: DateTime (Mặc định: now)
- **ngayCapNhat**: DateTime (Tự động cập nhật)
- **gioiTinh**: Int (0: Nữ, 1: Nam, 2: Khác)
- **ngaySinh**: Date (Ngày tháng năm sinh)
- **diaChi**: String (Địa chỉ cư trú)
- **anhDaiDien**: String (URL ảnh từ Cloudinary)

### 3.2. Bảng `BacSi` (Thông tin bác sĩ)
- **id**: BigInt (Khóa chính)
- **hocViChucDanh**: String (Thạc sĩ, Tiến sĩ, PGS...)
- **tenBacSi**: String (Họ và tên bác sĩ)
- **moTaNgan**: String (Tóm tắt tiểu sử)
- **moTaChiTiet**: Text (Kinh nghiệm, quá trình công tác)
- **giaKham**: Decimal (Giá tiền một lần khám)
- **taiKhoanId**: BigInt (Khóa ngoại - Liên kết `TaiKhoan`)
- **chuyenKhoaId**: BigInt (Khóa ngoại - Liên kết `ChuyenKhoa`)

### 3.3. Bảng `BenhNhan` (Thông tin bệnh nhân)
- **id**: BigInt (Khóa chính)
- **hoTen**: String (Họ tên đầy đủ)
- **soDienThoai**: String (Số điện thoại liên lạc)
- **emailLienHe**: String (Email nhận thông báo lịch hẹn)
- **taiKhoanId**: BigInt (Khóa ngoại - Liên kết `TaiKhoan`)

### 3.4. Bảng `ChuyenKhoa` (Danh mục chuyên khoa)
- **id**: BigInt (Khóa chính)
- **tenChuyenKhoa**: String (Tên chuyên khoa)
- **anhChuyenKhoa**: String (Ảnh đại diện chuyên khoa)
- **moTaChuyenKhoa**: Text (Giới thiệu chuyên khoa)
- **thoiLuongKham**: Int (Mặc định 20 phút/ca)
- **icon**: String (Tên icon hiển thị)

### 3.5. Bảng `DatLich` (Quản lý lịch hẹn)
- **id**: BigInt (Khóa chính)
- **ngayDat**: Date (Ngày khám)
- **gioBatDau / gioKetThuc**: Time (Khung giờ khám)
- **lyDoKham**: String (Bệnh nhân mô tả triệu chứng)
- **giaKham**: Decimal (Giá tại thời điểm đặt)
- **trangThai**: Int (0: Chờ khám, 1: Đã khám, 2: Đã hủy)
- **trangThaiThanhToan**: Int (0: Chưa, 1: Đã thanh toán)
- **bacSiId / benhNhanId**: BigInt (Khóa ngoại)
- **hinhThucThanhToanId**: BigInt (Khóa ngoại)
- **lichLamViecId**: BigInt (Khóa ngoại)

### 3.6. Bảng `LichLamViecBacSi` (Lịch trực bác sĩ)
- **id**: BigInt (Khóa chính)
- **ngayLamViec**: Date (Ngày bác sĩ trực)
- **soBenhNhanHienTai**: Int (Số người đã đặt)
- **soBenhNhanToiDa**: Int (Giới hạn tối đa/ca)
- **sanSang**: Int (1: Cho phép đặt, 0: Tạm dừng)
- **bacSiId / khungGioId**: BigInt (Khóa ngoại)

### 3.7. Bảng `KhungGio` (Danh mục giờ khám)
- **id**: BigInt (Khóa chính)
- **gioBatDau / gioKetThuc**: Time (Ví dụ: 08:00 - 08:30)

### 3.8. Bảng `DonThuoc` (Kết quả khám bệnh)
- **id**: BigInt (Khóa chính)
- **datLichId**: BigInt (Khóa ngoại - Một lịch hẹn có một đơn thuốc)
- **ngayTao**: DateTime (Mặc định: now)
- **chanDoan**: Text (Kết luận của bác sĩ)
- **ghiChu**: Text (Lời dặn dò)
- **tongTien**: Decimal (Tổng tiền thuốc trong đơn)

### 3.9. Bảng `ChiTietDonThuoc` (Danh sách thuốc)
- **id**: BigInt (Khóa chính)
- **donThuocId**: BigInt (Khóa ngoại)
- **tenThuoc**: String
- **soLuong**: Int
- **donGia**: Decimal
- **lieuDung**: String (Ví dụ: Sáng 1 vên, chiều 1 viên)
- **ghiChu**: String (Uống sau ăn...)

### 3.10. Bảng `GiaoDich` (Lịch sử thanh toán)
- **id**: BigInt (Khóa chính)
- **datLichId**: BigInt (Khóa ngoại)
- **loaiGiaoDich**: String (PHI_KHAM hoặc DON_THUOC)
- **soTien**: Decimal
- **maGiaoDichVNP**: String (Mã từ VNPay)
- **maThamChieu**: String (Mã định danh duy nhất của hệ thống)
- **trangThai**: Int (0: Chờ, 1: Thành công, 2: Thất bại)
- **ngayTao**: DateTime (Thời gian tạo giao dịch)
- **ngayCapNhat**: DateTime (Thời gian cập nhật cuối)

### 3.11. Bảng `HinhThucThanhToan` (Phương thức thanh toán)
- **id**: BigInt (Khóa chính)
- **tenHinhThuc**: String (Ví dụ: Tiền mặt, VNPay)
- **maLoai**: String (Mã code: OFFLINE, VNPAY...)

### 3.12. Bảng `CauHoiThuongGap` (Quản lý FAQ)
- **id**: BigInt (Khóa chính)
- **cauHoi**: String (Nội dung câu hỏi)
- **traLoi**: Text (Nội dung trả lời)
- **dangHoatDong**: Int (1: Hiển thị, 0: Ẩn)

---

## 4. Danh mục đầy đủ Endpoints API (Toàn dự án)

### 4.1. Module Xác thực (`/api/auth`)
1.  `POST /register`: Đăng ký tài khoản bệnh nhân.
2.  `POST /login`: Đăng nhập, trả về Tokens.
3.  `POST /refresh`: Làm mới Access Token.
4.  `POST /logout`: Đăng xuất hệ thống.
5.  `GET /me`: Lấy thông tin tài khoản hiện tại.
6.  `PUT /doi-mat-khau`: Đổi mật khẩu người dùng.
7.  `PUT /cap-nhat-ho-so`: Cập nhật thông tin cá nhân.
8.  `PUT /cap-nhat-avatar`: Tải ảnh đại diện.

### 4.2. Module Bác sĩ (`/api/bac-si`)
9.  `GET /`: Danh sách bác sĩ.
10. `GET /:id`: Hồ sơ chi tiết bác sĩ.
11. `POST /`: (Admin) Thêm bác sĩ.
12. `PUT /:id`: (Admin) Cập nhật bác sĩ.
13. `DELETE /:id`: (Admin) Xóa bác sĩ.

### 4.3. Module Bệnh nhân (`/api/benh-nhan`)
14. `GET /`: (Admin) Danh sách bệnh nhân.
15. `GET /:id`: Chi tiết bệnh nhân.
16. `PUT /:id`: Cập nhật bệnh nhân.
17. `DELETE /:id`: (Admin) Xóa bệnh nhân.

### 4.4. Module Chuyên khoa (`/api/chuyen-khoa`)
18. `GET /`: Danh sách chuyên khoa.
19. `GET /:id`: Chi tiết chuyên khoa.
20. `POST /`: (Admin) Thêm chuyên khoa.
21. `PUT /:id`: (Admin) Sửa chuyên khoa.
22. `DELETE /:id`: (Admin) Xóa chuyên khoa.
23. `PUT /:id/upload-anh`: Tải ảnh chuyên khoa.

### 4.5. Module Đặt lịch (`/api/dat-lich`)
24. `GET /slot-trong`: Tìm khung giờ trống.
25. `GET /`: (Admin) Toàn bộ lịch hẹn.
26. `GET /benh-nhan/:id`: Lịch sử bệnh nhân.
27. `GET /bac-si/:id`: Lịch khám của bác sĩ.
28. `GET /:id`: Chi tiết lịch hẹn.
29. `POST /`: Tạo lịch hẹn mới.
30. `PUT /:id/trang-thai`: Cập nhật Trạng thái khám.
31. `PUT /:id/thanh-toan`: Cập nhật Trạng thái thanh toán.
32. `DELETE /:id`: Xóa lịch hẹn.
33. `PATCH /:id/payment-method`: Đổi phương thức thanh toán.

### 4.6. Module Đơn thuôc (`/api/don-thuoc`)
34. `GET /`: Danh sách đơn thuốc.
35. `GET /:id`: Chi tiết đơn thuốc.
36. `POST /`: Tạo đơn thuốc mới (Bác sĩ).
37. `PUT /:id`: Sửa đơn thuốc.
38. `DELETE /:id`: Xóa đơn thuốc.

### 4.7. Module Lịch làm việc (`/api/lich-lam-viec`)
39. `GET /khung-gio`: Danh mục khung giờ.
40. `POST /khung-gio`: Thêm khung giờ.
41. `DELETE /khung-gio/:id`: Xóa khung giờ.
42. `GET /`: Xem lịch trực bác sĩ.
43. `POST /`: Đăng ký lịch trực.
44. `PUT /:id`: Sửa lịch trực.
45. `DELETE /:id`: Hủy lịch trực.

### 4.8. Module Thống kê (`/api/thong-ke`)
46. `GET /tong-quan`: Chỉ số dashboard Admin.
47. `GET /lich-hen`: Thống kê lịch hẹn.
48. `GET /doanh-thu`: Thống kê doanh thu.

### 4.9. Module Thanh toán VNPay (`/api/vnpay`)
49. `POST /create-payment`: Tạo yêu cầu thanh toán.
50. `GET /return`: Nhận kết quả từ VNPay.
51. `GET /ipn`: Nhận thông báo tự động.
52. `POST /verify`: Xác thực giao dịch.

### 4.10. Module Câu hỏi (`/api/cau-hoi-thuong-gap`)
53. `GET /`: Danh sách FAQ công khai.
54. `GET /all`: Admin quản lý FAQ.
55. `GET /:id`: Chi tiết câu hỏi.
56. `POST /`: Thêm FAQ.
57. `PUT /:id`: Sửa FAQ.
58. `DELETE /:id`: Xóa FAQ.

---

## 5. Các Kỹ thuật Tối ưu & Bảo mật Nâng cao

Hệ thống được tích hợp các giải pháp hiện đại để đảm bảo trải nghiệm người dùng mượt mà và an toàn:

### 5.1. Redis Caching (Upstash)
*   **Chiến lược**: Cache-aside (Lazy loading).
*   **Đối tượng áp dụng**:
    *   **Dữ liệu tĩnh**: Chuyên khoa, câu hỏi thường gặp (TTL 1h).
    *   **Dữ liệu động**: Danh sách bác sĩ, slot khám trống (TTL 5-15p).
    *   **Dữ liệu Dashboard**: Các chỉ số doanh thu, thống kê (Cập nhật sau mỗi giao dịch/đăng ký).
*   **Hiệu năng**: Giảm thời gian phản hồi API từ ~200-500ms xuống còn < 10ms đối với dữ liệu đã được cache.

### 5.2. Bảo mật & Xác thực OTP (Đã triển khai)
*   **Quên mật khẩu bằng OTP kết hợp Redis**: Nâng cấp luồng quên mật khẩu từ Link-based (JWT) sang Redis-backed OTP cục bộ.
    *   Mã OTP 6 số sinh tự động và gửi qua email chuyên nghiệp.
    *   Bảo vệ mã OTP bằng Redis với thời gian sống (TTL) giới hạn chặt chẽ trong vòng 5 phút (300 giây). Hủy bỏ mã ngay sau khi đổi thành công.
*   Thêm lớp bảo vệ Cloudflare Turnstile cho các form quan trọng (Sắp triển khai Phase 4).

---

*Hết tài liệu tổng thể cập nhật đầy đủ nhất cho báo cáo tiến độ dự án.*
