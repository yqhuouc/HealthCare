# 🛡️ Tài liệu Luồng Giao dịch VNPay - HealthCare Project

Tài liệu này giải thích cách hệ thống HealthCare tương tác với cổng thanh toán VNPay để xử lý việc đặt lịch khám và thanh toán online.

---

## 1. Sơ đồ Luồng (Sequence Diagram)

```mermaid
sequenceDiagram
    participant BN as Bệnh nhân (Frontend)
    participant BE as HealthCare Server (NodeJS)
    participant VN as Cổng VNPay (Sandbox)
    participant DB as Database (Prisma/PostgreSQL)

    Note over BN, BE: Bước 1: Đặt lịch khám (Không cần chọn HTTT)
    BN->>BE: Gửi yêu cầu Đặt lịch
    BE->>DB: Tạo bản ghi DatLich (Trạng thái: Chờ khám, trangThaiThanhToan: 0)
    BE-->>BN: Trả về ID lịch hẹn mới tạo -> Vào trang Lịch sử

    Note over BE, DB: Bước 2: Bác sĩ khám bệnh
    BE->>DB: Cập nhật DatLich (Trạng thái: Đã khám - trangThai = 2)

    Note over BN, BE: Bước 3: Tạo Link Thanh toán (Sau khi đã khám)
    BN->>BE: Gọi API lấy link VNPay (truyền ID lịch hẹn + loaiGiaoDich)
    BE->>BE: Kiểm tra trangThai === 2 (Chỉ thanh toán khi đã khám xong)
    BE->>DB: Tạo bản ghi GiaoDich (Trạng thái: 0 - Chờ)
    BE->>BE: Tính toán chữ ký bảo mật (Checksum) & Số tiền (tự tính Phí khám/Thuốc/Gộp)
    BE-->>BN: Trả về Payment URL (sandbox.vnpayment.vn/...)

    Note over BN, VN: Bước 4: Người dùng Thanh toán
    BN->>VN: Chuyển hướng trình duyệt sang VNPay
    BN->>VN: Nhập thẻ Test (NCB) & Xác thực OTP
    VN->>VN: Xử lý giao dịch nội bộ

    Note over VN, BE: Bước 5: Cập nhật trạng thái (IPN)
    VN->>BE: VNPay gọi ngầm API IPN (Server-to-Server)
    BE->>BE: Kiểm tra chữ ký & Kiểm tra số tiền
    BE->>DB: Cập nhật GiaoDich (Thành công), DatLich (trangThaiThanhToan) & hinhThucThanhToanId (VNPAY)
    BE-->>VN: Phản hồi "Confirm Success" (RspCode 00)

    Note over VN, BN: Bước 6: Trả kết quả (Return URL & Verify chủ động)
    VN->>BN: Redirect trình duyệt về website (/payment/result)
    BN->>BE: Gửi request verify để đồng bộ dữ liệu ngay lập tức
    BN->>BN: PaymentResultPage đọc URL để hiển thị HÓA ĐƠN & MỞ KHÓA ĐƠN THUỐC
```

---

## 2. Giải thích chi tiết các thành phần

### A. MedicalResultPage.jsx (Cửa ngõ ra)
*   **Vị trí**: `client/src/pages/patient/MedicalResultPage.jsx`
*   **Nhiệm vụ**: Sau khi bác sĩ đã khám xong (`trangThai === 2`), bệnh nhân sẽ truy cập trang Kết quả khám. Nếu chưa thanh toán hoặc chưa thanh toán hết (phí khám hoặc đơn thuốc), file này sẽ hiển thị các nút thanh toán tương ứng (VNPay). Khi bấm nút, nó gọi API nạp tiền `/api/vnpay/create-payment` và dùng `window.location.href` để chuyển sang VNPay.

### B. vnpay.service.js (Bộ não xử lý)
*   **Vị trí**: `server/src/services/vnpay.service.js`
*   **Nhiệm vụ**: 
    - Lấy thông tin giá từ bảng `DatLich`.
    - Làm sạch nội dung (`sanitizeOrderInfo`) để tránh lỗi ký tự đặc biệt.
    - Tạo `vnp_TxnRef` (Mã tham chiều) duy nhất để VNPay gửi lại cho mình.
    - Xử lý xác thực IPN (bước quan trọng nhất để nạp tiền vào DB).

### C. PaymentResultPage.jsx (Cửa ngõ vào)
*   **Vị trí**: `client/src/pages/patient/PaymentResultPage.jsx`
*   **Nhiệm vụ**: Đón người dùng quay lại. Nó lấy `vnp_ResponseCode` từ URL:
    - Nếu là `00`: Hiện banner xanh (Thành công).
    - Nếu khác `00`: Hiện banner đỏ (Thất bại).

### D. Model GiaoDich (Lưu trữ lịch sử)
*   **Vị trí**: `server/prisma/schema.prisma` -> `model GiaoDich`
*   **Nhiệm vụ**: Lưu lại mọi nỗ lực thanh toán của người dùng, bao gồm mã tham chiếu VNP, số tiền, loại giao dịch (Phí khám/Thuốc) và trạng thái cuối cùng giúp đối soát dữ liệu dễ dàng.

---

## 3. Các tham số cần ghi nhớ (Dành cho Báo cáo)

| Tham số | Ý nghĩa | Ghi chú |
|:--- |:--- |:--- |
| **vnp_Amount** | Số tiền | Gửi đi là VND, VNPay tự nạp thêm 00 ở cuối (cents). |
| **vnp_TxnRef** | Mã tham chiếu | Phải là duy nhất cho mỗi lần nhấn nút thanh toán. |
| **vnp_ResponseCode** | Mã kết quả | `00` là con số "vàng" (Thành công). |
| **vnp_SecureHash** | Chữ ký bảo mật | Giúp VNPay và Web của bạn hiểu nhau mà không bị hacker can thiệp. |

---

> [!TIP]
> **Điểm mấu chốt**: Hệ thống cập nhật tiền vào Database thông qua bước **IPN** (VNPay gọi trực tiếp cho Server của mình), chứ không phải dựa vào trang Kết quả mà người dùng thấy. Điều này giúp ngăn chặn việc người dùng "giả mạo" link thành công để hack tiền.

---
*Tài liệu được tạo tự động bởi Antigravity trợ lý AI.*
