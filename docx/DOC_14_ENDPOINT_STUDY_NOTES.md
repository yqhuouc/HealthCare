# Phiếu học Endpoint (Client -> Server) — TẤT CẢ API

> Mục tiêu: giúp bạn học “thuộc luồng” cho **tất cả endpoint** theo dạng phiếu học (1 endpoint = 1 khung trả lời).  
> Khi giáo viên hỏi, bạn chỉ cần trả lời theo đúng các ý: **Client gọi đâu → Route/middleware → Controller → Service → DB/Cache → Response/Edge cases**.

---

## 0. Khung trả lời chuẩn (áp dụng cho mọi endpoint)

Khi được hỏi về một endpoint, bạn trả lời theo 6 ý (có thể nói thành 4 câu):

1. **Ai gọi?** (màn hình/hành động nào; file `client/src/services/*.js`)
2. **Endpoint ở đâu?** (method + path; file `server/src/routes/*.routes.js`)
3. **Middleware đi qua?** (`authenticate` / `authorize` / `validate` / upload / turnstile)
4. **Controller gọi gì?** (hàm trong `server/src/controllers/*.controller.js`)
5. **Service xử lý gì?** (hàm trong `server/src/services/*.service.js` + business rules)
6. **Đụng DB/cache gì?** (Prisma/Redis/Cloudinary/Mail/VNPay) + **response trả về**

---

## 1. Điểm chung của toàn hệ thống

### 1.1 Axios + Refresh token (Client)

- File: `client/src/services/api.js`
- `baseURL: "/api"`, `withCredentials: true` để gửi/nhận HttpOnly cookie.
- Khi API trả `401`, interceptor tự gọi `POST /api/auth/refresh`, rồi retry request gốc.

### 1.2 Express entry + mount routes (Server)

- File: `server/src/app.js`: middleware toàn cục + mount `/api`.
- File: `server/src/routes/index.js`: mount module:
  - `/auth`, `/chuyen-khoa`, `/bac-si`, `/benh-nhan`, `/dat-lich`,
    `/lich-lam-viec`, `/don-thuoc`, `/cau-hoi-thuong-gap`,
    `/hinh-thuc-thanh-toan`, `/thong-ke`, `/vnpay`.

---

## 2. AUTH (`/api/auth`) — `server/src/routes/auth.routes.js`

Client thường gọi trong `client/src/services/authService.js`.

### 2.1 `POST /api/auth/register`

- **Middleware**: `verifyTurnstile` → `validate(registerSchema)`
- **Controller**: `authController.register`
- **Service**: `auth.service.register(body)`
- **Điểm hay hỏi**:
  - register tạo tài khoản + gắn vai trò bệnh nhân.
  - validate dữ liệu bằng Zod; turnstile chống bot.

### 2.2 `POST /api/auth/login`

- **Middleware**: `verifyTurnstile` → `validate(loginSchema)`
- **Controller**: `authController.login`
- **Service**: `auth.service.login(body)`
- **Điểm hay hỏi**:
  - Server **set cookie** `accessToken` (path `/`) và `refreshToken` (path `/api/auth`) trong HttpOnly cookie.
  - Body trả về chủ yếu là `user`, không trả token.

### 2.3 `POST /api/auth/refresh`

- **Middleware**: (không bắt buộc authenticate; server đọc cookie refresh)
- **Controller**: `authController.refresh`
- **Service**: `auth.service.refreshAccessToken(oldRefreshToken)`
- **Điểm hay hỏi**:
  - Vì sao refresh cookie `path=/api/auth` (giảm phạm vi gửi cookie).
  - Vì sao client tự refresh khi gặp `401`.

### 2.4 `POST /api/auth/logout`

- **Middleware**: `authenticate`
- **Controller**: `authController.logout`
- **Service**: `auth.service.logout(userId)`
- **Điểm hay hỏi**:
  - Clear cookie phải đúng `path` như lúc set.
  - Logout xóa refresh token phía DB (không chỉ clear cookie).

### 2.5 `GET /api/auth/me`

- **Middleware**: `authenticate`
- **Controller**: `authController.getMe`
- **Service**: `auth.service.getMe(userId)`

### 2.6 `PUT /api/auth/doi-mat-khau`

- **Middleware**: `authenticate` → `validate(doiMatKhauSchema)`
- **Controller**: `authController.doiMatKhau`
- **Service**: `auth.service.doiMatKhau(userId, body)`
- **Điểm hay hỏi**:
  - check mật khẩu cũ + hash mật khẩu mới.

### 2.7 `PUT /api/auth/cap-nhat-ho-so`

- **Middleware**: `authenticate` → `validate(capNhatHoSoSchema)`
- **Controller**: `authController.capNhatHoSo`
- **Service**: `auth.service.capNhatHoSo(userId, body)`

### 2.8 `PUT /api/auth/cap-nhat-avatar`

- **Middleware**: `authenticate` → `multerUpload.single("avatar")`
- **Controller**: `authController.capNhatAvatar`
- **Service**: `auth.service.capNhatAvatar(userId, avatarUrl)`
- **Integration**: Cloudinary (multer-storage-cloudinary gắn `req.file.path`)

### 2.9 `POST /api/auth/forgot-password`

- **Middleware**: `verifyTurnstile` → `validate(forgotPasswordSchema)`
- **Controller**: `authController.forgotPassword`
- **Service**: `auth.service.forgotPassword(email)`
- **Integration**: Redis + Email (OTP TTL)

### 2.10 `POST /api/auth/reset-password`

- **Middleware**: `validate(resetPasswordSchema)`
- **Controller**: `authController.resetPassword`
- **Service**: `auth.service.resetPassword(email, otp, matKhauMoi)`
- **Điểm hay hỏi**:
  - OTP hợp lệ trong thời gian TTL; dùng xong xóa OTP.

---

## 3. CHUYÊN KHOA (`/api/chuyen-khoa`) — `server/src/routes/chuyenKhoa.routes.js`

Client thường gọi `client/src/services/specialtyService.js`.

### 3.1 `GET /api/chuyen-khoa`

- **Middleware**: (public)
- **Controller**: `chuyenKhoaController.getAll`
- **Service**: `chuyenKhoa.service.getAll()`
- **Điểm hay hỏi**: thường có cache Redis cho list.

### 3.2 `GET /api/chuyen-khoa/:id`

- **Middleware**: (public)
- **Controller**: `chuyenKhoaController.getById`
- **Service**: `chuyenKhoa.service.getById(id)`

### 3.3 `POST /api/chuyen-khoa`

- **Middleware**: `authenticate` → `authorize("admin")` → `validate(chuyenKhoaSchema)`
- **Controller**: `chuyenKhoaController.create`
- **Service**: `chuyenKhoa.service.create(body)`

### 3.4 `PUT /api/chuyen-khoa/:id`

- **Middleware**: `authenticate` → `authorize("admin")` → `validate(chuyenKhoaSchema)`
- **Controller**: `chuyenKhoaController.update`
- **Service**: `chuyenKhoa.service.update(id, body)`

### 3.5 `DELETE /api/chuyen-khoa/:id`

- **Middleware**: `authenticate` → `authorize("admin")`
- **Controller**: `chuyenKhoaController.remove`
- **Service**: `chuyenKhoa.service.remove(id)`
- **Điểm hay hỏi**: xóa có thể check ràng buộc “còn bác sĩ thuộc chuyên khoa không”.

### 3.6 `PUT /api/chuyen-khoa/:id/upload-anh`

- **Middleware**: `authenticate` → `authorize("admin")` → `multerUpload.single("image")`
- **Controller**: `chuyenKhoaController.uploadAnh`
- **Service**: `chuyenKhoa.service.uploadAnh(id, imageUrl)`
- **Integration**: Cloudinary

---

## 4. BÁC SĨ (`/api/bac-si`) — `server/src/routes/bacSi.routes.js`

Client thường gọi `client/src/services/doctorService.js`.

### 4.1 `GET /api/bac-si`

- **Middleware**: (public)
- **Controller**: `bacSiController.getAll`
- **Service**: `bacSi.service.getAll(query)` (lọc/pagination)
- **Điểm hay hỏi**: cache Redis cho list/filter.

### 4.2 `GET /api/bac-si/:id`

- **Middleware**: (public)
- **Controller**: `bacSiController.getById`
- **Service**: `bacSi.service.getById(id)`

### 4.3 `POST /api/bac-si`

- **Middleware**: `authenticate` → `authorize("admin")` → `validate(createBacSiSchema)`
- **Controller**: `bacSiController.create`
- **Service**: `bacSi.service.create(body)`
- **Điểm hay hỏi**: tạo bác sĩ thường liên quan tạo tài khoản/role và quan hệ chuyên khoa.

### 4.4 `PUT /api/bac-si/:id`

- **Middleware**: `authenticate` → `authorize("admin")` → `validate(updateBacSiSchema)`
- **Controller**: `bacSiController.update`
- **Service**: `bacSi.service.update(id, body)`

### 4.5 `DELETE /api/bac-si/:id`

- **Middleware**: `authenticate` → `authorize("admin")`
- **Controller**: `bacSiController.remove`
- **Service**: `bacSi.service.remove(id)`

---

## 5. BỆNH NHÂN (`/api/benh-nhan`) — `server/src/routes/benhNhan.routes.js`

Client thường gọi `client/src/services/patientService.js`.

### 5.1 `GET /api/benh-nhan`

- **Middleware**: `authenticate` → `authorize("admin")`
- **Controller**: `benhNhanController.getAll`
- **Service**: `benhNhan.service.getAll(query)`

### 5.2 `GET /api/benh-nhan/:id`

- **Middleware**: `authenticate` → `authorize("admin", "benh_nhan")`
- **Controller**: `benhNhanController.getById`
- **Service**: `benhNhan.service.getById(id, req.user)`
- **Điểm hay hỏi**: ownership — bệnh nhân chỉ xem được chính mình (service check).

### 5.3 `PUT /api/benh-nhan/:id`

- **Middleware**: `authenticate` → `authorize("admin", "benh_nhan")` → `validate(updateBenhNhanSchema)`
- **Controller**: `benhNhanController.update`
- **Service**: `benhNhan.service.update(id, body, req.user)`
- **Điểm hay hỏi**: quyền sửa theo role/ownership.

### 5.4 `DELETE /api/benh-nhan/:id`

- **Middleware**: `authenticate` → `authorize("admin")`
- **Controller**: `benhNhanController.remove`
- **Service**: `benhNhan.service.remove(id)`

---

## 6. ĐẶT LỊCH (`/api/dat-lich`) — `server/src/routes/datLich.routes.js`

Client thường gọi `client/src/services/appointmentService.js`.

### 6.1 `GET /api/dat-lich/slot-trong?bacSiId=&ngayDat=`

- **Middleware**: (public)
- **Controller**: `datLichController.getSlotTrong`
- **Service**: `datLich.service.getSlotTrong(query)`
- **Điểm hay hỏi**: slot trống thường dựa trên lịch làm việc + số bệnh nhân hiện tại + giờ đã đặt.

### 6.2 `GET /api/dat-lich`

- **Middleware**: `authenticate` → `authorize("admin")`
- **Controller**: `datLichController.getAll`
- **Service**: `datLich.service.getAll(query)` (pagination)

### 6.3 `GET /api/dat-lich/benh-nhan/:id`

- **Middleware**: `authenticate`
- **Controller**: `datLichController.getByBenhNhan`
- **Service**: `datLich.service.getByBenhNhan(id, req.user)`
- **Điểm hay hỏi**: service check role/ownership để tránh lộ dữ liệu.

### 6.4 `GET /api/dat-lich/bac-si/:id`

- **Middleware**: `authenticate`
- **Controller**: `datLichController.getByBacSi`
- **Service**: `datLich.service.getByBacSi(id, req.user)`

### 6.5 `GET /api/dat-lich/:id`

- **Middleware**: `authenticate`
- **Controller**: `datLichController.getById`
- **Service**: `datLich.service.getById(id, req.user)`

### 6.6 `POST /api/dat-lich`

- **Middleware**: `authenticate` → `validate(createDatLichSchema)`
- **Controller**: `datLichController.create`
- **Service**: `datLich.service.create(body, req.user)`
- **Điểm hay hỏi (rất quan trọng)**:
  - check bác sĩ/bệnh nhân/ca làm việc/khung giờ có tồn tại và hợp lệ.
  - chống trùng slot (unique).
  - dùng transaction để tạo lịch + cập nhật số lượng bệnh nhân của ca.

### 6.7 `PUT /api/dat-lich/:id/trang-thai`

- **Middleware**: `authenticate` → `authorize("admin", "bac_si")` → `validate(updateTrangThaiSchema)`
- **Controller**: `datLichController.updateTrangThai`
- **Service**: `datLich.service.updateTrangThai(id, trangThai, req.user)`
- **Điểm hay hỏi**: chuyển trạng thái có thể kéo theo “giữ/trả slot” theo quy tắc nghiệp vụ.

### 6.8 `PUT /api/dat-lich/:id/thanh-toan`

- **Middleware**: `authenticate` → `authorize("admin")` → `validate(updateThanhToanSchema)`
- **Controller**: `datLichController.updateThanhToan`
- **Service**: `datLich.service.updateThanhToan(id, trangThaiThanhToan)`

### 6.9 `PATCH /api/dat-lich/:id/payment-method`

- **Middleware**: `authenticate`
- **Controller**: `datLichController.changePaymentMethod`
- **Service**: `datLich.service.changePaymentMethod(id, hinhThucThanhToanId, req.user)`
- **Điểm hay hỏi**: bệnh nhân chỉ được đổi của lịch thuộc về mình (service check).

### 6.10 `DELETE /api/dat-lich/:id`

- **Middleware**: `authenticate`
- **Controller**: `datLichController.remove`
- **Service**: `datLich.service.remove(id, req.user)`
- **Điểm hay hỏi**: xóa lịch có thể phải “giảm số bệnh nhân hiện tại” của ca.

---

## 7. LỊCH LÀM VIỆC (`/api/lich-lam-viec`) — `server/src/routes/lichLamViec.routes.js`

Client thường gọi `client/src/services/scheduleService.js`.

### 7.1 `GET /api/lich-lam-viec/khung-gio`

- **Middleware**: (public)
- **Controller**: `lichLamViecController.getAllKhungGio`
- **Service**: `lichLamViec.service.getAllKhungGio()`

### 7.2 `POST /api/lich-lam-viec/khung-gio`

- **Middleware**: `authenticate` → `authorize("admin")` → `validate(khungGioSchema)`
- **Controller**: `lichLamViecController.createKhungGio`
- **Service**: `lichLamViec.service.createKhungGio(body)`

### 7.3 `DELETE /api/lich-lam-viec/khung-gio/:id`

- **Middleware**: `authenticate` → `authorize("admin")`
- **Controller**: `lichLamViecController.deleteKhungGio`
- **Service**: `lichLamViec.service.deleteKhungGio(id)`
- **Điểm hay hỏi**: không cho xóa nếu còn lịch đang dùng khung giờ đó.

### 7.4 `GET /api/lich-lam-viec`

- **Middleware**: (public)
- **Controller**: `lichLamViecController.getLichLamViec`
- **Service**: `lichLamViec.service.getLichLamViec(query)`

### 7.5 `POST /api/lich-lam-viec`

- **Middleware**: `authenticate` → `authorize("admin", "bac_si")` → `validate(lichLamViecSchema)`
- **Controller**: `lichLamViecController.createLichLamViec`
- **Service**: `lichLamViec.service.createLichLamViec(body, req.user)`

### 7.6 `PUT /api/lich-lam-viec/:id`

- **Middleware**: `authenticate` → `authorize("admin", "bac_si")` → `validate(updateLichLamViecSchema)`
- **Controller**: `lichLamViecController.updateLichLamViec`
- **Service**: `lichLamViec.service.updateLichLamViec(id, body, req.user)`

### 7.7 `DELETE /api/lich-lam-viec/:id`

- **Middleware**: `authenticate` → `authorize("admin", "bac_si")`
- **Controller**: `lichLamViecController.deleteLichLamViec`
- **Service**: `lichLamViec.service.deleteLichLamViec(id, req.user)`

---

## 8. ĐƠN THUỐC (`/api/don-thuoc`) — `server/src/routes/donThuoc.routes.js`

Client thường gọi `client/src/services/prescriptionService.js`.

### 8.1 `GET /api/don-thuoc`

- **Middleware**: `authenticate` → `authorize("admin", "bac_si")`
- **Controller**: `donThuocController.getAll`
- **Service**: `donThuoc.service.getAll(query, req.user)`

### 8.2 `GET /api/don-thuoc/:id`

- **Middleware**: `authenticate`
- **Controller**: `donThuocController.getById`
- **Service**: `donThuoc.service.getById(id, req.user)`
- **Điểm hay hỏi**: nếu bệnh nhân chưa thanh toán đủ, service có thể ẩn chi tiết thuốc.

### 8.3 `POST /api/don-thuoc`

- **Middleware**: `authenticate` → `authorize("bac_si")` → `validate(createDonThuocSchema)`
- **Controller**: `donThuocController.create`
- **Service**: `donThuoc.service.create(body, req.user)`
- **Điểm hay hỏi**: tạo đơn thuốc thường gắn với lịch hẹn; cần kiểm tra bác sĩ đúng ca/lịch.

### 8.4 `PUT /api/don-thuoc/:id`

- **Middleware**: `authenticate` → `authorize("bac_si", "admin")` → `validate(updateDonThuocSchema)`
- **Controller**: `donThuocController.update`
- **Service**: `donThuoc.service.update(id, body, req.user)`

### 8.5 `DELETE /api/don-thuoc/:id`

- **Middleware**: `authenticate` → `authorize("admin")`
- **Controller**: `donThuocController.remove`
- **Service**: `donThuoc.service.remove(id)`

---

## 9. FAQ (`/api/cau-hoi-thuong-gap`) — `server/src/routes/cauHoiThuongGap.routes.js`

Client thường gọi `client/src/services/faqService.js`.

### 9.1 `GET /api/cau-hoi-thuong-gap`

- **Middleware**: (public)
- **Controller**: `cauHoiThuongGapController.getActive`
- **Service**: `cauHoiThuongGap.service.getActive()`
- **Điểm hay hỏi**: cache Redis cho public list.

### 9.2 `GET /api/cau-hoi-thuong-gap/all`

- **Middleware**: `authenticate` → `authorize("admin")`
- **Controller**: `cauHoiThuongGapController.getAll`
- **Service**: `cauHoiThuongGap.service.getAll(query)`

### 9.3 `GET /api/cau-hoi-thuong-gap/:id`

- **Middleware**: (public)
- **Controller**: `cauHoiThuongGapController.getById`
- **Service**: `cauHoiThuongGap.service.getById(id)`

### 9.4 `POST /api/cau-hoi-thuong-gap`

- **Middleware**: `authenticate` → `authorize("admin")` → `validate(cauHoiThuongGapSchema)`
- **Controller**: `cauHoiThuongGapController.create`
- **Service**: `cauHoiThuongGap.service.create(body)`

### 9.5 `PUT /api/cau-hoi-thuong-gap/:id`

- **Middleware**: `authenticate` → `authorize("admin")` → `validate(cauHoiThuongGapSchema)`
- **Controller**: `cauHoiThuongGapController.update`
- **Service**: `cauHoiThuongGap.service.update(id, body)`

### 9.6 `DELETE /api/cau-hoi-thuong-gap/:id`

- **Middleware**: `authenticate` → `authorize("admin")`
- **Controller**: `cauHoiThuongGapController.remove`
- **Service**: `cauHoiThuongGap.service.remove(id)`

---

## 10. HÌNH THỨC THANH TOÁN (`/api/hinh-thuc-thanh-toan`) — `server/src/routes/hinhThucThanhToan.routes.js`

Client thường gọi `client/src/services/paymentService.js` (phần danh mục).

### 10.1 `GET /api/hinh-thuc-thanh-toan`

- **Middleware**: (public)
- **Controller**: `hinhThucThanhToanController.getAll`
- **Service**: `hinhThucThanhToan.service.getAll()`
- **Điểm hay hỏi**: cache Redis cho danh mục.

### 10.2 `POST /api/hinh-thuc-thanh-toan`

- **Middleware**: `authenticate` → `authorize("admin")` → `validate(hinhThucThanhToanSchema)`
- **Controller**: `hinhThucThanhToanController.create`
- **Service**: `hinhThucThanhToan.service.create(body)`

### 10.3 `DELETE /api/hinh-thuc-thanh-toan/:id`

- **Middleware**: `authenticate` → `authorize("admin")`
- **Controller**: `hinhThucThanhToanController.remove`
- **Service**: `hinhThucThanhToan.service.remove(id)`
- **Điểm hay hỏi**: không cho xóa nếu đang được dùng bởi lịch hẹn (ràng buộc).

---

## 11. THỐNG KÊ (`/api/thong-ke`) — `server/src/routes/thongKe.routes.js`

Client admin thường gọi `client/src/services/adminStatsService.js`.

### 11.1 `GET /api/thong-ke/tong-quan`

- **Middleware**: `authenticate` → `authorize("admin")`
- **Controller**: `thongKeController.tongQuan`
- **Service**: `thongKe.service.tongQuan()`
- **Điểm hay hỏi**: cache Redis (TTL ngắn) vì truy vấn tổng hợp nặng.

### 11.2 `GET /api/thong-ke/lich-hen`

- **Middleware**: `authenticate` → `authorize("admin")`
- **Controller**: `thongKeController.thongKeLichHen`
- **Service**: `thongKe.service.thongKeLichHen(query)`

### 11.3 `GET /api/thong-ke/doanh-thu?nam=2026`

- **Middleware**: `authenticate` → `authorize("admin")`
- **Controller**: `thongKeController.thongKeDoanhThu`
- **Service**: `thongKe.service.thongKeDoanhThuTheoThang(nam)`

---

## 12. VNPAY (`/api/vnpay`) — `server/src/routes/vnpay.routes.js`

Client thường gọi `client/src/services/paymentService.js` (phần VNPay).

### 12.1 `POST /api/vnpay/create-payment`

- **Middleware**: `authenticate`
- **Controller**: `vnpayController.createPayment`
- **Service**: `vnpay.service.initiatePayment({ datLichId, loaiGiaoDich, ipAddr, user })`
- **Điểm hay hỏi (rất quan trọng)**:
  - server tạo URL VNPay, ký checksum.
  - tạo/ghi log giao dịch và/hoặc chuẩn bị cập nhật trạng thái thanh toán.

### 12.2 `GET /api/vnpay/return`

- **Middleware**: (public)
- **Controller**: `vnpayController.vnpayReturn`
- **Service**: `vnpay.service.verifyReturnUrl(vnpParams)`
- **Điểm hay hỏi**: return chủ yếu để hiển thị kết quả cho người dùng (không phải nguồn cập nhật DB đáng tin nhất).

### 12.3 `GET /api/vnpay/ipn`

- **Middleware**: (public)
- **Controller**: `vnpayController.vnpayIpn`
- **Service**: `vnpay.service.processIpn(vnpParams)`
- **Điểm hay hỏi**:
  - IPN là server-to-server callback: verify chữ ký + cập nhật DB bằng transaction.
  - response phải theo format VNPay yêu cầu (`RspCode`, `Message`).

### 12.4 `POST /api/vnpay/verify`

- **Middleware**: (public)
- **Controller**: `vnpayController.verifyPayment`
- **Service**: `vnpay.service.verifyAndSyncPayment(vnpParams)`
- **Điểm hay hỏi**: frontend chủ động verify/sync khi callback chậm hoặc môi trường local.

---

## 13. Bản đồ file để “trace” nhanh khi học

- **Client API**
  - `client/src/services/api.js`
  - `client/src/services/authService.js`
  - `client/src/services/specialtyService.js`
  - `client/src/services/doctorService.js`
  - `client/src/services/patientService.js`
  - `client/src/services/appointmentService.js`
  - `client/src/services/scheduleService.js`
  - `client/src/services/prescriptionService.js`
  - `client/src/services/faqService.js`
  - `client/src/services/paymentService.js`
  - `client/src/services/adminStatsService.js`

- **Server**
  - Routes: `server/src/routes/*.routes.js`
  - Controllers: `server/src/controllers/*.controller.js`
  - Services: `server/src/services/*.service.js`
  - Middleware: `server/src/middlewares/*.middleware.js`

---

## 14. Cách học nhanh (khuyến nghị)

- Với mỗi module, bạn chọn 1–2 endpoint “xương sống” để học sâu:
  - `auth/login`, `auth/refresh`
  - `dat-lich/POST` (create) và `dat-lich/:id/trang-thai`
  - `vnpay/create-payment` và `vnpay/ipn`
- Sau đó các endpoint còn lại bạn học theo “cùng pattern middleware + controller → service”.

