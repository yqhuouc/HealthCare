# 🗺️ SƠ ĐỒ ĐIỀU HƯỚNG TRANG - PHÂN HỆ BỆNH NHÂN (DOC_17)
> **HealthCare Project — Sơ đồ Cấu trúc & Điều hướng phân hệ Bệnh nhân**
>
> Tài liệu này mô tả sơ đồ điều hướng (Sitemap) chi tiết của phân hệ Bệnh nhân dựa trên các click chuột thực tế từ Trang chủ đi sâu vào các trang tiếp theo.

---

## 🧭 Sơ Đồ Cây Điều Hướng (Navigation Tree Map)

Sơ đồ thể hiện luồng đi và hành động click chuột thực tế của người dùng:
* **Đặt lịch khám** xong sẽ chuyển hướng bệnh nhân về trang **Lịch sử khám bệnh** để theo dõi trạng thái Chờ xác nhận (không có bước thanh toán tại đây).
* **Thanh toán trực tuyến (VNPay)** chỉ diễn ra sau khi khám xong, bệnh nhân vào xem trang **Kết quả & Đơn thuốc** mới thực hiện thanh toán hóa đơn để mở khóa xem chi tiết đơn thuốc.

```mermaid
graph TD
    TrangChu["Trang chủ (/)"] --> DangNhap["Đăng nhập (/login)"]
    TrangChu --> DangKy["Đăng ký (/register)"]
    TrangChu --> DSChuyenKhoa["Danh sách Chuyên khoa (/specialties)"]
    TrangChu --> DSBacSi["Danh sách Bác sĩ (/doctors)"]
    TrangChu --> HoiDapFAQ["Hỏi đáp FAQ (/faq)"]
    TrangChu --> HoSoCaNhan["Hồ sơ cá nhân (/profile)"]
    TrangChu --> LichSuKham["Lịch sử khám bệnh (/appointments)"]

    %% Nhánh Đăng nhập
    DangNhap --> QuenMatKhau["Quên mật khẩu (/forgot-password)"]
    QuenMatKhau --> ResetMatKhau["Đặt lại mật khẩu (/reset-password)"]

    %% Nhánh Chuyên khoa
    DSChuyenKhoa --> ChiTietChuyenKhoa["Chi tiết Chuyên khoa (/specialties/:id)"]
    ChiTietChuyenKhoa --> ChiTietBacSi["Chi tiết Bác sĩ (/doctors/:id)"]

    %% Nhánh Bác sĩ
    DSBacSi --> ChiTietBacSi
    ChiTietBacSi --> DatLichKham["Đặt lịch khám (/booking/:doctorId)"]
    DatLichKham --> |Đặt lịch thành công| LichSuKham

    %% Nhánh Lịch sử khám bệnh
    LichSuKham --> KetQuaKham["Kết quả & Đơn thuốc (/medical-results/:id)"]
    KetQuaKham --> |Thanh toán đơn thuốc qua VNPay| KetQuaThanhToan["Kết quả thanh toán (/payment/result)"]

    %% Định dạng style màu sắc trực tiếp (Style inline)
    style TrangChu fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d;
    style DangNhap fill:#fef08a,stroke:#ca8a04,stroke-width:1px,color:#713f12;
    style DangKy fill:#fef08a,stroke:#ca8a04,stroke-width:1px,color:#713f12;
    style DSChuyenKhoa fill:#fef08a,stroke:#ca8a04,stroke-width:1px,color:#713f12;
    style DSBacSi fill:#fef08a,stroke:#ca8a04,stroke-width:1px,color:#713f12;
    style HoiDapFAQ fill:#fef08a,stroke:#ca8a04,stroke-width:1px,color:#713f12;
    style HoSoCaNhan fill:#fef08a,stroke:#ca8a04,stroke-width:1px,color:#713f12;
    style LichSuKham fill:#fef08a,stroke:#ca8a04,stroke-width:1px,color:#713f12;
    style QuenMatKhau fill:#fecdd3,stroke:#e11d48,stroke-width:1px,color:#881337;
    style ChiTietChuyenKhoa fill:#fecdd3,stroke:#e11d48,stroke-width:1px,color:#881337;
    style ResetMatKhau fill:#fecdd3,stroke:#e11d48,stroke-width:1px,color:#881337;
    style ChiTietBacSi fill:#ffedd5,stroke:#ea580c,stroke-width:1px,color:#7c2d12;
    style KetQuaKham fill:#ffedd5,stroke:#ea580c,stroke-width:1px,color:#7c2d12;
    style DatLichKham fill:#f1f5f9,stroke:#475569,stroke-width:1px,color:#0f172a;
    style KetQuaThanhToan fill:#f1f5f9,stroke:#475569,stroke-width:1px,color:#0f172a;
```

---

## 🎨 CHÚ THÍCH PHÂN CẤP MÀU SẮC (LEGEND)

Trong báo cáo, màu sắc của các ô thể hiện **Cấu trúc Kiến trúc Thông tin (Information Architecture)** của website theo mức độ quan trọng và độ sâu của đường dẫn URL:

| Màu Sắc | Phân Cấp Trang | Ý Nghĩa / Cách Người Dùng Tiếp Cận | Ví Dụ |
| :--- | :--- | :--- | :--- |
| 🟩 **Xanh Lá** | **Root (Cấp 0)** | Trang chủ gốc, điểm truy cập đầu tiên của hệ thống. | Trang chủ (`/`) |
| 🟨 **Vàng** | **Trang Cấp 1** | Các trang chính nằm ngay trên Menu Điều hướng (Header Navigation), click được trực tiếp từ Trang chủ. | Đăng nhập, Chuyên khoa, Bác sĩ, Hồ sơ... |
| 🟥 **Hồng** | **Trang Cấp 2** | Các trang phụ hoặc trang danh sách con phát sinh sau Trang cấp 1. | Quên mật khẩu, Chi tiết Chuyên khoa... |
| 🟧 **Cam** | **Trang Cấp 3** | Các trang xem chi tiết thực thể hoặc dữ liệu chuyên sâu. | Chi tiết Bác sĩ, Kết quả khám & Đơn thuốc... |
| ⬜ **Xám** | **Trang Cấp 4 (Action)** | Trang thực hiện hành động/điền form cuối cùng để hoàn tất quy trình nghiệp vụ. | Đặt lịch khám, Kết quả thanh toán VNPay |
