# HƯỚNG DẪN VẼ SƠ ĐỒ BẰNG VISUAL PARADIGM

## Dự án: Website Đặt Lịch Khám Bệnh Trực Tuyến — ClinicBooking

> Hướng dẫn từng bước vẽ các sơ đồ UML cho báo cáo đồ án tốt nghiệp.

---

## Mục lục

1. [Chuẩn bị](#1-chuẩn-bị)
2. [Sơ đồ Use Case](#2-sơ-đồ-use-case-use-case-diagram)
3. [Sơ đồ Hoạt động](#3-sơ-đồ-hoạt-động-activity-diagram)
4. [Sơ đồ Tuần tự](#4-sơ-đồ-tuần-tự-sequence-diagram)
5. [Sơ đồ Trạng thái](#5-sơ-đồ-trạng-thái-state-machine-diagram)
6. [Sơ đồ ERD](#6-sơ-đồ-erd-entity-relationship-diagram)
7. [Sơ đồ Lớp](#7-sơ-đồ-lớp-class-diagram)
8. [Sơ đồ Thành phần & Triển khai](#8-sơ-đồ-thành-phần--triển-khai)
9. [Xuất hình ảnh](#9-xuất-hình-ảnh-cho-báo-cáo-word)

---

## 1. Chuẩn bị

### 1.1 Tạo Project mới

1. Mở **Visual Paradigm**
2. `File` → `New Project…`
3. Đặt tên: **ClinicBooking**
4. Chọn thư mục lưu → `Create`

### 1.2 Mẹo chung

- **Kéo thả từ bảng Diagram Toolbar** (bên trái) để thêm phần tử
- **Ctrl + Z** để undo
- **Ctrl + Shift + Z** để redo
- Click đúp vào phần tử để **đổi tên**
- Kéo từ **phần tử A → phần tử B** để tạo quan hệ (mũi tên)
- Click chuột phải → `Format` → `Fill Color` để đổi màu
- Để căn chỉnh nhiều phần tử: chọn tất cả → chuột phải → `Alignment`

---

## 2. Sơ đồ Use Case (Use Case Diagram)

### 2.1 Tạo diagram

1. `Diagram` → `New` → tìm **"Use Case Diagram"** → `Next` → đặt tên **"UC - Tong quan"** → `OK`

### 2.2 Thêm Actor

Kéo icon **Actor** (hình người) từ toolbar vào diagram. Tạo 3 actor:

| Actor | Tên hiển thị |
|-------|-------------|
| Actor 1 | `Bệnh nhân` |
| Actor 2 | `Bác sĩ` |
| Actor 3 | `Admin` |

> 💡 Đặt các Actor ở **bên trái** diagram

### 2.3 Thêm System Boundary

1. Kéo **System Boundary** (hình chữ nhật) từ toolbar vào giữa diagram
2. Click đúp để đặt tên: **"Hệ thống đặt lịch khám bệnh trực tuyến"**
3. Kéo rộng ra để chứa tất cả Use Case bên trong

### 2.4 Thêm Use Case

Kéo **Use Case** (hình oval) vào bên trong System Boundary. Tạo các UC sau:

#### Nhóm Auth (đặt phía trên)

| UC | Tên hiển thị |
|----|-------------|
| UC01 | Đăng ký tài khoản |
| UC02 | Đăng nhập |
| UC03 | Đăng xuất |
| UC04 | Đổi mật khẩu |
| UC05 | Cập nhật hồ sơ |

#### Nhóm Bệnh nhân (đặt bên trái)

| UC | Tên hiển thị |
|----|-------------|
| UC06 | Xem danh sách chuyên khoa |
| UC07 | Tìm kiếm bác sĩ |
| UC08 | Xem thông tin bác sĩ |
| UC09 | Đặt lịch khám |
| UC10 | Xem lịch sử lịch hẹn |
| UC11 | Hủy lịch hẹn |
| UC12 | Xem kết quả khám / đơn thuốc |

#### Nhóm Bác sĩ (đặt giữa-phải)

| UC | Tên hiển thị |
|----|-------------|
| UC13 | Tạo lịch làm việc |
| UC14 | Xem lịch hẹn của tôi |
| UC15 | Cập nhật trạng thái lịch hẹn |
| UC16 | Kê đơn thuốc |

#### Nhóm Admin (đặt bên phải)

| UC | Tên hiển thị |
|----|-------------|
| UC17 | Quản lý chuyên khoa |
| UC18 | Quản lý bác sĩ |
| UC19 | Quản lý bệnh nhân |
| UC20 | Quản lý FAQ |
| UC21 | Quản lý hình thức thanh toán |
| UC22 | Xem tất cả lịch hẹn |
| UC23 | Xem thống kê |

### 2.5 Vẽ quan hệ (Association)

Kéo đường nối từ **Actor** → **Use Case**:

**Bệnh nhân** nối đến:
- UC01, UC02, UC03, UC04, UC05
- UC06, UC07, UC08, UC09, UC10, UC11, UC12

**Bác sĩ** nối đến:
- UC02, UC03, UC04, UC05
- UC13, UC14, UC15, UC16

**Admin** nối đến:
- UC02, UC03
- UC15, UC17, UC18, UC19, UC20, UC21, UC22, UC23

### 2.6 Vẽ quan hệ Include / Extend

Cách vẽ:
1. Chọn tool **Dependency** hoặc **Include/Extend** từ toolbar
2. Kéo từ UC gốc → UC đích
3. Click đúp lên đường nối → chọn stereotype: `<<include>>` hoặc `<<extend>>`

#### Quan hệ Include

| Từ UC | Đến UC | Ghi chú |
|-------|--------|---------|
| UC09 (Đặt lịch) | Kiểm tra lịch bác sĩ | Bác sĩ phải có lịch làm việc ngày đó |
| UC09 (Đặt lịch) | Kiểm tra trùng lịch | Unique constraint bacSiId + ngayDat + gioBatDau |
| UC09 (Đặt lịch) | Xác thực JWT | Phải đăng nhập trước |
| UC11 (Hủy lịch) | Kiểm tra quyền sở hữu | Chỉ chủ lịch mới hủy được |
| UC11 (Hủy lịch) | Kiểm tra trạng thái | Chỉ hủy khi chưa xác nhận |
| UC16 (Kê đơn) | Kiểm tra trạng thái = "Đã khám" | Chỉ kê khi đã khám xong |

#### Quan hệ Extend

| Từ UC | Đến UC | Ghi chú |
|-------|--------|---------|
| Chọn hình thức thanh toán | UC09 (Đặt lịch) | Extension point |

> 💡 **Mẹo bố cục**: Nên tách thành 2-3 diagram riêng nếu quá nhiều UC. Ví dụ:
> - Diagram 1: **UC tổng quan** (chỉ có các UC chính, không có include/extend)
> - Diagram 2: **UC chi tiết - Đặt lịch** (chỉ focus vào UC09 + include/extend)
> - Diagram 3: **UC chi tiết - Admin** (CRUD operations)

---

## 3. Sơ đồ Hoạt động (Activity Diagram)

### 3.1 Tạo diagram

`Diagram` → `New` → tìm **"Activity Diagram"** → đặt tên

Nên tạo **3 diagram riêng**:
- `AD - Dang nhap`
- `AD - Dat lich kham`
- `AD - Cap nhat trang thai lich hen`

### 3.2 Các phần tử cần dùng (kéo từ toolbar)

| Phần tử | Hình dạng | Ý nghĩa |
|---------|-----------|---------|
| **Initial Node** | ● (tròn đen đặc) | Điểm bắt đầu |
| **Activity Final Node** | ⊕ (tròn đen viền tròn) | Điểm kết thúc |
| **Action** | ▭ (chữ nhật bo góc) | Hành động / bước xử lý |
| **Decision** | ◇ (hình thoi) | Điểm rẽ nhánh (if/else) |
| **Merge** | ◇ (hình thoi) | Gộp nhánh lại |
| **Swimlane** | Cột dọc | Phân chia theo actor/tầng |

### 3.3 Activity Diagram: Đăng nhập

#### Thêm Swimlane (2 lane)

1. Chuột phải vào diagram → `Add Swimlane` hoặc kéo từ toolbar
2. Tạo 2 lane: **"Người dùng / Frontend"** | **"Server / Backend"**

#### Vẽ flow (theo thứ tự từ trên xuống)

```
Lane: Người dùng / Frontend
──────────────────────────────
● Initial Node
│
▼
[Nhập email + mật khẩu]
│
▼
[Gửi POST /api/auth/login]
│
─────── chuyển sang lane Backend ───────

Lane: Server / Backend
──────────────────────────────
▼
[Validate dữ liệu đầu vào]
│
◇ Dữ liệu hợp lệ?
├── Không → [Trả lỗi 400] → ⊕ End
│
▼ Có
[Tìm tài khoản theo email]
│
◇ Email tồn tại?
├── Không → [Trả lỗi 401: Sai email/mật khẩu] → ⊕ End
│
▼ Có
◇ Tài khoản bị khóa?
├── Bị khóa → [Trả lỗi 403: Tài khoản bị khóa] → ⊕ End
│
▼ Hoạt động
[So sánh mật khẩu (bcrypt)]
│
◇ Mật khẩu đúng?
├── Sai → [Trả lỗi 401: Sai email/mật khẩu] → ⊕ End
│
▼ Đúng
[Tạo Access Token (JWT)]
│
▼
[Tạo Refresh Token (JWT)]
│
▼
[Lưu Refresh Token vào Database]
│
▼
[Set Refresh Token vào Cookie HttpOnly]
│
▼
[Trả Access Token + thông tin user]
│
─────── chuyển sang lane Frontend ───────

Lane: Người dùng / Frontend
──────────────────────────────
▼
[Lưu Access Token vào store]
│
▼
[Redirect theo vai trò (admin/bác sĩ/bệnh nhân)]
│
▼
⊕ Activity Final Node
```

### 3.4 Activity Diagram: Đặt lịch khám

#### Thêm Swimlane (2 lane): **"Bệnh nhân / Frontend"** | **"Server / Backend"**

#### Vẽ flow

```
Lane: Bệnh nhân / Frontend
──────────────────────────────
● Initial Node
│
▼
[Chọn chuyên khoa]
│
▼
[Chọn bác sĩ]
│
▼
[Xem thông tin bác sĩ + lịch trống]
│
▼
[Chọn ngày + khung giờ]
│
▼
[Nhập lý do khám + Chọn hình thức thanh toán]
│
▼
[Gửi POST /api/dat-lich (kèm JWT)]
│
─────── chuyển sang lane Backend ───────

Lane: Server / Backend
──────────────────────────────
▼
[Validate dữ liệu đầu vào]
│
◇ Hợp lệ?
├── Không → [Trả lỗi 400] → ⊕ End
│
▼ Có
[Xác thực JWT, lấy thông tin user]
│
◇ JWT hợp lệ?
├── Không → [Trả lỗi 401] → ⊕ End
│
▼ Có
[Kiểm tra bác sĩ tồn tại]
│
◇ Tồn tại?
├── Không → [Trả lỗi 404] → ⊕ End
│
▼ Có
[Kiểm tra bệnh nhân tồn tại]
│
◇ Tồn tại?
├── Không → [Trả lỗi 404] → ⊕ End
│
▼ Có
[Kiểm tra LichLamViecBacSi: ngày đó + sanSang = 1?]
│
◇ Có lịch làm việc?
├── Không → [Trả lỗi 400: Bác sĩ không có lịch] → ⊕ End
│
▼ Có
[Kiểm tra trùng lịch: bacSiId + ngayDat + gioBatDau]
│
◇ Trùng lịch?
├── Trùng → [Trả lỗi 409: Lịch đã được đặt] → ⊕ End
│
▼ Không trùng
[Tạo DatLich (trangThai = 0: Chờ xác nhận)]
│
▼
[Trả 201 + thông tin lịch hẹn]
│
─────── chuyển sang lane Frontend ───────

Lane: Bệnh nhân / Frontend
──────────────────────────────
▼
[Hiển thị "Đặt lịch thành công"]
│
▼
⊕ Activity Final Node
```

### 3.5 Activity Diagram: Cập nhật trạng thái lịch hẹn

#### Swimlane: **"Bác sĩ / Admin"** | **"Server"**

```
Lane: Bác sĩ / Admin
──────────────────────────────
● Initial Node
│
▼
[Chọn lịch hẹn cần cập nhật]
│
▼
[Chọn trạng thái mới]
│
▼
[Gửi PUT /api/dat-lich/:id/trang-thai]
│
─────── chuyển sang lane Server ───────

Lane: Server
──────────────────────────────
▼
[Xác thực JWT + Kiểm tra vai trò]
│
◇ Có quyền?
├── Không → [Trả lỗi 403] → ⊕ End
│
▼ Có
[Lấy thông tin lịch hẹn hiện tại]
│
◇ Trạng thái hiện tại?
│
├── 0 (Chờ) ──→ ◇ Hành động?
│                ├── Xác nhận → [Cập nhật trangThai = 1] → [Trả thành công]
│                └── Hủy → [Cập nhật trangThai = 3] → [Trả thành công]
│
├── 1 (Đã xác nhận) ──→ ◇ Hành động?
│                        ├── Đã khám → [Cập nhật trangThai = 2] → [Trả thành công]
│                        └── Hủy → [Cập nhật trangThai = 3] → [Trả thành công]
│
├── 2 (Đã khám) ──→ [Không cho phép thay đổi] → [Trả lỗi 400]
│
└── 3 (Đã hủy) ──→ [Không cho phép thay đổi] → [Trả lỗi 400]
│
▼
⊕ Activity Final Node
```

---

## 4. Sơ đồ Tuần tự (Sequence Diagram)

### 4.1 Tạo diagram

`Diagram` → `New` → tìm **"Sequence Diagram"** → đặt tên

Nên tạo **3 diagram**:
- `SD - Dang nhap`
- `SD - Dat lich kham`
- `SD - Refresh Token`

### 4.2 Các phần tử cần dùng

| Phần tử | Ý nghĩa | Cách thêm |
|---------|---------|-----------|
| **Actor** | Người dùng | Kéo từ toolbar (hình người) |
| **Lifeline** | Đối tượng tham gia | Kéo từ toolbar (hình chữ nhật + đường gạch) |
| **Message** | Lời gọi | Kéo mũi tên đặc từ A → B |
| **Return Message** | Phản hồi | Kéo mũi tên đứt nét từ B → A |
| **Alt Fragment** | Rẽ nhánh (if/else) | Kéo từ toolbar hoặc chuột phải → Add Fragment → alt |
| **Activation Box** | Thời gian xử lý | Tự động xuất hiện khi có message |

### 4.3 Sequence: Đăng nhập

#### Tạo các Lifeline (từ trái → phải)

1. **Actor**: `Bệnh nhân`
2. **Lifeline**: `Frontend (React)`
3. **Lifeline**: `Router (Express)`
4. **Lifeline**: `Validate MW`
5. **Lifeline**: `Auth Service`
6. **Lifeline**: `Database (PostgreSQL)`

#### Vẽ Messages (từ trên xuống)

| # | Loại | Từ | Đến | Nội dung message |
|---|------|----|----|-----------------|
| 1 | Message | Bệnh nhân | Frontend | `nhập email + mật khẩu` |
| 2 | Message | Frontend | Router | `POST /api/auth/login` |
| 3 | Message | Router | Validate MW | `validate(body)` |
| 4 | Return | Validate MW | Router | `OK` |
| 5 | Message | Router | Auth Service | `login({email, matKhau})` |
| 6 | Message | Auth Service | Database | `findUnique({email})` |
| 7 | Return | Database | Auth Service | `TaiKhoan data` |
| 8 | **Self-message** | Auth Service | Auth Service | `bcrypt.compare()` |
| 9 | **Self-message** | Auth Service | Auth Service | `generateTokens()` |
| | | | | *Thêm Note: "Tạo Access Token + Refresh Token"* |
| 10 | Message | Auth Service | Database | `UPDATE refreshToken` |
| 11 | Return | Database | Auth Service | `OK` |
| 12 | Return | Auth Service | Router | `{user, accessToken, refreshToken}` |
| 13 | **Self-message** | Router | Router | `res.cookie("refreshToken", HttpOnly)` |
| 14 | Return | Router | Frontend | `{user, accessToken}` |
| 15 | **Self-message** | Frontend | Frontend | `Lưu token + redirect theo vai trò` |
| 16 | Return | Frontend | Bệnh nhân | `Hiển thị trang chủ` |

### 4.4 Sequence: Đặt lịch khám

#### Tạo các Lifeline

1. **Actor**: `Bệnh nhân`
2. **Lifeline**: `Frontend`
3. **Lifeline**: `Router`
4. **Lifeline**: `Auth MW`
5. **Lifeline**: `DatLich Service`
6. **Lifeline**: `Database`

#### Vẽ Messages

| # | Loại | Từ | Đến | Nội dung |
|---|------|----|----|----------|
| 1 | Message | Bệnh nhân | Frontend | `chọn bác sĩ + ngày + giờ` |
| 2 | Message | Frontend | Router | `POST /api/dat-lich (Bearer token)` |
| 3 | Message | Router | Auth MW | `authenticate(JWT)` |
| 4 | Message | Auth MW | Database | `findUnique(userId)` |
| 5 | Return | Database | Auth MW | `TaiKhoan + vaiTro` |
| 6 | Return | Auth MW | Router | `req.user` |
| 7 | Message | Router | DatLich Service | `create(data)` |
| 8 | Message | DatLich Service | Database | `Check BacSi tồn tại?` |
| 9 | Return | Database | DatLich Service | `BacSi data` |
| 10 | Message | DatLich Service | Database | `Check BenhNhan tồn tại?` |
| 11 | Return | Database | DatLich Service | `BenhNhan data` |
| 12 | Message | DatLich Service | Database | `Check LichLamViec (ngày + sẵn sàng)` |
| 13 | Return | Database | DatLich Service | `Lịch làm việc data` |
| 14 | Message | DatLich Service | Database | `Check trùng lịch (unique constraint)` |
| 15 | Return | Database | DatLich Service | `Không trùng` |

Thêm **Alt Fragment** bao quanh bước 14-15 trở đi:

**Alt (Không trùng lịch):**

| # | Loại | Từ | Đến | Nội dung |
|---|------|----|----|----------|
| 16 | Message | DatLich Service | Database | `CREATE DatLich (trangThai=0)` |
| 17 | Return | Database | DatLich Service | `DatLich created` |
| 18 | Return | DatLich Service | Router | `appointment data` |
| 19 | Return | Router | Frontend | `201 + JSON` |
| 20 | Return | Frontend | Bệnh nhân | `"Đặt lịch thành công"` |

**Else (Trùng lịch):**

| # | Loại | Từ | Đến | Nội dung |
|---|------|----|----|----------|
| 16' | Return | DatLich Service | Router | `Error 409` |
| 17' | Return | Router | Frontend | `"Lịch đã được đặt"` |

### 4.5 Sequence: Refresh Token Rotation

#### Tạo các Lifeline

1. **Lifeline**: `Frontend`
2. **Lifeline**: `Router`
3. **Lifeline**: `Auth Service`
4. **Lifeline**: `Database`

#### Vẽ Messages

Thêm **Note** ở trên: *"Access Token hết hạn"*

| # | Loại | Từ | Đến | Nội dung |
|---|------|----|----|----------|
| 1 | Message | Frontend | Router | `POST /api/auth/refresh-token` |
| | | | | *Note: "Cookie tự động gửi kèm refreshToken"* |
| 2 | Message | Router | Auth Service | `refreshAccessToken(cookieToken)` |
| 3 | **Self** | Auth Service | Auth Service | `jwt.verify(token, secret)` |
| 4 | Message | Auth Service | Database | `findUnique(decoded.id)` |
| 5 | Return | Database | Auth Service | `TaiKhoan (có refreshToken)` |

**Alt Fragment (Token khớp: cookie == DB):**

| # | Loại | Từ | Đến | Nội dung |
|---|------|----|----|----------|
| 6 | **Self** | Auth Service | Auth Service | `generateTokens() — tạo cặp mới` |
| 7 | Message | Auth Service | Database | `UPDATE refreshToken mới` |
| 8 | Return | Database | Auth Service | `OK` |
| 9 | Return | Auth Service | Router | `{accessToken, refreshToken} mới` |
| 10 | **Self** | Router | Router | `res.cookie(refreshToken mới)` |
| 11 | Return | Router | Frontend | `{accessToken mới}` |
| | | | | *Note: "Token cũ TỰ ĐỘNG VÔ HIỆU (Rotation)"* |

**Else (Token KHÔNG khớp):**

| # | Loại | Từ | Đến | Nội dung |
|---|------|----|----|----------|
| 6' | Return | Auth Service | Router | `Error 401` |
| 7' | Return | Router | Frontend | `"Token không hợp lệ"` |
| | | | | *Note: "Redirect về trang đăng nhập"* |

---

## 5. Sơ đồ Trạng thái (State Machine Diagram)

### 5.1 Tạo diagram

`Diagram` → `New` → tìm **"State Machine Diagram"** → đặt tên `SM - Trang thai lich hen`

### 5.2 Sơ đồ trạng thái lịch hẹn (DatLich.trangThai)

#### Các phần tử cần thêm

| Phần tử | Hình dạng | Cách thêm |
|---------|-----------|-----------|
| **Initial State** | ● (tròn đen) | Kéo từ toolbar |
| **State** | ▭ bo góc | Kéo từ toolbar |
| **Final State** | ⊕ | Kéo từ toolbar |
| **Transition** | Mũi tên | Kéo từ state → state |

#### Các State (tạo 4 state)

| State | Tên hiển thị | Mô tả bên trong |
|-------|-------------|-----------------|
| S0 | **Chờ xác nhận** | `trangThai = 0` |
| S1 | **Đã xác nhận** | `trangThai = 1` |
| S2 | **Đã khám** | `trangThai = 2` |
| S3 | **Đã hủy** | `trangThai = 3` |

#### Các Transition (vẽ mũi tên + ghi nhãn)

| Từ | Đến | Nhãn trên mũi tên |
|----|-----|--------------------|
| ● Initial | S0 | `Bệnh nhân đặt lịch` |
| S0 | S1 | `Bác sĩ / Admin xác nhận` |
| S0 | S3 | `Bệnh nhân / Bác sĩ / Admin hủy` |
| S1 | S2 | `Bác sĩ hoàn thành khám` |
| S1 | S3 | `Bác sĩ / Admin hủy` |
| S2 | ⊕ Final | *(không cần nhãn)* |
| S3 | ⊕ Final | *(không cần nhãn)* |

> 💡 **Bố cục gợi ý**: Đặt S0 ở trên, S1 ở giữa bên trái, S3 ở giữa bên phải, S2 ở dưới bên trái

### 5.3 Sơ đồ trạng thái tài khoản

Tạo diagram mới: `SM - Trang thai tai khoan`

| Từ | Đến | Nhãn |
|----|-----|------|
| ● Initial | Hoạt động (1) | `Đăng ký thành công` |
| Hoạt động (1) | Bị khóa (0) | `Admin khóa tài khoản` |
| Bị khóa (0) | Hoạt động (1) | `Admin mở khóa` |

---

## 6. Sơ đồ ERD (Entity Relationship Diagram)

### 6.1 Tạo diagram

`Diagram` → `New` → tìm **"Entity Relationship Diagram"** → đặt tên `ERD - Co so du lieu`

### 6.2 Tạo các Entity (bảng)

Kéo **Entity** vào diagram. Với mỗi entity, **click đúp** để thêm attribute.

#### Entity 1: TaiKhoan

| Attribute | Kiểu | Key | Ghi chú |
|-----------|------|-----|---------|
| `id` | BigInt | PK | Auto increment |
| `email` | VarChar(255) | UK | Unique |
| `matKhau` | VarChar(255) | | Hashed |
| `vaiTro` | VarChar(50) | | admin / bac_si / benh_nhan |
| `trangThaiTaiKhoan` | Int | | 1=hoạt động, 0=khóa |
| `refreshToken` | Text | | JWT refresh token |
| `gioiTinh` | Int | | 1=Nam, 2=Nữ, 3=Khác |
| `ngaySinh` | Date | | |
| `diaChi` | VarChar(255) | | |
| `anhDaiDien` | VarChar(255) | | |
| `ngayTao` | DateTime | | Default: now() |
| `ngayCapNhat` | DateTime | | Auto update |

#### Entity 2: ChuyenKhoa

| Attribute | Kiểu | Key |
|-----------|------|-----|
| `id` | BigInt | PK |
| `tenChuyenKhoa` | VarChar(120) | |
| `anhChuyenKhoa` | VarChar(255) | |
| `moTaChuyenKhoa` | Text | |

#### Entity 3: BacSi

| Attribute | Kiểu | Key | Ghi chú |
|-----------|------|-----|---------|
| `id` | BigInt | PK | |
| `hocViChucDanh` | VarChar(120) | | |
| `tenBacSi` | VarChar(120) | | |
| `moTaNgan` | VarChar(255) | | |
| `moTaChiTiet` | Text | | |
| `giaKham` | Decimal(10,2) | | |
| `taiKhoanId` | BigInt | FK, UK | → TaiKhoan.id |
| `chuyenKhoaId` | BigInt | FK | → ChuyenKhoa.id |

#### Entity 4: BenhNhan

| Attribute | Kiểu | Key | Ghi chú |
|-----------|------|-----|---------|
| `id` | BigInt | PK | |
| `hoTen` | VarChar(120) | | |
| `soDienThoai` | VarChar(20) | | |
| `emailLienHe` | VarChar(255) | | |
| `taiKhoanId` | BigInt | FK, UK | → TaiKhoan.id |

#### Entity 5: KhungGio

| Attribute | Kiểu | Key |
|-----------|------|-----|
| `id` | BigInt | PK |
| `gioBatDau` | Time | |
| `gioKetThuc` | Time | |

#### Entity 6: LichLamViecBacSi

| Attribute | Kiểu | Key | Ghi chú |
|-----------|------|-----|---------|
| `id` | BigInt | PK | |
| `ngayLamViec` | Date | | |
| `soBenhNhanHienTai` | Int | | Default: 0 |
| `sanSang` | Int | | 1=sẵn sàng, 0=không |
| `bacSiId` | BigInt | FK | → BacSi.id |
| `khungGioId` | BigInt | FK | → KhungGio.id |

#### Entity 7: HinhThucThanhToan

| Attribute | Kiểu | Key |
|-----------|------|-----|
| `id` | BigInt | PK |
| `tenHinhThuc` | VarChar(120) | |

#### Entity 8: DatLich

| Attribute | Kiểu | Key | Ghi chú |
|-----------|------|-----|---------|
| `id` | BigInt | PK | |
| `ngayDat` | Date | | |
| `gioBatDau` | Time | | |
| `gioKetThuc` | Time | | |
| `lyDoKham` | VarChar(255) | | |
| `giaKham` | Decimal(10,2) | | |
| `trangThai` | Int | | 0=chờ, 1=xác nhận, 2=đã khám, 3=hủy |
| `bacSiId` | BigInt | FK | → BacSi.id |
| `benhNhanId` | BigInt | FK | → BenhNhan.id |
| `hinhThucThanhToanId` | BigInt | FK | → HinhThucThanhToan.id |

> ⚠️ **UNIQUE Constraint**: `(bacSiId, ngayDat, gioBatDau)` — chuột phải vào entity → `Unique Constraint` → thêm 3 cột này

#### Entity 9: DonThuoc

| Attribute | Kiểu | Key | Ghi chú |
|-----------|------|-----|---------|
| `id` | BigInt | PK | |
| `datLichId` | BigInt | FK, UK | → DatLich.id (unique) |
| `ngayTao` | DateTime | | Default: now() |

#### Entity 10: CauHoiThuongGap

| Attribute | Kiểu | Key |
|-----------|------|-----|
| `id` | BigInt | PK |
| `cauHoi` | VarChar(255) | |
| `traLoi` | Text | |
| `dangHoatDong` | Int | |

### 6.3 Vẽ Relationship (quan hệ)

Cách vẽ: dùng tool **Relationship** từ toolbar, kéo từ entity A → entity B, sau đó chỉnh cardinality.

| Từ Entity | Đến Entity | Cardinality | Kiểu |
|-----------|-----------|-------------|------|
| TaiKhoan | BacSi | 1 ── 0..1 | One-to-ZeroOrOne |
| TaiKhoan | BenhNhan | 1 ── 0..1 | One-to-ZeroOrOne |
| ChuyenKhoa | BacSi | 1 ── 0..* | One-to-Many |
| BacSi | LichLamViecBacSi | 1 ── 0..* | One-to-Many |
| KhungGio | LichLamViecBacSi | 1 ── 0..* | One-to-Many |
| BacSi | DatLich | 1 ── 0..* | One-to-Many |
| BenhNhan | DatLich | 1 ── 0..* | One-to-Many |
| HinhThucThanhToan | DatLich | 1 ── 0..* | One-to-Many |
| DatLich | DonThuoc | 1 ── 0..1 | One-to-ZeroOrOne |

> 💡 **Bố cục gợi ý**: Đặt `TaiKhoan` ở trên cùng giữa. `BacSi` và `BenhNhan` ở hàng 2. `DatLich` ở giữa (bảng trung tâm). `LichLamViecBacSi`, `KhungGio`, `DonThuoc` ở các cạnh.

---

## 7. Sơ đồ Lớp (Class Diagram)

### 7.1 Tạo diagram

`Diagram` → `New` → **"Class Diagram"** → đặt tên `CD - Backend Architecture`

### 7.2 Tạo các Class (theo kiến trúc backend)

Vẽ các class thể hiện kiến trúc **Controller → Service → Prisma**:

#### Class: AuthController

```
┌──────────────────────────┐
│    <<controller>>        │
│    AuthController        │
├──────────────────────────┤
│                          │
├──────────────────────────┤
│ + register(req, res)     │
│ + login(req, res)        │
│ + refresh(req, res)      │
│ + logout(req, res)       │
│ + getMe(req, res)        │
│ + doiMatKhau(req, res)   │
│ + capNhatHoSo(req, res)  │
└──────────────────────────┘
```

#### Class: AuthService

```
┌─────────────────────────────────┐
│    <<service>>                  │
│    AuthService                  │
├─────────────────────────────────┤
│                                 │
├─────────────────────────────────┤
│ + register(data): TaiKhoan      │
│ + login(data): {user, tokens}   │
│ + refreshAccessToken(token)     │
│ + logout(userId)                │
│ + getMe(userId): TaiKhoan       │
│ + doiMatKhau(userId, data)      │
│ + capNhatHoSo(userId, data)     │
│ - generateTokens(id): {AT, RT}  │
└─────────────────────────────────┘
```

Tương tự tạo thêm:

| Class | Stereotype | Các method chính |
|-------|-----------|------------------|
| `DatLichController` | `<<controller>>` | getAll, getById, create, updateStatus, delete |
| `DatLichService` | `<<service>>` | getAll, getById, create, updateStatus, delete |
| `BacSiController` | `<<controller>>` | getAll, getById, create, update, delete |
| `BacSiService` | `<<service>>` | getAll, getById, create, update, delete |
| `LichLamViecController` | `<<controller>>` | getAll, create, update, delete |
| `LichLamViecService` | `<<service>>` | getAll, create, update, delete |
| `AuthMiddleware` | `<<middleware>>` | authenticate, authorize |
| `ErrorMiddleware` | `<<middleware>>` | handleError |
| `ValidateMiddleware` | `<<middleware>>` | validate |

### 7.3 Vẽ quan hệ

| Từ | Đến | Kiểu | Nhãn |
|----|-----|------|------|
| AuthController | AuthService | Dependency (mũi tên đứt nét) | `<<uses>>` |
| DatLichController | DatLichService | Dependency | `<<uses>>` |
| AuthService | PrismaClient | Dependency | `<<uses>>` |
| DatLichService | PrismaClient | Dependency | `<<uses>>` |
| Router | AuthMiddleware | Dependency | `<<uses>>` |
| Router | ValidateMiddleware | Dependency | `<<uses>>` |

---

## 8. Sơ đồ Thành phần & Triển khai

### 8.1 Sơ đồ Thành phần (Component Diagram)

`Diagram` → `New` → **"Component Diagram"** → đặt tên `COMP - He thong`

#### Các Component cần tạo

```
┌─────────────────────────────────────────────────────┐
│  <<subsystem>> Frontend                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │  Pages   │ │Components│ │ Services │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│  ┌──────────┐ ┌──────────┐                         │
│  │  Stores  │ │  Router  │                         │
│  └──────────┘ └──────────┘                         │
└─────────────────────────────────────────────────────┘
                      │
                      │ HTTP/REST + JWT
                      ▼
┌─────────────────────────────────────────────────────┐
│  <<subsystem>> Backend                               │
│  ┌──────────┐ ┌────────────┐ ┌──────────┐          │
│  │  Routes  │→│ Middlewares │→│Controllers│          │
│  └──────────┘ └────────────┘ └──────────┘          │
│                                    │                │
│                                    ▼                │
│                              ┌──────────┐           │
│                              │ Services │           │
│                              └──────────┘           │
│                                    │                │
│                                    ▼                │
│                              ┌──────────┐           │
│                              │  Prisma  │           │
│                              └──────────┘           │
└─────────────────────────────────────────────────────┘
                      │
                      │ SQL Query
                      ▼
┌─────────────────────────────────────────────────────┐
│  <<database>> PostgreSQL (Supabase)                  │
│  ┌──────────────────────────────────────────┐       │
│  │ TaiKhoan | BacSi | BenhNhan | DatLich   │       │
│  │ ChuyenKhoa | KhungGio | LichLamViec ... │       │
│  └──────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────┘
```

### 8.2 Sơ đồ Triển khai (Deployment Diagram)

`Diagram` → `New` → **"Deployment Diagram"** → đặt tên `DEP - Trien khai`

#### Các Node cần tạo

| Node | Stereotype | Chứa component |
|------|-----------|----------------|
| **Trình duyệt Web** | `<<device>>` | React App (Vite build) |
| **Node.js Server** | `<<execution environment>>` | Express API, Auth, Services |
| **Supabase Cloud** | `<<device>>` | PostgreSQL Database |

#### Các Communication Path (đường kết nối)

| Từ Node | Đến Node | Nhãn |
|---------|---------|------|
| Trình duyệt | Node.js Server | `HTTP/HTTPS (REST API + JWT)` |
| Node.js Server | Supabase | `PostgreSQL Connection (Prisma)` |

---

## 9. Xuất hình ảnh cho báo cáo Word

### 9.1 Xuất từng diagram

1. Mở diagram cần xuất
2. `File` → `Export` → `Active Diagram as Image…`
3. Chọn định dạng: **PNG** (để chèn vào Word)
4. Chỉnh DPI: **150-200** (đủ rõ cho in ấn)
5. Chọn thư mục lưu → `Export`

### 9.2 Xuất tất cả diagram

1. `File` → `Export` → `All Diagrams as Images…`
2. Chọn thư mục → `Export`

### 9.3 Mẹo khi chèn vào Word

- Chèn ảnh: `Insert` → `Pictures` → chọn file PNG
- Đặt caption: chuột phải vào ảnh → `Insert Caption` → gõ tên sơ đồ
- Định dạng caption: *"Hình 3.1: Biểu đồ Use Case tổng quan hệ thống"*
- Đánh số tự động: dùng field `Caption` của Word

### 9.4 Gợi ý đánh số hình trong đồ án

| Chương | Sơ đồ | Caption gợi ý |
|--------|-------|---------------|
| Chương 3 | Use Case tổng quan | Hình 3.1: Biểu đồ Use Case tổng quan |
| Chương 3 | Use Case chi tiết đặt lịch | Hình 3.2: Biểu đồ Use Case chi tiết đặt lịch |
| Chương 3 | Activity - Đăng nhập | Hình 3.3: Biểu đồ hoạt động đăng nhập |
| Chương 3 | Activity - Đặt lịch | Hình 3.4: Biểu đồ hoạt động đặt lịch |
| Chương 3 | Sequence - Đăng nhập | Hình 3.5: Biểu đồ tuần tự đăng nhập |
| Chương 3 | Sequence - Đặt lịch | Hình 3.6: Biểu đồ tuần tự đặt lịch |
| Chương 3 | Sequence - Refresh Token | Hình 3.7: Biểu đồ tuần tự làm mới token |
| Chương 3 | State - Lịch hẹn | Hình 3.8: Biểu đồ trạng thái lịch hẹn |
| Chương 3 | ERD | Hình 3.9: Biểu đồ thực thể quan hệ (ERD) |
| Chương 3 | Class Diagram | Hình 3.10: Biểu đồ lớp kiến trúc backend |
| Chương 3 | Component Diagram | Hình 3.11: Biểu đồ thành phần hệ thống |
| Chương 3 | Deployment Diagram | Hình 3.12: Biểu đồ triển khai |

---

> 📝 *Hướng dẫn vẽ sơ đồ Visual Paradigm — Dự án ClinicBooking*
> *Đồ án tốt nghiệp — Trường Đại học Mỏ - Địa Chất Hà Nội*
