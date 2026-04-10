# Giải Thích Chuyên Sâu Lựa Chọn Công Nghệ (Technical Rationale)

Tài liệu này cung cấp các luận cứ khoa học và kỹ thuật cho việc lựa chọn các thư viện cốt lõi trong dự án, phục vụ cho mục đích bảo vệ đồ án và giải trình hội đồng.

---

## 1. TanStack Query (Quản lý trạng thái Máy chủ)
**Vấn đề:** Native `useEffect` không có khả năng caching, dễ gây ra tình trạng "Over-fetching" (tải dữ liệu thừa) và "Prop Drilling" để truyền trạng thái loading.

**Giải pháp & Ưu điểm:**
*   **Chiến lược Caching:** Sử dụng cơ chế `stale-while-revalidate`. Dữ liệu cũ được hiển thị ngay lập tức để người dùng không phải chờ đợi, trong khi dữ liệu mới được tải ngầm.
*   **Phân tách State:** Tách biệt rõ ràng giữa **Server State** (Dữ liệu từ API) và **Client State** (Dữ liệu UI như đóng/mở menu).
*   **Tự động Invalidation:** Khi thực hiện các hành động thay đổi dữ liệu (Mutation), hệ thống tự động đánh dấu các truy vấn liên quan là "cũ" để cập nhật lại, đảm bảo tính toàn vẹn dữ liệu trên giao diện.

---

## 2. Zod & React Hook Form (Quản lý Biểu mẫu & Xác thực)
**Vấn đề:** Các biểu mẫu (Forms) truyền thống gây ra độ trễ (latency) khi render do quản lý từng ô nhập liệu bằng `useState`. Validation thủ công bằng `if/else` rườm rà và khó bảo trì.

**Giải pháp & Ưu điểm:**
*   **Uncontrolled Components:** React Hook Form giảm thiểu số lần render lại linh kiện, giúp ứng dụng mượt mà ngay cả với các form hàng chục trường dữ liệu.
*   **Schema-based Validation:** Sử dụng Zod để định nghĩa các tập quy tắc (Schemas) tập trung. Điều này giúp tách biệt logic nghiệp vụ (business rules) ra khỏi logic giao diện (UI logic).
*   **Tính tái sử dụng:** Một Schema có thể dùng chung cho cả màn hình "Thêm mới" và "Chỉnh sửa", đảm bảo tính nhất quán (Consistency).

---

## 3. Day.js & Timezone Architecture (Xử lý Thời gian)
**Vấn đề:** Đối tượng `Date` của Javascript có API nghèo nàn và dễ gây nhầm lẫn về múi giờ khi triển khai trên các hạ tầng đám mây (Cloud) dùng giờ UTC.

**Giải pháp & Ưu điểm:**
*   **Lightweight:** Day.js chỉ nặng ~2KB, tối ưu hóa kích thước bundle của ứng dụng.
*   **Immutable:** Các đối tượng thời gian là bất biến, loại bỏ các lỗi logic phát sinh khi biến đổi ngày tháng.
*   **Timezone Consistency:** Sử dụng kiến trúc `dateUtils` tập trung để ép toàn bộ hệ thống (cả Client và Server) hoạt động trên múi giờ `Asia/Ho_Chi_Minh`, giải quyết triệt để bài toán đặt lịch khám bệnh chính xác theo giờ Việt Nam.

---

## 4. Kiến Trúc Phân Tầng (Multi-layered Architecture)
Dự án áp dụng mô hình phân tầng rõ rệt:
1.  **UI Layer:** Chỉ lo việc hiển thị.
2.  **Validation Layer:** Chỉ lo việc kiểm tra tính đúng đắn của dữ liệu.
3.  **Hook Layer:** Chỉ lo việc giao tiếp và quản lý vòng đời dữ liệu từ Server.
4.  **Service Layer:** Chỉ lo việc định dạng và gửi request.

**Kết luận:** Việc kết hợp bộ ba **TanStack Query + React Hook Form + Zod** đang là tiêu chuẩn công nghiệp (Industry Standard) hiện nay, giúp xây dựng các ứng dụng web quy mô lớn, bền vững và dễ mở rộng.
