# Sơ Đồ & Luồng Dữ Liệu API Chi Tiết (API Data Flow)

Tài liệu này mô tả cách thức dữ liệu luân chuyển trong hệ thống, từ các thao tác của người dùng đến các tầng xử lý khác nhau của ứng dụng.

---

## 1. Kiến Trúc 6 Tầng (6-Layer Architecture)

Ứng dụng được thiết kế theo mô hình phân lớp để đảm bảo tính module hóa:

1.  **UI Component Layer (React):** Nhận input từ người dùng và hiển thị output.
2.  **Validation Layer (Zod):** Kiểm tra tính hợp lệ của dữ liệu đầu vào ngay tại Client.
3.  **Hook Layer (TanStack Query):** Quản lý vòng đời của Request (loading, success, error, caching).
4.  **Zustand Layer (Global State):** Quản lý thông tin phiên làm việc (Session/Auth).
5.  **Service Layer (Axios Wrapper):** Định nghĩa các API endpoints và kiểu dữ liệu gửi đi.
6.  **Infrastructure Layer (Axios Interceptors):** Xử lý Token, Cookies và các lỗi HTTP toàn cục.

---

## 2. Luồng Xử Lý Truy Văn (Query/Read Flow)

Được áp dụng khi người dùng xem danh sách bác sĩ, lịch hẹn, hồ sơ cá nhân...

1.  **Component** gọi một Custom Hook (ví dụ: `useDoctors()`).
2.  **TanStack Query** kiểm tra trong **Cache**. 
    *   Nếu dữ liệu còn mới (`fresh`): Trả về kết quả ngay lập tức cho UI.
    *   Nếu dữ liệu đã cũ hoặc chưa có: Thực hiện bước tiếp theo.
3.  **Service** thực hiện gọi hàm API thông qua Axios.
4.  **Axios Interceptor** đính kèm Auth Cookie.
5.  **Backend** xử lý và trả về JSON.
6.  **TanStack Query** lưu kết quả vào Cache và cập nhật trạng thái `data`, `isLoading = false`.
7.  **Component** tự động render lại với dữ liệu mới.

---

## 3. Luồng Xử Lý Biểu Mẫu (Mutation/Write Flow)

Được áp dụng khi người dùng Đặt lịch, Sửa thông tin bác sĩ, Đổi mật khẩu...

1.  **Người dùng** nhập liệu và nhấn "Lưu/Gửi".
2.  **React Hook Form** thu thập dữ liệu và chuyển qua **Zod Schema**.
3.  **Validation Layer** kiểm tra:
    *   Nếu dữ liệu sai: Hiển thị lỗi ngay lập tức dưới các ô nhập liệu (Inline Errors).
    *   Nếu dữ liệu đúng: Gọi hàm `mutate()`.
4.  **Hook Layer** kích hoạt trạng thái `isPending = true` (hiển thị loading spinner trên nút bấm).
5.  **Service** gửi dữ liệu đã được validate lên Backend.
6.  **Backend** phản hồi kết quả thành công.
7.  **Hook Layer** thực hiện `invalidateQueries`: Đánh dấu các bảng dữ liệu cũ là không còn hiệu lực.
    *   *Ví dụ: Thêm bác sĩ mới xong sẽ tự động làm mới danh sách bác sĩ ở trang Dashboard.*
8.  **Hệ thống** hiển thị thông báo thành công (Toast notification) và điều hướng trang nếu cần.

---

## 4. Ưu Điểm Của Luồng Dữ Liệu Này

*   **Tính Tin Cậy:** Dữ liệu luôn được validate 2 lớp (Client & Server).
*   **Hiệu Năng:** Giảm thiểu số lần Fetch dữ liệu nhờ bộ nhớ đệm thông minh.
*   **Trải Nghiệm Người Dùng:** Giao diện phản ứng tức thì, các trạng thái Loading/Error được quản lý chuyên nghiệp.
*   **Dễ Bảo Trì:** Khi cần thay đổi logic kiểm tra (ví dụ: thay đổi độ dài mật khẩu), chỉ cần sửa tại 1 file duy nhất trong `validations/`.
