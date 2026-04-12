# PHỤ LỤC 04: MINH CHỨNG KIỂM THỬ (TESTING REPORT)

> Giai đoạn thực hiện: Tuần 4, 5 & 9
> Nội dung: Kết quả kiểm thử API bằng Postman và kiểm thử thủ công trên trình duyệt.

---

## 1. Kết quả kiểm thử API (Postman)

Hệ thống đã trải qua 3 giai đoạn kiểm thử API chính:

### Giai đoạn 1 (Tuần 4): Xác thực & Bảo mật
- **Login API**: Test với email/pass đúng -> Trả 200 + Set Cookie HttpOnly.
- **Protected Routes**: Try access `/api/auth/me` không kèm token -> Trả 401 Unauthorized.
- **Refesh Token**: Test cơ chế Token Rotation thành công.

### Giai đoạn 2 (Tuần 5): Nghiệp vụ Backend
- **Tạo lịch hẹn**: Test gửi trùng `bacSiId` + `ngayDat` + `gioBatDau` -> Hệ thống trả 409 Conflict (Đã xử lý logic trùng lịch thành công).
- **Phân quyền (RBAC)**: Tài khoản bệnh nhân gọi API tạo chuyên khoa -> Trả 403 Forbidden. Đảm bảo Admin mới có quyền quản trị.

### Giai đoạn 3 (Tuần 9): Regression Test
- Chạy toàn bộ Collection gồm 35+ API endpoints.
- Tỉ lệ thành công: 100%.

## 2. Kịch bản kiểm thử thủ công (Manual Test Case)

| STT | Luồng nghiệp vụ | Kết quả mong đợi | Trạng thái |
|---|---|---|---|
| TC01 | Đăng ký & Đăng nhập | Tạo tài khoản mới và vào được Dashboard tương ứng. | ✅ Đạt |
| TC02 | Đặt lịch bác sĩ | Slot giờ đã đặt sẽ biến mất khỏi danh sách trống của người khác. | ✅ Đạt |
| TC03 | Thanh toán VNPay | Redirect sang VNPay, nhập thẻ test thành công, quay lại web cập nhật "Đã thanh toán". | ✅ Đạt |
| TC04 | Kê đơn thuốc | Bác sĩ kê xong, bệnh nhân thấy đơn trong lịch sử khám. | ✅ Đạt |
| TC05 | Bảo mật đơn thuốc | Đơn thuốc chưa thanh toán sẽ không hiện danh sách thuốc chi tiết. | ✅ Đạt |

## 3. Hình ảnh minh chứng (Minh họa)

> [!TIP]
> **Hướng dẫn xem chi tiết**: Bạn có thể xem tài liệu định hướng kiểm thử chi tiết tại file [DOC_05_TESTING_GUIDE.md](../DOC_05_TESTING_GUIDE.md) để biết cách cài đặt môi trường test.

---
*Báo cáo kiểm thử được phê duyệt vào Tuần 9.*
