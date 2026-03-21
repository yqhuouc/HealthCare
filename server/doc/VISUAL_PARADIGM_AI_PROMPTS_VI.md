# PROMPT VẼ SƠ ĐỒ AI - VISUAL PARADIGM

## Dự án: Website Đặt Lịch Khám Bệnh Trực Tuyến

### Hướng dẫn sử dụng
1. Chọn đúng `Diagram type`.
2. Copy prompt của từng sơ đồ.
3. Paste vào ô `Topic` của công cụ vẽ sơ đồ.
4. Bấm `OK/Generate`.
5. Khi AI vẽ xong, bạn có thể click đúp vào text để chỉnh lại tiếng Việt nếu cần.

---

## SƠ ĐỒ 1: USE CASE DIAGRAM - TỔNG QUAN

Use Case Diagram tổng quan với 3 actor và 1 “system boundary”.

### Diagram type
Use Case Diagram

### Actors
1. `Bệnh nhân` (bên trái)
2. `Bác sĩ` (bên phải)
3. `Quản trị viên` (bên phải, dưới `Bác sĩ`)

### System Boundary
`Hệ thống đặt lịch khám (ClinicBooking System)`

### Authentication group
- `UC01 Đăng ký tài khoản` (chỉ Bệnh nhân)
- `UC02 Đăng nhập` (tất cả 3 actor)
- `UC03 Đăng xuất` (tất cả 3 actor)
- `UC04 Đổi mật khẩu` (Bệnh nhân và Bác sĩ)
- `UC05 Cập nhật hồ sơ` (Bệnh nhân và Bác sĩ)

### Patient group
- `UC06 Xem chuyên khoa` (Bệnh nhân)
- `UC07 Tìm kiếm bác sĩ` (Bệnh nhân)
- `UC08 Xem chi tiết bác sĩ` (Bệnh nhân)
- `UC09 Đặt lịch khám` (Bệnh nhân)
- `UC10 Xem lịch sử đặt lịch` (Bệnh nhân)
- `UC11 Hủy lịch khám` (Bệnh nhân)
- `UC12 Xem đơn thuốc` (Bệnh nhân)
- `UC13 Xem FAQ` (Bệnh nhân)

### Doctor group
- `UC14 Tạo lịch làm việc` (Bác sĩ)
- `UC15 Xem lịch hẹn của tôi` (Bác sĩ)
- `UC16 Cập nhật trạng thái lịch hẹn` (Bác sĩ và Quản trị viên)
- `UC17 Tạo đơn thuốc` (Bác sĩ)

### Admin group
- `UC18 Quản lý chuyên khoa (CRUD)` (Quản trị viên)
- `UC19 Quản lý bác sĩ (CRUD)` (Quản trị viên)
- `UC20 Quản lý bệnh nhân` (Quản trị viên)
- `UC21 Quản lý FAQ (CRUD)` (Quản trị viên)
- `UC22 Quản lý phương thức thanh toán` (Quản trị viên)
- `UC23 Xem tất cả lịch hẹn` (Quản trị viên)
- `UC24 Xem dashboard thống kê` (Quản trị viên)

### Liên kết
Vẽ đường association nối mỗi actor với các use case tương ứng.

---

## SƠ ĐỒ 2: USE CASE DIAGRAM - CHI TIẾT ĐẶT LỊCH

Use Case Diagram chi tiết cho chức năng `Đặt lịch khám`.

### Diagram type
Use Case Diagram

### Actor
`Bệnh nhân` (bên trái)

### System boundary
`Booking Subsystem (Phân hệ Đặt lịch)`

### Main use case
- `Book Appointment (Đặt lịch khám)` (nối với Patient)

### Include relationships (<<include>>) — mũi tên nét đứt
- `Book Appointment` bao gồm:
  - `Authenticate User via JWT (Xác thực người dùng qua JWT)`
  - `Verify Doctor Schedule Exists (Kiểm tra lịch làm việc bác sĩ tồn tại)`
  - `Check Appointment Conflict (Kiểm tra xung đột lịch hẹn)`
  - `Validate Input Data (Kiểm tra validate dữ liệu đầu vào)`

### Extend relationship (<<extend>>) — mũi tên nét đứt
- `Select Payment Method (Chọn phương thức thanh toán)` mở rộng `Book Appointment`

### Use case khác
- `Cancel Appointment (Hủy lịch khám)` (nối với Patient)
  - `Cancel Appointment` bao gồm:
    - `Verify Ownership (Xác minh quyền sở hữu)`
    - `Check Cancellation Allowed (Kiểm tra được phép hủy)`

---

## SƠ ĐỒ 3: USE CASE DIAGRAM - CHI TIẾT BÁC SĨ

Use Case Diagram chi tiết cho các chức năng của `Bác sĩ`.

### Diagram type
Use Case Diagram

### Actor
`Bác sĩ` (bên trái)

### System boundary
`Doctor Subsystem (Phân hệ Bác sĩ)`

### Use cases
- `Login (Đăng nhập)` (nối với Doctor)
- `Create Work Schedule (Tạo lịch làm việc)` (nối với Doctor)
- `View My Appointments (Xem lịch hẹn của tôi)` (nối với Doctor)
- `Update Appointment Status (Cập nhật trạng thái lịch hẹn)` (nối với Doctor)
- `Create Prescription (Tạo đơn thuốc)` (nối với Doctor)

### Include relationships
- `Update Appointment Status` bao gồm:
  - `Authenticate JWT (Xác thực JWT)`
  - `Verify Doctor Ownership (Xác minh quyền thuộc bác sĩ)`
- `Create Prescription` bao gồm:
  - `Check Appointment Status is Completed (Kiểm tra lịch hẹn đã hoàn tất)`
  - `Check No Existing Prescription (Kiểm tra chưa có đơn thuốc)`
- `Create Work Schedule` bao gồm:
  - `Check Schedule Not Duplicate (Kiểm tra lịch không trùng)`

---

## SƠ ĐỒ 4: USE CASE DIAGRAM - CHI TIẾT ADMIN

Use Case Diagram chi tiết cho các chức năng quản trị.

### Diagram type
Use Case Diagram

### Actor
`Admin (Quản trị viên)` (bên trái)

### System boundary
`Admin Subsystem (Phân hệ Quản trị)`

### Use cases
- `Manage Specialties (Quản lý chuyên khoa)` (nối với Admin)
- `Manage Doctors (Quản lý bác sĩ)` (nối với Admin)
- `Manage Patients (Quản lý bệnh nhân)` (nối với Admin)
- `Manage FAQ (Quản lý FAQ)` (nối với Admin)
- `Manage Payment Methods (Quản lý phương thức thanh toán)` (nối với Admin)
- `View All Appointments (Xem tất cả lịch hẹn)` (nối với Admin)
- `Update Appointment Status (Cập nhật trạng thái lịch hẹn)` (nối với Admin)
- `View Statistics (Xem thống kê)` (nối với Admin)

### Include relationships
- `Manage Specialties` bao gồm:
  - `Create Specialty`
  - `Update Specialty`
  - `Delete Specialty`
- `Manage Doctors` bao gồm:
  - `Create Doctor with Account`
  - `Update Doctor`
  - `Delete Doctor`
- `Manage FAQ` bao gồm:
  - `Create FAQ`
  - `Update FAQ`
  - `Delete FAQ`

---

## SƠ ĐỒ 5: ACTIVITY DIAGRAM - ĐĂNG KÝ

Activity diagram cho quy trình đăng ký của Patient (2 swimlanes: `Patient / Frontend` và `Server / Backend`).

### Diagram type
Activity Diagram

### Swimlane Patient / Frontend
1. Start node
2. Open registration page
3. Enter email, password, full name, phone number, gender, date of birth, address
4. Submit registration form
5. Send `POST /api/auth/register`

### Swimlane Server / Backend
6. Validate input data using `express-validator`
7. Decision: Is data valid?
   - No -> Return error `400` -> End
   - Yes -> continue
8. Check if email already exists
9. Decision: Email already exists?
   - Yes -> Return error `409` -> End
   - No -> continue
10. Hash password using `bcrypt` (salt rounds 10)
11. Create `TaiKhoan` record with role `benh_nhan`, status active
12. Create `BenhNhan` linked to `TaiKhoan`
13. Return `201 Created` with user info

### Swimlane Patient / Frontend
14. Display success message
15. Redirect to login page
16. End node

---

## SƠ ĐỒ 6: ACTIVITY DIAGRAM - ĐĂNG NHẬP

Activity diagram cho đăng nhập (2 swimlanes: `User / Frontend` và `Server / Backend`).

### Diagram type
Activity Diagram

### Swimlane User / Frontend
1. Start node
2. Enter email and password
3. Send `POST /api/auth/login`

### Swimlane Server / Backend
4. Validate input data
5. Decision: Data valid?
   - No -> Return error `400` -> End
   - Yes -> continue
6. Find account by email
7. Decision: Account exists?
   - No -> Return error `401` -> End
   - Yes -> continue
8. Decision: Account locked (status = 0)?
   - Yes -> Return error `403` -> End
   - No -> continue
9. Compare password using `bcrypt.compare`
10. Decision: Password correct?
    - No -> Return error `401` -> End
    - Yes -> continue
11. Generate Access Token using JWT
12. Generate Refresh Token using JWT
13. Save Refresh Token to database (`TaiKhoan`)
14. Set Refresh Token into HttpOnly cookie
15. Return Access Token and user info

### Swimlane User / Frontend
16. Save Access Token to Zustand store
17. Decision: What is user role?
    - `benh_nhan` -> Redirect to patient home
    - `bac_si` -> Redirect to doctor dashboard
    - `admin` -> Redirect to admin dashboard
18. End node

---

## SƠ ĐỒ 7: ACTIVITY DIAGRAM - ĐẶT LỊCH KHÁM

Activity diagram cho Booking Appointment (2 swimlanes: `Patient / Frontend` và `Server / Backend`).

### Diagram type
Activity Diagram

### Swimlane Patient / Frontend
1. Start node
2. Browse specialties list
3. Select a specialty
4. View doctors in selected specialty
5. Select a doctor
6. View doctor details and available schedule
7. Select date and time slot
8. Enter reason for visit
9. Select payment method
10. Submit booking request with JWT token

### Swimlane Server / Backend
11. Validate all input fields
12. Decision: Input valid?
    - No -> Return error `400` -> End
    - Yes -> continue
13. Authenticate JWT token from Authorization header
14. Decision: Token valid?
    - No -> Return error `401` -> End
    - Yes -> continue
15. Find doctor by bacSiId
16. Decision: Doctor exists?
    - No -> Return error `404` -> End
    - Yes -> continue
17. Find patient by benhNhanId from token
18. Decision: Patient exists?
    - No -> Return error `404` -> End
    - Yes -> continue
19. Check LichLamViecBacSi table for doctor schedule on selected date with `sanSang = 1`
20. Decision: Doctor has available schedule?
    - No -> Return error `400` -> End
    - Yes -> continue
21. Check unique constraint on DatLich (bacSiId + ngayDat + gioBatDau)
22. Decision: Appointment conflict?
    - Yes -> Return error `409` -> End
    - No -> continue
23. Create DatLich record with trangThai = 0 (Pending)
24. Return `201 Created` with appointment details

### Swimlane Patient / Frontend
25. Display success message
26. Redirect to appointment history page
27. End node

---

## SƠ ĐỒ 8: ACTIVITY DIAGRAM - CẬP NHẬT TRẠNG THÁI LỊCH HẸN

Activity diagram cập nhật trạng thái lịch hẹn (2 swimlanes: `Doctor or Admin` và `Server`).

### Diagram type
Activity Diagram

### Swimlane Doctor or Admin
1. Start node
2. View appointment list
3. Select an appointment
4. Choose new status to update
5. Send PUT request with new status

### Swimlane Server
6. Authenticate JWT and check role
7. Decision: Has permission?
    - No -> Return error `403` -> End
    - Yes -> continue
8. Get current appointment from database
9. Decision: Current status is 0 (Pending)?
    - Yes -> Decision: New status?
      - 1 -> Update to 1 -> success -> End
      - 3 -> Update to 3 -> success -> End
10. Decision: Current status is 1 (Confirmed)?
    - Yes -> Decision: New status?
      - 2 -> Update to 2 -> success -> End
      - 3 -> Update to 3 -> success -> End
11. If status is 2 or 3, cannot change
12. Return error `400` cannot modify
13. End node

---

## SƠ ĐỒ 9: ACTIVITY DIAGRAM - KÊ ĐƠN THUỐC

Activity diagram tạo đơn thuốc (2 swimlanes: `Doctor` và `Server`).

### Diagram type
Activity Diagram

### Swimlane Doctor
1. Start node
2. View completed appointment details
3. Enter prescription information
4. Submit prescription

### Swimlane Server
5. Authenticate JWT and verify role is Doctor
6. Decision: Is Doctor?
    - No -> Return error `403` -> End
    - Yes -> continue
7. Find appointment by datLichId
8. Decision: Appointment exists?
    - No -> Return error `404` -> End
    - Yes -> continue
9. Decision: Appointment status = 2 (Completed)?
    - No -> Return error `400` -> End
    - Yes -> continue
10. Check if prescription already exists
11. Decision: Prescription already exists?
    - Yes -> Return error `400` -> End
    - No -> continue
12. Create DonThuoc linked to datLichId
13. Return `201 Created` with prescription data

### Swimlane Doctor
14. Display success message
15. End node

---

## SƠ ĐỒ 10: ACTIVITY DIAGRAM - QUẢN LÝ LỊCH LÀM VIỆC BÁC SĨ

Activity diagram quản lý lịch làm việc (2 swimlanes: `Doctor` và `Server`).

### Diagram type
Activity Diagram

### Swimlane Doctor
1. Start node
2. Open schedule management page
3. Select work date
4. Select time slot
5. Submit new schedule entry

### Swimlane Server
6. Authenticate JWT and verify role is Doctor
7. Decision: Is Doctor?
    - No -> Return error `403` -> End
    - Yes -> continue
8. Get doctor ID from authenticated user
9. Check if schedule already exists (bacSiId + ngayLamViec + khungGioId)
10. Decision: Duplicate?
    - Yes -> Return error `409` -> End
    - No -> continue
11. Create LichLamViecBacSi record with sanSang = 1, soBenhNhanHienTai = 0
12. Return `201 Created`

### Swimlane Doctor
13. Display updated schedule calendar
14. End node

---

## SƠ ĐỒ 11: SEQUENCE DIAGRAM - ĐĂNG NHẬP

Sequence diagram for User Login (participants from left to right):
- User
- Frontend (React)
- API Router (Express)
- Auth Service
- Database (PostgreSQL)

### Diagram type
Sequence Diagram

### Messages
1. User sends “Enter email and password” to Frontend
2. Frontend sends `POST /api/auth/login(email, password)` to API Router
3. API Router self-message: `validate(email, password)`
4. API Router sends `login(email, password)` to Auth Service
5. Auth Service sends `SELECT * FROM TaiKhoan WHERE email` to Database
6. Database returns “Account data or null”
7. Auth Service self-message: `bcrypt.compare(password, hash)`

Alt fragment [Password Valid]:
8. Auth Service self-message: `generateTokens(userId)`
9. Note: Create Access Token (15min) and Refresh Token (7 days)
10. Auth Service sends `UPDATE TaiKhoan SET refreshToken` to Database
11. Database returns OK
12. Auth Service returns `{user, accessToken, refreshToken}` to API Router
13. API Router self-message: `res.cookie(refreshToken, HttpOnly, Secure)`
14. API Router returns `200 OK {user, accessToken}` to Frontend
15. Frontend self-message: Save token to Zustand store
16. Frontend returns Redirect to dashboard by role

Alt fragment [Password Invalid]:
17. Auth Service throws Error 401
18. API Router returns `401 Wrong credentials`
19. Frontend shows error message

---

## SƠ ĐỒ 12: SEQUENCE DIAGRAM - ĐẶT LỊCH KHÁM

Sequence diagram for Booking Appointment (participants):
- Patient
- Frontend (React)
- API Router
- Auth Middleware
- DatLich Service
- Database (PostgreSQL)

### Diagram type
Sequence Diagram

### Messages
1. Patient sends “Select doctor, date, time slot, reason” to Frontend
2. Frontend sends `POST /api/dat-lich` with Bearer token and body data to API Router
3. API Router sends `authenticate(JWT)` to Auth Middleware
4. Auth Middleware sends `SELECT TaiKhoan WHERE id from token` to Database
5. Database returns account with role
6. Auth Middleware returns `req.user = {id, role}`
7. API Router sends `create(appointmentData)` to DatLich Service
8. DatLich Service sends `SELECT BacSi WHERE id = bacSiId` to Database
9. Database returns Doctor data
10. DatLich Service sends `SELECT BenhNhan WHERE taiKhoanId` to Database
11. Database returns Patient data
12. DatLich Service sends `SELECT LichLamViecBacSi ... sanSang=1`
13. Database returns Schedule data
14. DatLich Service sends `SELECT DatLich ... (check unique)`
15. Database returns Exists or not

Alt fragment [No Conflict]:
16. DatLich Service inserts `trangThai=0`
17. Database returns Created appointment
18. DatLich Service returns Appointment data
19. API Router returns `201 Created`
20. Frontend shows Booking successful

Alt fragment [Conflict Exists]:
21. DatLich Service throws Error 409 Conflict
22. API Router returns `409 Schedule conflict`
23. Frontend shows “time slot taken”

---

## SƠ ĐỒ 13: SEQUENCE DIAGRAM - REFRESH TOKEN

Sequence diagram for Refresh Token Rotation (participants from left to right):
- Frontend (React)
- API Router (Express)
- Auth Service
- Database (PostgreSQL)

### Diagram type
Sequence Diagram

Note at top: `Access Token has expired`

### Messages
1. Frontend sends `POST /api/auth/refresh-token`
2. Note: Cookie automatically sends refreshToken (HttpOnly)
3. API Router sends `refreshAccessToken(cookieRefreshToken)` to Auth Service
4. Auth Service self-message: `jwt.verify(refreshToken, secret)`
5. Auth Service sends `SELECT TaiKhoan WHERE id = decoded.id` to Database
6. Database returns account with stored refreshToken
7. Auth Service self-message: Compare cookie token vs database token

Alt fragment [Tokens Match]:
8. Generate new tokens (rotation)
9. Note: Old tokens invalidated
10. Update TaiKhoan refreshToken
11. Database returns OK
12. Return `{new accessToken, new refreshToken}`
13. Set new refreshToken cookie HttpOnly
14. Return `200 OK {new accessToken}`

Alt fragment [Tokens Do Not Match]:
15. Throw Error 401 Invalid token
16. Return `401 Unauthorized`
17. Note: Redirect to login, possible token theft detected

---

## SƠ ĐỒ 14: SEQUENCE DIAGRAM - KÊ ĐƠN THUỐC

Sequence diagram for Creating Prescription (participants):
- Doctor
- Frontend
- API Router
- Auth Middleware
- DonThuoc Service
- Database

### Diagram type
Sequence Diagram

### Messages
1. Doctor sends view completed appointment + enter prescription
2. Frontend sends `POST /api/don-thuoc` with Bearer token and `{datLichId, content}`
3. API Router sends `authenticate(JWT)` to Auth Middleware
4. Auth Middleware verifies token and role = bac_si
5. Auth Middleware returns `req.user`
6. API Router calls `create(datLichId, prescriptionData)`
7. DonThuoc Service selects `DatLich`
8. Database returns appointment data
9. Check appointment status = 2 (Completed)

Alt fragment [Status Completed and No existing prescription]:
10. Check unique DonThuoc by datLichId
11. Not found => OK to create
12. Insert DonThuoc
13. Return created prescription
14. API Router returns 201 Created
15. Frontend shows success

Alt fragment [Status not Completed or Prescription exists]:
16. Throw Error 400
17. Return 400 Bad Request
18. Frontend shows error message

---

## SƠ ĐỒ 15: SEQUENCE DIAGRAM - ĐĂNG XUẤT

Sequence diagram for Logout (participants):
- User
- Frontend
- API Router
- Auth Service
- Database

### Diagram type
Sequence Diagram

### Messages
1. User clicks logout button
2. Frontend sends `POST /api/auth/logout` with Bearer token
3. API Router verifies JWT (self message): get userId
4. API Router calls `logout(userId)` on Auth Service
5. Auth Service updates `TaiKhoan.refreshToken = NULL`
6. Database returns OK
7. Auth Service returns Success
8. API Router clears refreshToken cookie
9. Return `200 OK Logout successful`
10. Frontend clears Zustand store (remove accessToken)
11. Redirect to login page

Note: All old tokens invalidated; refresh token removed from DB and cookie.

---

## SƠ ĐỒ 16: STATE MACHINE - TRẠNG THÁI LỊCH HẸN

State machine cho `DatLich.trangThai`.

### Diagram type
State Machine Diagram

### States
1. Pending (0): Waiting for doctor confirmation
2. Confirmed (1): Accepted, waiting examination day
3. Completed (2): Can create prescription
4. Cancelled (3): Terminal state

### Transitions
- Initial -> Pending: Patient books appointment
- Pending -> Confirmed: Doctor or Admin confirms
- Pending -> Cancelled: Patient/Doctor/Admin cancels
- Confirmed -> Completed: Doctor completes examination
- Confirmed -> Cancelled: Doctor or Admin cancels
- Completed -> Final
- Cancelled -> Final

---

## SƠ ĐỒ 17: STATE MACHINE - TRẠNG THÁI TÀI KHOẢN

State machine cho `TaiKhoan.trangThaiTaiKhoan`.

### Diagram type
State Machine Diagram

### States
1. Active (1): Can login
2. Locked (0): Cannot login

### Transitions
- Initial -> Active: User registers successfully
- Active -> Locked: Admin locks the account
- Locked -> Active: Admin unlocks the account

---

## SƠ ĐỒ 18: ERD - ENTITY RELATIONSHIP DIAGRAM

ERD cho database `ClinicBooking` với 10 entity.

### Diagram type
Entity Relationship Diagram

### Entities
`TaiKhoan`, `ChuyenKhoa`, `BacSi`, `BenhNhan`, `KhungGio`, `LichLamViecBacSi`, `HinhThucThanhToan`, `DatLich`, `DonThuoc`, `CauHoiThuongGap`.

### Relationships
- `TaiKhoan` -> `BacSi` (0..1)
- `TaiKhoan` -> `BenhNhan` (0..1)
- `ChuyenKhoa` -> `BacSi` (0..many)
- `BacSi` -> `LichLamViecBacSi` (0..many)
- `KhungGio` -> `LichLamViecBacSi` (0..many)
- `BacSi` -> `DatLich` (0..many)
- `BenhNhan` -> `DatLich` (0..many)
- `HinhThucThanhToan` -> `DatLich` (0..many)
- `DatLich` -> `DonThuoc` (0..1)

### Chi tiết ERD (full field/constraint)

Entity TaiKhoan (Account):
- `id`: BigInt, Primary Key, Auto Increment
- `email`: VARCHAR(255), Unique
- `matKhau`: VARCHAR(255)
- `vaiTro`: VARCHAR(50), values: admin, bac_si, benh_nhan
- `trangThaiTaiKhoan`: INT, default 1
- `refreshToken`: TEXT, nullable
- `gioiTinh`: INT, nullable, values: 1=Male 2=Female 3=Other
- `ngaySinh`: DATE, nullable
- `diaChi`: VARCHAR(255), nullable
- `anhDaiDien`: VARCHAR(255), nullable
- `ngayTao`: DATETIME, default now
- `ngayCapNhat`: DATETIME, auto update

Entity ChuyenKhoa (Specialty):
- `id`: BigInt, Primary Key
- `tenChuyenKhoa`: VARCHAR(120)
- `anhChuyenKhoa`: VARCHAR(255), nullable
- `moTaChuyenKhoa`: TEXT, nullable

Entity BacSi (Doctor):
- `id`: BigInt, Primary Key
- `hocViChucDanh`: VARCHAR(120), nullable
- `tenBacSi`: VARCHAR(120)
- `moTaNgan`: VARCHAR(255), nullable
- `moTaChiTiet`: TEXT, nullable
- `giaKham`: DECIMAL(10,2), nullable
- `taiKhoanId`: BigInt, Foreign Key to TaiKhoan.id, Unique
- `chuyenKhoaId`: BigInt, Foreign Key to ChuyenKhoa.id

Entity BenhNhan (Patient):
- `id`: BigInt, Primary Key
- `hoTen`: VARCHAR(120)
- `soDienThoai`: VARCHAR(20), nullable
- `emailLienHe`: VARCHAR(255), nullable
- `taiKhoanId`: BigInt, Foreign Key to TaiKhoan.id, Unique

Entity KhungGio (TimeSlot):
- `id`: BigInt, Primary Key
- `gioBatDau`: TIME
- `gioKetThuc`: TIME

Entity LichLamViecBacSi (DoctorSchedule):
- `id`: BigInt, Primary Key
- `ngayLamViec`: DATE
- `soBenhNhanHienTai`: INT, default 0
- `sanSang`: INT, default 1
- `bacSiId`: BigInt, Foreign Key to BacSi.id
- `khungGioId`: BigInt, Foreign Key to KhungGio.id

Entity HinhThucThanhToan (PaymentMethod):
- `id`: BigInt, Primary Key
- `tenHinhThuc`: VARCHAR(120)

Entity DatLich (Appointment):
- `id`: BigInt, Primary Key
- `ngayDat`: DATE
- `gioBatDau`: TIME
- `gioKetThuc`: TIME
- `lyDoKham`: VARCHAR(255), nullable
- `giaKham`: DECIMAL(10,2), nullable
- `trangThai`: INT, default 0, values: 0=pending 1=confirmed 2=completed 3=cancelled
- `bacSiId`: BigInt, Foreign Key to BacSi.id
- `benhNhanId`: BigInt, Foreign Key to BenhNhan.id
- `hinhThucThanhToanId`: BigInt, Foreign Key to HinhThucThanhToan.id
- UNIQUE CONSTRAINT on (bacSiId, ngayDat, gioBatDau)

Entity DonThuoc (Prescription):
- `id`: BigInt, Primary Key
- `datLichId`: BigInt, Foreign Key to DatLich.id, Unique
- `ngayTao`: DATETIME, default now

Entity CauHoiThuongGap (FAQ):
- `id`: BigInt, Primary Key
- `cauHoi`: VARCHAR(255), nullable
- `traLoi`: TEXT, nullable
- `dangHoatDong`: INT, default 1

Relationships:
- TaiKhoan 1 to 0..1 BacSi (via taiKhoanId)
- TaiKhoan 1 to 0..1 BenhNhan (via taiKhoanId)
- ChuyenKhoa 1 to 0..many BacSi (via chuyenKhoaId)
- BacSi 1 to 0..many LichLamViecBacSi (via bacSiId)
- KhungGio 1 to 0..many LichLamViecBacSi (via khungGioId)
- BacSi 1 to 0..many DatLich (via bacSiId)
- BenhNhan 1 to 0..many DatLich (via benhNhanId)
- HinhThucThanhToan 1 to 0..many DatLich (via hinhThucThanhToanId)
- DatLich 1 to 0..1 DonThuoc (via datLichId)

> Ghi chú: Các field/constraint chi tiết mình để theo đúng model đã mô tả trong phần “Sơ đồ 18” ở prompt bạn đưa trước đó (có thể paste toàn bộ đoạn ERD chi tiết nếu bạn muốn bản full đúng 100%).

---

## SƠ ĐỒ 19: CLASS DIAGRAM - KIẾN TRÚC BACKEND

Class diagram theo kiến trúc MVC + `Controller-Service-Repository`.

### Diagram type
Class Diagram

### Classes
- `AuthController` (controller)
- `AuthService` (service)
- `DatLichController` (controller)
- `DatLichService` (service)
- `BacSiController` (controller)
- `BacSiService` (service)
- `LichLamViecController` (controller)
- `LichLamViecService` (service)
- `DonThuocController` (controller)
- `DonThuocService` (service)
- `AuthMiddleware` (middleware)
- `PrismaClient` (repository)

### Dependencies
- Controller (<<uses>>) Service tương ứng
- Service (<<uses>>) PrismaClient
- AuthMiddleware (<<uses>>) PrismaClient

### Chi tiết Class Diagram (full Controller/Service/Repository)
Class AuthController with stereotype <<controller>>:
Methods: `register(req,res)`, `login(req,res)`, `refresh(req,res)`, `logout(req,res)`, `getMe(req,res)`, `doiMatKhau(req,res)`, `capNhatHoSo(req,res)`

Class AuthService with stereotype <<service>>:
Methods: `register(data)`, `login(data)`, `refreshAccessToken(token)`, `logout(userId)`, `getMe(userId)`, `doiMatKhau(userId,data)`, `capNhatHoSo(userId,data)`
Private method: `generateTokens(id)`

Class DatLichController with stereotype <<controller>>:
Methods: `getAll(req,res)`, `getById(req,res)`, `create(req,res)`, `updateStatus(req,res)`, `delete(req,res)`

Class DatLichService with stereotype <<service>>:
Methods: `getAll(filters)`, `getById(id)`, `create(data)`, `updateStatus(id,status)`, `delete(id)`

Class BacSiController with stereotype <<controller>>:
Methods: `getAll(req,res)`, `getById(req,res)`, `create(req,res)`, `update(req,res)`, `delete(req,res)`

Class BacSiService with stereotype <<service>>:
Methods: `getAll(filters)`, `getById(id)`, `create(data)`, `update(id,data)`, `delete(id)`

Class LichLamViecController with stereotype <<controller>>:
Methods: `getAll(req,res)`, `create(req,res)`, `update(req,res)`, `delete(req,res)`

Class LichLamViecService with stereotype <<service>>:
Methods: `getAll(filters)`, `create(data)`, `update(id,data)`, `delete(id)`

Class DonThuocController with stereotype <<controller>>:
Methods: `getByDatLichId(req,res)`, `create(req,res)`

Class DonThuocService with stereotype <<service>>:
Methods: `getByDatLichId(datLichId)`, `create(data)`

Class AuthMiddleware with stereotype <<middleware>>:
Methods: `authenticate(req,res,next)`, `authorize(roles)(req,res,next)`

Class PrismaClient with stereotype <<repository>>:
Methods: `connect()`, `disconnect()`, `query()`

Dependencies (dashed arrows):
- Each `Controller` depends on its corresponding `Service` (<<uses>>)
- Each `Service` depends on `PrismaClient` (<<uses>>)
- `AuthMiddleware` depends on `PrismaClient` (<<uses>>)

---

## SƠ ĐỒ 20: COMPONENT DIAGRAM

Component diagram 3 subsystem: `Frontend`, `Backend`, `Database`.

### Diagram type
Component Diagram

### Kết nối
- Frontend -> Backend: `HTTP/REST + JWT Authentication`
- Backend -> Database: `Prisma ORM (PostgreSQL protocol)`

### Chi tiết Component Diagram (full)

Component Diagram showing system architecture with 3 subsystems.

Subsystem 1: `Frontend` (React Application)
Components inside:
- `Pages` (admin pages, doctor pages, patient pages)
- `Components` (layout, UI components)
- `Services` (API calls using Axios)
- `Stores` (Zustand state management)
- `Router` (React Router DOM)
Provided interface: `User Interface`

Subsystem 2: `Backend` (Node.js Express API)
Components inside:
- `Routes` (9 route modules)
- `Middlewares` (auth, validate, error handler)
- `Controllers` (9 controllers)
- `Services` (9 service modules)
- `Prisma Client` (ORM)
Provided interface: `REST API`
Required interface: `Database Connection`

Subsystem 3: `Database` (PostgreSQL on Supabase)
Components inside:
- `Tables` (10 tables)
Provided interface: `SQL Query Interface`

Connections:
- Frontend connects to Backend via `HTTP/REST + JWT Authentication`
- Backend connects to Database via `Prisma ORM (PostgreSQL protocol)`

---

## SƠ ĐỒ 21: DEPLOYMENT DIAGRAM

Deployment diagram mô tả triển khai: `Client Device`, `Application Server`, `Database Server`.

### Diagram type
Deployment Diagram

### Communication
- Client Device -> Application Server: `HTTPS (REST API + JWT + Cookie)`
- Application Server -> Database Server: `PostgreSQL Connection via Prisma (pgbouncer)`

### Chi tiết Deployment Diagram (full)

Deployment Diagram showing physical deployment architecture.

Node 1: Client Device (Web Browser)
- Stereotype: <<device>>
- Artifact: React SPA (Single Page Application built with Vite)
- Technologies: React 19, Tailwind CSS 4, Zustand, TanStack Query

Node 2: Application Server (Node.js Runtime)
- Stereotype: <<execution environment>>
- Artifact: Express REST API Server
- Technologies: Express 4, Prisma 6, JWT, bcryptjs
- Runs on port 5000

Node 3: Database Server (Supabase Cloud)
- Stereotype: <<device>>
- Artifact: PostgreSQL Database
- Contains 10 tables with relational data

Communication paths:
- Client Device to Application Server: `HTTPS (REST API + JWT in Authorization header + Cookie)`
- Application Server to Database Server: `PostgreSQL Connection via Prisma (connection pooling with pgbouncer)`

