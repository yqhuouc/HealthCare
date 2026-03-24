# CODE Q&A NOTES

File nay dung de note cac cau hoi/tra loi trong qua trinh doc va lam code backend.

---

## 1) `asyncHandler` la gi? Tai sao can?

Code hien tai:

```js
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

Muc dich:

- Boc controller async de khong phai lap `try/catch` trong tung API.
- Neu controller/service `throw` hoac Promise `reject`, loi se duoc day vao `next(err)`.
- Khi da goi `next(err)`, Express se chuyen sang middleware xu ly loi (`errorHandler`).

---

## 2) Luong loi trong project nay

Luong tong quat:

`router -> controller -> service -> (throw/reject) -> next(err) -> app.use(errorHandler) -> response loi`

Tom tat:

- Client chi gui request.
- Loi business/DB xay ra o backend (controller/service/Prisma).
- De loi di den `errorHandler`, can co `next(err)`:
  - Hoac tu dong qua `asyncHandler`
  - Hoac tu viet `try/catch` va `next(err)`

---

## 3) Co `asyncHandler` vs khong co `asyncHandler`

### Co `asyncHandler` (gon)

```js
const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
});
```

### Khong co `asyncHandler` (phai tu bat loi)

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

---

## 4) Vi sao `next` "tu tim" den `errorHandler`?

Vi do la co che cua Express:

- Middleware thuong: `(req, res, next)`
- Middleware xu ly loi: `(err, req, res, next)`

Khi goi `next(err)`, Express bo qua middleware thuong va chay den middleware loi tiep theo trong stack, vi du:

```js
app.use(errorHandler);
```

---

## 5) Ghi nho nhanh

- `asyncHandler` khong xu ly loi thay ban, no chi chuyen loi dung duong (`next(err)`).
- `errorHandler` moi la noi chuan hoa message/status va tra JSON loi.
- Khong dung `asyncHandler` thi phai nho `try/catch + next(err)` o tung controller async.

