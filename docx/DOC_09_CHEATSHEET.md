# Prisma + Express Tra Cuu Nhanh

> File nay dung de “tra cuu nhanh” cac keyword va noi lay du lieu trong request (params/query/body/headers/cookies...) phu hop voi kien truc backend hien tai.

---

## 0) Keyword Truy Van (Ban Da Liet Ke)


| Nhom       | Keyword    | Y nghia                |
| ---------- | ---------- | ---------------------- |
| Field      | select     | chon field             |
| Relation   | include    | lay bang lien ket      |
| Filter     | where      | loc                    |
| Sort       | orderBy    | sap xep                |
| Pagination | skip/take  | phan trang (offset)    |
| Count      | _count     | dem                    |
| Logic      | AND/OR/NOT | dieu kien              |
| Unique     | distinct   | bo trung (cap ket qua) |
| Advanced   | cursor     | phan trang nang cao    |
| Stats      | aggregate  | tinh toan              |
| Group      | groupBy    | nhom                   |
| Thuoc tinh | Lay tu dau | Dung khi               |
| ---------- | ---------- | -------------------    |
| `params`   | URL `/id`  | lay 1 item             |
| `query`    | `?key=val` | loc, search            |
| `body`     | Request    | gui du lieu            |
| `headers`  | Header     | Token                  |
| `user`     | Middleware | Auth (req.user)        |
| `cookies`  | Cookie     | Login (HttpOnly)       |
| `files`    | Upload     | File                   |


---

## 1) Noi Lay Du Lieu Trong Request (Express)

1. `req.params` : duong dan URL, vi du `/:id`
2. `req.query` : tham so query string, vi du `?page=1&limit=10`
3. `req.body` : payload JSON cua client
4. `req.headers` : header (neu co Authorization / content-type...)
5. `req.user` : duoc gan trong middleware `authenticate` (sau khi verify JWT)
6. `req.cookies` : cookie HttpOnly do trinh duyet tu dong gui (trong project: `accessToken`, `refreshToken`)
7. `req.file(s)` : upload (neu co middleware upload)

> Ghi chu quan trong: project dung Dual JWT trong HttpOnly cookie, nen `accessToken/refreshToken` thuong khong doc qua `headers` ma doc qua `req.cookies`.

---

## 2) Prisma: Chon Field (`select`) vs Lay Relation (`include`)

1. `select`
  - Chi lay cac field ban muon, giam payload.
  - Thuong dung khi API can response nho/gon.
2. `include`
  - Lay luon cac entity lien quan.
  - Thuong dung khi can man hinh hiển thị day du (nhieu relation).
3. Nguyen tac hay gap
  - `select` va `include` o cung “muc” (cung entity root) khong nen ket hop lung tung.
  - Neu muon vua chon field vua include relation, hay dung theo cau truc Prisma (root dung `select` hoac root dung `include`), sau do moi nested relation duoc khai bao trong `select`/`include`.

---

## 3) Prisma: where (Loc) + Logic

### 3.1 Logic chinh

- `AND`: tat ca dieu kien deu thoa
- `OR`: it nhat mot dieu kien thoa
- `NOT`: phu dinh dieu kien

### 3.2 Filter thong dung

- So sanh: `equals`, `not`, `lt`, `lte`, `gt`, `gte`
- Chuoi: `contains`, `startsWith`, `endsWith`, `mode: "insensitive"`
- Tap hop: `in`, `notIn`

### 3.3 Loc theo relation (RAT HAY THIEU)

Voi relation field (vi du `benhNhan`, `bacSi`, ...), Prisma cung cap:

- `some`: ton tai it nhat 1 record lien quan thoa dieu kien
- `every`: tat ca record lien quan deu thoa dieu kien
- `none`: khong co record nao lien quan thoa dieu kien

Vi du (minh hoa):

- `lichHen: { some: { trangThai: 2 } }` (co it nhat 1 lich hop trangThai=2)
- `donThuoc: { none: { } }` (khong co don thuoc)

---

## 4) Prisma: Methods pho bien (De biet dung loai query)

1. `findUnique`
  - Lay 1 record theo truong “unique” (hoac constraint unique).
2. `findFirst`
  - Lay 1 record dau tien theo `where` + `orderBy` (dung khi khong co unique field).
3. `findMany`
  - Danh sach nhieu record, ho tro where/orderBy/pagination/include/select.
4. `create`
  - Tao record moi
5. `update`
  - Cap nhat record theo unique
6. `delete`
  - Xoa record theo unique
7. `upsert`
  - “cap nhat neu co, tao neu khong co” theo unique condition

---

## 5) Pagination trong Prisma

### 5.1 Skip/Take (offset pagination)

- `skip`: bo qua N record
- `take`: lay N record

Phu hop danh sach don gian, nhung co the cham hon khi dataset lon va thay doi nhieu.

### 5.2 Cursor (keyset pagination)

Tham so hay dung:

- `cursor`: vi tri bat dau (thuong la 1 field unique/hoac primary key)
- `skip`: thuong set `1` de bo record “cursor”
- `take`: so record can lay

> Cursor pagination phu hop khi ban can “dang theo trang” nhung dataset co the thay doi.

---

## 6) Distinct / Count / Aggregate / GroupBy

### 6.1 `distinct`

- `distinct` giup bo trung (tuy theo field)
- Thuong dung de lay gia tri khac nhau (vi du list id).

### 6.2 `_count`

- `_count` lay so luong relation.
- Thuong dung trong response public admin dashboard de nhanh.

### 6.3 `aggregate`

- Dung khi ban can tinh toan nhanh: `sum`, `avg`, `min`, `max`, `count`...

### 6.4 `groupBy`

- Dung khi ban muon gom theo nhieu truong va tinh stats tren tung nhom.

---

## 7) Nested Writes (Tao/Cap Nhat Xoay Nguoc) - RAT QUAN TRONG

1. `create` (nested)
  - Tao co the kem relation (vi du tao `DonThuoc` kem danh sach `ChiTietDonThuoc`)
2. `connect`
  - Noi record moi vao relation da co (vi du `connect: { id }`)
3. `disconnect`
  - Tach relation
4. `connectOrCreate`
  - Ket hop va neu khong co thi tao moi
5. `upsert` (nested hoac root)
  - cap nhat neu co / tao neu khong co

> Trong project, voi luong “Don thuoc”, `chiTietDonThuoc` co the optional: neu khong gui thi chi tao `DonThuoc`, neu co thi nested create them `ChiTietDonThuoc`.

---

## 8) Transactions (`$transaction`)

Khi can dam bao tinh nhat giua nhieu thao tac, dung:

- `await prisma.$transaction(async (tx) => { ... })`
- hoac danh sach promise trong `$transaction([ ... ])`

Duoc khuyen dung khi:

- Tao nhieu bang trong 1 lan (vi du: register/tao TaiKhoan + BenhNhan)
- Update trang thai dong thoi xoa don phu thuoc (vi du cancel lich hẹn -> xoa don thuoc lien quan)

---

## 9) App Response / Error (Lien Quan Voi Backend Cua Ban)

Trong project, response thuong co dang:

- `{ success: true, message, data }`

Error:

- Middleware / service throw `AppError(message, statusCode)`
- `authorize` tra:
  - `401`: chua login (khong co `req.user`)
  - `403`: user khong duoc quyen

---

## 10) Checklist Nhanh Khi “Prisma Query Khong Ra Ket Qua”

1. `where` co dung truong (field) va dung kieu du lieu khong (string/number/date)?
2. Relation filter co dung operator (`some/every/none`) khong?
3. `select/include` co bi xung logic root (`select` vs `include`) khong?
4. `findUnique` co dung key unique khong? Neu khong dung -> doi sang `findFirst`.
5. Pagination skip/take co loai bo dung record (`cursor` + `skip: 1`) khong?
6. Nested create optional (nhu `chiTietDonThuoc`) da duoc xu ly khong?
7. Co can `$transaction` khong?

