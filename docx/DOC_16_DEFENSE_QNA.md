# 🛡️ KỊCH BẢN TRẢ LỜI PHẢN BIỆN HỘI ĐỒNG (DEFENSE Q&A)

> **Tài liệu chiến lược (Tuyệt mật)**
> Tài liệu này tổng hợp các câu hỏi "bắt bẻ" hóc búa nhất từ Hội đồng bảo vệ đồ án liên quan đến quy trình nghiệp vụ (Business Flow) và thiết kế hệ thống. Dưới đây là cách trả lời "vừa cứng vừa khéo" để lấy điểm tuyệt đối.

---

## 💡 TÌNH HUỐNG 1: Tại sao lại thanh toán trên Website thay vì tại quầy? 

**🗣️ Câu hỏi của Thầy/Cô:** 
> *"Ở các bệnh viện thực tế, khám xong là bệnh nhân ra quầy thu ngân xếp hàng thanh toán luôn. Em thiết kế để bệnh nhân về nhà thanh toán trên Website thì làm sao em đảm bảo họ sẽ trả tiền? Khám xong họ trốn về luôn thì phòng khám của em sập tiệm à?"*

**✅ Cách trả lời:**

"Dạ thưa thầy/cô, hệ thống HealthCare của em không hề bắt bệnh nhân phải về nhà mới thanh toán, mà được thiết kế theo mô hình **Hybrid (Kết hợp O2O - Online to Offline)** để giải quyết bài toán ùn tắc tại bệnh viện:

1. **Hỗ trợ luồng Truyền Thống (Tiền mặt / Tại quầy):** 
   Đối với người lớn tuổi hoặc không thạo công nghệ, khám xong họ vẫn ra quầy thu ngân. Thu ngân thu tiền và ấn nút *"Xác nhận thanh toán"* trên hệ thống. 
2. **Hỗ trợ luồng Hiện Đại (Self-Checkout / VNPay):** 
   Đối với bệnh nhân trẻ, thay vì phải chờ đợi xếp hàng rồng rắn ở quầy thu ngân, họ vừa bước ra khỏi phòng khám có thể ra sảnh ngồi ghế, mở điện thoại và tự quét VNPay trên Website. Thanh toán xong, họ đi thẳng ra quầy thuốc để lĩnh thuốc. (Mô hình này đang được các chuỗi lớn như Vinmec, Tâm Anh áp dụng).

**Về rủi ro bệnh nhân trốn thanh toán**, hệ thống của em sở hữu một **Cơ chế Khóa Đơn Thuốc (Payment Gate)** cực kỳ chặt chẽ:
* Nếu bệnh nhân chưa thanh toán, hệ thống sẽ **khóa và che mờ hoàn toàn** chi tiết các loại thuốc, liều lượng uống. 
* Nếu họ trốn về, họ cũng không có toa thuốc để tự ra hiệu thuốc bên ngoài mua. Chỉ khi nào hệ thống ghi nhận Đã Thanh Toán (qua VNPay hoặc Admin) thì Toa thuốc mới được tự động mở khóa."

---

## 💡 TÌNH HUỐNG 2: Gửi Email có làm "Lộ" thông tin bệnh không?

**🗣️ Câu hỏi của Thầy/Cô:** 
> *"Em vừa bảo là em khóa Toa thuốc lại, thế mà khám xong em lại gửi Email báo luôn Chẩn đoán cho bệnh nhân. Họ đọc mail biết họ bị viêm họng, họ ra thẳng hiệu thuốc ngoài ngã tư bảo 'Bán cho tôi liều viêm họng' thì phòng khám của em mất khách à?"*

**✅ Cách trả lời:**

"Dạ thưa thầy/cô, điểm mấu chốt ở đây là sự khác biệt giữa **Chẩn Đoán (Diagnosis)** và **Chi Tiết Đơn Thuốc (Prescription Details)** ạ. Em không khóa Chẩn Đoán, em chỉ khóa Chi Tiết Đơn Thuốc.

1. **Về phần Chẩn đoán (Tên bệnh):** 
   Thực tế khi ngồi trong phòng khám, bác sĩ đã trao đổi trực tiếp và nói cho bệnh nhân biết họ mắc bệnh gì rồi. Do đó, việc hiển thị dòng chữ *"Chẩn đoán: Viêm họng cấp"* trong Email là hoàn toàn bình thường, giúp bệnh nhân an tâm và nắm được tình trạng sức khỏe.
2. **Về Chi tiết đơn thuốc (Bị khóa chặt):** 
   Bệnh nhân biết mình bị "Viêm họng cấp", nhưng họ **không thể biết** bác sĩ kê kháng sinh loại gì, hàm lượng bao nhiêu miligram, liều uống mấy viên/ngày. Chất xám, trình độ của bác sĩ và nguồn thu chính của phòng khám nằm ở cái **Toa thuốc** này.

Nếu bệnh nhân cầm Email có mỗi chữ *"Viêm họng"* ra hiệu thuốc, hiệu thuốc có thể tự bán nốt. Nhưng với các bệnh lý chuyên khoa sâu (Dạ dày, tim mạch, thần kinh, da liễu...), không một hiệu thuốc nào dám bán **thuốc kê đơn (RX)** nếu không có toa chuẩn của bác sĩ. Vì hệ thống của em đã giấu kín danh sách tên thuốc trong Email, bệnh nhân bắt buộc phải nhấp vào link trong Email, truy cập Website và Thanh toán cho phòng khám thì mới nhận được Toa thuốc chi tiết ạ."

---

## 💡 TÌNH HUỐNG 3: Tại sao lại cần gửi Email nhắc nhở?

**🗣️ Câu hỏi của Thầy/Cô:** 
> *"Bệnh nhân đã đến khám tận nơi, có app/web rồi, tại sao lại phải rườm rà gửi thêm Email cho họ sau khi khám làm gì?"*

**✅ Cách trả lời:**

"Dạ thưa thầy/cô, tính năng Email sinh ra với mục đích **Chăm Sóc Khách Hàng (Customer Care)** và nâng cao trải nghiệm y tế:

1. **Sổ Y Bạ Điện Tử:** Bệnh nhân đi khám thường rất bối rối và có thể quên lời bác sĩ dặn. Email này đóng vai trò như một bản lưu trữ kết quả khám bệnh trực tiếp vào hộp thư cá nhân của họ.
2. **Hỗ trợ Tư vấn từ xa (Telemedicine):** Nếu bệnh nhân sử dụng dịch vụ khám online, bác sĩ sẽ chẩn đoán qua mạng và kê đơn trên hệ thống. Email sẽ tự động bay về máy bệnh nhân, họ thanh toán VNPay ngay trong Email/Web, sau đó phòng khám sẽ đóng gói ship thuốc về tận nhà.
3. **Thúc đẩy thanh toán:** Trong Email luôn đính kèm một nút Call-to-Action rõ ràng: *"Tổng tiền: 450,000 VNĐ. Nhấn vào đây để thanh toán và xem chi tiết đơn thuốc"*, giúp tăng tỉ lệ chuyển đổi và nhắc nhở bệnh nhân hoàn tất thủ tục nhẹ nhàng, lịch sự."

---

*(Tài liệu này sẽ liên tục được cập nhật thêm các câu hỏi hóc búa khác nếu có phát sinh trong quá trình ôn tập).*
