# PHỤ LỤC 02: ĐẶC TẢ BÀI TOÁN CHI TIẾT

> Giai đoạn thực hiện: Tuần 1
> Nội dung: Nghiên cứu, khảo sát và xây dựng đặc tả yêu cầu hệ thống.

---

## 1. Bối cảnh và Khảo sát
Trong bối cảnh chuyển đổi số y tế, việc đặt lịch khám trực tuyến giúp tối ưu hóa quy trình làm việc của phòng khám và giảm thời gian chờ đợi của bệnh nhân. Chúng tôi đã khảo sát các nền tảng y tế lớn (như DoctorAnywhere, Medpro) để rút ra quy trình chuẩn:
1. Tìm kiếm chuyên khoa/bác sĩ.
2. Kiểm tra lịch trống thực tế.
3. Xác nhận đặt lịch và thanh toán.
4. Quản lý kết quả sau khám.

## 2. Đối tượng sử dụng (Actors)
Hệ thống xác định 3 nhóm đối tượng chính:
- **Bệnh nhân**: Có nhu cầu tìm kiếm thông tin bác sĩ và đặt lịch hẹn từ xa.
- **Bác sĩ**: Chuyên gia cung cấp dịch vụ khám, cần quản lý lịch làm việc và thông tin bệnh nhân.
- **Quản trị viên (Admin)**: Người điều hành hệ thống, quản lý danh mục và theo dõi số liệu doanh thu.

## 3. Chức năng hệ thống (System Functions)
Hệ thống được thiết kế với các nhóm chức năng cốt lõi:
- **Hệ thống lõi (Core)**: Quản lý tài khoản, phân quyền (Auth & RBAC).
- **Nghiệp vụ Bệnh nhân**: Tìm kiếm bác sĩ, Đặt lịch hẹn, Thanh toán VNPay, Xem đơn thuốc.
- **Nghiệp vụ Bác sĩ**: Quản lý ca làm việc (Shift), Xử lý lịch hẹn, Kê đơn thuốc điện tử.
- **Quản trị (Admin)**: CRUD danh mục (Chuyên khoa, Bác sĩ, Bệnh nhân, FAQ), Thống kê doanh thu 12 tháng.

## 4. Công cụ hỗ trợ phân tích (AI Integration)
Chúng tôi sử dụng **NotebookLM** để:
- Phân tích và tóm tắt các tài liệu chuyên ngành về quản lý y tế.
- Tổng hợp các yêu cầu chức năng từ các báo cáo khảo sát thực tế.
- Hỗ trợ viết các kịch bản Use Case logic và chặt chẽ.

## 5. Trích dẫn nguồn tham khảo
1. Quy định về quản lý hồ sơ bệnh án điện tử - Bộ Y tế.
2. Quy trình đặt lịch khám bệnh trực tuyến - Bệnh viện Đại học Y Dược TP.HCM.
3. Tài liệu kiến trúc RESTful API - RESTful Web Services (O'Reilly).

---
*Hoàn thành: Tuần 1 - Đã được phê duyệt bởi GVHD.*
