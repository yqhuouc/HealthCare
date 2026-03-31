# Hướng Dẫn Kiểm Thử Tích Hợp Frontend - Backend (Từng Phase)

Tài liệu này hướng dẫn bạn cách kiểm tra (test) ứng dụng sau khi hoàn thành việc tích hợp API cho mỗi Phase, đảm bảo Frontend hoạt động trơn tru với dữ liệu thật từ Backend thay vì sử dụng mock data.

---

## 🟢 Phase 1: Nền Tảng Xác Thực (Auth) - Đã Hoàn Thành

**Mục tiêu:** Đảm bảo luồng đăng nhập, đăng ký, đăng xuất và khôi phục phiên bản đăng nhập (session) hoạt động đúng với cơ chế Dual Token (HttpOnly Cookie).

### Các bước test:
1. **Kiểm tra luồng Đăng nhập (Login)**
   * Mở web, vào trang `/login`.
   * Nhập email và mật khẩu của `admin@clinic.vn` (mật khẩu: `admin123`) hoặc tài khoản bệnh nhân/bác sĩ mẫu.
   * **Kỳ vọng:** Đăng nhập thành công, chuyển hướng đúng trang (bệnh nhân về trang chủ, bác sĩ về dashboard bác sĩ, admin về dashboard admin). Header cập nhật hiển thị tên người dùng.
2. **Kiểm tra lưu trữ Cookie (Quan trọng)**
   * Mở F12 (Developer Tools) -> tab **Application** (hoặc **Storage**) -> mục **Cookies**.
   * **Kỳ vọng:** Nhìn thấy 2 cookie là `accessToken` và `refreshToken` đều có cờ `HttpOnly = true`.
3. **Kiểm tra Session Restore (F5 tải lại trang)**
   * Đang ở trạng thái đăng nhập, nhấn **F5** (Refresh) tải lại trang.
   * **Kỳ vọng:** Ứng dụng không bị văng ra trang đăng nhập. Header vẫn hiển thị tên người dùng (do `fetchUser()` tự động chạy lấy thông tin).
4. **Kiểm tra luồng Đăng xuất (Logout)**
   * Nhấn nút Đăng xuất trên Header.
   * **Kỳ vọng:** Chuyển về trang chủ (hoặc login), Header trở lại trạng thái "Đăng nhập/Đăng ký". Kiểm tra lại tab **Cookies** trong F12 thấy cookie `accessToken` và `refreshToken` đã bị xóa.
5. **Kiểm tra tính năng Cập nhật hồ sơ / Đổi mật khẩu**
   * Đăng nhập với tài khoản Bệnh nhân, vào trang "Hồ sơ cá nhân".
   * Thử cập nhật tên, số điện thoại, ngày sinh và nhấn lưu. Đổi mật khẩu thành công.
   * **Kỳ vọng:** Thông báo thành công, dữ liệu trên Header (tên) tự động cập nhật nếu có thay đổi.

---

## 🟡 Phase 2: Trang Công Khai (Không cần đăng nhập)

**Mục tiêu:** Chuyên khoa, Bác sĩ, và FAQ hiển thị chuẩn dữ liệu từ Backend.

### Các bước test:
1. **Trang Chủ (Home)**
   * Kéo xuống phần Chuyên Khoa nổi bật và Bác sĩ nổi bật.
   * **Kỳ vọng:** Danh sách được đổ từ API, không còn các bác sĩ tên "Mock". Hình ảnh, tên, chuyên khoa hiển thị chính xác.
2. **Trang Danh Sách Chuyên Khoa (`/specialties`)**
   * **Kỳ vọng:** Hiển thị đủ 8 chuyên khoa mẫu (từ database đã seed). Số lượng bác sĩ ở mỗi chuyên khoa thống kê chính xác.
3. **Trang Chi Tiết Chuyên Khoa (`/specialties/:id`)**
   * Bấm vào 1 chuyên khoa bất kỳ.
   * **Kỳ vọng:** Hiện đúng thông tin mô tả chuyên khoa và danh sách toàn bộ bác sĩ TỘC chuyên khoa đó.
4. **Trang Danh Sách Bác Sĩ (`/doctors`)**
   * **Kỳ vọng:** Dữ liệu fetch từ `/api/bac-si`. Thử thanh tìm kiếm (nhập tên bác sĩ) và bộ lọc chuyên khoa. Tính năng phân trang hoạt động tốt.
5. **Trang Chi Tiết Bác Sĩ (`/doctors/:id`)**
   * Bấm vào 1 bác sĩ bất kỳ.
   * **Kỳ vọng:** Thông tin giá khám, học vị, chuyên khoa, mô tả chi tiết được đổ từ database. (Lưu ý: Các field như rating/đánh giá sẽ bị ẩn vì API chưa hỗ trợ).
6. **Trang FAQ (`/faq`)**
   * **Kỳ vọng:** Các câu hỏi hiển thị từ API `/api/cau-hoi-thuong-gap`. Bấm vào có thể xem câu trả lời.

---

## 🟠 Phase 3: Luồng Bệnh Nhân (Cần đăng nhập)

**Mục tiêu:** Bệnh nhân xem và đặt lịch khám thành công.

### Các bước test:
1. **Luồng Đặt Lịch Khám**
   * Đăng nhập bằng tài khoản **Bệnh nhân**.
   * Vào trang `/doctors/:id` của bác sĩ bất kỳ, bấm "Đặt lịch hẹn".
   * **Kỳ vọng:**
     * API tải danh sách khung giờ trống của bác sĩ trong ngày được chọn.
     * API tải các "Hình thức thanh toán" (Tiền mặt, Chuyển khoản, VNPAY...).
   * Tiến hành đặt lịch.
   * **Kỳ vọng:** Báo "Đặt lịch thành công" và có thể chuyển hướng sang trang "Lịch sử đặt khám".
2. **Trang Lịch Sử Đặt Khám (`/appointments`)**
   * **Kỳ vọng:** Hiển thị danh sách các lịch đã đặt, sắp xếp từ mới nhất. Các trạng thái (Chờ xác nhận, Đã xác nhận, Hoàn thành, Đã hủy) có màu sắc tương ứng.
3. **Hủy Lịch Khám**
   * Tìm một lịch ở trạng thái "Chờ xác nhận", bấm "Hủy lịch".
   * **Kỳ vọng:** Trạng thái chuyển sang "Đã hủy" ngay lập tức (UI được cập nhật ngay).
4. **Xem Chi Tiết Lịch / Đơn Thuốc**
   * Với lịch đã "Hoàn thành", xem thông tin chi tiết. Nếu có đơn thuốc, bấm xem Đơn Thuốc.
   * **Kỳ vọng:** Lấy được data đơn thuốc từ API `/api/don-thuoc/:id`.

---

## 🔵 Phase 4: Portal Bác Sĩ (`/doctor`)

**Mục tiêu:** Bác sĩ quản lý lịch làm việc, tiếp nhận bệnh nhân.

### Các bước test:
1. **Đăng nhập & Dashboard**
   * Đăng nhập bằng tài khoản Bác sĩ (`bacsi1@clinic.vn` / `doctor123`).
   * **Kỳ vọng:** Chuyển thẳng vào `/doctor`. Dashboard thống kê đúng (ví dụ: Số bệnh nhân hôm nay).
2. **Quản Lý Lịch Làm Việc (`/doctor/schedule`)**
   * Xem lịch của tuần này. Thêm ca làm việc mới (ví dụ: Đăng ký sáng thứ 6).
   * **Kỳ vọng:** Khi thêm ca, API `/api/lich-lam-viec` được gọi. Số lượng bệnh nhân tối đa/khung giờ hoạt động.
3. **Quản Lý Lịch Hẹn (`/doctor/appointments`)**
   * Kiểm tra xem có thấy lịch bệnh nhân vừa đặt ở Phase 3 không.
   * Thay đổi trạng thái: "Chờ xác nhận" -> "Đã xác nhận".
   * **Kỳ vọng:** Trạng thái cập nhật thành công (Toast xanh).
4. **Khám Bệnh & Kê Đơn (`/doctor/appointments/:id`)**
   * Khám xong, chuyển trạng thái thành "Đã hoàn thành".
   * Mở form **Tạo Đơn Thuốc**, nhập chẩn đoán và thuốc.
   * **Kỳ vọng:** Lưu đơn thuốc thành công và được gắn với lịch hẹn tương ứng.

---

## 🟣 Phase 5: Portal Admin (`/admin`)

**Mục tiêu:** Quản trị toàn bộ ứng dụng.

### Các bước test:
1. **Đăng nhập & Dashboard**
   * Đăng nhập Admin (`admin@clinic.vn` / `admin123`).
   * **Kỳ vọng:** Vào thẳng `/admin`. Biểu đồ doanh thu, thống kê có dữ liệu.
2. **Quản Lý Đối Tượng**
   * **Bác sĩ (`/admin/doctors`):** Thêm 1 bác sĩ mới (tự tạo cả account), sửa, xóa.
   * **Chuyên khoa (`/admin/specialties`):** Thêm 1 chuyên khoa mới (upload ảnh nếu cần thay bằng paste link URL avatar tạm), sửa, xóa.
   * **Bệnh nhân (`/admin/patients`):** Xem danh sách phân trang.
3. **Quản Lý Nghiệp Vụ**
   * **Lịch hẹn (`/admin/appointments`):** Xem tất cả lịch của toàn hệ thống, có quyền Admin là hủy lịch bất kì.
   * **FAQ (`/admin/faqs`):** Thêm / ẩn / xóa danh sách FAQ hiển thị ngoài trang chủ.

---

## 🛠 Cách Debug khi gặp lỗi API
Nếu chức năng vỡ hoặc "Quay tít", mở **F12 -> tab Network**.
1. Nhấp vào API bị báo đỏ (Status: 400, 401, 403, 500...).
2. Bấm vào tab **Preview** hoặc **Response** xem dòng `message` do server báo ngược lại (Ví dụ: *"Dữ liệu không hợp lệ"*, *"Bạn không có quyền truy cập"*).
3. Đảm bảo 2 terminal (Client + Server) không in ra lỗi Syntax, Crash nào.
