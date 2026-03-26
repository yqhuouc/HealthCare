# PostgreSQL + Prisma (Tổng hợp & Tra cứu nhanh)

> Tài liệu này viết để bạn “quên tới đâu tra tới đó”.
> Tập trung vào: PostgreSQL (nền tảng DB), Prisma (ORM + workflow), và các “bẫy” thường gặp khi làm backend Node/Express.

---

## 1) Vì sao cần PostgreSQL?

PostgreSQL là hệ quản trị CSDL quan hệ (RDBMS). Bạn dùng PostgreSQL khi cần:

- Dữ liệu có cấu trúc rõ (bảng, cột) và quan hệ giữa các bảng.
- Hỗ trợ mạnh về ràng buộc (constraint), transaction, khóa ngoại (FK).
- Truy vấn SQL linh hoạt (join, group, window function...).
- Tính toàn vẹn dữ liệu và khả năng mở rộng (index, query planner).

Điểm quan trọng khi làm app web:

- Truy vấn nhiều request song song: cần hiểu transaction và isolation.
- Dữ liệu nhiều: cần index đúng chỗ để query nhanh.
- Lỗi phân quyền/ownership: vẫn phải đảm bảo logic ở backend + DB không cho dữ liệu “trôi”.

---

## 2) Các khái niệm cốt lõi trong PostgreSQL

### 2.1 Database / Schema / Table

- **Database**: “khung chứa” chung.
- **Schema**: namespace bên trong DB (thường dùng `public`).
- **Table**: dữ liệu chính.

### 2.2 Column Types (kiểu dữ liệu) hay gặp

- `integer`, `bigint` (id, khóa ngoại)
- `numeric/decimal` (tiền tệ thường nên dùng `numeric`)
- `text/varchar` (chuỗi)
- `boolean` (true/false)
- `date`, `timestamp` (thời gian)

Lưu ý thời gian:

- Khi lưu `timestamp`, bạn cần biết app đang dùng timezone nào.
- Prisma thường map `DateTime` sang kiểu timestamp (cách hiển thị phụ thuộc serializer).

### 2.3 Constraint: UNIQUE / NOT NULL / CHECK

- `UNIQUE`: không cho trùng (dùng cho email, mã định danh…)
- `NOT NULL`: bắt buộc phải có giá trị
- `CHECK`: ràng buộc logic (ví dụ status 0-3)

Constraint giúp backend giảm được lỗi “dữ liệu bẩn”.

### 2.4 Foreign Key (FK) & ON DELETE

- FK đảm bảo quan hệ giữa các bảng.
- `ON DELETE CASCADE` giúp xóa theo chuỗi quan hệ.

Trong Prisma, bạn sẽ khai báo `onDelete: Cascade/Restrict` trong relation.

### 2.5 Index

Index là “bảng tra nhanh” cho truy vấn.

Nguyên tắc:

- Index tốt nhất cho cột dùng trong `WHERE`/`JOIN`/`ORDER BY`.
- Không nên index quá nhiều vì ghi dữ liệu sẽ chậm hơn.

### 2.6 Transaction (ACID)

Transaction đảm bảo:

- **Atomicity**: tất cả hoặc không gì cả
- **Consistency**: ràng buộc không bị phá
- **Isolation**: giữa các transaction
- **Durability**: ghi xong là bền

Trong backend, transaction thường dùng khi:

- Tạo nhiều bảng liên quan trong một request (ví dụ create `TaiKhoan` + `BenhNhan`)
- Cập nhật trạng thái + xóa bản ghi liên quan (ví dụ hủy lịch -> xóa đơn thuốc liên quan)

---

## 3) Migrations/Schema thay đổi: DB “sống” như thế nào?

Thường bạn có 2 kiểu workflow:

1. **Dev nhanh**: `prisma db push` (đẩy schema hiện tại vào DB)
2. **Chuẩn hóa theo lịch sử**: `prisma migrate dev` / `prisma migrate deploy`

Với đồ án/ứng dụng học thuật:

- `db push` nhanh để chạy prototype.
- `migrate` rõ ràng lịch sử thay đổi (dễ review, dễ khôi phục).

---

## 4) Prisma là gì?

Prisma là **ORM (Object-Relational Mapping)** cho Node.js/TypeScript.

### 4.1 Vì sao lại cần Prisma?

Bạn cần Prisma vì:

- **Làm việc với dữ liệu ở dạng “object”** thay vì tự viết SQL cho mọi CRUD.
- **Tự sinh type an toàn** (nếu bạn dùng TS) giúp giảm lỗi sai field.
- **Giảm đau khi làm relation** (FK, join) nhờ `include/select` và query API.
- **Migration/schema** dễ hơn: khai báo trong `schema.prisma` rồi đẩy/migrate.
- **Transaction** tiện: `$transaction`.
- Dễ bảo trì vì logic query tập trung trong code theo model.

### 4.2 Prisma không thay SQL hoàn toàn

Prisma mạnh cho hầu hết use-case CRUD + relation.
Nhưng với query quá “đặc thù” (window function phức tạp, CTE nặng, vendor-specific features),
bạn vẫn có thể dùng:

- `prisma.$queryRaw` / `prisma.$executeRaw` (raw SQL)

---

## 5) Prisma workflow (trong project Node/Express)

Thông thường:

1. Viết `schema.prisma`
2. Chạy `npx prisma generate`
3. Dùng một trong:
   - `npx prisma db push` (đẩy schema nhanh)
   - `npx prisma migrate dev` (migrate theo lịch sử)
4. Trong code backend:
   - Tạo Prisma client singleton (để tránh tốn connection)
   - Viết query theo model (find/create/update/delete)

---

## 6) Prisma schema.prisma: bạn cần đọc phần nào?

Các phần quan trọng:

### 6.1 `datasource db`

- Chứa `provider = "postgresql"`
- Chỉ định connection string:
  - `DATABASE_URL` (thường dùng app)
  - `DIRECT_URL` (thường dùng migration)

### 6.2 `generator client`

- Sinh Prisma client.

### 6.3 `model`

Ví dụ model (minh họa):

```prisma
model TaiKhoan {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  matKhau   String
  vaiTro    String
  trangThaiTaiKhoan Int
  benhNhan  BenhNhan?
}
```

Những điểm bạn cần nhớ:

- `@id` + `@default(...)`: key và cách sinh
- `@unique`: dùng cho `findUnique`
- Relation: field kiểu object và khai báo `@relation(...)`

---

## 7) Prisma Client: các method CRUD cốt lõi

### 7.1 `findUnique`, `findFirst`, `findMany`

- `findUnique({ where })`
  - Bắt buộc `where` dùng field có `unique` (hoặc `@@id`)
- `findFirst({ where, orderBy })`
  - Dùng khi không có unique
- `findMany({ where, orderBy, skip, take, include/select })`
  - Trả danh sách

### 7.2 `create`, `update`, `delete`

- `create({ data })`
- `update({ where: { id }, data })`
- `delete({ where: { id } })`

### 7.3 `upsert`

`upsert` = “nếu tồn tại thì update, không thì create”

```js
await prisma.user.upsert({
  where: { email: inputEmail },
  update: { name: newName },
  create: { email: inputEmail, name: newName },
});
```

---

## 8) Prisma Query: where/select/include/orderBy

### 8.1 `where`

`where` kết hợp:

- logic: `AND`, `OR`, `NOT`
- so sánh: `equals`, `gt`, `gte`, `lt`, `lte`
- chuỗi: `contains`, `startsWith`
- số lượng: `in`, `notIn`

### 8.2 Relation filter: `some/every/none`

Đây là phần “đặc trưng Prisma” và hay quên:

- `some`: tồn tại ít nhất 1 record thỏa
- `every`: tất cả record thỏa
- `none`: không có record thỏa

### 8.3 `select` vs `include`

- Root level:
  - `select`: chỉ chọn field ở model chính
  - `include`: thêm relation vào response
- Nested:
  - trong `select`/`include` bạn tiếp tục `select` relation con.

### 8.4 `orderBy`, `skip/take`

- `orderBy`: sắp xếp (ví dụ theo `ngayDat desc`)
- `skip/take`: phân trang kiểu offset

### 8.5 `_count`

- Hay dùng khi bạn cần trả nhanh số lượng relation.

---

## 9) Nested writes (create/update) - làm cùng lúc nhiều bảng

Prisma cho phép “nested write”:

- create relation con ngay khi tạo bản ghi cha
- update/cascade nhiều cấp
- connect để gắn vào bản ghi đã có

Các kỹ thuật bạn hay dùng:

1. `create` (tạo mới)
2. `connect` (gắn với id đã tồn tại)
3. `connectOrCreate` (nếu có thì connect, không thì create)
4. `upsert` (conditional)

Ví dụ pattern trong project dạng “tạo DonThuoc và ChiTietDonThuoc”:

- Nếu `chiTietDonThuoc` gửi kèm -> nested create
- Nếu `chiTietDonThuoc` optional -> chỉ create cha

---

## 10) Transaction trong Prisma: `$transaction`

Bạn dùng `$transaction` khi:

- nhiều query phải “đồng bộ thành công/thất bại cùng nhau”
- tránh trạng thái nửa vời

Ví dụ:

```js
await prisma.$transaction(async (tx) => {
  const tk = await tx.taiKhoan.create(...);
  await tx.benhNhan.create({ data: { taiKhoanId: tk.id, ... }});
});
```

---

## 11) Raw SQL khi cần (biết để dùng, không lạm dụng)

Khi query Prisma không đáp ứng, có thể:

- `prisma.$queryRaw` (SELECT)
- `prisma.$executeRaw` (INSERT/UPDATE/DELETE)

Lưu ý:

- Raw SQL vẫn phụ thuộc PostgreSQL syntax.
- Luôn tham số hóa để tránh SQL injection.

---

## 12) Những “bẫy” thường gặp (Checklist)

### 12.1 `findUnique` không trả gì

- Kiểm tra `where` có dùng field `@unique` không.
- Nếu không unique -> chuyển sang `findFirst`.

### 12.2 Sai kiểu dữ liệu

- `id` trong route là string, Prisma có thể cần `Int`
- Nên convert ở validation (Zod) hoặc trước khi query.

### 12.3 `select/include` dùng sai chỗ

- Root vừa `select` vừa `include` có thể không hợp ý.
- Nested relation cần đúng kiểu.

### 12.4 Relation filter `some/every/none` dùng nhầm

- `some` thường dùng nhiều nhất trong bài toán “có ít nhất 1 bản ghi thỏa”.

### 12.5 Lỗi constraint ở DB

- Email `@unique` trùng -> lỗi unique constraint
- Delete có FK không cho xóa -> lỗi constraint
- Cần xử lý ở service trước (throw 400/409/403) hoặc cấu hình `onDelete`.

### 12.6 DateTime/timezone

- Khi serialize/deserialze, ngày có thể “lệch” giờ.
- Nếu bạn chỉ quan tâm ngày (`YYYY-MM-DD`) thì nên thống nhất cách parse.

---

## 13) Mapping nhanh: SQL -> Prisma (gợi ý)

### 13.1 `SELECT * FROM table WHERE ...`

- `prisma.table.findMany({ where: { ... } })`

### 13.2 `SELECT ... JOIN ...`

- Prisma: `include` (hoặc `select` nested).

### 13.3 `COUNT(*)`

- `_count` hoặc `aggregate({ _count: ... })`.

### 13.4 `GROUP BY`

- Prisma `groupBy`.

---

## 14) Template nhỏ cho bạn dùng khi quên

### 14.1 Tìm danh sách có phân trang

```js
const list = await prisma.bacSi.findMany({
  where: { chuyenKhoaId: Number(chuyenKhoaId) },
  orderBy: { id: "desc" },
  skip: (page - 1) * limit,
  take: limit,
  include: { taiKhoan: { select: { email: true } } },
});
```

### 14.2 Lọc theo relation có `some`

```js
const lichHen = await prisma.datLich.findMany({
  where: {
    benhNhan: { taiKhoanId: req.user.id },
    trangThai: 0,
  },
});
```

---

## 15) Tài liệu tham khảo (để tự tra sâu)

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Prisma Docs: https://www.prisma.io/docs

