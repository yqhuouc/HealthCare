# PHỤ LỤC 01: LỘ TRÌNH THỰC HIỆN ĐỒ ÁN (10 TUẦN)

> Tài liệu này theo dõi tiến độ công việc và các sản phẩm đầu ra theo từng giai đoạn của đồ án tốt nghiệp.

---

| Tuần | Thủ tục hành chính | Nội dung công việc | Sản phẩm đầu ra | Minh chứng (Link/File) |
|---|---|---|---|---|
| **Tuần 1** | Báo cáo đề cương trước hội đồng, nhận góp ý và hoàn thiện đề cương | - Nghiên cứu tài liệu và khảo sát quy trình đặt lịch trực tuyến qua các nền tảng y tế.<br>- Xác định đối tượng sử dụng.<br>- Xác định chức năng hệ thống.<br>- Viết đặc tả bài toán chi tiết.<br>- Sử dụng NotebookLM để phân tích, tổng hợp tài liệu chuyên ngành. | Bản đặc tả bài toán chi tiết (có trích dẫn nguồn tham khảo). | [PHU_LUC_02_DAC_TA.md](./PHU_LUC_02_DAC_TA_BAI_TOAN.md) |
| **Tuần 2** | | - Vẽ Use Case tổng quan.<br>- Vẽ Use Case chi tiết từng chức năng.<br>- Xác định Actor.<br>- Vẽ sơ đồ hoạt động (Activity Diagram).<br>- Viết mô tả giải thích sơ đồ. | Bộ sơ đồ Use Case + Activity + Tài liệu mô tả. | [DOC_01_SYSTEM_ANALYSIS.md](../DOC_01_SYSTEM_ANALYSIS.md) |
| **Tuần 3** | | - Thiết kế CSDL theo 4 bước: Phân tích -> ERD -> Logic -> Physical.<br>- Vẽ sơ đồ tuần tự (Sequence Diagram).<br>- Thiết kế sơ đồ phân trang ≥ 10 trang.<br>- Vẽ User Flows cho các luồng chính. | ERD + Database design, Sequence Diagram, Sơ đồ phân trang. | [DOC_02_DB_DESIGN.md](../DOC_02_DATABASE_DESIGN.md)<br>[PHU_LUC_03_DESIGN.md](./PHU_LUC_03_THIET_KE_GIAO_DIEN_USER_FLOW.md) |
| **Tuần 4** | | - Cài đặt PostgreSQL cục bộ và pgAdmin4.<br>- Tạo database + bảng.<br>- Kết nối Node.js.<br>- Xây API: đăng ký, đăng nhập (JWT).<br>- Test Postman.<br>- Sử dụng ChatGPT/Gemini sinh dữ liệu mẫu. | Database hoạt động, API Auth chạy ổn định. | [SERVER_OVERVIEW.md](../../server/doc/BACKEND_OVERVIEW.md)<br>[PHU_LUC_04_TESTING.md](./PHU_LUC_04_MINH_CHUNG_KIEM_THU.md) |
| **Tuần 5** | Nộp báo cáo tiến độ 5 tuần đầu cho GVHD | - Xây dựng ≥15 end-points.<br>- Xây dựng ≥10 end-points xử lý nghiệp vụ.<br>- Xử lý logic trùng lịch.<br>- Test toàn bộ bằng Postman.<br>- Viết báo cáo tiến độ. | 15+ end-points hoạt động, Báo cáo tiến độ. | [SERVER_OVERVIEW.md](../../server/doc/BACKEND_OVERVIEW.md) |
| **Tuần 6** | Nghiệm thu tiến độ trước Hội đồng bộ môn | - Sử dụng công cụ Stich tạo thiết kế tương tác (tạo ít nhất 2 templates).<br>- Viết tài liệu giải thích lý do lựa chọn thiết kế.<br>- Chuyển đổi template thành mã Front-end ReactJS. | Bản thiết kế templates (Stich), Tài liệu giải thích, Mã nguồn React. | [FRONTEND_OVERVIEW.md](../../client/doc/FRONTEND_OVERVIEW.md)<br>[PHU_LUC_03_DESIGN.md](./PHU_LUC_03_THIET_KE_GIAO_DIEN_USER_FLOW.md) |
| **Tuần 7** | | - Tích hợp API cho bệnh nhân (Hiển thị bác sĩ, Chọn lịch, Gửi request đặt lịch). | Luồng đặt lịch hoạt động. | [DOC_08_FUNCTION_FLOW.md](../DOC_08_FUNCTION_FLOW.md) |
| **Tuần 8** | Đóng học phí ĐATN đầy đủ | - Tích hợp Admin/Bác sĩ.<br>- Duyệt lịch - Hoàn thiện hệ thống. | Hệ thống hoàn chỉnh, Hồ sơ đầy đủ. | [Toàn bộ Source Code](../../) |
| **Tuần 9** | Nộp Đơn xin bảo vệ và Giấy thanh toán về Bộ môn | - Test lại toàn bộ API bằng Postman.<br>- Kiểm tra thủ công (Manual Test) theo kịch bản.<br>- Fix lỗi logic và tối ưu hóa UI. | Demo chạy ổn định, Luồng chức năng đúng. | [PHU_LUC_04_TESTING.md](./PHU_LUC_04_MINH_CHUNG_KIEM_THU.md) |
| **Tuần 10** | Nộp báo cáo hoàn chỉnh cho GV Phản biện | - Viết báo cáo.<br>- Thêm bảng khai báo AI.<br>- In quyển, làm slide, duyệt GVHD. | Báo cáo hoàn chỉnh, Slide, Sẵn sàng bảo vệ. | [PHU_LUC_05_KHAI_BAO_AI.md](./PHU_LUC_05_KHAI_BAO_AI.md) |

---
*Tài liệu được cập nhật tự động để phản ánh đúng thực tế quá trình phát triển.*
