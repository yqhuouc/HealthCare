# Giải Thích Lựa Chọn Công Nghệ & Kiến Trúc (Tech Stack Explanation)

Tài liệu này giải thích lý do tại sao hệ thống sử dụng các thư viện và mô hình kiến trúc hiện tại. Mục tiêu là tối ưu hiệu năng, tăng khả năng bảo trì và đảm bảo trải nghiệm người dùng (UX) tốt nhất cho Đồ án Tốt nghiệp.

---

## 1. TanStack Query (React Query)
**Thay thế cho:** `useEffect` + `useState` + `Axios` thủ công.

### Lý do lựa chọn:
*   **Quản lý trạng thái Server (Server State Management):** Khác với trạng thái UI (như đóng/mở modal), dữ liệu từ API có thể thay đổi bất cứ lúc nào. TanStack Query giúp quản lý việc "khi nào cần tải lại dữ liệu" một cách tự động.
*   **Caching (Bộ nhớ đệm):** Dữ liệu được lưu lại trong bộ nhớ. Khi người dùng quay lại một trang đã xem, dữ liệu hiển thị ngay lập tức (Instant) trong khi hệ thống âm thầm cập nhật bản mới nhất ở chế độ nền (Background fetching).
*   **Tự động hoá trạng thái:** Cung cấp sẵn các biến `isLoading`, `isError`, `isPending`, giúp code Frontend sạch hơn, không còn phải viết hàng chục dòng `if (loading) ...` thủ công.
*   **Invalidation:** Khi thêm mới bác sĩ hoặc xóa lịch hẹn, hệ thống tự động biết để "làm mới" (refetch) danh sách liên quan mà không cần reload trang.

---

## 2. React Hook Form
**Thay thế cho:** Quản lý `useState` cho từng ô nhập liệu (Controlled Components).

### Lý do lựa chọn:
*   **Hiệu năng (Performance):** Hạn chế tối đa việc Component bị render lại (re-render) mỗi khi người dùng gõ một phím. Nó chỉ thực hiện cập nhật khi thực sự cần thiết.
*   **Cấu trúc code:** Giảm bớt số lượng biến state và hàm `onChange` rườm rà. Chỉ cần sử dụng `{...register("name")}` là đủ.
*   **Tích hợp dễ dàng:** Làm việc cực kỳ hiệu quả với các thư viện Validation như Zod.

---

## 3. Zod (Schema Validation)
**Thay thế cho:** Các hàm `if/else` kiểm tra dữ liệu hoặc dùng HTML Validation cơ bản.

### Lý do lựa chọn:
*   **Tập trung hoá (Centralized):** Toàn bộ quy tắc (Ví dụ: "Mật khẩu phải > 6 ký tự", "Số điện thoại phải đúng định dạng VN") được viết một lần tại thư mục `validations/` và dùng chung cho cả trang Thêm và trang Sửa.
*   **Mạnh mẽ:** Hỗ trợ kiểm tra các logic phức tạp (Ví dụ: `confirmPassword` phải giống `password`) một cách dễ dàng thông qua hàm `.refine()`.
*   **Đồng bộ dữ liệu:** Đảm bảo dữ liệu gửi lên Server luôn sạch và đúng định dạng, giảm thiểu lỗi logic từ phía Backend.

---

## 4. Day.js & dateUtils
**Thay thế cho:** Đối tượng `Date` mặc định của Javascript hoặc `Moment.js`.

### Lý do lựa chọn:
*   **Siêu nhẹ:** Day.js chỉ nặng khoảng 2KB (so với hàng trăm KB của Moment.js), giúp trang web tải nhanh hơn.
*   **Bất biến (Immutable):** Thao tác với ngày tháng không làm thay đổi đối tượng gốc, tránh các bug "nhảy ngày" khó chịu trong Javascript.
*   **Xử lý múi giờ (Timezone):** Thông qua plugin `utc` và `timezone`, hệ thống đảm bảo thời gian khám bệnh luôn hiển thị đúng múi giờ `Asia/Ho_Chi_Minh` bất kể máy tính người dùng cài đặt giờ gì.
*   **Kiến trúc dateUtils:** Tách biệt logic xử lý thời gian ra khỏi logic format chuỗi giúp tuân thủ nguyên lý **Single Responsibility (SRP)** – mỗi file chỉ làm một việc tốt nhất.

---

## 5. Kiến trúc Wrapper - Child Component (Edit Pages)
**Thay thế cho:** Việc gọi API và gán `setValue` ngay trong một `useEffect`.

### Lý do lựa chọn:
*   **Tránh "Cascading Renders":** Ngăn chặn tình trạng Component bị render lặp đi lặp lại do việc đồng bộ dữ liệu API vào Form State.
*   **Dễ Debug:** Tách bạch rõ ràng: Component cha lo việc "Lấy dữ liệu", Component con lo việc "Hiển thị và Validate Form". Nếu form lỗi, ta biết ngay là do logic validate chứ không phải do lỗi truyền dữ liệu từ API.
