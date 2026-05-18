# DOC_15 — Luồng API từng bước (Request → Response)

> **Mục đích:** Tài liệu ôn thi / báo cáo — mô tả **chi tiết từng bước** mọi chức năng: client gửi gì, server xử lý thế nào, trả về gì.  
> **Khác DOC_08:** DOC_08 tóm tắt flow nghiệp vụ; **DOC_15** đi sâu **HTTP request/response**, `body` / `query` / `params`, middleware, `req.body`, cookie auth.  
> **Bám code thực tế:** `server/src/app.js`, `routes/*`, `middlewares/*`, `client/src/services/api.js`.

---

## Cách dùng tài liệu này

1. Đọc **Phần A** (nền tảng HTTP) một lần — nhớ phân biệt body / query / params.
2. Mỗi chức năng có cùng khung 4 bước: **Client gửi → Middleware → Service → Response**.
3. Khi thầy hỏi “API nhận gì?” → trả lời theo bảng **Dữ liệu đầu vào** của mục đó.
4. Tham chiếu thêm: `DOC_08_FUNCTION_FLOW.md` (nghiệp vụ), `DOC_04_API_SPECIFICATION.md` (danh sách endpoint).

---

# PHẦN A — NỀN TẢNG (HỌC MỘT LẦN, NHỚ MÃI)

## A.1. Một HTTP Request gồm những gì?

Hình dung **gửi bưu kiện**:

| Thành phần | Ví dụ | Trên server (Express) | Ghi chú |
|------------|--------|------------------------|---------|
| **Method** | `GET`, `POST`, `PUT`, `DELETE`, `PATCH` | `req.method` | Quyết định có body hay không (GET thường không body) |
| **URL / Path** | `/api/dat-lich` | `req.path` | Địa chỉ API |
| **Query** | `?bacSiId=1&ngayDat=2026-05-17` | `req.query` | Sau dấu `?`, dùng lọc/tìm kiếm |
| **Params** | `/api/dat-lich/42` → `id=42` | `req.params` | Biến **nhúng trong path** |
| **Headers** | `Content-Type`, `Cookie`, `Origin` | `req.headers` | Metadata, không phải nghiệp vụ chính |
| **Body** | JSON `{ "bacSiId": 1 }` | `req.body` (sau `express.json()`) | Chỉ với POST/PUT/PATCH (thường) |

### Phân biệt nhanh (hay lẫn)

- **Body** = “hàng trong thùng” — dữ liệu form/JSON người dùng nhập (đặt lịch, đăng nhập…).
- **Query** = “ghi chú trên tem bưu kiện” — `?key=value` trên URL (lọc, phân trang, slot trống).
- **Params** = “số nhà trên đường” — `/dat-lich/:id` → `req.params.id`.
- **Headers** = “nhãn dán” — loại dữ liệu, cookie đăng nhập, origin CORS.

## A.2. HTTPS là gì?

- **HTTP:** giao thức web.
- **HTTPS:** HTTP + mã hóa TLS → bảo vệ nội dung request/response trên đường truyền.
- Dev local: `http://localhost:5000` — production nên `https://...`.

HTTPS **không thay** cấu trúc body/query; chỉ **bảo mật đường truyền**.

## A.3. Xác thực trong project này (QUAN TRỌNG)

**Không dùng** `Authorization: Bearer ...` trong header (trừ tích hợp ngoài).

| Cơ chế | Chi tiết |
|--------|----------|
| **Access Token** | JWT lưu cookie `accessToken` (HttpOnly, 15 phút, path `/`) |
| **Refresh Token** | JWT cookie `refreshToken` (HttpOnly, 7 ngày, path `/api/auth`) |
| **Client** | Axios `withCredentials: true` → browser **tự gửi** cookie |
| **Server** | `authenticate` đọc `req.cookies.accessToken` → `req.user` |

Request mẫu khi đã đăng nhập:

```http
POST http://localhost:5000/api/dat-lich
Content-Type: application/json
Cookie: accessToken=eyJhbG...; refreshToken=eyJhbG...
Origin: http://localhost:5173

{ "bacSiId": 1, ... }
```

## A.4. Luồng global trên mọi request (app.js)

Mọi request vào server đều đi qua (theo thứ tự):

1. `helmet()` — header bảo mật
2. `rateLimit` — giới hạn 100 req / 15 phút / IP
3. `cors({ origin: clientUrl, credentials: true })`
4. `express.json()` — parse JSON → `req.body`
5. `express.urlencoded()` — parse form
6. `cookieParser()` — parse cookie → `req.cookies`
7. Router `/api/*` — middleware riêng từng route
8. `notFoundHandler` / `errorHandler` nếu lỗi

## A.5. Chuỗi middleware trên một route (mẫu)

```
HTTP Request
  → [Global: helmet, cors, json, cookieParser]
  → routes/xxx.routes.js
  → [verifyTurnstile] (một số route auth)
  → [authenticate] (nếu cần đăng nhập)
  → [authorize("admin", "bac_si")] (nếu cần role)
  → [validate(ZodSchema)] (nếu có body cần kiểm tra)
  → [multerUpload] (nếu upload file)
  → Controller (req, res)
  → Service (logic + Prisma)
  → res.json(...) hoặc throw AppError
```

## A.6. Response chuẩn của backend

**Thành công:**

```json
{
  "success": true,
  "message": "Mô tả (tùy endpoint)",
  "data": { }
}
```

**Lỗi** (qua `errorHandler`):

```json
{
  "success": false,
  "message": "Lý do lỗi tiếng Việt"
}
```

**Mã HTTP thường gặp:** `200` OK, `201` Created, `400` Bad Request, `401` Chưa đăng nhập, `403` Không đủ quyền, `404` Không tìm thấy, `409` Trùng dữ liệu.

## A.7. Bảng mã trạng thái nghiệp vụ (nhớ khi báo cáo)

### `DatLich.trangThai` (trạng thái khám)

| Giá trị | Ý nghĩa |
|---------|---------|
| 0 | Chờ xác nhận |
| 1 | Đã xác nhận |
| 2 | Đã khám xong |
| 3 | Đã hủy |

### `DatLich.trangThaiThanhToan`

| Giá trị | Ý nghĩa |
|---------|---------|
| 0 | Chưa thanh toán |
| 1 | Đã trả phí khám |
| 2 | Đã thanh toán toàn bộ (khám + thuốc) |

### `HinhThucThanhToan.maLoai`

| Giá trị | Hành vi frontend |
|---------|------------------|
| `OFFLINE` | Trả tại quầy sau khi khám |
| `VNPAY` | Gọi API VNPay → redirect từ trang Kết quả (sau khi đã khám) |

---

# PHẦN B — AUTH (`/api/auth`)

---

## B.1. Đăng ký bệnh nhân

**Trang UI:** `/register` — `RegisterPage.jsx`  
**Service:** `authService.register()`  
**Endpoint:** `POST /api/auth/register`  
**Auth:** Không cần cookie

### Bước 1 — Client gửi

```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "benhnhan@example.com",
  "matKhau": "123456",
  "hoTen": "Nguyễn Văn A",
  "soDienThoai": "0912345678",
  "gioiTinh": 1,
  "ngaySinh": "2000-01-15",
  "diaChi": "Hà Nội"
}
```

| Nguồn | Trường | Bắt buộc |
|-------|--------|----------|
| Body | `email`, `matKhau`, `hoTen` | Có |
| Body | `soDienThoai`, `gioiTinh`, `ngaySinh`, `diaChi` | Không |

*(Có thể kèm Turnstile token tùy cấu hình `verifyTurnstile`.)*

### Bước 2 — Server middleware

1. `express.json()` → `req.body`
2. `verifyTurnstile` (nếu bật)
3. `validate(registerSchema)` — Zod
4. `authController.register`

### Bước 3 — Service logic

1. Kiểm tra email đã tồn tại → `409`
2. `bcrypt.hash(matKhau)`
3. Transaction: tạo `TaiKhoan` (`vaiTro: benh_nhan`) + `BenhNhan`
4. **Không** trả token — chỉ thông tin tài khoản cơ bản

### Bước 4 — Response

**201 Created:**

```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": { "id": "1", "email": "...", "vaiTro": "benh_nhan", "hoTen": "..." }
}
```

**Lỗi:** `409` email trùng, `400` validation.

### Bước 5 — Frontend

Toast thành công → `navigate("/login")`.

---

## B.2. Đăng nhập

**Trang UI:** `/login`, `/doctor/login`  
**Endpoint:** `POST /api/auth/login`

### Bước 1 — Client gửi

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "matKhau": "123456"
}
```

| Nguồn | Trường |
|-------|--------|
| Body | `email`, `matKhau` |

### Bước 2 — Server middleware

`verifyTurnstile` → `validate(loginSchema)` → `authController.login`

### Bước 3 — Service logic

1. Tìm `TaiKhoan` theo email (+ include bacSi/benhNhan)
2. Sai email/mật khẩu → `401`
3. Tài khoản khóa (`trangThaiTaiKhoan === 0`) → `403`
4. `bcrypt.compare` mật khẩu
5. Tạo access (15m) + refresh (7d), lưu refresh vào DB

### Bước 4 — Response

**200** — Body JSON **không chứa token**:

```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": { "id": "1", "email": "...", "vaiTro": "benh_nhan", "hoTen": "..." }
  }
}
```

**Set-Cookie (response headers):** `accessToken`, `refreshToken` (HttpOnly).

### Bước 5 — Frontend

Browser lưu cookie tự động → redirect theo `vaiTro` (admin/doctor/patient).

---

## B.3. Làm mới token (Refresh)

**Kích hoạt:** API khác trả `401` → Axios interceptor trong `api.js`  
**Endpoint:** `POST /api/auth/refresh`

### Bước 1 — Client gửi

```http
POST http://localhost:5000/api/auth/refresh
Cookie: refreshToken=...; accessToken=...
```

| Nguồn | Dữ liệu |
|-------|---------|
| Body | Rỗng `{}` |
| Cookie | `refreshToken` (bắt buộc) |

### Bước 2 — Server

`authController.refresh` → đọc `req.cookies.refreshToken` → verify → token rotation → set cookie mới.

### Bước 3 — Response

```json
{ "success": true, "message": "Token đã được làm mới" }
```

### Bước 4 — Frontend

Retry request gốc (cookie mới tự gửi).

---

## B.4. Đăng xuất

**Endpoint:** `POST /api/auth/logout` — **cần** `authenticate`

### Bước 1 — Client

```http
POST http://localhost:5000/api/auth/logout
Cookie: accessToken=...
```

### Bước 2 — Server

1. `authenticate` → `req.user`
2. Xóa `refreshToken` trong DB
3. `clearCookie` access + refresh

### Bước 3 — Response

```json
{ "success": true, "message": "Đăng xuất thành công" }
```

---

## B.5. Lấy thông tin user hiện tại

**Endpoint:** `GET /api/auth/me` — **cần** cookie

### Bước 1 — Client

```http
GET http://localhost:5000/api/auth/me
Cookie: accessToken=...
```

| Body | Query | Params |
|------|-------|--------|
| Không | Không | Không |

### Bước 2 — Server

`authenticate` → `authService.getMe(req.user.id)` → include bacSi/benhNhan.

### Bước 3 — Response

```json
{ "success": true, "data": { "id", "email", "vaiTro", "bacSi": {...}, "benhNhan": {...} } }
```

---

## B.6. Đổi mật khẩu

**Endpoint:** `PUT /api/auth/doi-mat-khau`

### Body

```json
{ "matKhauCu": "123456", "matKhauMoi": "654321" }
```

### Flow server

`authenticate` → `validate(doiMatKhauSchema)` → verify mật khẩu cũ → hash mới → update DB.

---

## B.7. Cập nhật hồ sơ

**Endpoint:** `PUT /api/auth/cap-nhat-ho-so`

### Body (tất cả optional)

```json
{
  "hoTen": "Tên mới",
  "soDienThoai": "09...",
  "email": "new@mail.com",
  "gioiTinh": 1,
  "ngaySinh": "2000-01-01",
  "diaChi": "...",
  "anhDaiDien": "https://..."
}
```

---

## B.8. Cập nhật avatar (khác JSON thuần)

**Endpoint:** `PUT /api/auth/cap-nhat-avatar`

### Bước 1 — Client

```http
PUT http://localhost:5000/api/auth/cap-nhat-avatar
Content-Type: multipart/form-data
Cookie: accessToken=...

FormData:
  avatar: (file ảnh)
```

| Nguồn | Kiểu |
|-------|------|
| Body | **multipart** — field `avatar`, không phải JSON |
| `req.file` | Sau multer: `path` = URL Cloudinary |

### Server

`authenticate` → `multerUpload.single("avatar")` → upload Cloudinary → lưu URL vào `TaiKhoan.anhDaiDien`.

---

## B.9. Quên mật khẩu / Đặt lại mật khẩu

| Endpoint | Body | Auth |
|----------|------|------|
| `POST /api/auth/forgot-password` | `{ "email" }` | Public + Turnstile |
| `POST /api/auth/reset-password` | `{ "email", "otp", "matKhauMoi" }` | Public |

---

# PHẦN C — ĐẶT LỊCH KHÁM (MẪU CHI TIẾT NHẤT)

---

## C.1. Lấy slot trống (trước khi đặt)

**Trang UI:** `BookingPage.jsx`  
**Endpoint:** `GET /api/dat-lich/slot-trong`  
**Auth:** **Không** cần đăng nhập

### Bước 1 — Client gửi

```http
GET http://localhost:5000/api/dat-lich/slot-trong?bacSiId=1&ngayDat=2026-05-17
```

| Nguồn | Trường | Ghi chú |
|-------|--------|---------|
| **Query** | `bacSiId` | ID bác sĩ |
| **Query** | `ngayDat` | `YYYY-MM-DD` |
| Body | — | GET không dùng body |
| Params | — | Không có `:id` trong path |

### Bước 2 — Server

1. Global middleware
2. `datLichController.getSlotTrong` — **không** `authenticate`
3. `datLichService.getSlotTrong(req.query)`
4. Logic: lấy ca làm việc `sanSang=1`, sinh slot theo `thoiLuongKham`, trừ giờ đã có `DatLich`

### Bước 3 — Response thành công

```json
{
  "success": true,
  "data": [
    { "gioBatDau": "08:00", "gioKetThuc": "08:20", "conTrong": true },
    { "gioBatDau": "08:20", "gioKetThuc": "08:40", "conTrong": false }
  ]
}
```

### Bước 4 — Frontend

Hiển thị danh sách giờ → user chọn `selectedSlot.gioBatDau`.

---

## C.2. Đặt lịch mới (POST)

**Trang UI:** `BookingPage.jsx` — bấm xác nhận  
**Service:** `appointmentService.create(data)`  
**Endpoint:** `POST /api/dat-lich`  
**Auth:** Cookie `accessToken` bắt buộc

### Bước 1 — Client gửi

```http
POST http://localhost:5000/api/dat-lich
Content-Type: application/json
Cookie: accessToken=...
Origin: http://localhost:5173

{
  "bacSiId": 1,
  "benhNhanId": 5,
  "ngayDat": "2026-05-17",
  "gioBatDau": "08:20",
  "lyDoKham": "Đau đầu"
}
```

| Nguồn | Trường | Bắt buộc | Ghi chú |
|-------|--------|----------|---------|
| Body | `bacSiId` | Có | ID số, không gửi tên bác sĩ |
| Body | `benhNhanId` | Có | Phải trùng tài khoản đang login (bệnh nhân) |
| Body | `ngayDat` | Có | Chuỗi ngày |
| Body | `gioBatDau` | Có | `HH:mm` |
| Body | `hinhThucThanhToanId` | Không | 1=tiền mặt, 2=VNPay... (có thể để trống) |
| Body | `lyDoKham` | Không | Max 255 ký tự |
| Body | `giaKham` | Không | Không gửi → lấy `bacSi.giaKham` |
| Body | `gioKetThuc` | **Không gửi** | Server tự tính |

**Không gửi trong body:** `trangThai`, `lichLamViecId` — server gán.

### Bước 2 — Server middleware (theo thứ tự)

1. `express.json()` → `req.body` là object JS  
   - `req.body.bacSiId` → `1`  
   - `req.body.ngayDat` → `"2026-05-17"`
2. `authenticate` — đọc `req.cookies.accessToken` → `req.user`
3. `validate(createDatLichSchema)` — Zod; sai → `400`
4. `datLichController.create(req, res)`
5. Gọi `datLichService.create(req.body, req.user)`

### Bước 3 — Service logic (từng bước nghiệp vụ)

1. **Phân quyền:** `benh_nhan` chỉ được `benhNhanId === req.user.benhNhan.id` → sai `403`
2. Kiểm tra `bacSi` tồn tại + lấy `thoiLuongKham` chuyên khoa → `404`
3. Kiểm tra `benhNhan` tồn tại → `404`
4. Tính `gioKetThuc = gioBatDau + thoiLuongKham` phút
5. Lấy `availableShifts` (ca làm `sanSang=1` trong ngày)
6. **Quét slot** trong ca: tìm ca có mốc giờ trùng `gioBatDau` → gán `lichLamViec`
7. Không có ca phù hợp → `400`
8. `soBenhNhanHienTai >= soBenhNhanToiDa` → `400` ca đầy
9. Trùng lịch (unique bacSi + ngay + gioBatDau) → `409`
10. **Transaction:**
    - `datLich.create` — `trangThai=0`, `trangThaiThanhToan=0`
    - `soBenhNhanHienTai++` trên ca
    - Xóa cache slot
11. (Optional) Nếu có truyền `hinhThucThanhToanId`, gắn thông tin `hinhThucThanhToan`.

### Bước 4 — Response thành công

**201 Created:**

```json
{
  "success": true,
  "message": "Đặt lịch thành công",
  "data": {
    "id": "123",
    "ngayDat": "...",
    "gioBatDau": "...",
    "gioKetThuc": "...",
    "trangThai": 0,
    "trangThaiThanhToan": 0,
    "bacSi": { },
    "benhNhan": { }
  }
}
```

### Bước 5 — Response lỗi thường gặp

| HTTP | Message (ví dụ) |
|------|-----------------|
| 400 | Slot không nằm trong ca / ca đầy |
| 401 | Chưa đăng nhập |
| 403 | Đặt lịch cho bệnh nhân khác |
| 409 | Khung giờ đã có người đăng ký |

### Bước 6 — Frontend sau response

- Bệnh nhân sẽ đợi xác nhận và đến khám. Sau khi khám xong (`trangThai = 2`), bệnh nhân vào trang Kết quả Khám để thanh toán VNPay hoặc tại quầy.

---

## C.3. Xem lịch sử (bệnh nhân)

**Endpoint:** `GET /api/dat-lich/benh-nhan/:id`

### Request

```http
GET http://localhost:5000/api/dat-lich/benh-nhan/5
Cookie: accessToken=...
```

| Nguồn | Giá trị |
|-------|---------|
| **Params** | `id` = `benhNhanId` |
| Body | Không |
| Query | Không (trong route cơ bản) |

### Server

`authenticate` → service kiểm tra ownership → `findMany` include bác sĩ, đơn thuốc.

### Response

```json
{ "success": true, "data": [ { "id", "trangThai", "bacSi": {}, "donThuoc": {} }, ... ] }
```

---

## C.4. Xem chi tiết một lịch

**Endpoint:** `GET /api/dat-lich/:id`

| Params | `id` = mã lịch hẹn |
| Auth | Cookie — ownership: BN/BS chỉ xem của mình, admin xem tất cả |

---

## C.5. Hủy / xóa lịch

**Endpoint:** `DELETE /api/dat-lich/:id`

| Params | `id` |
| Auth | Cookie — bệnh nhân chỉ xóa lịch của mình, trạng thái cho phép |

Service: transaction xóa đơn thuốc/giao dịch liên quan, giảm `soBenhNhanHienTai`.

---

## C.6. Cập nhật trạng thái lịch (bác sĩ / admin)

**Endpoint:** `PUT /api/dat-lich/:id/trang-thai`

### Body

```json
{ "trangThai": 1 }
```

| Params | `id` lịch hẹn |
| Body | `trangThai` (0–3) |
| Auth | `authenticate` + `authorize("admin", "bac_si")` |

Hủy (3) → hoàn trả slot ca làm việc.

---

## C.7. Cập nhật trạng thái thanh toán (admin)

**Endpoint:** `PUT /api/dat-lich/:id/thanh-toan`

```json
{ "trangThaiThanhToan": 1 }
```

Chỉ `authorize("admin")`.

---

## C.8. Đổi hình thức thanh toán

**Endpoint:** `PATCH /api/dat-lich/:id/payment-method`

```json
{ "hinhThucThanhToanId": 1 }
```

Bệnh nhân — khi muốn đổi từ VNPay sang trả tại quầy (hoặc ngược lại) ở màn hình Kết quả Khám.

---

# PHẦN D — VNPAY

---

## D.1. Tạo link thanh toán

**Từ MedicalResultPage (chỉ khi lịch hẹn có trangThai = 2, tức là Đã khám)**  
**Endpoint:** `POST /api/vnpay/create-payment`

### Bước 1 — Client

```http
POST http://localhost:5000/api/vnpay/create-payment
Content-Type: application/json
Cookie: accessToken=...

{
  "datLichId": 123,
  "loaiGiaoDich": "PHI_KHAM"
}
```

| Body | Ý nghĩa |
|------|---------|
| `datLichId` | ID lịch hẹn |
| `loaiGiaoDich` | `PHI_KHAM` \| `DON_THUOC` \| `TONG_HOP` |

**Không gửi `amount`** — server tự tính từ `giaKham` / `donThuoc.tongTien`.

### Bước 2 — Server

1. `authenticate`
2. Lấy IP từ `x-forwarded-for` hoặc `remoteAddress`
3. `vnpayService.initiatePayment`:
   - Kiểm tra lịch + quyền sở hữu
   - Tính số tiền, tạo `GiaoDich` chờ
   - Build URL sandbox VNPay + chữ ký HMAC

### Bước 3 — Response

```json
{
  "success": true,
  "paymentUrl": "https://sandbox.vnpayment.vn/..."
}
```

### Bước 4 — Frontend

`window.location.href = paymentUrl` — chuyển sang cổng VNPay.

---

## D.2. IPN (VNPay → Server, ngầm)

**Endpoint:** `GET /api/vnpay/ipn?vnp_Amount=...&vnp_TxnRef=...&vnp_SecureHash=...`  
**Auth:** Public — VNPay server gọi

| Nguồn | Dữ liệu |
|-------|---------|
| **Query** | Toàn bộ tham số `vnp_*` |
| Body | Không |

### Server

1. `verifyIpnCall` — kiểm tra chữ ký
2. `vnp_ResponseCode === "00"` → cập nhật `GiaoDich` + `DatLich.trangThaiThanhToan`
3. Trả `{ RspCode, Message }` cho VNPay

> **Quan trọng:** Cập nhật tiền vào DB qua **IPN**, không tin mỗi trang redirect user.

---

## D.3. Return URL (user quay lại)

**Endpoint:** `GET /api/vnpay/return?...`  
**Query:** params VNPay  
**Response:** JSON thành công/thất bại — frontend `PaymentResultPage` có thể gọi thêm `POST /api/vnpay/verify`.

---

## D.4. Verify chủ động (frontend)

**Endpoint:** `POST /api/vnpay/verify`

```json
{
  "vnp_Amount": "...",
  "vnp_TxnRef": "...",
  "vnp_ResponseCode": "00",
  "vnp_SecureHash": "..."
}
```

Body = params VNPay redirect về trang `/payment/result`.

---

# PHẦN E — BÁC SĨ (`/doctor`)

Mỗi API dưới đây đều cần **cookie** + role `bac_si` (trừ khi ghi public).

| # | Chức năng | Method | URL | Params | Query | Body |
|---|-----------|--------|-----|--------|-------|------|
| E.1 | Lịch hẹn của BS | GET | `/api/dat-lich/bac-si/:id` | `id`=bacSiId | — | — |
| E.2 | Chi tiết lịch | GET | `/api/dat-lich/:id` | `id` | — | — |
| E.3 | Đổi trạng thái khám | PUT | `/api/dat-lich/:id/trang-thai` | `id` | — | `{ trangThai }` |
| E.4 | Xem ca làm việc | GET | `/api/lich-lam-viec` | — | `bacSiId`, `ngayLamViec` | — |
| E.5 | Thêm ca | POST | `/api/lich-lam-viec` | — | — | `{ ngayLamViec, bacSiId, khungGioId, soBenhNhanToiDa? }` |
| E.6 | Đóng/mở ca | PUT | `/api/lich-lam-viec/:id` | `id` | — | `{ sanSang: 0\|1 }` |
| E.7 | Xóa ca | DELETE | `/api/lich-lam-viec/:id` | `id` | — | — |
| E.8 | Kê đơn thuốc | POST | `/api/don-thuoc` | — | — | xem C.9 bên dưới |

### E.8. Kê đơn thuốc — chi tiết

```http
POST http://localhost:5000/api/don-thuoc
Cookie: accessToken=...
authorize: bac_si

{
  "datLichId": 123,
  "chanDoan": "Viêm họng",
  "ghiChu": "Nghỉ ngơi",
  "chiTietDonThuoc": [
    {
      "tenThuoc": "Paracetamol",
      "soLuong": 10,
      "donGia": 2000,
      "lieuDung": "1 viên khi sốt",
      "ghiChu": ""
    }
  ]
}
```

**Service kiểm tra:** `datLich.trangThai === 2`, `bacSiId` khớp `req.user.bacSi.id`, chưa có đơn → `409`.  
**Tự tính** `tongTien` = sum(`soLuong * donGia`).

**Response 201:**

```json
{ "success": true, "data": { "id", "chanDoan", "tongTien", "chiTietDonThuoc": [...] } }
```

---

# PHẦN F — ADMIN (`/admin`)

Các API admin đều: **Cookie** + `authorize("admin")` (trừ public).

| # | Chức năng | Method | URL | Query / Body |
|---|-----------|--------|-----|----------------|
| F.1 | Dashboard | GET | `/api/thong-ke/tong-quan` | — |
| F.2 | Thống kê lịch | GET | `/api/thong-ke/lich-hen` | `?tuNgay=&denNgay=` |
| F.3 | Doanh thu | GET | `/api/thong-ke/doanh-thu` | `?nam=2026` |
| F.4 | DS chuyên khoa | GET | `/api/chuyen-khoa` | public |
| F.5 | Tạo CK | POST | `/api/chuyen-khoa` | body: `tenChuyenKhoa`, `thoiLuongKham`, ... |
| F.6 | DS bác sĩ | GET | `/api/bac-si` | `?page=&limit=&search=` |
| F.7 | Tạo BS | POST | `/api/bac-si` | body: `email`, `matKhau`, `tenBacSi`, `chuyenKhoaId`, ... |
| F.8 | DS bệnh nhân | GET | `/api/benh-nhan` | `?search=&page=` |
| F.9 | DS lịch hẹn | GET | `/api/dat-lich` | `?trangThai=&ngayDat=&page=` |
| F.10 | FAQ (tất cả) | GET | `/api/cau-hoi-thuong-gap/all` | `?page=` |
| F.11 | Hình thức TT | GET | `/api/hinh-thuc-thanh-toan` | public |

**Mẫu POST tạo bác sĩ (F.7):**

```json
{
  "tenBacSi": "BS. Nguyễn A",
  "hocViChucDanh": "ThS.",
  "email": "bacsi@clinic.com",
  "matKhau": "123456",
  "chuyenKhoaId": 1,
  "giaKham": 200000,
  "moTaNgan": "..."
}
```

Server: transaction `TaiKhoan` (`bac_si`) + `BacSi`.

---

# PHẦN G — PUBLIC (không cần đăng nhập)

| Endpoint | Query/Params | Response `data` |
|----------|--------------|-----------------|
| `GET /api/health` | — | `{ message, timestamp }` |
| `GET /api/bac-si` | `chuyenKhoaId`, `search`, `page`, `limit` | Danh sách BS + pagination |
| `GET /api/bac-si/:id` | params `id` | Chi tiết BS |
| `GET /api/chuyen-khoa` | — | Danh sách CK |
| `GET /api/chuyen-khoa/:id` | params `id` | CK + danh sách BS |
| `GET /api/cau-hoi-thuong-gap` | — | FAQ `dangHoatDong=1` |
| `GET /api/hinh-thuc-thanh-toan` | — | Tiền mặt, VNPay... |
| `GET /api/dat-lich/slot-trong` | `bacSiId`, `ngayDat` | Mảng slot |

---

# PHẦN H — KẾT QUẢ KHÁM / ĐƠN THUỐC (BỆNH NHÂN)

## H.1. Xem đơn thuốc

**Endpoint:** `GET /api/don-thuoc/:id` — cookie bệnh nhân

### Cơ chế khóa (Payment Gate)

| `trangThaiThanhToan` | BN nhận được |
|----------------------|--------------|
| `< 2` | Chẩn đoán, `tongTien`, **`chiTietDonThuoc: []`** + message yêu cầu thanh toán |
| `=== 2` | Full chi tiết thuốc |

Admin / bác sĩ: luôn xem full.

---

# PHẦN I — MẪU TRẢ LỜI HỘI ĐỒNG (30 GIÂY)

### “API đặt lịch nhận gì?”

> Em dùng `POST /api/dat-lich`. Client gửi **body JSON** gồm ID bác sĩ, ID bệnh nhân, ngày khám, giờ bắt đầu và có thể kèm lý do khám. Request có **cookie HttpOnly** chứng minh đã đăng nhập. Server validate bằng Zod, kiểm tra ca làm việc và slot trống, lưu database và trả kết quả. Việc thanh toán (VNPay) sẽ được thực hiện sau khi bác sĩ đánh dấu "Đã khám".

### “Body là gì?”

> Body là phần dữ liệu nghiệp vụ trong thân request POST/PUT. Trong project em dùng JSON, Express parse thành `req.body`. Khác với query trên URL và params là ID trên đường dẫn.

### “Xác thực thế nào?”

> Không lưu token ở localStorage. Server set JWT vào **HttpOnly cookie** khi login; mọi request sau browser tự gửi cookie nhờ `withCredentials: true`.

---

# PHỤ LỤC — CHECKLIST DEBUG

1. Đúng **method** + **URL**? (`routes/*.routes.js`)
2. **Body / query / params** đúng chỗ?
3. Đã **login** (cookie còn hạn)?
4. **Role** khớp `authorize`?
5. **Ownership** (BN chỉ sửa data của mình)?
6. Zod validation fail → đọc `message` trong response
7. VNPay: IPN đã chạy chưa (xem log `[VNPAY IPN]`)

---

# PHỤ LỤC — MAP FILE CODE

| Layer | Ví dụ đặt lịch |
|-------|----------------|
| UI | `client/src/pages/patient/BookingPage.jsx` |
| Service FE | `client/src/services/appointmentService.js` |
| Axios | `client/src/services/api.js` |
| Route | `server/src/routes/datLich.routes.js` |
| Validation | `server/src/validations/datLich.validation.js` |
| Controller | `server/src/controllers/datLich.controller.js` |
| Service BE | `server/src/services/datLich.service.js` |
| DB | `server/prisma/schema.prisma` — model `DatLich` |

---

*Tài liệu đồng bộ với codebase tại thời điểm tạo DOC_15. Khi đổi route/validation, cập nhật file này cùng `DOC_08` và `DOC_04`.*
