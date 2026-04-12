# CODE Q&A NOTES

Ghi chú câu hỏi — trả lời khi đọc / làm backend. **Mỗi mục có thẻ `<a id="...">` chỉ dùng chữ thường, số và gạch ngang** để bấm link trong mục lục là nhảy đúng chỗ (tránh lỗi anchor tiêu đề tiếng Việt trên một số trình xem Markdown).

**Quy ước mã danh mục (mở rộng dần, không giới hạn A/B/C):**

| Mã   | Nội dung gợi ý        | Prefix `id`   |
|------|------------------------|---------------|
| EXP  | Express, middleware, lỗi | `qa-exp-...` |
| AUTH | JWT, đăng nhập, refresh  | `qa-auth-...` |
| DB   | Prisma, migration, query | `qa-db-...`  |
| API  | REST, Postman, contract  | `qa-api-...` |
| FE   | React, hooks, upload   | `qa-fe-...`  |
| …    | Thêm cột khi cần        | `qa-xxx-...` |

**Thêm mục mới:** copy khối [Template](#qa-template) ở cuối file, đổi `qa-exp-999` / tiêu đề / nội dung, rồi thêm **một dòng** vào mục lục bên dưới.

---

## Mục lục (bấm là tới mục)

<a id="toc"></a>

<a id="toc-exp"></a>

### EXP — Express & xử lý lỗi

| Id | Câu hỏi / chủ đề |
|----|------------------|
| [qa-exp-001](#qa-exp-001) | `asyncHandler` là gì? Tại sao cần? |
| [qa-exp-002](#qa-exp-002) | Luồng lỗi trong project |
| [qa-exp-003](#qa-exp-003) | Có `asyncHandler` vs không có |
| [qa-exp-004](#qa-exp-004) | Vì sao `next(err)` tới được `errorHandler`? |
| [qa-exp-005](#qa-exp-005) | Ghi nhớ nhanh (Express / lỗi) |
| [qa-exp-006](#qa-exp-006) | `req.cookies.accessToken` — vì sao cần `cookieParser()` trong `app.js`? |
| [qa-exp-007](#qa-exp-007) | Vì sao nên dùng `validate(schema)` thay vì `if...else` thủ công? |

<a id="toc-auth"></a>

### AUTH — JWT, refresh, tài khoản

**Tham chiếu:** `server/src/services/auth.service.js`, `server/src/controllers/auth.controller.js`, `server/src/middlewares/auth.middleware.js`, `server/src/routes/auth.routes.js`

| Id | Câu hỏi / chủ đề |
|----|------------------|
| [qa-auth-001](#qa-auth-001) | Sau `jwt.verify`, `decoded` chứa những field gì? |
| [qa-auth-002](#qa-auth-002) | `BigInt(decoded.id)` là gì? Ví dụ |
| [qa-auth-003](#qa-auth-003) | `refreshAccessToken`: vì sao cần `findUnique` rồi mới so hash? |
| [qa-auth-004](#qa-auth-004) | Login: `req.body` là gì? Logout / `me`: `req.user` lấy từ đâu? |
| [qa-auth-005](#qa-auth-005) | Đổi mật khẩu: sao biết đúng user? `userId` từ token / `req.user` |
| [qa-auth-006](#qa-auth-006) | `clearCookie` path `"/"` vs `"/api/auth"` khác gì? |
| [qa-auth-007](#qa-auth-007) | Vì sao không có bảng `Admin`? Làm sao biết user là admin khi đăng nhập? |
| [qa-auth-008](#qa-auth-008) | Phân biệt `bcrypt.hash` (Mật khẩu) và `hashToken` (SHA-256 cho Refresh Token) |
| [qa-auth-009](#qa-auth-009) | Tại sao đăng ký tài khoản mặc định là bệnh nhân? Admin tạo tài khoản bác sĩ như thế nào? |
| [qa-auth-010](#qa-auth-010) | Luồng upload ảnh avatar lên Cloudinary qua multer hoạt động như thế nào? |

<a id="toc-db"></a>

### DB — Prisma / PostgreSQL

| Id | Câu hỏi / chủ đề |
|----|------------------|
| [qa-db-001](#qa-db-001) | Vì sao xóa bản ghi rồi tạo mới thì `id` không quay lại số cũ? |
| [qa-db-002](#qa-db-002) | Prisma `findMany`: `include`, `_count`, `orderBy`, `asc/desc` là gì? |
| [qa-db-003](#qa-db-003) | Xử lý múi giờ: Tại sao `parseTime` lại dùng `+07:00` còn `formatTime` cộng 7? |

<a id="toc-fe"></a>

### FE — React & Giao diện

| Id | Câu hỏi / chủ đề |
|----|------------------|
| [qa-fe-001](#qa-fe-001) | Upload file (Ảnh đại diện) bằng FormData hoạt động ra sao ở Frontend? |
| [qa-fe-002](#qa-fe-002) | Logic mở/đóng (Accordion) trong trang FAQ hoạt động như thế nào? |
| [qa-fe-003](#qa-fe-003) | Tại sao cần gọi `getMe()` khi đã có Zustand lưu thông tin người dùng rồi? |
| [qa-fe-004](#qa-fe-004) | Vai trò của `useNavigate` và `useLocation` trong Layout Bác sĩ? |
| [qa-fe-005](#qa-fe-005) | Cách xử lý ảnh đại diện (Avatar) giữa Local và Cloud? (getAvatarUrl) |
| [qa-fe-006](#qa-fe-006) | Cơ chế hiển thị tiêu đề trang động cho các route lồng nhau (basePath)? |
| [qa-fe-007](#qa-fe-007) | Sửa lỗi: Tại sao trước đây phải F5 mới tải đầy đủ dữ liệu sau khi đăng nhập? |
| [qa-fe-008](#qa-fe-008) | Giải thích hàm `formatTime` và mẹo ép năm 2024 (Xử lý múi giờ VN)? |

---

<a id="qa-exp-001"></a>

### EXP-001 — `asyncHandler` là gì? Tại sao cần?

Code hiện tại:

```js
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

Mục đích:

- Bọc controller `async` để không lặp `try/catch` ở từng API.
- Nếu controller/service `throw` hoặc Promise `reject`, lỗi được đưa vào `next(err)`.
- Sau `next(err)`, Express chuyển sang middleware xử lý lỗi (`errorHandler`).

[↑ Về mục lục EXP](#toc-exp)

---

<a id="qa-exp-002"></a>

### EXP-002 — Luồng lỗi trong project

Luồng tổng quát:

`router → controller → service → (throw/reject) → next(err) → app.use(errorHandler) → response lỗi`

Tóm tắt:

- Client chỉ gửi request; lỗi nghiệp vụ / DB xảy ra ở backend.
- Để lỗi tới `errorHandler` phải có `next(err)`:
  - Hoặc tự động qua `asyncHandler`
  - Hoặc tự viết `try/catch` và `next(err)`

[↑ Về mục lục EXP](#toc-exp)

---

<a id="qa-exp-003"></a>

### EXP-003 — Có `asyncHandler` vs không có

**Có `asyncHandler` (gọn):**

```js
const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
});
```

**Không có `asyncHandler` (phải tự bắt lỗi):**

```js
const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
```

[↑ Về mục lục EXP](#toc-exp)

---

<a id="qa-exp-004"></a>

### EXP-004 — Vì sao `next(err)` tới được `errorHandler`?

Đó là cơ chế Express:

- Middleware thường: `(req, res, next)`
- Middleware xử lý lỗi: `(err, req, res, next)`

Khi gọi `next(err)`, Express bỏ qua middleware thường và chạy middleware lỗi kế tiếp, ví dụ:

```js
app.use(errorHandler);
```

[↑ Về mục lục EXP](#toc-exp)

---

<a id="qa-exp-005"></a>

### EXP-005 — Ghi nhớ nhanh (Express / lỗi)

- `asyncHandler` không xử lý lỗi thay bạn; nó chỉ chuyển lỗi đúng đường (`next(err)`).
- `errorHandler` mới là nơi chuẩn hóa `status` / `message` và trả JSON lỗi.
- Không dùng `asyncHandler` thì nhớ `try/catch + next(err)` trong từng controller `async`.

[↑ Về mục lục EXP](#toc-exp)

---

<a id="qa-exp-006"></a>

### EXP-006 — `req.cookies.accessToken` — vì sao cần `cookieParser()` trong `app.js`?

**Đúng:** Trong `authenticate`, `req.cookies.accessToken` **dùng được** vì toàn app đã gắn middleware **`cookie-parser`**:

```71:76:server/src/app.js
/**
 * cookieParser()
 * - Đọc header Cookie, parse thành req.cookies.
 * - Cần cho luồng auth của bạn: đọc refreshToken / accessToken từ cookie (vd: /api/auth/refresh).
 */
app.use(cookieParser());
```

`cookie-parser` đọc header HTTP **`Cookie`**, parse thành object và gán vào **`req.cookies`**. Không có `app.use(cookieParser())` thì **`req.cookies`** thường **không tồn tại hoặc rỗng**, nên đọc `req.cookies.accessToken` sẽ không ra token server đã `res.cookie(...)` lúc login.

Trong `app.js`, `cookieParser()` được đặt **trước** `app.use("/api", routes)`, nên mọi route (kể cả middleware `authenticate`) chạy sau đều đã có `req.cookies` sẵn.

```13:13:server/src/middlewares/auth.middleware.js
    const token = req.cookies.accessToken;
```

[↑ Về mục lục EXP](#toc-exp)

---

<a id="qa-exp-007"></a>

### EXP-007 — Vì sao nên dùng `validate(schema)` thay vì `if...else` thủ công?

**Vấn đề:**
Nếu không có `resolve/zod` và hàm middleware `validate`, Controller sẽ phải "gánh" toàn bộ logic kiểm duyệt dữ liệu (Manual Validation). 

Ví dụ, API Đăng ký sẽ biến thành một hàm dài dòng chứa hàng tá lệnh `if...else`:

```js
const register = asyncHandler(async (req, res, next) => {
  const { email, matKhau } = req.body;

  // 1. Kiểm tra thủ công từng trường và regex
  if (!email) return next(new AppError("Thiếu email", 400));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return next(new AppError("Email sai định dạng", 400));
  if (!matKhau) return next(new AppError("Thiếu mật khẩu", 400));
  if (matKhau.length < 6) return next(new AppError("Mật khẩu quá ngắn", 400));
  // ... hàng chục cái if nữa

  // 2. Chạy logic chính
  const result = await authService.register(req.body);
  res.status(201).json(...);
});
```

**Nhược điểm của cách cũ (`if...else`):**
- **Spaghetti code**: Controller quá dài, khó đọc, lẫn lộn giữa kiểm tra đầu vào và logic nghiệp vụ.
- **Khó bảo trì**: Phải copy-paste lại các dòng regex để check email/password ở các API khác (như API Đăng nhập, Đổi pass...).

**Giải pháp với Zod + Middleware Factory:**
Dùng `router.post("/register", validate(registerSchema), authController.register);`

1. **Phân chia trách nhiệm rõ ràng**: Mọi logic kiểm tra gộp vào 1 file Schema (như `auth.validation.js`).
2. **Controller "sạch sẽ"**: Chỉ tập trung xử lý đúng logic lõi (`authService`).
3. **Chặn lỗi từ "cửa khẩu"**: Hàm `validate(schema)` sẽ lấy schema hứng chuỗi JSON do Client truyền lên để `.parse()`. Nếu Fail, hàm tự gom câu báo lỗi lại và ném mã `400 Bad Request` đá thẳng ra ngoài. Không một Request rác nào có cơ hội lọt sâu vào Database!

[↑ Về mục lục EXP](#toc-exp)

---

<a id="qa-auth-001"></a>

### AUTH-001 — Sau `jwt.verify`, `decoded` chứa những field gì?

`decoded` **không phải** chuỗi token. Nó là **payload** (object) đã giải mã từ JWT, sau khi verify thành công (chữ ký đúng, còn hạn).

Trong project, access và refresh đều được ký với payload `{ id: taiKhoanId }`:

```js
jwt.sign({ id: taiKhoanId }, secret, { expiresIn: ... });
```

Thư viện `jsonwebtoken` còn **tự thêm** (trong payload khi verify):

- `iat` — thời điểm phát hành (Unix timestamp, giây)
- `exp` — thời điểm hết hạn (Unix timestamp, giây)

Ví dụ minh họa sau `jwt.verify`:

```js
{
  id: 12,
  iat: 1710000000,
  exp: 1710000900
}
```

Nếu sau này đổi cách ký token, shape của `decoded` đổi theo; hiện tại **`decoded.id` là id tài khoản** để tra DB.

[↑ Về mục lục AUTH](#toc-auth)

---

<a id="qa-auth-002"></a>

### AUTH-002 — `BigInt(decoded.id)` là gì? Ví dụ

Trong schema Prisma, `taiKhoan.id` thường là **`BigInt`**. Khi `where: { id: ... }`, cần giá trị kiểu **`BigInt`** cho khớp.

- `decoded.id` sau verify thường là **number** (ví dụ `12`).
- `BigInt(decoded.id)` tạo **`12n`** — đúng kiểu Prisma cho field BigInt.

```js
decoded.id;           // 12 (number)
BigInt(decoded.id);   // 12n (bigint)
```

[↑ Về mục lục AUTH](#toc-auth)

---

<a id="qa-auth-003"></a>

### AUTH-003 — `refreshAccessToken`: vì sao cần `findUnique` trước khi so hash?

`jwt.verify` chỉ bảo đảm token **không giả**, **đúng secret**, **chưa hết hạn**. Không bảo đảm tài khoản còn trong DB hay refresh token vẫn là token **đang được server chấp nhận** (đăng xuất, xoay token, thu hồi…).

Project lưu **hash SHA-256** của refresh token trong DB. Cần `findUnique({ where: { id: BigInt(decoded.id) } })` để:

1. Lấy dòng `taiKhoan` và cột `refreshToken` (hash đang lưu).
2. So `taiKhoan.refreshToken === hashToken(refreshToken)` với token client gửi.
3. Dùng `taiKhoan.id` cho bước `update` hash mới sau khi cấp token mới.

Token **không** đưa vào `where` Prisma; điều kiện token nằm ở `if` sau `findUnique`.

[↑ Về mục lục AUTH](#toc-auth)

---

<a id="qa-auth-004"></a>

### AUTH-004 — Login: `req.body` là gì? Logout / `me`: `req.user` lấy từ đâu?

**`req.body` (POST `/api/auth/login`):** là **JSON body** client gửi lên sau khi đã qua `validate(loginSchema)` — thường là **email + mật khẩu** (đúng schema đăng nhập). Controller truyền thẳng vào service:

```38:38:server/src/controllers/auth.controller.js
  const { user, accessToken, refreshToken } = await authService.login(req.body);
```

**`req.user` (POST `/logout`, GET `/me`, …):** Express **không tự có** `req.user`. Nó được middleware **`authenticate`** gắn **trước** controller. Trong routes, các endpoint cần đăng nhập khai báo `authenticate` trước handler:

```20:24:server/src/routes/auth.routes.js
// POST /api/auth/logout - Đăng xuất
router.post("/logout", authenticate, authController.logout);

// GET /api/auth/me - Lấy thông tin tài khoản
router.get("/me", authenticate, authController.getMe);
```

Luồng trong `authenticate`: đọc **`req.cookies.accessToken`** → `jwt.verify` → `findUnique` tài khoản → **`req.user = taiKhoan`** → `next()`:

```11:45:server/src/middlewares/auth.middleware.js
const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    // ...
    const decoded = jwt.verify(token, config.jwtAccessSecret);

    const taiKhoan = await prisma.taiKhoan.findUnique({
      where: { id: BigInt(decoded.id) },
      select: {
        id: true,
        email: true,
        vaiTro: true,
        trangThaiTaiKhoan: true,
        bacSi: { select: { id: true } },
        benhNhan: { select: { id: true } },
      },
    });
    // ... kiểm tra tồn tại, trạng thái khóa ...
    req.user = taiKhoan;
    next();
  } catch (error) {
    next(error);
  }
};
```

Tóm tắt:

- **Biết user lúc đăng nhập:** từ **body** (email/mật khẩu).
- **Biết user lúc gọi API đã đăng nhập:** từ **cookie access token** → middleware → **`req.user`**.

[↑ Về mục lục AUTH](#toc-auth)

---

<a id="qa-auth-005"></a>

### AUTH-005 — Đổi mật khẩu: sao biết đúng user? `userId` có phải từ token?

Service **`doiMatKhau`** không tự “đoán” ai đang đổi mật khẩu. **`userId`** truyền vào là **`req.user.id`** — đã được server xác định **sau khi verify access token** trong cookie (middleware `authenticate`).

Route có `authenticate` **trước** controller:

```27:27:server/src/routes/auth.routes.js
router.put("/doi-mat-khau", authenticate, validate(doiMatKhauSchema), authController.doiMatKhau);
```

Controller lấy id từ **`req.user`**, body chỉ chứa mật khẩu (theo schema), **không** tin `userId` do client tự gửi để tránh giả mạo:

```78:79:server/src/controllers/auth.controller.js
const doiMatKhau = asyncHandler(async (req, res) => {
  const result = await authService.doiMatKhau(req.user.id, req.body);
```

Service chỉ **`findUnique`** theo id đó:

```180:182:server/src/services/auth.service.js
  const taiKhoan = await prisma.taiKhoan.findUnique({
    where: { id: BigInt(userId) },
  });
```

Tóm tắt: **định danh = JWT trong cookie** → `authenticate` → **`req.user.id`** → `doiMatKhau`. Token có field **`id`** (tài khoản) lúc ký ở `generateTokens`.

[↑ Về mục lục AUTH](#toc-auth)

---

<a id="qa-auth-006"></a>

### AUTH-006 — `clearCookie` path `"/"` vs `"/api/auth"` khác gì?

Khác nhau ở **phạm vi URL** mà browser gửi cookie:

- `path: "/"`: cookie áp dụng gần như toàn site (mọi path bắt đầu từ `/`).
- `path: "/api/auth"`: cookie chỉ gửi cho URL bắt đầu bằng `/api/auth`.

Trong auth flow của project:

- `accessToken` dùng `path: "/"` để middleware auth đọc được trên các API cần đăng nhập.
- `refreshToken` dùng `path: "/api/auth"` để chỉ gửi ở nhóm route auth (ví dụ `/api/auth/refresh`), giảm phạm vi lộ token.

Khi logout phải `clearCookie` **đúng cùng path** như lúc set; khác path thì browser coi là cookie khác và không xóa đúng cái cũ:

```65:66:server/src/controllers/auth.controller.js
  res.clearCookie("accessToken", { ...COOKIE_BASE, path: "/" });
  res.clearCookie("refreshToken", { ...COOKIE_BASE, path: "/api/auth" });
```

[↑ Về mục lục AUTH](#toc-auth)

---

<a id="qa-auth-007"></a>

### AUTH-007 — Vì sao không có bảng `Admin`? Làm sao biết user là admin khi đăng nhập?

Hệ thống sử dụng kiến trúc **"Tài khoản tập trung" (Centralized Account)**. Dưới đây là 3 điểm mấu chốt:

**1) Bảng `TaiKhoan` là bảng "Gốc"**

- Mọi thông tin xác thực (email, mật khẩu) đều nằm chung ở model `TaiKhoan`. Bất kể là Admin, Bác sĩ hay Bệnh nhân, đều **phải có 1 dòng** trong bảng này thì mới đăng nhập được.

**2) Phân biệt bằng trường `vaiTro` (Role-based)**

Trong `schema.prisma`, model `TaiKhoan` có field `vaiTro` (`"admin"`, `"bac_si"`, `"benh_nhan"`).

- **Với Bác sĩ / Bệnh nhân:** Họ cần thêm thông tin chuyên môn (bằng cấp, bệnh sử, ...) nên ta thiết kế thêm các bảng phụ riêng (`BacSi`, `BenhNhan`) và liên kết (quan hệ `1-1`) với `TaiKhoan` dựa trên cột `taiKhoanId`.
- **Với Admin:** Admin thường chỉ cần Email/Password để định danh và quản lý hệ thống, không có thông tin chuyên môn khám chữa bệnh. Do đó **chỉ cần tồn tại ở bảng `TaiKhoan` (với `vaiTro = "admin"`) là đủ**, không cần sinh thêm một bảng `Admin` dư thừa.

**3) Cách backend nhận diện lúc Code (Service & Middleware)**

- **Lúc Login (`auth.service.js`):** Khi query lấy tài khoản, hệ thống sẽ gộp (include) cả `bacSi` và `benhNhan`. Nếu cả hai đều không tồn tại (`null`), hệ thống hiểu đó là Admin và mặc định biến tên hiển thị (`hoTen`) là `"Admin"`.
  ```js
  let hoTen = "Admin";
  if (taiKhoan.benhNhan) hoTen = taiKhoan.benhNhan.hoTen;
  if (taiKhoan.bacSi) hoTen = taiKhoan.bacSi.tenBacSi;
  ```
- **Lúc gọi API (`auth.middleware.js`):** Middleware `authenticate` decode JWT lấy ID rồi query DB, dán toàn bộ dữ liệu của `taiKhoan` vào `req.user`. Các route cần bảo vệ sử dụng cụm `authorize("admin")` sẽ lấy `req.user.vaiTro` ra kiểm tra, nếu là `"admin"` thì mới cho phép xử lý tiếp.

**Tham chiếu chính:** `server/src/services/auth.service.js`, `server/prisma/schema.prisma`, `server/src/middlewares/auth.middleware.js`

[↑ Về mục lục AUTH](#toc-auth)

---

<a id="qa-auth-008"></a>

### AUTH-008 — Phân biệt `bcrypt.hash` (Mật khẩu) và `hashToken` (SHA-256 cho Refresh Token)

Trong `auth.service.js`, hai kiểu hash này được dùng cho hai mục đích bảo mật khác nhau:

**1) `bcrypt.hash(matKhau, 10)` — Bảo vệ Mật khẩu:**
- **Đặc điểm:** Chậm (Key Stretching) và tự động có Salt.
- **Lý do:** Mật khẩu do người dùng đặt thường ngắn/dễ đoán. `bcrypt` cố tình chạy chậm (~100ms) để ngăn hacker dùng siêu máy tính thử hàng tỷ mật khẩu mỗi giây (Brute-force).
- **Luồng:** Nhận mật khẩu $\rightarrow$ `bcrypt.hash` $\rightarrow$ Lưu hash vào DB. Khi login dùng `bcrypt.compare`.

**2) `hashToken(token)` với SHA-256 — Bảo vệ Refresh Token:**
- **Đặc điểm:** Rất nhanh và không có salt mặc định.
- **Lý do:** Refresh Token (JWT) là chuỗi ngẫu nhiên dài, cực kỳ khó đoán (độ phức tạp cao). Ta dùng SHA-256 để tạo một "dấu vân tay" (fingerprint) lưu vào DB. 
- **Mục đích:** Nếu DB bị lộ, hacker chỉ thấy bản hash SHA-256, không thể dùng nó để giả danh người dùng (vì cần Token "sống" ban đầu). Dùng SHA-256 vì cần tốc độ xác thực nhanh khi người dùng gọi API.
- **Luồng:** Tạo Refresh Token JWT $\rightarrow$ `hashToken(token)` $\rightarrow$ Lưu hash vào DB. Token gốc gửi cho Client qua HttpOnly Cookie.

[↑ Về mục lục AUTH](#toc-auth)

---

<a id="qa-auth-009"></a>

### AUTH-009 — Tại sao đăng ký tài khoản mặc định là bệnh nhân? Admin tạo tài khoản bác sĩ như thế nào?

**1) Đăng ký công khai (`POST /api/auth/register`) mặc định là Bệnh nhân:**
- Chức năng đăng ký trên ứng dụng chỉ cấp quyền hạn cơ bản nhất cho công chúng đến khám. Để ngăn ngừa lỗi leo thang đặc quyền (Privilege Escalation), hệ thống luôn chủ động hardcode `vaiTro: "benh_nhan"` ở server side (file `auth.service.js`), phớt lờ bất kỳ `vaiTro` nào mà client cố tình gửi lên.

**2) Luồng khởi tạo tài khoản Bác sĩ của Admin:**
- Với hệ thống backend được refactor kiến trúc theo module, thao tác tạo Bác sĩ mới (bao gồm cả tài khoản để bác sĩ đó login) được gom về **Module Bác Sĩ** (`POST /api/bac-si`) thay vì nằm lạc lõng tại module `Auth`.
- Luồng này chỉ dành cho quản trị viên, nên phải đi qua vòng kiểm duyệt phân quyền: `authenticate` (xác thực token) và `authorize("admin")`.
- Tại phần xử lý Core (`bacSi.service.js`), Prisma sẽ mở **Transaction** đồng bộ: Xóa bỏ việc tự sinh tài khoản mặc định nguy hiểm, API yêu cầu cung cấp song song thông tin người dùng (`email`, `matKhau`) kèm theo thông tin y tế (`chuyenKhoaId`...). Hệ thống sẽ tạo `TaiKhoan` gán `vaiTro: "bac_si"` (và dùng bcrypt hash password), sau đó móc nối `taiKhoanId` đó vào bảng `BacSi`. Quá trình này có tính nguyên tử: hỏng 1 khâu sẽ rollback toàn phần.

[↑ Về mục lục AUTH](#toc-auth)

---

<a id="qa-auth-010"></a>

### AUTH-010 — Luồng upload ảnh avatar lên Cloudinary qua multer hoạt động như thế nào?

Dòng code mẫu: `router.put("/cap-nhat-avatar", authenticate, multerUpload.single("avatar"), authController.capNhatAvatar);`

**1. Tại sao lại khai báo `.single("avatar")`?**
- Chữ `"avatar"` là **tên trường (Field Name)** chứa file ảnh cấu hình dưới Frontend khi gửi form (vd: `formData.append("avatar", fileAnh)`).
- Nó báo cho Backend biết: *"Hãy tìm file đính kèm với key 'avatar' trong request body dạng multipart/form-data"*.
- `single` biểu thị việc API này chỉ làm việc với 1 file trong mỗi request.

**2. Việc đẩy file lên Cloud diễn ra ở đâu?**
- Quá trình này diễn ra **ngầm** tại bước trung gian `multerUpload.single("avatar")`.
- Thông qua file cấu hình `server/src/config/cloudinary.config.js`, hệ thống dùng `CloudinaryStorage`. Nó sẽ nhận file từ request, biến thành stream và tự động stream thẳng bản gốc lên bộ nhớ Cloudinary, sau đó đợi Cloudinary nạp xong.

**3. Làm sao lấy link hiển thị ảnh trên Cloud gán vào Database?**
- Khi Cloudinary lưu thành công, toàn bộ tài nguyên đó (bao gồm link `secure_url`) được gắn trả lại vào biến **`req.file.path`**.
- Lúc này Request mới được nhả sang **Controller**. Tại đây (`auth.controller.js`), code lấy link bằng cấu trúc `const avatarUrl = req.file.path`.
- Cuối cùng Controller ném chuỗi URL này vào **Service** (`auth.service.js` hàm `capNhatAvatar`), dùng Prisma Update trực tiếp `avatarUrl` này vào cột `anhDaiDien` của record `TaiKhoan`.

**Tóm tắt luồng:**
Frontend gửi ảnh $\rightarrow$ qua thẻ Auth kiểm tra đăng nhập $\rightarrow$ Middleware Multer tóm file $\rightarrow$ Đẩy lên Cloudinary $\rightarrow$ Nhận về Link ảnh (`req.file`) $\rightarrow$ Controller quét Link $\rightarrow$ Service UPDATE DB.

[↑ Về mục lục AUTH](#toc-auth)

---

<a id="qa-db-001"></a>

### DB-001 — Vì sao xóa bản ghi rồi tạo mới thì `id` không quay lại số cũ?

Đây là hành vi **bình thường** của DB, không phải bug code.

- Model đang dùng `id BigInt @default(autoincrement())`.
- PostgreSQL cấp id bằng **sequence**.
- Khi insert, sequence tăng (`9 -> 10 -> 11...`).
- Khi xóa bản ghi `id=9`, sequence **không giảm** và thường **không tái sử dụng 9**.

Vì vậy, luồng `tạo id=9 -> xóa -> tạo mới id=10` là đúng chuẩn.

Điểm cần nhớ:

- `id` là khóa kỹ thuật (định danh), không nên yêu cầu liên tục không hở số.
- Nếu nghiệp vụ cần mã hiển thị liên tục, nên dùng thêm cột riêng (ví dụ `maHienThi`), tách khỏi `id`.

[↑ Về mục lục DB](#toc-db)

---

<a id="qa-db-002"></a>

### DB-002 — Prisma `findMany`: `include`, `_count`, `orderBy`, `asc/desc` là gì?

Ví dụ đang dùng:

```9:14:server/src/services/chuyenKhoa.service.js
const getAll = async () => {
  return prisma.chuyenKhoa.findMany({
    include: { _count: { select: { bacSiList: true } } },
    orderBy: { tenChuyenKhoa: "asc" },
  });
};
```

Giải thích nhanh:

- `findMany(...)`: lấy **nhiều bản ghi** từ model `ChuyenKhoa`.
- `include`: lấy thêm dữ liệu liên quan ngoài field chính.
- `_count`: object Prisma hỗ trợ **đếm số bản ghi relation**.
- `select: { bacSiList: true }`: đếm số bác sĩ thuộc mỗi chuyên khoa, trả về ở `_count.bacSiList`.
- `orderBy: { tenChuyenKhoa: "asc" }`: sắp xếp theo tên chuyên khoa tăng dần.
- `"asc"`: tăng dần (A -> Z), `"desc"`: giảm dần (Z -> A).

Tóm tắt: query này trả danh sách chuyên khoa, kèm số bác sĩ mỗi khoa và sắp xếp tên từ A-Z.

[↑ Về mục lục DB](#toc-db)

---

<a id="qa-db-003"></a>

### DB-003 — Xử lý múi giờ: Tại sao dùng năm 2000? Vai trò của `normalizeTime`?

**Vấn đề:** 
Hệ thống lưu trữ giờ hành chính của bác sĩ (ví dụ: 07:00 - 11:00) dưới dạng chuẩn `DateTime` trong database. Nếu không xử lý khéo, ta sẽ gặp 2 lỗi nghiêm trọng:
1. **Lệch 7 tiếng:** Do Database lưu giờ UTC (00:00Z) còn ta dùng giờ Việt Nam (07:00).
2. **Lỗi lịch sử 1970 (Lệch thêm 1 tiếng):** Trong hệ thống múi giờ quốc tế, trước năm 1975, khu vực Sài Gòn (`Asia/Ho_Chi_Minh`) có múi giờ là **UTC+8**. Nếu dùng mốc năm mặc định là 1970, hàm `format` sẽ tự cộng 8 tiếng thay vì 7 tiếng, khiến 7h sáng biến thành 8h sáng.

**Giải pháp bộ 3 hàm "vệ sĩ" (trong `datLich.service.js`):**

1. **`parseTime(timeStr)` — "Đóng gói" chuẩn xác:**
   Dùng mốc năm **2000** và offset **+07:00** để đảm bảo DB luôn lưu chuẩn lùi về UTC một cách nhất quán (07:00 VN -> 00:00 UTC).
   ```js
   const parseTime = (timeStr) => new Date(`2000-01-01T${timeStr}:00.000+07:00`);
   ```

2. **`formatTime(date)` — "Hiển thị" thông minh:**
   Ép mốc năm về **2000** trước khi định dạng để "né" lỗi UTC+8 của năm 1970. Sử dụng `Intl.DateTimeFormat` để tự động tính toán múi giờ theo vùng `Asia/Ho_Chi_Minh`.
   ```js
   const d = new Date(date);
   d.setFullYear(2000); 
   return new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", ... }).format(d);
   ```

3. **`normalizeTime(date)` — "Là phẳng" để so sánh:**
   Trong JS, so sánh 2 đối tượng `Date` là so sánh cả Ngày/Tháng/Năm. Hàm này reset mọi Date về cùng ngày `2000-01-01` để việc so sánh **chỉ dựa trên Giờ/Phút**.
   ```js
   const d = new Date(date);
   d.setFullYear(2000, 0, 1); 
   return d.getTime();
   ```

**Tóm lược công thức VIP**:
- **Chiều Nhận (IN):** `timestamp + 07:00` -> DB lưu UTC.
- **Chiều Xuất (OUT):** `UTC -> Asia/Ho_Chi_Minh` (đảm bảo năm > 1975).
- **So sánh:** Dùng `normalizeTime` để dẹp bỏ sự khác biệt về ngày tháng.

[↑ Về mục lục DB](#toc-db)

---

<a id="qa-fe-001"></a>

### FE-001 — Upload file (Ảnh đại diện) bằng FormData hoạt động ra sao ở Frontend?

Dòng code mẫu: `PatientProfilePage.jsx` (hàm `handleAvatarChange`)

**1. Bắt lấy file người dùng chọn**
- Khi người dùng chọn file từ thẻ `<input type="file" />`, file đó sinh ra sự kiện (`event`) và được lưu trong mảng `e.target.files`.
- Lệnh `const file = e.target.files[0];` giúp ta lấy file đầu tiên. Nếu người dùng mở cửa sổ chọn file nhưng cấu hình ấn "Cancel", thì `!file` sẽ `true` và dùng lệnh `return` để dừng sớm.

**2. Đóng gói dữ liệu bằng FormData**
- Upload file **không thể gộp** chung với JSON thường (`{ email, password }` v.v...) vì form gửi file có kích thước lớn và định dạng đặc thù là `multipart/form-data`.
- Cần tạo một cái thùng chứa: `const formDataToUpload = new FormData()`.
- Lệnh `.append("avatar", file)` sẽ thả file vào thùng và gắn nhãn tên là `"avatar"`.
- Nhãn `"avatar"` này khớp 100% với keyword `multerUpload.single("avatar")` ở Backend để Backend có thể tóm được chính xác file.

**3. Làm mới giao diện (Sau khi thành công)**
- Sau khi chờ `await authService.capNhatAvatar` đẩy lên mây, ta lấy về kết quả chứa đường link dạng `res.anhDaiDien`.
- `setFormData`: Để cập nhật hiển thị cái ảnh nằm giữa Form hồ sơ hiện tại.
- `setUser`: Để cập nhật biến Global State. Giúp hình avatar đại diện nhỏ xíu nằm ở góc phải Menu trên cùng của màn hình thay đổi tức thì mà người dùng không cần phải F5 (refresh) thẻ trình duyệt tải lại trang.

**4. Khối lệnh `finally` dọn dẹp**
- Khối lệnh `finally` được ưu tiên chạy ngay cho dù hàm chạy vào thành công hay văng lỗi để dọn dẹp logic. Tại đây sẽ tắt cái vòng tròn icon xoay loading (`setIsUploadingAvatar(false)`).
- Chú ý câu lệnh mẹo: `e.target.value = null;`. Việc này dọn dẹp sạch giá trị đã nhớ của thẻ `<input>`. Cực kỳ hữu dụng: ví dụ nếu người dùng tải file `anh.jpg` bị web từ chối báo lỗi dung lượng, người đó kéo nén file lại nhưng tải lên vẫn chung 1 tên `anh.jpg`. Thẻ input sẽ cảm nhận "Ủa giá trị null thành anh.jpg" thay vì điểu kiện cũ là "anh.jpg => anh.jpg" và nó sẽ tiếp tục kích hoạt được trigger `onChange` để làm việc bình thường thay vì bị "chết đơ".

**Vòng lặp tổng lược:** Bắt file $\rightarrow$ Kiểm duyệt dung lượng $\rightarrow$ Đóng thùng `FormData` $\rightarrow$ Đợi API Response $\rightarrow$ Cập nhật 2 nơi UI State $\rightarrow$ Tắt hiệu ứng Loading / Clear thẻ `<input>`.

[↑ Về mục lục FE](#toc-fe)

---

<a id="qa-fe-002"></a>

### FE-002 — Logic mở/đóng (Accordion) trong trang FAQ hoạt động như thế nào?

Dòng code mẫu: `FAQPage.jsx` (hàm `toggle` và thẻ render)

**1. Khởi tạo State lưu trữ trạng thái**
```js
const [openIndex, setOpenIndex] = useState(null);
```
- Biến `openIndex` lưu lại **vị trí (index)** của câu hỏi đang được mở trong danh sách `FAQ_DATA.map`.
- Giá trị khởi tạo là `null` mang ý nghĩa: lúc mới tải trang, không có câu nào được mở (tất cả đều thu lại).

**2. Hàm điều khiển Toggle (Bật/Tắt)**
```js
const toggle = (index) => {
  setOpenIndex(openIndex === index ? null : index);
};
```
- Khi người dùng click vào một câu hỏi (ví dụ câu số 2, `index = 2`):
  - **Trường hợp click mở cái mới:** Nếu câu đó chưa được mở (`openIndex !== 2`), hàm sẽ set giá trị `openIndex` thành 2, làm câu 2 mở ra. Kèm theo đó, nếu trước đó đang mở câu 1 thì nó sẽ tự động bị đóng lại, vì biến state `openIndex` lúc này chỉ còn nhớ đúng số 2 chứ không phải số 1 nữa. Đây là bản chất của cơ chế "Single-open accordion" (chỉ mở 1 thẻ cùng lúc).
  - **Trường hợp click đóng cái đang mở:** Nếu câu 2 đang mở sẵn (`openIndex === 2`) mà người dùng lại click vào chính nó một lần nữa, phép so sánh `openIndex === index` sẽ trả về `true`. Do đó hàm set biến về lại giá trị `null`, giúp toàn bộ danh sách quy về trạng thái đóng rỗng.

**3. Khâu hiển thị UI (Render)**
```js
const isOpen = openIndex === index;
// ...
{isOpen && (
  <div className="px-6 pb-6 text-slate-600 text-sm leading-relaxed">
    {item.answer}
  </div>
)}
```
- Biến `isOpen` nằm trong vòng lặp `map`, nó sẽ chạy kiểm tra từng phần tử. Chỉ phần tử nào có `index` trùng với `openIndex` thì `isOpen` của phần tử đó mới có giá trị `true`.
- Khối `isOpen && (...)` là kĩ thuật Rendering có điều kiện (Short-circuit) của React: Chỉ vẽ phần mã HTML chứa câu trả lời (`item.answer`) ra giao diện nếu điều kiện đằng trước là `true`.

[↑ Về mục lục FE](#toc-fe)

---

<a id="qa-fe-003"></a>

### FE-003 — Tại sao cần gọi `getMe()` khi đã có Zustand lưu thông tin người dùng rồi?

Đây là câu hỏi cực kỳ quan trọng về cách hoạt động của State Management (Zustand) kết hợp với Cơ chế xác thực (Token/Cookie).

**1. "Trí nhớ ngắn hạn" của Zustand**
- Zustand lưu thông tin trên **RAM (Bộ nhớ tạm)** của trình duyệt. 
- **Đặc điểm:** Khi người dùng nhấn **F5 (Refresh)** hoặc tắt trình duyệt đi rồi mở lại, toàn bộ "trí nhớ" của Zustand sẽ bị xóa sạch (quy về giá trị khởi tạo là `null`). 
- Nếu không có cơ chế khôi phục, người dùng sẽ bị đá ra trang Login liên tục mỗi khi tải lại trang, dù họ chưa hề đăng xuất.

**2. "Vé thông hành" trong Cookie**
- Khi đăng nhập thành công, Server không chỉ trả về thông tin cho Zustand mà còn gửi một **"Token"** dán vào **Cookie** của trình duyệt.
- Khác với Zustand, Cookie được lưu dưới **ổ cứng (Persistent Storage)**. Nó "sống sót" được qua hành động F5, thậm chí tắt máy bật lại vẫn còn (nếu chưa hết hạn).

**3. Vai trò "Cứu hộ" của hàm `getMe()`**
- Khi Frontend bắt đầu khởi động (sau khi F5), nó kiểm tra thấy Zustand đang trống rỗng.
- Ngay lập tức, một hiệu ứng (thường là `useEffect` trong `App.jsx`) sẽ kích hoạt gọi API `getMe()`.
- Nhờ chiếc Token vẫn còn trong Cookie, Server sẽ xác thực được danh tính người dùng và trả về thông tin đầy đủ.
- Frontend nhận được thông tin này và **"nhồi" lại vào Zustand**. 
- Kết quả: Người dùng thấy mình vẫn đang đăng nhập một cách mượt mà.

**4. Vòng đời tổng quát:**
- **Đăng nhập:** Nhận thông tin $\rightarrow$ Lưu Zustand (xài tạm) + Lưu Cookie (xài lâu).
- **F5 trang:** Zustand mất thông tin $\rightarrow$ Cookie vẫn còn.
- **Tự động cứu hộ:** Gọi `getMe()` dùng Token từ Cookie $\rightarrow$ Lấy lại thông tin $\rightarrow$ Gán lại vào Zustand.
- **Đăng xuất / Hết hạn:** Xóa sạch cả Zustand và Cookie $\rightarrow$ Kết thúc phiên làm việc.

**Tóm lại:** Zustand là cái kho để xài nhanh (tránh gọi API nhiều lần), còn `getMe()` là "máy phát điện dự phòng" giúp khôi phục cái kho đó mỗi khi web bị reset.

[↑ Về mục lục FE](#toc-fe)

---

<a id="qa-fe-004"></a>

### FE-004 — Vai trò của `useNavigate` và `useLocation` trong Layout Bác sĩ?

Hai React Hook này cực kỳ quan trọng trong việc quản lý điều hướng và giao diện của trang Doctor Portal:

1. **`useNavigate()` (Bộ điều hướng):**
   - **Mục đích:** Dùng để chuyển hướng người dùng sang trang khác bằng mã nguồn (programmatic navigation) thay vì thẻ Link.
   - **Ứng dụng:** Thường dùng trong hàm xử lý logic, ví dụ hàm `handleLogout`. Sau khi xóa session, ta gọi `navigate("/doctor/login")` để đẩy người dùng về trang đăng nhập.

2. **`useLocation()` (Bộ nhận diện vị trí):**
   - **Mục đích:** Lấy thông tin về URL hiện tại (pathname, search, v.v.).
   - **Ứng dụng:** Dùng để xác định tiêu đề trang. Dựa vào `location.pathname`, Layout biết bác sĩ đang ở trang nào để hiển thị tiêu đề (Dashboard, Lịch làm việc...) tương ứng trên thanh Header.

[↑ Về mục lục FE](#toc-fe)

---

<a id="qa-fe-005"></a>

### FE-005 — Cách xử lý ảnh đại diện (Avatar) giữa Local và Cloud? (getAvatarUrl)

Hàm `getAvatarUrl` là một bộ lọc thông minh giúp xử lý ảnh từ hai nguồn khác nhau:

- **Link Cloud (Tuyệt đối):** Nếu URL bắt đầu bằng `http`, hệ thống hiểu đây là link từ dịch vụ bên ngoài (Facebook, Google, Cloudinary). Nó sẽ giữ nguyên link đó.
- **Link Local (Tương đối):** Nếu URL là dạng đường dẫn thư mục (vd: `/uploads/abc.jpg`), hệ thống sẽ tự động ghép thêm địa chỉ Backend (`VITE_API_URL`) vào đằng trước để trình duyệt có thể tìm thấy file trên server nội bộ.

**Cơ chế Ưu tiên (Priority Fallback):**
Hệ thống sử dụng toán tử `||` để chọn ảnh theo thứ tự:
`Ảnh User (Mới nhất) || Ảnh hồ sơ Bác sĩ || Ảnh mặc định (UI-Avatars)`.
Việc dùng **UI-Avatars** làm phương án cuối giúp giao diện luôn có ảnh đại diện (chữ cái đầu của tên) cực kỳ chuyên nghiệp ngay cả khi người dùng chưa bao giờ upload ảnh.

[↑ Về mục lục FE](#toc-fe)

---

<a id="qa-fe-006"></a>

### FE-006 — Cơ chế hiển thị tiêu đề trang động cho các route lồng nhau (basePath)?

Trong `DoctorLayout`, có một logic xử lý đường dẫn khá "thông minh":
`const basePath = "/" + location.pathname.split("/").slice(1, 3).join("/");`

**Tại sao cần đoạn này?**
Khi có các trang lồng nhau sâu (vd: `/doctor/schedule/add` hoặc `/doctor/schedule/edit/1`), nếu chỉ so sánh khớp hoàn toàn URL, hệ thống sẽ không tìm thấy tiêu đề phù hợp trong `PAGE_TITLES`.

**Cách hoạt động:**
- Nó "cắt gọt" URL để chỉ lấy 2 cấp đầu tiên (vd: `/doctor/schedule`).
- Điều này giúp mọi trang con (thêm/sửa/chi tiết) đều dùng chung một tiêu đề chính của chuyên mục đó, giúp Header luôn hiển thị nhất quán.
- Nếu không tìm thấy trong danh sách khai báo, nó sử dụng fallback: `title: "Doctor Portal"`.

[↑ Về mục lục FE](#toc-fe)

---

<a id="qa-fe-007"></a>

### FE-007 — Sửa lỗi: Tại sao trước đây phải F5 mới tải đầy đủ dữ liệu sau khi đăng nhập?

**Lý do:** 
API `auth/login` thường chỉ trả về thông tin tài khoản cơ bản. Các thông tin chi tiết (populated) như chuyên khoa, chức danh bác sĩ... chỉ có đầy đủ khi gọi API `/auth/me` (hàm `fetchUser`). Trước đây, `fetchUser` chỉ chạy khi App khởi động lại (F5).

**Cách khắc phục:**
Cập nhật hàm `login` trong `useAuthStore.js` để tự động gọi `fetchUser()` ngay lập tức sau khi xác thực thành công.
```js
  login: async (credentials) => {
    await authService.login(credentials); // 1. Lấy Cookie
    const { fetchUser } = useAuthStore.getState();
    await fetchUser(); // 2. Lấy Full Profile ngay lập tức
    return useAuthStore.getState().user;
  },
```
Việc này đảm bảo dữ liệu trong Store đã "đầy đủ 100%" trước khi trang web thực hiện chuyển hướng (`navigate`), giúp người dùng thấy thông tin ngay mà không cần tải lại trang.

[↑ Về mục lục FE](#toc-fe)

---

<a id="qa-fe-008"></a>

### FE-008 — Giải thích hàm `formatTime` và mẹo ép năm 2024 (Xử lý múi giờ VN)?

**Vấn đề:**
Khi hiển thị giờ (ví dụ `08:00`), nếu chỉ dùng `new Date()` đơn thuần, JavaScript sẽ mặc định lấy mốc năm **1970**. Điều này gây ra lỗi "lệch 1 tiếng" tại Việt Nam vì:
- Trước năm 1975, múi giờ Sài Gòn (`Asia/Ho_Chi_Minh`) trong thư viện quốc tế được ghi nhận là **UTC+8**.
- Sau năm 1975, múi giờ chuẩn là **UTC+7**.
- Nếu dùng năm 1970, hệ thống tự cộng 8 tiếng $\rightarrow$ 7h sáng biến thành 8h sáng.

**Giải pháp với hàm `formatTime`:**

```javascript
function formatTime(timeInput) {
  if (!timeInput) return "";
  
  // 1. Tối ưu: Nếu là chuỗi giờ thuần "HH:mm:ss", cắt lấy HH:mm cho nhanh
  if (typeof timeInput === "string" && !timeInput.includes("T") && timeInput.includes(":")) {
    return timeInput.substring(0, 5);
  }

  const d = new Date(timeInput);
  if (isNaN(d.getTime())) return timeInput;

  // 2. MẸO QUAN TRỌNG: Ép năm về 2024
  // Giúp trình duyệt luôn dùng quy tắc múi giờ hiện đại (UTC+7), tránh sai lệch lịch sử.
  d.setFullYear(2024); 

  // 3. Định dạng chuẩn hóa
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit", 
    minute: "2-digit", 
    hour12: false, 
    timeZone: "Asia/Ho_Chi_Minh", // Đảm bảo luôn hiện giờ VN kể cả khách ở nước ngoài
  });
}
```

**Lợi ích:**
- **Chính xác tuyệt đối**: Giờ giấc luôn nhất quán giữa Backend (lưu UTC) và Frontend (hiển thị VN).
- **Chuyên nghiệp**: Tránh các lỗi hiển thị giờ kiểu `02:00 PM` khó đọc, thay vào đó là `14:00`.
- **Ổn định**: Hoạt động đúng trên mọi trình duyệt (Chrome, Safari, Firefox) nhờ dùng `Intl` API chuẩn.

[↑ Về mục lục FE](#toc-fe)

---

<a id="qa-template"></a>

### Template — thêm câu hỏi mới

1. Chọn mã danh mục (`exp`, `auth`, `db`, …) và số tiếp theo, ví dụ `qa-db-001`.
2. Thêm **một dòng** vào bảng mục lục đúng nhóm.
3. Dán khối dưới đây, sửa id, tiêu đề và nội dung.

```markdown
<a id="qa-db-001"></a>

### DB-001 — Tiêu đề câu hỏi ngắn

Nội dung trả lời…

[↑ Về mục lục DB](#toc-db)  
```

Khi mở nhóm **DB** lần đầu: trong phần mục lục thêm `<a id="toc-db"></a>` ngay trên `### DB — …`, rồi mới bảng câu hỏi — link “Về mục lục DB” sẽ trỏ tới `#toc-db`.

---

*Cập nhật: thêm DB-002 (`include`, `_count`, `orderBy`, `asc/desc` trong Prisma `findMany`).*
