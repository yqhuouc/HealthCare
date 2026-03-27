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
| [qa-auth-007](#qa-auth-007) | Vì sao không có bảng `Admin`? Làm sao biết user là admin? |

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

### AUTH-007 — Vì sao không có bảng `Admin`? Làm sao biết user là admin?

Trong project của bạn, **admin không có bảng hồ sơ riêng** (không có model `Admin`), vì role admin được lưu trực tiếp trên bảng **`TaiKhoan`**.

**1) Admin nằm ở đâu trong DB?**

Trong `schema.prisma`, model `TaiKhoan` có field `vaiTro`:

- `"admin"` | `"bac_si"` | `"benh_nhan"`

Và `TaiKhoan` có quan hệ tùy chọn:

- `bacSi BacSi?`
- `benhNhan BenhNhan?`

=> Với tài khoản admin: `vaiTro = "admin"` và **cả** `bacSi` lẫn `benhNhan` thường sẽ là `null`.

**2) Backend biết user đang là admin như thế nào?**

Middleware `authenticate` lấy token từ cookie (`req.cookies.accessToken`), decode JWT, rồi `findUnique` tài khoản trong DB. Nó **chọn luôn** `vaiTro` và gán vào `req.user`:

- `req.user.vaiTro` là `"admin"` khi tài khoản là admin.

Trong middleware `authorize(...roles)`, nó chỉ cho phép nếu:

- `roles.includes(req.user.vaiTro)`

Ví dụ nếu route có `authorize("admin")` thì chỉ tài khoản có `vaiTro = "admin"` mới đi qua; ngược lại sẽ trả `403`.

**Tham chiếu chính:** `server/prisma/schema.prisma`, `server/src/middlewares/auth.middleware.js`

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

### DB-003 — Xử lý múi giờ: Tại sao `parseTime` lại dùng `+07:00` còn `formatTime` cộng 7?

**Vấn đề:** 
Hệ thống (Node.js/Prisma) tự động lưu trữ định dạng Time bằng chuẩn giờ UTC (giờ Quốc tế). Việc lưu UTC giúp mọi Client trên thế giới tự đồng bộ múi giờ với hệ thống tự động, nhưng backend nếu trích xuất Time sai sẽ sinh ra lỗi lệch múi giờ.

**Cách giải quyết 2 chiều (ở backend):**

1. **Chiều IN - Khi nhận `"HH:mm"` từ client (`parseTime`):**
   ```javascript
   const parseTime = (timeStr) => new Date(`1970-01-01T${timeStr}:00.000+07:00`);
   ```
   Ta dùng `+07:00`. Ví dụ: dữ liệu client gửi là `"13:00"`. Khi khởi tạo `Date()`, Node hiểu đây là *"13h giờ VN"* -> tự động quy đổi lùi về thành *"06h chuẩn UTC"* để lưu vào Prisma. Khi Prisma GET và nhả ra JSON (như `"1970-01-01T06:00:00.000Z"`), trình duyệt ở VN sẽ parse JSON này tự động `+7` hiển thị trên màn hình là 13:00 chuẩn xác.

2. **Chiều OUT - Khi trích xuất chữ ở API backend (`formatTime`):**
   Thay vì phải cộng (+7) thủ công rồi ghép chuỗi dễ xảy ra lỗi nếu host server ở múi giờ lạ, cách **chuẩn mực và an toàn nhất** là sử dụng `Intl.DateTimeFormat`:
   ```javascript
   const formatTime = (date) => {
     return new Intl.DateTimeFormat("vi-VN", {
       timeZone: "Asia/Ho_Chi_Minh",
       hour: "2-digit",
       minute: "2-digit",
       hour12: false,
     }).format(new Date(date));
   };
   ```
   Nếu API backend cần lấy biến Date `06:00 UTC` mà Prisma trả về, engine của Javascript sẽ dùng thư viện định dạng múi giờ nội tại (`Asia/Ho_Chi_Minh`) tự động tra cứu chuẩn Quốc tế và quy ra thẳng `"13:00"`.
   Lợi ích là **bất luận máy chủ Node.js (AWS/Vercel/Render,...) đang để múi giờ gì**, chuỗi cuối cùng trích xuất ra luôn là `"13:00"` giờ Việt Nam chuẩn xác 100%.

**Tóm lược công thức VIP**:
- Chiều IN -> Ép nhận format `+07:00` vào lúc Parse Date → Để DB lưu chuẩn lùi về UTC.
- Chiều OUT -> Dùng hàm siêu cấp `Intl.DateTimeFormat` với `timeZone: "Asia/Ho_Chi_Minh"`.

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
