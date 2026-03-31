# CODE Q&A NOTES

Ghi chú câu hỏi — trả lời khi đọc / làm backend. **Mỗi mục có thẻ `<a id="...">` chỉ dùng chữ thường, số và gạch ngang** để bấm link trong mục lục là nhảy đúng chỗ (tránh lỗi anchor tiêu đề tiếng Việt trên một số trình xem Markdown).

**Quy ước mã danh mục (mở rộng dần, không giới hạn A/B/C):**

| Mã   | Nội dung gợi ý        | Prefix `id`   |
|------|------------------------|---------------|
| EXP  | Express, middleware, lỗi | `qa-exp-...` |
| AUTH | JWT, đăng nhập, refresh  | `qa-auth-...` |
| DB   | Prisma, migration, query | `qa-db-...`  |
| API  | REST, Postman, contract  | `qa-api-...` |
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

<a id="toc-db"></a>

### DB — Prisma / PostgreSQL

| Id | Câu hỏi / chủ đề |
|----|------------------|
| [qa-db-001](#qa-db-001) | Vì sao xóa bản ghi rồi tạo mới thì `id` không quay lại số cũ? |
| [qa-db-002](#qa-db-002) | Prisma `findMany`: `include`, `_count`, `orderBy`, `asc/desc` là gì? |
| [qa-db-003](#qa-db-003) | Xử lý múi giờ: Tại sao `parseTime` lại dùng `+07:00` còn `formatTime` cộng 7? |

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
