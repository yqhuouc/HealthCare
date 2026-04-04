# Hướng Dẫn Chi Tiết Luồng Chạy API Ở Phía Client (Frontend)

Tài liệu này giải thích chi tiết cách thức hoạt động của luồng dữ liệu (Data Flow) khi khởi động trang web và khi tạo một request tới Backend (ví dụ: Đăng nhập, Đăng ký), từ lúc người dùng thao tác trên UI cho đến khi dữ liệu trả về và cập nhật vào State.

---

## 1. Các Tầng (Layers) Kiến Trúc Trong Client

Kiến trúc client của dự án được chia thành 4 tầng rõ rệt:

1. **Pages/Components:** Nơi chứa giao diện người dùng (UI), nhận tương tác (click, submit form) và hiển thị dữ liệu. Khởi nguồn gốc rễ là Component `App.jsx`.
2. **Stores (Zustand):** Quản lý trạng thái toàn cục (Global State) như thông tin user đã đăng nhập, giỏ hàng, v.v. (Lưu ý: Không lưu Token ở đây, chỉ lưu thông tin User).
3. **Services:** Chứa các hàm để làm bước đệm, đóng gói (format) dữ liệu trước khi gửi đi hoặc xử lý dữ liệu trước khi trả về.
4. **API (Axios Interceptor):** Cấu hình gốc của thư viện gọi HTTP (Axios), tự động đính kèm cookie, xử lý lỗi chung (Refresh token tự động).

---

## 2. Luồng Khởi Động Web: Phục Hồi Phiên Đăng Nhập (Session Restoration)

Xảy ra **Tự Động MỘT LẦN DUY NHẤT** khi bạn vừa gõ URL vào trang web, hoặc bấm F5 tải lại trang. Chức năng này giúp hệ thống biết bạn là ai nếu bạn đã từng đăng nhập trước đó vài ngày (Cookie vẫn còn hạn).

### Bước 1: Khởi động tại Core (`client/src/App.jsx`)
- `App.jsx` là Component gốc, chạy đầu tiên của toàn bộ trang web.
- Nó sử dụng hàm `useEffect` để ngay lập tức gọi lệnh kiểm tra User ngay khi web vừa tải lên.

```javascript
// file: client/src/App.jsx
import useAuthStore from "./stores/useAuthStore";

function App() {
  const { fetchUser, isLoading } = useAuthStore();

  // Khôi phục session khi app khởi động
  useEffect(() => {
    fetchUser(); // Bước khởi nguồn chạy ngầm âm thầm
  }, [fetchUser]);
  // ...
```

### Bước 2: Kích hoạt Store (`client/src/stores/useAuthStore.js`)
- Store tiến hành gọi Tầng Service để xin dữ liệu cá nhân (`getMe`).

```javascript
// file: client/src/stores/useAuthStore.js
fetchUser: async () => {
  try {
    const res = await authService.getMe(); // Gọi qua Service
    const userData = res.data;
    
    // Nếu có data trả về (Token hợp lệ) -> Đưa user vào State
    set({ user: userData, isAuthenticated: true, isLoading: false });
  } catch {
    // Nếu token hết hạn hoặc chưa đăng nhập bao giờ -> Set null
    set({ user: null, isAuthenticated: false, isLoading: false });
  }
}
```

### Bước 3: Đóng gói và Gửi lên Backend 
- `authService.js` chứa endpoint `api.get("/auth/me")`.
- `api.js` tự động "kẹp" theo Cookie vô hình mà Trình duyệt đang cất giữ (nếu có) vào trong Header nhờ config `withCredentials: true`.
- Gửi lên Server Nodejs, Server kiểm tra Cookie. Nếu chuẩn, Server nhả data User về. State lưu lại và bạn truy cập web mượt mà không cần nhập mật khẩu.

---

## 3. Luồng Chủ Động Tạo Request: Điển hình Đăng Nhập (Login Flow)

Khi phiên bản "Người lạ" nhấn chuột vào nút **"Đăng nhập"**, luồng xử lý sẽ đi xuống theo tuần tự:

### Bước 1: Giao Diện UI (`client/src/pages/patient/LoginPage.jsx`)
- Sử dụng thư viện `react-hook-form` để validate định dạng nhập liệu.
- Kích hoạt sự kiện submit. Nhận uỷ quyền hàm `login` từ Zustand.

```javascript
// file: client/src/pages/patient/LoginPage.jsx
const login = useAuthStore((state) => state.login);

const onSubmit = async (data) => {
  setLoading(true);
  try {
    // [1] - Chuyển giao thông tin đi sâu xuống
    const user = await login({ email: data.email, password: data.password });
    
    // Đợi [2], [3], [4] xử lý xong mới chạy đoạn dưới
    toast.success("Đăng nhập thành công!");
    if (user.vaiTro === "admin") navigate("/admin"); // Chuyển trang
    else navigate("/");
  } catch (err) {
    // ...
  }
};
```

### Bước 2: State Manager (`client/src/stores/useAuthStore.js`)
```javascript
// file: client/src/stores/useAuthStore.js
login: async (credentials) => {
  // [2] - Chuyển giao xuống Service
  const res = await authService.login(credentials);
  
  // Format Data thành State
  const user = { ...res.data.user, fullName: res.data.user.hoTen };
  set({ user, isAuthenticated: true }); // Báo hiệu đã đăng nhập thành công
  return user;
}
```

### Bước 3: Services (`client/src/services/authService.js`)
- Dịch (mapping) cái Object `{password}` trên form ban nãy từ UI thành `{matKhau}` để nhét vừa khít thiết kế API của backend yêu cầu.

```javascript
// file: client/src/services/authService.js
login: (credentials) =>
  // [3] - Giao phó cho Axios kết thúc
  api.post("/auth/login", {
    email: credentials.email,
    matKhau: credentials.password // Mapping
  }),
```

### Bước 4: Core API chặn đầu - Trả Result (`client/src/services/api.js`)
- Gửi Data lên Backend thông qua `/api/auth/login`.
- **Nếu đúng mật khẩu:** Backend gửi Data Object Info (HoTen, role, email...) kèm 1 Lệnh tự động lưu `HttpOnly Cookie`. 
- `api.js` nhận cục Object này. Lột vỏ axios ra và trả về theo luồng đảo ngược: `Bước 3` -> `Bước 2 (set User lên State)` -> về tới lưới UI `Bước 1 (kích hoạt báo Toast thành công)`.

---

## Tóm Tắt Quy Trình Khái Quát

Dù là luồng tải trang (GetMe) hay luồng chủ động (Login, Đặt lịch), dữ liệu luôn luân chuyển 1 chiều sâu xuống và nảy ngược lên:

`Sự Kiện Web / User Click` ➔ **UI / Khởi Động Page (.jsx)** ➔ **Store (.js)** ➔ **Service (.js)** ➔ **Axios API (.js)** ➔ `Backend Server`

Và khi muốn tạo 1 tính năng mới gọi tới API, bạn hãy làm theo các bước:
1. Tạo config kết nối backend trong thư mục `services`.
2. Truyền Data từ trang View (`pages`, `components`) vào Service. (Có thể kẹp qua trung gian `Store` nếu thấy cả web cần dùng data đó).
3. Hứng dữ liệu đợi `await` -> `toast` báo thành công và cập nhật.
