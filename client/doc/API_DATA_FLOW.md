# Hướng Dẫn Chi Tiết Luồng Chạy API Ở Phía Client (Frontend)

Tài liệu này giải thích chi tiết cách thức hoạt động của luồng dữ liệu (Data Flow) khi khởi động trang web và khi tạo một request tới Backend (ví dụ: Fetch danh sách, Thêm sửa xóa), từ lúc người dùng thao tác trên UI cho đến khi dữ liệu trả về và cập nhật vào State.

---

## 1. Các Tầng (Layers) Kiến Trúc Trong Client

Kiến trúc client của dự án được chia thành 5 tầng rõ rệt:

1. **Pages/Components (UI Layer):** Nơi chứa giao diện người dùng, nhận tương tác (click, submit form) và hiển thị dữ liệu. Khởi nguồn gốc rễ là Component `App.jsx`.
2. **Hooks (TanStack Query):** Quản lý Server State. Cung cấp các Custom Hooks (`useQuery`, `useMutation`) giúp tự động hoá việc gọi API, lưu cache, quản lý trạng thái `loading/error/success` và tự động cập nhật lại giao diện ngay khi data thay đổi.
3. **Stores (Zustand):** Quản lý Client State (trạng thái UI, biến nhớ toàn cục) như thông tin session Auth (User đã đăng nhập chưa). *Lưu ý: Không dùng State này để lưu trữ dữ liệu tải từ server về (nhạc, lịch hẹn, bệnh nhân...) vì đã có TanStack Query lo việc đó.*
4. **Services:** Lớp trung gian đóng gói dữ liệu trước khi gửi đi, chuyển đổi payload từ Component thành format mà Backend chỉ định, đồng thời là nơi trực tiếp gọi các lệnh Axios.
5. **API (Axios Interceptors):** Cấu hình lõi của thư viện HTTP (Axios), tự động đính kèm cookie hiện rải, xử lý lỗi chung toàn cục (ví dụ: Refresh token tự động khi mã bị lỗi 401).

---

## 2. Luồng Khởi Động Web: Phục Hồi Phiên Đăng Nhập (Auth Flow - Zustand)

Xảy ra **Tự Động MỘT LẦN DUY NHẤT** khi bạn vừa gõ URL vào trang web, hoặc bấm F5 tải lại trang. Các data Client-side (như thông tin cá nhân local) vẫn được duy trì bằng Zustand.

### Bước 1: Khởi động tại Core (`client/src/App.jsx`)
`App.jsx` dùng `useEffect` để ngay lập tức gọi lệnh kiểm tra User ngay khi web vừa tải lên.
```javascript
// file: client/src/App.jsx
import useAuthStore from "./stores/useAuthStore";

function App() {
  const { fetchUser } = useAuthStore();
  
  useEffect(() => {
    fetchUser(); // Bước khởi nguồn chạy ngầm âm thầm lấy Auth
  }, [fetchUser]);
  // ...
```

### Bước 2: Kích hoạt Store (`client/src/stores/useAuthStore.js`)
Store tiến hành gọi Tầng Service để xin dữ liệu cá nhân (`getMe`).
```javascript
// file: client/src/stores/useAuthStore.js
fetchUser: async () => {
  try {
    const res = await authService.getMe(); 
    // Nếu có data trả về (Cookie hợp lệ) -> Đưa user vào State
    set({ user: res.data, isAuthenticated: true, isLoading: false });
  } catch {
    set({ user: null, isAuthenticated: false, isLoading: false });
  }
}
```

### Bước 3: Đóng gói API
`authService.js` chứa endpoint `api.get("/auth/me")`. `api.js` tự động "kẹp" theo Cookie vô hình mà Trình duyệt đang cất giữ vào trong Header nhờ config `withCredentials: true`. Server Nodejs kiểm tra Cookie, nếu chuẩn thì nhả data User về. State Zustand lưu lại và bạn truy cập web mượt mà.

---

## 3. Luồng Data Server: Lấy & Cập Nhật Dữ Liệu (TanStack Query Flow)

Thay vì lưu dữ liệu vào mảng `useState` và gọi API bằng `useEffect` thủ công, tất cả dữ liệu hệ thống (server state) đều dùng Hook sinh ra từ TanStack Query để quản lý. Ví dụ ở quá trình Bác sĩ cập nhật trạng thái lịch hẹn.

### Bước 1: Giao Diện UI (`DoctorDashboardPage.jsx`)
Giao diện không cần tự khai báo biến `loading` hay khối `try/catch`. Component này gọi thẳng hook mutation sinh ra từ layer queries.

```javascript
import { useUpdateAppointmentStatus } from "../../hooks/queries/useAppointmentQueries";

function DoctorDashboardPage() {
  // [1] Khởi tạo mutation instance
  const statusMutation = useUpdateAppointmentStatus(); 

  const handleConfirm = (id) => {
    // [2] Bấm nút xác nhận, gọi hàm mutate() hoặc mutateAsync()
    statusMutation.mutate({ id, trangThai: 1 }, {
      onSuccess: () => toast.success("Xác nhận thành công!"),
      onError: () => toast.error("Có lỗi xảy ra")
    });
  };
}
```

### Bước 2: Tầng Custom Query Hook (`hooks/queries/useAppointmentQueries.js`)
Đây là nơi cấu hình API chạy và chỉ định xem: sau khi Cập nhật hoàn thành thì bảng danh sách nào (`queryKey`) cần được tải lại tự động để làm mới màn hình.

```javascript
export const useUpdateAppointmentStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    // [3] Giao thông tin xuống service
    mutationFn: ({ id, trangThai }) => appointmentService.updateTrangThai(id, trangThai),
    
    // [4] Server trả Ok -> Xóa cache cũ -> TanStack tự động Background Refetch Data
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentKeys.all }); 
    },
  });
};
```

### Bước 3: Tầng Service & Axios API
Service map `id` và `trangThai` thành Payload JSON, quăng cho Axios gửi HTTP request lên Backend (NodeJS). Kết quả HTTP Response đi vòng trở lại Hook. Hook cập nhật Cache Data, sau đó React sẽ re-render UI lên phiên bản mới nhất ngay lập tức.

---

## 4. Tóm Tắt Quy Trình Khái Quát

Dù là luồng tải danh sách hay thay đổi trạng thái, dữ liệu luôn luân chuyển 1 chiều đi xuống và nảy phản ứng lên giao diện:

### 🔹 Luồng Lấy Data Mới (Query Read)
User Mở Trang Web ➔ `Component.jsx` gọi `useQuery(key)` ➔ Kiểm tra Cache ➔ Nếu trống, xuống `Service` ➔ `Axios` ➔ Node.js ➔ `TanStack Cache Lưu lại` ➔ UI Hiển Thị (loading → success).

### 🔹 Luồng Thay Đổi Data (Mutation Write)
User Submit Nút Sửa/Xóa ➔ `useMutation.mutate()` ➔ `Service` ➔ `Axios API` ➔ Backend Node.js ➔ Response Success ➔ `onSuccess()` kích hoạt `invalidateQueries` ➔ `useQuery()` ngầm tự động gọi lại ➔ UI được làm mới bằng dữ liệu từ Server.

### Hướng Dẫn Nhanh Khi Code Tính Năng Mới:
1. Soạn thảo kết nối các Router backend mới vào trong các file ở `services/`.
2. Bọc hàm service đó vào thành một Custom Hook trong  `hooks/queries/`. (Dùng `useQuery` để *Đọc dữ liệu*, `useMutation` để *Sửa đổi dữ liệu*).
3. Import Custom Hook đó vào Component UI bằng destructuring (VD: `const { data, isLoading } = useUser(...)`) để hứng kết quả luôn. Tiết kiệm 99% lỗi ngớ ngẩn do bất đồng bộ!
