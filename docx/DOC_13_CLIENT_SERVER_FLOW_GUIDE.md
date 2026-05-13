# Tài liệu luồng hoạt động Client -> Server

> Tài liệu này mô tả chi tiết cách request đi qua hệ thống từ frontend đến backend/database, và liệt kê đầy đủ các chức năng hiện có kèm flow xử lý.
>  
> Tài liệu này bổ sung cho `DOC_05_TESTING_GUIDE.md` (test endpoint bằng Postman), tập trung vào **logic chạy bên trong hệ thống**.

---

## 1. Mục tiêu tài liệu

- Hiểu tổng quan kiến trúc `client` và `server`.
- Hiểu luồng chuẩn của một request từ UI tới DB và trả ngược về UI.
- Nắm rõ tất cả module/chức năng đang có trong hệ thống.
- Mỗi chức năng đều có flow: route -> middleware -> controller -> service -> database/cache -> response.

---

## 2. Kiến trúc tổng quan

### 2.1 Thành phần chính

- **Frontend (`client/`)**: React + Vite, gọi API qua Axios (`client/src/services/api.js`).
- **Backend (`server/`)**: Express, mount API dưới `/api` (`server/src/app.js`, `server/src/routes/index.js`).
- **Database**: PostgreSQL qua Prisma (`server/prisma/schema.prisma`).
- **Cache**: Redis (`server/src/utils/redis.util.js`).
- **Upload ảnh**: Multer + Cloudinary (`server/src/config/cloudinary.config.js`).
- **Email OTP**: Nodemailer (`server/src/utils/email.util.js`).
- **Thanh toán online**: VNPay (`server/src/services/vnpay.service.js`).

### 2.2 Sơ đồ luồng tổng quát

1. Người dùng thao tác trên giao diện React.
2. Frontend gọi hàm trong `client/src/services/*.js`.
3. Hàm service dùng Axios instance `api` (`baseURL=/api`, `withCredentials=true`).
4. Request đi vào Express app (`server/src/app.js`), qua middleware toàn cục (`helmet`, `rate-limit`, `cors`, parser, cookie-parser).
5. Router gốc `server/src/routes/index.js` định tuyến sang module tương ứng.
6. Route module chạy middleware theo endpoint (`authenticate`, `authorize`, `validate`, upload...).
7. Controller nhận request, gọi service nghiệp vụ.
8. Service xử lý logic + truy vấn Prisma/Redis/tích hợp ngoài.
9. Controller trả JSON chuẩn hóa về client.
10. Frontend nhận dữ liệu, cập nhật state/UI.

---

## 3. Luồng kỹ thuật chung cần nắm

### 3.1 Luồng xác thực JWT Cookie

- Hệ thống dùng **Access Token + Refresh Token** trong **HttpOnly Cookie**.
- Frontend **không lưu token** ở localStorage/sessionStorage.
- Khi access token hết hạn:
  - API trả `401`.
  - Axios interceptor tự gọi `POST /api/auth/refresh`.
  - Server cấp lại cookie token mới.
  - Request cũ tự retry.

File chính:
- `client/src/services/api.js`
- `server/src/routes/auth.routes.js`
- `server/src/controllers/auth.controller.js`
- `server/src/services/auth.service.js`
- `server/src/middlewares/auth.middleware.js`

### 3.2 Luồng middleware backend

Theo thứ tự phổ biến:

1. `authenticate` (đọc/verify access token, nạp user).
2. `authorize(...roles)` (kiểm tra vai trò: `admin`, `bac_si`, `benh_nhan`).
3. `validate(schema)` (kiểm tra dữ liệu đầu vào bằng Zod).
4. Middleware chuyên biệt (upload file, turnstile, ...).
5. Controller -> Service.

### 3.3 Luồng lỗi chuẩn

- Lỗi nghiệp vụ trong service/controller sẽ đi về `errorHandler`.
- Route không tồn tại đi về `notFoundHandler`.
- Kết quả trả JSON thống nhất để frontend hiển thị thông báo.

---

## 4. Danh sách toàn bộ chức năng hiện có

Từ router gốc `server/src/routes/index.js`, hệ thống đang có các module:

1. `auth`
2. `chuyen-khoa`
3. `bac-si`
4. `benh-nhan`
5. `dat-lich`
6. `lich-lam-viec`
7. `don-thuoc`
8. `cau-hoi-thuong-gap`
9. `hinh-thuc-thanh-toan`
10. `thong-ke`
11. `vnpay`

---

## 5. Flow chi tiết theo từng chức năng

## 5.1 Auth

### Endpoint tiêu biểu

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PUT /api/auth/doi-mat-khau`
- `PUT /api/auth/cap-nhat-ho-so`
- `PUT /api/auth/cap-nhat-avatar`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Flow nghiệp vụ

1. Client gọi `authService`.
2. Route chạy `validate` (và `verifyTurnstile` cho login/register/forgot nếu cấu hình).
3. `auth.controller` gọi `auth.service`.
4. Service kiểm tra user/mật khẩu/hash token.
5. Login thành công -> server set cookie `accessToken` + `refreshToken`.
6. Refresh token -> verify token + so khớp hash refresh token trong DB -> cấp lại token mới.
7. Forgot/reset password -> tạo OTP, lưu Redis (TTL), gửi email qua Nodemailer.

---

## 5.2 Chuyên khoa (`chuyen-khoa`)

### Endpoint tiêu biểu

- Public: `GET /api/chuyen-khoa`, `GET /api/chuyen-khoa/:id`
- Admin: `POST /api/chuyen-khoa`, `PUT /api/chuyen-khoa/:id`, `DELETE /api/chuyen-khoa/:id`
- Upload ảnh: `PUT /api/chuyen-khoa/:id/upload-anh`

### Flow nghiệp vụ

1. Client gọi `specialtyService`.
2. Request vào `chuyenKhoa.routes` (public hoặc admin theo endpoint).
3. Endpoint admin qua `authenticate` + `authorize("admin")`.
4. Service đọc/ghi Prisma bảng chuyên khoa.
5. Danh sách public có thể lấy từ Redis cache.
6. Khi CRUD thành công sẽ xóa/refresh cache liên quan.
7. Upload ảnh đi qua multer + Cloudinary, trả URL ảnh mới.

---

## 5.3 Bác sĩ (`bac-si`)

### Endpoint tiêu biểu

- Public: `GET /api/bac-si`, `GET /api/bac-si/:id`
- Admin: `POST /api/bac-si`, `PUT /api/bac-si/:id`, `DELETE /api/bac-si/:id`

### Flow nghiệp vụ

1. Client gọi `doctorService`.
2. Route phân tách public/admin.
3. Service xử lý lọc, phân trang, join dữ liệu chuyên khoa/lịch làm việc.
4. Một số API danh sách dùng cache Redis.
5. Tạo/sửa/xóa bác sĩ làm việc qua Prisma transaction để đảm bảo dữ liệu nhất quán.

---

## 5.4 Bệnh nhân (`benh-nhan`)

### Endpoint tiêu biểu

- `GET /api/benh-nhan` (admin)
- `GET /api/benh-nhan/:id`
- `PUT /api/benh-nhan/:id`
- `DELETE /api/benh-nhan/:id` (admin)

### Flow nghiệp vụ

1. Client gọi `patientService`.
2. Route qua `authenticate`, tùy endpoint có `authorize`.
3. Service kiểm tra quyền truy cập dữ liệu (admin hoặc chủ tài khoản).
4. Truy vấn/cập nhật Prisma bảng bệnh nhân và thông tin tài khoản liên quan.

---

## 5.5 Đặt lịch (`dat-lich`)

### Endpoint tiêu biểu

- `GET /api/dat-lich/slot-trong`
- `GET /api/dat-lich`
- `GET /api/dat-lich/:id`
- `GET /api/dat-lich/benh-nhan/:id`
- `GET /api/dat-lich/bac-si/:id`
- `POST /api/dat-lich`
- `PUT /api/dat-lich/:id/trang-thai`
- `PUT /api/dat-lich/:id/thanh-toan`
- `PATCH /api/dat-lich/:id/payment-method`
- `DELETE /api/dat-lich/:id`

### Flow nghiệp vụ

1. Client gọi `appointmentService`.
2. Route kiểm tra auth + validate dữ liệu.
3. Service kiểm tra bác sĩ, bệnh nhân, lịch làm việc, khung giờ, trạng thái ca.
4. Khi tạo lịch: transaction tạo bản ghi đặt lịch + tăng số bệnh nhân hiện tại của ca.
5. Khi hủy/chuyển trạng thái: transaction trả slot hoặc khóa slot theo quy tắc nghiệp vụ.
6. Danh sách lịch theo bác sĩ/bệnh nhân có kiểm soát ownership theo role.
7. Một số dữ liệu slot/lịch có dùng cache Redis để tăng tốc.

---

## 5.6 Lịch làm việc (`lich-lam-viec`)

### Endpoint tiêu biểu

- Khung giờ:
  - `GET /api/lich-lam-viec/khung-gio`
  - `POST /api/lich-lam-viec/khung-gio`
  - `DELETE /api/lich-lam-viec/khung-gio/:id`
- Lịch làm việc:
  - `GET /api/lich-lam-viec`
  - `POST /api/lich-lam-viec`
  - `PUT /api/lich-lam-viec/:id`
  - `DELETE /api/lich-lam-viec/:id`

### Flow nghiệp vụ

1. Client gọi `scheduleService`.
2. Admin quản lý danh mục khung giờ chuẩn.
3. Tạo/sửa lịch bác sĩ có kiểm tra trùng, quyền, và tính hợp lệ theo ngày/khung giờ.
4. Khi thay đổi lịch sẽ clear cache slot trống liên quan.

---

## 5.7 Đơn thuốc (`don-thuoc`)

### Endpoint tiêu biểu

- `GET /api/don-thuoc`
- `GET /api/don-thuoc/:id`
- `POST /api/don-thuoc`
- `PUT /api/don-thuoc/:id`
- `DELETE /api/don-thuoc/:id`

### Flow nghiệp vụ

1. Client gọi `prescriptionService`.
2. Route kiểm tra auth + role (thường bác sĩ/admin).
3. Service xử lý bản ghi đơn thuốc và chi tiết thuốc.
4. Có liên hệ nghiệp vụ với lịch hẹn/thanh toán khi cần đồng bộ trạng thái.

---

## 5.8 FAQ (`cau-hoi-thuong-gap`)

### Endpoint tiêu biểu

- Public: `GET /api/cau-hoi-thuong-gap`
- Admin: `GET /api/cau-hoi-thuong-gap/all`, `POST`, `PUT /:id`, `DELETE /:id`

### Flow nghiệp vụ

1. Client gọi `faqService`.
2. Public lấy danh sách FAQ active (ưu tiên cache).
3. Admin CRUD qua middleware auth + authorize.
4. CRUD thành công sẽ clear cache FAQ.

---

## 5.9 Hình thức thanh toán (`hinh-thuc-thanh-toan`)

### Endpoint tiêu biểu

- `GET /api/hinh-thuc-thanh-toan`
- `POST /api/hinh-thuc-thanh-toan`
- `DELETE /api/hinh-thuc-thanh-toan/:id`

### Flow nghiệp vụ

1. Client gọi `paymentService` (phần danh mục thanh toán).
2. Danh mục lấy nhanh qua Redis cache.
3. Admin thêm/xóa phương thức thanh toán -> DB cập nhật -> clear cache.

---

## 5.10 Thống kê (`thong-ke`)

### Endpoint tiêu biểu

- `GET /api/thong-ke/tong-quan`
- `GET /api/thong-ke/lich-hen`
- `GET /api/thong-ke/doanh-thu`

### Flow nghiệp vụ

1. Client admin gọi `adminStatsService`.
2. Route bắt buộc `authenticate` + `authorize("admin")`.
3. Service tổng hợp dữ liệu từ nhiều bảng (đặt lịch, đơn thuốc, tài khoản...).
4. Dashboard tổng quan có cache Redis để giảm tải truy vấn nặng.
5. Khi module nghiệp vụ thay đổi dữ liệu quan trọng, cache thống kê sẽ bị invalidate.

---

## 5.11 Thanh toán VNPay (`vnpay`)

### Endpoint tiêu biểu

- `POST /api/vnpay/create-payment`
- `GET /api/vnpay/return`
- `GET /api/vnpay/ipn`
- `POST /api/vnpay/verify`

### Flow nghiệp vụ

1. Client chọn thanh toán online và gọi `create-payment`.
2. Service VNPay tạo `txnRef`, tính amount theo nghiệp vụ, ký checksum, trả payment URL.
3. Người dùng thanh toán tại cổng VNPay.
4. VNPay callback về `return/ipn`.
5. Server verify chữ ký + mã giao dịch, cập nhật trạng thái thanh toán lịch hẹn/giao dịch trong DB.
6. Frontend có thể gọi `verify` để đồng bộ trạng thái khi môi trường local hoặc callback chậm.

---

## 6. Mapping nhanh client service -> backend module

- `authService.js` -> `/api/auth/*`
- `specialtyService.js` -> `/api/chuyen-khoa/*`
- `doctorService.js` -> `/api/bac-si/*`
- `patientService.js` -> `/api/benh-nhan/*`
- `appointmentService.js` -> `/api/dat-lich/*`
- `scheduleService.js` -> `/api/lich-lam-viec/*`
- `prescriptionService.js` -> `/api/don-thuoc/*`
- `faqService.js` -> `/api/cau-hoi-thuong-gap/*`
- `paymentService.js` -> `/api/hinh-thuc-thanh-toan/*`, `/api/vnpay/*`
- `adminStatsService.js` -> `/api/thong-ke/*`

---

## 7. Tệp quan trọng để đọc sâu thêm

- **App + router**
  - `server/src/app.js`
  - `server/src/routes/index.js`
- **Middleware**
  - `server/src/middlewares/auth.middleware.js`
  - `server/src/middlewares/validate.middleware.js`
  - `server/src/middlewares/error.middleware.js`
  - `server/src/middlewares/turnstile.middleware.js`
- **Service lõi**
  - `server/src/services/auth.service.js`
  - `server/src/services/datLich.service.js`
  - `server/src/services/lichLamViec.service.js`
  - `server/src/services/thongKe.service.js`
  - `server/src/services/vnpay.service.js`
- **Hạ tầng**
  - `server/prisma/schema.prisma`
  - `server/src/utils/prisma.js`
  - `server/src/utils/redis.util.js`
  - `server/src/utils/email.util.js`
  - `server/src/config/cloudinary.config.js`
- **Frontend API & auth state**
  - `client/src/services/api.js`
  - `client/src/services/*.js`
  - `client/src/stores/useAuthStore.js`
  - `client/src/components/auth/ProtectedRoute.jsx`

---

## 8. Gợi ý cách đọc tài liệu này cùng tài liệu test

1. Đọc mục 2 + 3 để nắm luồng chung.
2. Chọn module ở mục 5 để hiểu flow nội bộ.
3. Mở `DOC_05_TESTING_GUIDE.md` để test endpoint tương ứng.
4. Nếu test lỗi, quay lại kiểm tra middleware + service ở mục 7.

---

## 9. Kết luận

Hệ thống hiện đã bao phủ đầy đủ các nhóm chức năng cốt lõi cho nền tảng đặt lịch khám bệnh trực tuyến:

- Quản lý người dùng và phân quyền.
- Quản lý chuyên khoa/bác sĩ/bệnh nhân.
- Quản lý lịch làm việc và đặt lịch.
- Quản lý đơn thuốc.
- Quản lý FAQ và hình thức thanh toán.
- Dashboard thống kê cho admin.
- Thanh toán online qua VNPay.

Luồng vận hành chính đều thống nhất theo kiến trúc:  
**Client service -> API route -> middleware -> controller -> service -> Prisma/Redis/integration -> JSON response**.
