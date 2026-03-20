# Luong di tung chuc nang (Frontend -> Backend)

Tai lieu nay mo ta luong xu ly theo tung chuc nang chinh de ban de theo doi va demo.

## 0) Tong quan luong chung

1. Nguoi dung thao tac tren UI (`client/src/pages/...`)
2. Page goi Service (`client/src/services/...`)
3. Service goi API qua `api.js` (axios instance)
4. Request vao backend: `Route -> Validator -> validate middleware -> auth middleware -> Controller -> Prisma -> DB`
5. Backend tra JSON ket qua, frontend hien thi/toast/chuyen trang

---

## 1) Dang ky tai khoan benh nhan (vi du ban hoi)

### 1.1 Luong mong muon khi noi backend that

1. Nguoi dung mo trang `/register` (`RegisterPage`)
2. Bam nut "Dang ky"
3. Frontend goi `authService.register(userData)`
4. Service goi `POST /api/auth/register`
5. Backend vao `auth.routes.js`:
  - `registerValidator`
  - `validate`
  - `authController.register`
6. Controller tao:
  - Ban ghi `TaiKhoan` (vai tro `benh_nhan`)
  - Ban ghi `BenhNhan` lien ket voi tai khoan
7. Backend tra ve `success + message + data`
8. Frontend hien thi "dang ky thanh cong", sau do dieu huong sang `/login`

### 1.2 Trang thai hien tai trong source

- `authService.register` dang tra mock message, chua goi API that.
- Nghia la UI co luong, backend co endpoint, nhung frontend chua noi truc tiep vao `/api/auth/register`.

---

## 2) Dang nhap

1. Nguoi dung mo `/login` (benh nhan) hoac `/doctor/login` (bac si)
2. Bam "Dang nhap"
3. Frontend goi `authService.login(credentials)`
4. Neu noi backend that: goi `POST /api/auth/login`
5. Backend:
  - `loginValidator` -> `validate` -> `authController.login`
  - Kiem tra email/mat khau, tao JWT
6. Frontend luu token (localStorage)
7. Tu lan goi API sau, `api.js` tu dong gan header `Authorization: Bearer <token>`

Trang thai hien tai: `authService.login` dang mock token/user.

---

## 3) Lay thong tin user hien tai (`/auth/me`)

1. Frontend goi `authService.getMe()`
2. API call: `GET /api/auth/me`
3. Backend middleware `authenticate` giai ma token, gan `req.user`
4. `authController.getMe` tra thong tin user dang dang nhap
5. Frontend dung de do du lieu profile/role

Trang thai hien tai: `authService.getMe` dang mock data.

---

## 4) Xem danh sach bac si, chi tiet bac si (benh nhan)

1. Nguoi dung vao `/doctors` (DoctorListPage)
2. Frontend goi `doctorService.getAll(filters)`
3. Neu noi backend that: `GET /api/bac-si?chuyenKhoaId=&search=&page=&limit=`
4. Backend route `bacSi.routes.js` -> `bacSiController.getAll` -> Prisma lay danh sach/filter
5. Bam 1 bac si -> `/doctors/:id`
6. Frontend goi `doctorService.getById(id)`
7. Neu backend that: `GET /api/bac-si/:id` -> `bacSiController.getById`

Trang thai hien tai: `doctorService` dang doc tu `mockDoctors`.

---

## 5) Dat lich kham (benh nhan)

1. Nguoi dung vao `/booking/:doctorId`
2. Chon ngay/gio/hinh thuc thanh toan
3. Bam "Dat lich"
4. Frontend goi `appointmentService.create(data)`
5. Neu backend that: `POST /api/dat-lich`
6. Backend:
  - `authenticate` (bat buoc dang nhap)
  - `datLichValidator` -> `validate`
  - `datLichController.create` (kiem tra rang buoc, luu DB)
7. Tra ket qua lich hen moi tao

Trang thai hien tai: `appointmentService.create` dang mock object lich hen.

---

## 6) Lich su lich hen / huy lich (benh nhan)

### 6.1 Xem lich su

1. Vao `/appointments`
2. Frontend goi `appointmentService.getMyAppointments()`
3. Neu backend that: `GET /api/dat-lich/benh-nhan/:id` (can JWT)
4. Backend tra danh sach lich theo benh nhan

### 6.2 Huy lich

1. Bam "Huy lich"
2. Frontend goi `appointmentService.cancel(id)`
3. Neu backend that: co the:
  - `PUT /api/dat-lich/:id/trang-thai` voi trang thai = da huy, hoac
  - `DELETE /api/dat-lich/:id` (tuy rule nghiep vu)
4. Backend xac thuc + cap nhat trang thai/xoa

Trang thai hien tai: `getMyAppointments` va `cancel` dang mock.

---

## 7) Luong bac si (portal `/doctor`)

### 7.1 Xem lich hen cua bac si

1. Bac si vao `/doctor/appointments`
2. Frontend goi API lay lich theo bac si
3. Backend endpoint: `GET /api/dat-lich/bac-si/:id` (JWT)

### 7.2 Cap nhat trang thai kham

1. Bac si mo chi tiet `/doctor/appointments/:id`
2. Bam xac nhan/hoan tat/huy
3. API: `PUT /api/dat-lich/:id/trang-thai`
4. Backend authorize `admin` hoac `bac_si`

### 7.3 Quan ly lich lam viec

1. Bac si vao `/doctor/schedule` hoac `/doctor/schedule/add`
2. API lien quan:
  - `GET /api/lich-lam-viec?bacSiId=&ngayLamViec=`
  - `POST /api/lich-lam-viec`
  - `PUT /api/lich-lam-viec/:id`
  - `DELETE /api/lich-lam-viec/:id`

### 7.4 Ke don thuoc

1. Tu man hinh kham benh, bac si tao don
2. API: `POST /api/don-thuoc` (chi role `bac_si`)

---

## 8) Luong admin (portal `/admin`)

### 8.1 Quan ly chuyen khoa

- Xem: `GET /api/chuyen-khoa`
- Them: `POST /api/chuyen-khoa` (admin)
- Sua: `PUT /api/chuyen-khoa/:id` (admin)
- Xoa: `DELETE /api/chuyen-khoa/:id` (admin)

### 8.2 Quan ly bac si

- Xem danh sach: `GET /api/bac-si`
- Them moi bac si: `POST /api/bac-si` (admin)
- Cap nhat: `PUT /api/bac-si/:id` (admin)
- Xoa: `DELETE /api/bac-si/:id` (admin)

### 8.3 Quan ly benh nhan

- Xem danh sach: `GET /api/benh-nhan` (admin)
- Xem chi tiet: `GET /api/benh-nhan/:id` (JWT)
- Sua: `PUT /api/benh-nhan/:id` (JWT)
- Xoa: `DELETE /api/benh-nhan/:id` (admin)

### 8.4 Quan ly FAQ

- Public xem FAQ active: `GET /api/cau-hoi-thuong-gap`
- Admin xem tat ca: `GET /api/cau-hoi-thuong-gap/all`
- Them/sua/xoa:
  - `POST /api/cau-hoi-thuong-gap`
  - `PUT /api/cau-hoi-thuong-gap/:id`
  - `DELETE /api/cau-hoi-thuong-gap/:id`

### 8.5 Quan ly hinh thuc thanh toan

- `GET /api/hinh-thuc-thanh-toan` (public)
- `POST /api/hinh-thuc-thanh-toan` (admin)
- `DELETE /api/hinh-thuc-thanh-toan/:id` (admin)

---

## 9) Health check va debug luong

- Endpoint kiem tra server: `GET /api/health`
- De trace nhanh 1 chuc nang, ban co the theo checklist:
  1. Route da khai bao trong `server/src/routes/*.routes.js` chua?
  2. Validator co dung field frontend gui len khong?
  3. Frontend service da goi dung endpoint chua?
  4. Co token trong `localStorage` de interceptor gan header chua?
  5. Role user co dung voi `authorize(...)` khong?

---

## 10) Ghi chu quan trong hien tai

1. Backend da co he thong endpoint kha day du.
2. Frontend hien van con nhieu service mock (`authService`, `doctorService`, `appointmentService`).
3. Vi vay, luong UI hien tai co the "chay duoc" nhung chua di het backend that.
4. Buoc tiep theo de dong bo:
  - thay cac TODO trong service bang API that,
  - map dung response backend,
  - them auth guard cho private routes.

