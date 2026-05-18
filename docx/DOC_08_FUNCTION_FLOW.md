# Luồng đi từng chức năng (Frontend → Backend)

> Tài liệu mô tả luồng xử lý theo từng chức năng chính của hệ thống.
> Giúp theo dõi toàn bộ flow từ UI đến Database.

---

## 0. Tổng quan luồng chung

```
┌──────────────────────────────────────────────────────────────────┐
│  1. Người dùng thao tác trên UI (client/src/pages/...)           │
│  2. Page gọi Service (client/src/services/...)                   │
│  3. Service gọi API qua api.js (axios instance, base URL /api)   │
│  4. Request vào backend (cookie HttpOnly tự gửi kèm):           │
│     Route → [validate middleware + Zod] → [authenticate]         │
│          → [authorize] → Controller → Service → Prisma → DB     │
│  5. Backend trả JSON { success, message, data }                  │
│  6. Frontend nhận response → cập nhật UI / toast / chuyển trang  │
└──────────────────────────────────────────────────────────────────┘
```

### Kiến trúc backend mỗi module

```
routes/xxx.routes.js          Khai báo HTTP method + URL + middleware chain
        │
validations/xxx.validation.js  Zod schema validate body
        │
middlewares/validate.middleware.js  Parse body qua schema, trả 400 nếu lỗi
        │
middlewares/auth.middleware.js      authenticate (đọc accessToken từ cookie), authorize (check role)
        │
controllers/xxx.controller.js      Nhận req, gọi service, trả res
        │
services/xxx.service.js            Logic nghiệp vụ, query Prisma, throw AppError
        │
utils/prisma.js                    Prisma Client singleton → PostgreSQL
```

---

## 1. Đăng ký tài khoản bệnh nhân

### Luồng chi tiết

1. Người dùng mở trang `/register` → `RegisterPage.jsx`
2. Điền form: email, mật khẩu, họ tên, số điện thoại, giới tính, ngày sinh, địa chỉ
3. Bấm nút **"Đăng ký"**
4. Frontend gọi `authService.register(userData)`
5. Service gọi `POST /api/auth/register`
6. Backend flow:
   - `auth.routes.js` → `validate(registerSchema)` → `authController.register`
   - Controller gọi `authService.register(req.body)`
   - Service kiểm tra email đã tồn tại chưa → nếu trùng throw `409`
   - Hash mật khẩu bằng bcrypt (10 rounds)
   - Dùng `$transaction` tạo đồng thời:
     - Bản ghi `TaiKhoan` (vaiTro = `"benh_nhan"`, trangThaiTaiKhoan = 1)
     - Bản ghi `BenhNhan` liên kết với tài khoản vừa tạo
   - Trả về `{ id, email, vaiTro, hoTen }` (không trả token)
7. Frontend nhận `201 Created` → hiển thị "Đăng ký thành công" → điều hướng sang `/login`

### Validation (Zod)

```
registerSchema:
  - email: string, email format (bắt buộc)
  - matKhau: string, 6-50 ký tự (bắt buộc)
  - hoTen: string, 1-120 ký tự (bắt buộc)
  - soDienThoai: string, max 20 (tùy chọn)
  - gioiTinh: number, 1-3 (tùy chọn)
  - ngaySinh: string (tùy chọn)
  - diaChi: string, max 255 (tùy chọn)
```

---

## 2. Đăng nhập (Dual JWT — HttpOnly Cookie)

### Luồng chi tiết

1. Người dùng mở `/login` (bệnh nhân) hoặc `/doctor/login` (bác sĩ)
2. Điền email + mật khẩu
3. Bấm **"Đăng nhập"**
4. Frontend gọi `authService.login(credentials)`
5. Service gọi `POST /api/auth/login`
6. Backend flow:
   - `auth.routes.js` → `validate(loginSchema)` → `authController.login`
   - Controller gọi `authService.login(req.body)`
   - Service:
     - Tìm tài khoản theo email (include bacSi, benhNhan)
     - Kiểm tra tài khoản tồn tại → nếu không throw `401`
     - Kiểm tra trangThaiTaiKhoan !== 0 → nếu bị khóa throw `403`
     - So sánh mật khẩu bằng bcrypt → nếu sai throw `401`
     - Tạo cặp token: `generateTokens(taiKhoanId)`
       - Access Token: `jwt.sign({ id }, accessSecret, { expiresIn: "15m" })`
       - Refresh Token: `jwt.sign({ id }, refreshSecret, { expiresIn: "7d" })`
     - Lưu refresh token vào DB (cột `TaiKhoan.refreshToken`)
     - Xác định hoTen dựa trên vai trò (admin/bác sĩ/bệnh nhân)
   - Controller:
     - Set `accessToken` vào **HttpOnly Cookie** (secure, sameSite strict, 15 phút)
     - Set `refreshToken` vào **HttpOnly Cookie** (secure, sameSite strict, 7 ngày)
     - Trả JSON: `{ user: { id, email, vaiTro, hoTen } }` — **KHÔNG trả token trong body**
7. Frontend:
   - Browser tự lưu 2 cookie HttpOnly (JS không đọc được)
   - Mọi request sau trình duyệt **tự gửi** cookie → server đọc `req.cookies.accessToken`
   - Chuyển hướng theo vai trò: admin → `/admin`, bác sĩ → `/doctor`, bệnh nhân → `/`

### Validation (Zod)

```
loginSchema:
  - email: string, email format (bắt buộc)
  - matKhau: string, min 1 ký tự (bắt buộc)
```

---

## 3. Làm mới Access Token (Refresh)

### Luồng chi tiết

1. Khi Access Token hết hạn → API trả `401` "Token đã hết hạn"
2. Frontend gọi `POST /api/auth/refresh` (không cần header Authorization)
3. Cả 2 cookie (accessToken + refreshToken) được trình duyệt **tự gửi**
4. Backend flow:
   - `authController.refresh` đọc `req.cookies.refreshToken`
   - Gọi `authService.refreshAccessToken(refreshToken)`
   - Service:
     - Kiểm tra token tồn tại → nếu không throw `401`
     - Verify token bằng `jwtRefreshSecret`
     - Tìm tài khoản trong DB, so khớp refreshToken
     - Tạo cặp token mới (**Token Rotation** — refresh token cũ bị thay thế)
     - Lưu refresh token mới vào DB
   - Controller: set **cả 2 cookie mới** (`accessToken` + `refreshToken`) → trả `{ message }`
5. Frontend retry request gốc (cookie mới tự gửi theo)

---

## 4. Đăng xuất

### Luồng chi tiết

1. Người dùng bấm **"Đăng xuất"**
2. Frontend gọi `POST /api/auth/logout` (cookie accessToken tự gửi kèm)
3. Backend flow:
   - `authenticate` middleware đọc `accessToken` từ cookie → verify → gắn `req.user`
   - Controller gọi `authService.logout(req.user.id)`
   - Service: update `TaiKhoan.refreshToken = null`
   - Controller: `res.clearCookie("accessToken")` + `res.clearCookie("refreshToken")` → trả success
4. Frontend: cập nhật state, điều hướng về `/login`

---

## 5. Lấy thông tin user hiện tại (`/auth/me`)

### Luồng chi tiết

1. Frontend gọi `authService.getMe()` → `GET /api/auth/me`
2. Middleware `authenticate` đọc `accessToken` từ HttpOnly Cookie → verify → query DB → gắn `req.user`
3. Controller gọi `authService.getMe(req.user.id)`
4. Service query TaiKhoan với select đầy đủ:
   - id, email, vaiTro, gioiTinh, ngaySinh, diaChi, anhDaiDien, ngayTao, trangThaiTaiKhoan
   - Include: `bacSi` (nếu vai trò bác sĩ), `benhNhan` (nếu vai trò bệnh nhân)
5. Trả về thông tin user đầy đủ
6. Frontend dùng dữ liệu này để hiển thị profile, kiểm tra role cho routing

---

## 6. Đổi mật khẩu

### Luồng chi tiết

1. Người dùng vào trang profile → bấm **"Đổi mật khẩu"**
2. Nhập mật khẩu cũ + mật khẩu mới
3. Frontend gọi `PUT /api/auth/doi-mat-khau`
4. Backend flow:
   - `authenticate` → `validate(doiMatKhauSchema)` → controller → service
   - Service: verify mật khẩu cũ bằng bcrypt → nếu sai throw `400`
   - Hash mật khẩu mới → update vào DB
5. Trả success → Frontend hiện toast "Đổi mật khẩu thành công"

### Validation (Zod)

```
doiMatKhauSchema:
  - matKhauCu: string, min 1 (bắt buộc)
  - matKhauMoi: string, 6-50 ký tự (bắt buộc)
```

---

## 7. Cập nhật hồ sơ cá nhân

### Luồng chi tiết

1. Người dùng vào trang profile → sửa thông tin cá nhân
2. Frontend gọi `PUT /api/auth/cap-nhat-ho-so`
3. Backend flow:
   - `authenticate` → `validate(capNhatHoSoSchema)` → controller → service
   - Service: tìm tài khoản → update các trường được gửi lên
   - Chỉ cho phép cập nhật: gioiTinh, ngaySinh, diaChi, anhDaiDien
4. Trả về thông tin tài khoản đã cập nhật

### Validation (Zod)

```
capNhatHoSoSchema:
  - gioiTinh: number, 1-3 (tùy chọn)
  - ngaySinh: string (tùy chọn)
  - diaChi: string, max 255 (tùy chọn)
  - anhDaiDien: string, max 255 (tùy chọn)
```

---

## 7.2 Cập nhật ảnh đại diện (Avatar lên Cloudinary)

### Luồng chi tiết

1. Người dùng vào trang profile → bấm biểu tượng chọn ảnh đại diện.
2. Frontend kiểm tra dung lượng ảnh (validate size < 5MB).
3. Gói file vào cấu trúc `FormData` (multipart/form-data) và tự động gọi `PUT /api/auth/cap-nhat-avatar`.
4. Backend flow:
   - Middleware `authenticate` → xác thực token và trích xuất `req.user.id`.
   - Chạy qua Middleware `multerUpload.single("avatar")` (Middleware này gắn với `CloudinaryStorage`).
   - `Multer` đứng ra môi giới, nhận file đẩy thẳng lên kho lưu trữ **Cloudinary**.
   - Sau khi lên mây thành công, Cloudinary trả lại URL truy cập công khai vào biến `req.file.path`.
   - `authController.capNhatAvatar` sử dụng `req.file.path` và gọi Service `capNhatAvatar()`.
   - Service dùng Prisma lưu lại URL này vào cột `anhDaiDien` trong bảng `TaiKhoan`.
5. Trả về thông tin `{ success: true, anhDaiDien: "https://res.cloudinary.com/..." }`.
6. Frontend nhận URL ảnh mới, cập nhật giá trị vào biến State và Global Store (Zustand), hiển thị ngay ảnh thay cho icon trống.

---

## 8. Xem danh sách bác sĩ + chi tiết bác sĩ (Public)

### 8.1 Danh sách bác sĩ

1. Người dùng vào `/doctors` → `DoctorListPage.jsx`
2. Frontend gọi `doctorService.getAll(filters)`
3. API: `GET /api/bac-si?chuyenKhoaId=&search=&page=1&limit=10`
4. Backend flow (public, không cần auth):
   - `bacSi.routes.js` → `bacSiController.getAll` → `bacSiService.getAll(req.query)`
   - Service:
     - Build `where` clause từ query params (chuyenKhoaId, search theo tên)
     - Query `prisma.bacSi.findMany` với include chuyenKhoa + taiKhoan
     - Đếm total → tính pagination
  - Trả: `{ bacSiList: [...], pagination: { total, page, limit, totalPages } }`
5. Frontend render danh sách + phân trang

### 8.2 Chi tiết bác sĩ

1. Bấm vào 1 bác sĩ → `/doctors/:id` → `DoctorDetailPage.jsx`
2. Frontend gọi `doctorService.getById(id)`
3. API: `GET /api/bac-si/:id`
4. Backend flow:
   - Service query bacSi include chuyenKhoa + taiKhoan (email, ảnh, giới tính, ngày sinh, địa chỉ)
   - Nếu không tìm thấy → throw `404`
5. Frontend hiển thị chi tiết: tên, học vị, chuyên khoa, mô tả, giá khám

---

## 9. Đặt lịch khám (Bệnh nhân)

### Luồng chi tiết

1. Người dùng vào `/booking/:doctorId` → `BookingPage.jsx`
2. Người dùng lấy danh sách slot trống: gọi `GET /api/dat-lich/slot-trong?bacSiId=X&ngayDat=Y`
3. Chọn ngày, chọn 1 slot trống trong danh sách, hình thức thanh toán, nhập lý do khám
4. Bấm **"Đặt lịch"**
5. Frontend gọi `appointmentService.create(data)` (lưu ý: không gửi `gioKetThuc`)
6. API: `POST /api/dat-lich`
7. Backend flow:
   - `authenticate` (bắt buộc đăng nhập — đọc accessToken từ cookie)
   - `validate(createDatLichSchema)`
   - Controller → Service:
     - **Bước 1**: Kiểm tra bác sĩ tồn tại và lấy `thoiLuongKham` của chuyên khoa → nếu không có BS throw `404`
     - **Bước 2**: Kiểm tra bệnh nhân tồn tại → nếu không throw `404`
     - **Bước 3**: Tự động tính `gioKetThuc` = `gioBatDau` + `thoiLuongKham` (phút)
     - **Bước 4**: Tìm ca làm việc (LichLamViecBacSi) nằm trong ngày đó, `sanSang = 1`, chứa trọn slot giờ này → nếu không có ca phù hợp throw `400`
     - **Bước 5**: Kiểm tra sức chứa (`soBenhNhanHienTai` < `soBenhNhanToiDa`) → nếu đầy throw `400`
     - **Bước 6**: Kiểm tra trùng slot hẹn (kiểm tra `gioBatDau`) → nếu trùng throw `409`
     - **Bước 7**: Transaction: Tạo DatLich (chờ xác nhận = 0) và Tăng `soBenhNhanHienTai` của ca làm việc lên 1.
8. Trả về lịch hẹn vừa tạo (include đầy đủ bác sĩ, bệnh nhân, hình thức thanh toán)
9. Frontend hiển thị "Đặt lịch thành công" → điều hướng về lịch sử

### Thanh toán đa tầng (Payment Flow)
Hệ thống hỗ trợ luồng thanh toán linh hoạt:
- **Bước 1 (Đặt lịch/Check-in):** Bệnh nhân trả phí khám (cố định). `trangThaiThanhToan` chuyển sang **1** (Đã trả phí khám).
- **Bước 2 (Khám xong):** Bác sĩ kê đơn thuốc (có `tongTien` thuốc phát sinh).
- **Bước 3 (Settlement):** Admin (xác nhận offline) hoặc bệnh nhân trả nốt tiền thuốc qua cổng thanh toán online. `trangThaiThanhToan` chuyển sang **2** (Đã thanh toán toàn bộ).

### Validation (Zod)

```
createDatLichSchema:
  - ngayDat: string, min 1 (bắt buộc) — format "YYYY-MM-DD"
  - gioBatDau: string, regex HH:mm (bắt buộc)
  - bacSiId: string|number, > 0 (bắt buộc)
  - benhNhanId: string|number, > 0 (bắt buộc)
  - lyDoKham: string, max 255 (tùy chọn)
  - hinhThucThanhToanId: string|number (tùy chọn)
  - giaKham: string|number (tùy chọn)
  - trangThaiThanhToan: number, 0 (chưa trả) hoặc 1 (đã trả phí khám) (tùy chọn)
```

---

## 10. Lịch sử lịch hẹn / Hủy lịch (Bệnh nhân)

### 10.1 Xem lịch sử

1. Vào `/appointments` → `AppointmentHistoryPage.jsx`
2. Frontend gọi `appointmentService.getMyAppointments(benhNhanId)`
3. API: `GET /api/dat-lich/benh-nhan/:id` (cần cookie HttpOnly)
4. Backend flow:
   - `authenticate` đọc accessToken từ cookie → verify
   - Service kiểm tra **ownership**: so sánh `benhNhan.taiKhoanId` với `req.user.id`
   - Nếu không phải chủ sở hữu → throw `403`
   - Query danh sách lịch hẹn theo benhNhanId, sắp xếp theo ngày mới nhất
   - Include: bác sĩ (tên, học vị, chuyên khoa), hình thức thanh toán, đơn thuốc
5. Frontend render danh sách theo trạng thái (chờ / xác nhận / đã khám / hủy)

### 10.2 Hủy/Xóa lịch

1. Bấm **"Hủy lịch"** trên lịch hẹn đang ở trạng thái "Chờ xác nhận" (0)
2. Frontend gọi `DELETE /api/dat-lich/:id` (xóa) hoặc `PUT /api/dat-lich/:id/trang-thai` (cập nhật trạng thái = 3)
3. Backend flow:
   - `authenticate` đọc accessToken từ cookie → verify
   - Service:
     - Kiểm tra lịch hẹn tồn tại
     - **Ownership check**: bệnh nhân chỉ thao tác lịch của mình
     - Kiểm tra trạng thái: **không cho xóa/hủy** nếu trangThai = 1 (đã xác nhận) hoặc 2 (đã khám)
     - Dùng `$transaction`:
       - Xóa đơn thuốc liên quan (nếu có)
       - Xóa lịch hẹn / Cập nhật trạng thái thành 3
       - Giảm `soBenhNhanHienTai` của ca làm việc xuống 1
4. Trả success → Frontend reload danh sách

---

## 11. Luồng Bác sĩ (Portal `/doctor`)

### 11.1 Xem lịch hẹn của bác sĩ

1. Bác sĩ vào `/doctor/appointments` → `DoctorAppointmentsPage.jsx`
2. API: `GET /api/dat-lich/bac-si/:bacSiId` (cookie HttpOnly)
3. Backend:
   - `authenticate` đọc accessToken từ cookie → verify
   - Service kiểm tra **ownership**: bác sĩ chỉ xem được lịch của chính mình
   - Query lịch hẹn theo bacSiId, include bệnh nhân, hình thức thanh toán, đơn thuốc

### 11.2 Xem chi tiết lịch hẹn

1. Bấm vào 1 lịch hẹn → `/doctor/appointments/:id` → `DoctorAppointmentDetailPage.jsx`
2. API: `GET /api/dat-lich/:id` (cookie HttpOnly)
3. Backend: **Ownership check** — bác sĩ chỉ xem được lịch do chính mình khám. Bệnh nhân chỉ xem được lịch của chính mình. Admin xem được tất cả.
4. Nếu bệnh nhân chưa thanh toán thuốc (`trangThaiThanhToan < 2`), phần `donThuoc` sẽ bị ẩn và thay bằng thông báo yêu cầu thanh toán.

### 11.3 Cập nhật trạng thái lịch hẹn
API: `PUT /api/dat-lich/:id/trang-thai` — Cập nhật trạng thái khám (0->1->2->3)
API: `PUT /api/dat-lich/:id/thanh-toan` — Cập nhật trạng thái thanh toán (0->1->2)

### 11.4 Quản lý lịch làm việc

1. Bác sĩ vào `/doctor/schedule` → `DoctorSchedulePage.jsx`
2. Xem lịch: `GET /api/lich-lam-viec?bacSiId=X&ngayLamViec=YYYY-MM-DD`
3. Thêm ca: `/doctor/schedule/add` → `DoctorAddShiftPage.jsx`
   - API: `POST /api/lich-lam-viec` (authorize: admin hoặc bac_si)
   - Body: `{ ngayLamViec, bacSiId, khungGioId, soBenhNhanToiDa }`
   - Backend kiểm tra bác sĩ + khung giờ tồn tại, kiểm tra trùng ca làm việc. Nếu `soBenhNhanToiDa` không truyền, tự tính dựa trên độ dài ca làm việc / thời lượng khám chuyên khoa.
4. Cập nhật sẵn sàng: `PUT /api/lich-lam-viec/:id` → `{ sanSang: 0 }` hoặc `{ sanSang: 1 }`
5. Xóa lịch: `DELETE /api/lich-lam-viec/:id` (chặn xóa nếu ca đang có lịch hẹn)

### 11.5 Kê đơn thuốc

1. Từ chi tiết lịch hẹn **đã khám xong** (trangThai = 2)
2. Bác sĩ bấm **"Kê đơn thuốc"**
3. API: `POST /api/don-thuoc` (authorize: bac_si)
4. Body:
   ```json
   {
     "datLichId": 1,
     "chanDoan": "Viêm họng cấp",
     "ghiChu": "Uống nhiều nước, nghỉ ngơi",
     "chiTietDonThuoc": [
       { "tenThuoc": "Amoxicillin 500mg", "soLuong": 21, "donGia": 15000, "lieuDung": "1 viên x 3 lần/ngày", "ghiChu": "Uống sau ăn" },
       { "tenThuoc": "Paracetamol 500mg", "soLuong": 10, "donGia": 2000, "lieuDung": "1 viên khi sốt > 38.5°C" }
     ]
   }
   ```
> `chiTietDonThuoc` là tùy chọn: nếu không gửi (hoặc mảng rỗng) thì chỉ tạo `DonThuoc`.
> **Backend tự động tính `tongTien`** dựa trên `soLuong * donGia` của từng loại thuốc.
5. Backend flow:
   - Kiểm tra lịch hẹn tồn tại + trangThai phải = 2 → nếu không throw `400`
   - **Ownership check**: Kiểm tra `datLich.bacSiId` trùng khớp với `req.user.bacSi.id` nhằm chống kê đơn ẩn danh chéo → nếu sai throw `403`
   - Kiểm tra chưa có đơn thuốc cho lịch này → nếu đã có throw `409`
   - Nếu có `chiTietDonThuoc` → Prisma nested create: tạo `DonThuoc` + `ChiTietDonThuoc` cùng lúc
   - Nếu không có `chiTietDonThuoc` → tạo `DonThuoc` đơn lẻ
6. Trả đơn thuốc vừa tạo (include chi tiết bác sĩ, bệnh nhân và danh sách thuốc nếu có)

### 11.6 Quản lý đơn thuốc (Admin/BS)

1. Xem danh sách đơn thuốc: `Admin/DoctorDrugListPage.jsx`
2. API: `GET /api/don-thuoc` (authorize: admin hoặc bac_si)
3. Backend flow:
   - authenticate (accessToken từ cookie) → authorize
   - Service query `DonThuoc` + include các quan hệ cần thiết để hiển thị
   - Hỗ trợ phân trang theo `page`/`limit` (nếu UI dùng)
4. Xem chi tiết đơn thuốc: `Admin/DoctorDrugDetailPage.jsx`
5. API: `GET /api/don-thuoc/:id` (authorize: admin hoặc bac_si)
6. Backend flow:
   - authenticate → authorize
   - Service trả chi tiết đầy đủ: `DonThuoc` + `ChiTietDonThuoc` + bác sĩ/bệnh nhân
7. Xóa đơn thuốc (Admin): `AdminDrugDetailPage.jsx`
8. API: `DELETE /api/don-thuoc/:id` (authorize: admin)
9. Backend flow:
   - authenticate → authorize
   - Service xóa `DonThuoc` → nhờ `onDelete: Cascade`, `ChiTietDonThuoc` tự xóa theo
10. Trả success → frontend reload lại dữ liệu

---

## 12. Luồng Admin (Portal `/admin`)

### 12.1 Dashboard tổng quan

1. Admin vào `/admin` → `AdminDashboardPage.jsx`
2. API: `GET /api/thong-ke/tong-quan` (authorize: admin)
3. Backend trả:
   - Tổng bệnh nhân, bác sĩ, lịch hẹn, chuyên khoa
   - Tổng doanh thu khám (`giaKham`) từ lịch hẹn trangThaiThanhToan >= 1
   - Tổng doanh thu thuốc (`tongTien`) từ lịch hẹn trangThaiThanhToan = 2
   - Phân bố lịch hẹn theo trạng thái (bao nhiêu chờ, bao nhiêu xác nhận, ...)

### 12.2 Thống kê lịch hẹn

1. Admin vào `/admin/stats` → `AdminStatsPage.jsx`
2. API: `GET /api/thong-ke/lich-hen?tuNgay=2026-01-01&denNgay=2026-03-20`
3. Backend trả:
   - Lịch hẹn theo ngày (group by ngayDat)
   - Top 10 bác sĩ có nhiều lịch hẹn nhất (kèm tên bác sĩ)

### 12.3 Thống kê doanh thu theo tháng

1. Admin vào tab Doanh thu → `AdminRevenuePage.jsx`
2. API: `GET /api/thong-ke/doanh-thu?nam=2026` (authorize: admin)
3. Backend trả:
   - Mảng 12 tháng chứa 2 dữ liệu: `doanhThuKham` và `doanhThuThuoc`.

### 12.3 Quản lý chuyên khoa

1. Xem: `/admin/specialties` → `AdminSpecialtiesPage.jsx`
   - `GET /api/chuyen-khoa` (public) — trả danh sách kèm `_count.bacSiList`
2. Tạo chuyên khoa: `/admin/specialties/add` → `AdminAddSpecialtyPage.jsx`
   - API: `POST /api/chuyen-khoa` (admin) — body: `{ tenChuyenKhoa, anhChuyenKhoa, moTaChuyenKhoa, thoiLuongKham }`
   - Backend flow:
     - `authenticate` (cookie accessToken) → `authorize` (admin)
     - `validate(createChuyenKhoaSchema)` (Zod)
     - Controller gọi `chuyenKhoaService.create(...)`
     - Service: tạo `ChuyenKhoa` bằng Prisma → trả record vừa tạo
3. Cập nhật chuyên khoa: `/admin/specialties/:id/edit` → `AdminEditSpecialtyPage.jsx`
   - API: `PUT /api/chuyen-khoa/:id` (admin) — body: `{ tenChuyenKhoa, anhChuyenKhoa, moTaChuyenKhoa, thoiLuongKham }`
   - Backend flow:
     - `authenticate` → `authorize` (admin)
     - `validate(updateChuyenKhoaSchema)` (Zod)
     - Service kiểm tra `id` có tồn tại → nếu không throw `404`
     - Service update `ChuyenKhoa` bằng Prisma → trả chuyên khoa đã cập nhật
4. Xóa chuyên khoa: `/admin/specialties/:id` → `AdminSpecialtyDetailPage.jsx`
   - API: `DELETE /api/chuyen-khoa/:id` (admin)
   - Backend flow:
     - `authenticate` → `authorize` (admin)
     - Service kiểm tra xem chuyên khoa có bác sĩ nào không:
       - nếu có `X` bác sĩ thuộc chuyên khoa → throw `400` ("Không thể xóa vì có X bác sĩ thuộc chuyên khoa này")
       - nếu không có → xóa `ChuyenKhoa` bằng Prisma → trả success

### 12.4 Quản lý bác sĩ

1. Xem danh sách: `/admin/doctors` → `AdminDoctorsPage.jsx`
   - `GET /api/bac-si?page=1&limit=10` — kèm filter chuyenKhoaId, search
2. Thêm bác sĩ: `/admin/doctors/add` → `AdminAddDoctorPage.jsx`
   - `POST /api/bac-si` (admin)
   - Bắt buộc nhập `email` và `matKhau`, backend tạo `TaiKhoan` (vaiTro = bac_si) + `BacSi` trong transaction
   - Body: `{ tenBacSi, hocViChucDanh, email, matKhau, chuyenKhoaId, giaKham, ... }`
3. Sửa: `PUT /api/bac-si/:id` (admin)
4. Xóa: `DELETE /api/bac-si/:id` (admin) — **không xóa được** nếu có lịch hẹn
   - Backend xóa trong transaction: BacSi → TaiKhoan

### 12.5 Quản lý bệnh nhân

1. Xem danh sách: `/admin/patients` → `AdminPatientsPage.jsx`
   - `GET /api/benh-nhan?search=&page=1&limit=10` (admin)
2. Xem chi tiết: `GET /api/benh-nhan/:id` (cookie HttpOnly)
3. Sửa: `PUT /api/benh-nhan/:id` (cookie HttpOnly) — cập nhật hoTen, soDienThoai, emailLienHe + taiKhoan liên quan
4. Xóa: `DELETE /api/benh-nhan/:id` (admin) — **không xóa được** nếu có lịch hẹn

### 12.6 Quản lý lịch hẹn

1. Xem tất cả: `/admin/appointments` → `AdminAppointmentsPage.jsx`
   - `GET /api/dat-lich?trangThai=&ngayDat=&page=1&limit=10` (admin)
2. Cập nhật trạng thái: `PUT /api/dat-lich/:id/trang-thai` (admin)

### 12.7 Quản lý FAQ

1. Xem tất cả: `/admin/faqs` → `AdminFAQsPage.jsx`
   - `GET /api/cau-hoi-thuong-gap/all?page=1&limit=20` (admin) — kể cả FAQ đã ẩn
2. Thêm: `/admin/faqs/add` → `AdminAddFAQPage.jsx`
   - `POST /api/cau-hoi-thuong-gap` (admin) — body: `{ cauHoi, traLoi, dangHoatDong }`
3. Sửa: `PUT /api/cau-hoi-thuong-gap/:id` (admin) — cho phép ẩn/hiện bằng dangHoatDong (0 hoặc 1)
4. Xóa: `DELETE /api/cau-hoi-thuong-gap/:id` (admin)

Public FAQ: `GET /api/cau-hoi-thuong-gap` — chỉ trả FAQ có dangHoatDong = 1

### 12.8 Quản lý hình thức thanh toán

- Xem: `GET /api/hinh-thuc-thanh-toan` (public)
- Thêm: `POST /api/hinh-thuc-thanh-toan` (admin) — body: `{ tenHinhThuc }`
- Xóa: `DELETE /api/hinh-thuc-thanh-toan/:id` (admin) — **không xóa được** nếu có lịch hẹn sử dụng

## 12.9 Quản lý lịch làm việc & khung giờ (Admin)

### 12.9.1 Khung giờ

1. Lấy danh sách khung giờ (Public): `GET /api/lich-lam-viec/khung-gio`
2. Tạo khung giờ (Admin):
   - API: `POST /api/lich-lam-viec/khung-gio` (authorize: admin)
   - Body: `{ gioBatDau, gioKetThuc }`
   - Validation (Zod): format giờ `HH:mm`
   - Backend: tạo record `KhungGio`
3. Xóa khung giờ (Admin):
   - API: `DELETE /api/lich-lam-viec/khung-gio/:id` (authorize: admin)
   - Backend kiểm tra ràng buộc: nếu `khungGio` đang được dùng trong `LichLamViec` → throw `400`
   - Nếu không dùng → xóa record `KhungGio`

> Các endpoint lịch làm việc (tạo lịch, cập nhật `sanSang`, xóa lịch) đã được mô tả tại `11.4 Quản lý lịch làm việc`.

---

## 13. Xem chuyên khoa (Public)

### 13.1 Danh sách chuyên khoa

1. `/specialties` → `SpecialtyListPage.jsx`
2. `GET /api/chuyen-khoa` (public)
3. Trả danh sách chuyên khoa kèm `_count.bacSiList` (số bác sĩ mỗi chuyên khoa)

### 13.2 Chi tiết chuyên khoa

1. `/specialties/:id` → `SpecialtyDetailPage.jsx`
2. `GET /api/chuyen-khoa/:id` (public)
3. Trả chi tiết + danh sách bác sĩ thuộc chuyên khoa (id, tên, học vị, mô tả ngắn, giá khám)

---

## 14. Luồng FAQ (Public)

### 14.1 FAQ đang hoạt động

1. `/faq` → `FAQPage.jsx`
2. API: `GET /api/cau-hoi-thuong-gap` (public)
3. Backend trả:
   - Chỉ FAQ có `dangHoatDong = 1`
   - Sắp xếp theo `id` tăng dần

---

## 15. Xem kết quả khám / Đơn thuốc (Bệnh nhân)

1. Bệnh nhân vào `/medical-result` → `MedicalResultPage.jsx`
2. Từ lịch hẹn đã khám (trangThai = 2), xem đơn thuốc:
   - Đơn thuốc đã nằm trong include khi lấy danh sách lịch hẹn
   - Hoặc gọi riêng: `GET /api/don-thuoc/:id` (cookie HttpOnly)
3. **Cơ chế khóa đơn thuốc (Payment Gate):**
   - Nếu `trangThaiThanhToan < 2` (chưa thanh toán xong):
     - Backend trả về thông tin chung (chẩn đoán, ghi chú, bác sĩ, `tongTien`)
     - `chiTietDonThuoc` trả về **mảng rỗng**
     - Kèm thông báo: `"Vui lòng thanh toán để xem chi tiết đơn thuốc."`
   - Nếu `trangThaiThanhToan === 2` (đã thanh toán toàn bộ):
     - Backend trả đầy đủ: chẩn đoán, ghi chú, danh sách thuốc (tên, số lượng, đơn giá, liều dùng, ghi chú)
4. **Lưu ý**: Admin và Bác sĩ luôn xem được toàn bộ chi tiết đơn thuốc, không bị ảnh hưởng bởi cơ chế khóa.


---

## 16. Health check và Debug

### Health check

```
GET /api/health → { success: true, message: "Server đang hoạt động!", timestamp }
```

### Checklist debug khi một chức năng không hoạt động

1. **Route đã khai báo?** → Kiểm tra `server/src/routes/*.routes.js` và `routes/index.js`
2. **Validation đúng field?** → Kiểm tra `server/src/validations/*.validation.js`
3. **Frontend gọi đúng endpoint?** → Kiểm tra `client/src/services/*.js`
4. **Access Token hết hạn?** → Gọi `/api/auth/refresh` để làm mới cookie
5. **Role đúng với authorize?** → Kiểm tra `authorize("admin", "bac_si")` trong route
6. **Ownership check?** → Bệnh nhân chỉ xem/sửa/xóa dữ liệu của chính mình
7. **Prisma schema khớp?** → Kiểm tra `schema.prisma` và chạy `npx prisma generate`
8. **Database kết nối?** → Kiểm tra `.env` (DATABASE_URL, DIRECT_URL)

### Kiểm tra nhanh bằng Prisma Studio

```bash
npx prisma studio
```

Mở `http://localhost:5555` → duyệt/sửa dữ liệu trực tiếp trên các bảng.

---

## 17. Luồng Thanh toán Online (VNPay)

### Luồng chi tiết (Tạo thanh toán)

1. Lịch hẹn của bệnh nhân phải ở trạng thái **Đã khám** (`trangThai === 2`). Bệnh nhân vào trang **Kết quả khám** (`MedicalResultPage.jsx`) → bấm **"Thanh toán VNPay"** cho một gói (Phí khám `PHI_KHAM`, Đơn thuốc `DON_THUOC`, hoặc thanh toán gộp `TAT_CA`).
2. Frontend gọi `POST /api/vnpay/create-payment`.
3. Backend flow:
   - `vnpayController.createPayment` nhận: `datLichId`, `loaiGiaoDich` (không cần truyền `amount`, server tự tính dựa trên cơ sở dữ liệu).
   - Kiểm tra xem lịch hẹn đã ở trạng thái `trangThai === 2` hay chưa. Nếu chưa, trả về lỗi `400`.
   - Tạo bản ghi `GiaoDich` trong DB với trạng thái = 0 (Chờ).
   - Sử dụng thư viện `vnpay` để tạo chuỗi băm bảo mật (HMAC-SHA512).
   - Trả về `paymentUrl`.
4. Frontend chuyển hướng người dùng sang trang thanh toán của VNPay Sandbox.

### Luồng chi tiết (Xử lý kết quả - IPN & Verify)

1. Sau khi người dùng thanh toán/hủy trên VNPay, VNPay gọi ngầm về Server qua `GET /api/vnpay/ipn`.
2. Backend flow:
   - Kiểm tra chữ ký `vnp_SecureHash` bằng `verifyIpnCall` để đảm bảo dữ liệu đúng từ VNPay.
   - Tìm bản ghi `GiaoDich` tương ứng qua mã tham chiếu.
   - Nếu thành công (`vnp_ResponseCode === '00'`):
     - Cập nhật `GiaoDich.trangThai = 1` (Thành công).
     - Cập nhật `DatLich.trangThaiThanhToan` dựa trên loại giao dịch:
       - Nếu `PHI_KHAM` → `trangThaiThanhToan = 1`.
       - Nếu `DON_THUOC` hoặc `TAT_CA` → `trangThaiThanhToan = 2`.
     - Đồng thời, tự động gán hình thức thanh toán `hinhThucThanhToanId` sang hình thức **VNPay**.
   - Trả về mã phản hồi cho VNPay (`RspCode: '00'`).
3. Người dùng được redirect về trang kết quả `/payment/result` trên Frontend. Tại đây, Frontend gọi `POST /api/vnpay/verify` gửi kèm các tham số URL để chủ động xác thực và đồng bộ dữ liệu ngay lập tức (giúp môi trường dev local không có IPN public vẫn đồng bộ được DB).

