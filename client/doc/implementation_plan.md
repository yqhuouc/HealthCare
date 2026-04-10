# 🔥 Nâng cấp Frontend lên chuẩn Production

## Kiểm tra Combo "Chuẩn Production"

| # | Thư viện | Vai trò | package.json | Dùng thực tế | Đánh giá |
|---|----------|---------|:------------:|:------------:|:--------:|
| 1 | **Zustand** | State management | ✅ `^5.0.11` | ✅ `useAuthStore` | ✅ OK |
| 2 | **React Query** | Server-state / API | ✅ `^5.90.21` | ❌ **0/40 pages dùng** | 🔴 CẦN SỬA |
| 3 | **Axios** | HTTP client | ✅ `^1.13.6` | ✅ `services/api.js` + interceptors | ✅ OK |
| 4 | **React Router** | Routing | ✅ `^7.13.1` | ✅ `router/index.js` + layouts | ✅ OK |
| 5 | **Tailwind CSS** | UI styling | ✅ `^4.2.1` | ✅ Toàn bộ app | ✅ OK |
| 6 | **React Hook Form** | Form management | ✅ `^7.71.2` | ⚠️ Chỉ **3/8 form pages** dùng | 🟡 CẦN MỞ RỘNG |
| 7 | **Zod** | Form validation schema | ❌ **Chưa cài** | ❌ Không có | 🔴 CẦN THÊM |
| 8 | **Day.js** | Date/time handling | ❌ **Chưa cài** | ❌ Dùng `new Date()` thủ công | 🔴 CẦN THÊM |

---

## Chi tiết vấn đề từng thư viện

### 🔴 React Query — Cài rồi nhưng chưa dùng

**Hiện trạng**: `QueryClientProvider` đã wrap `<App/>` trong `main.jsx`, nhưng **tất cả 40 pages** đều dùng pattern thủ công:

```jsx
// ❌ Lặp lại ~40 lần trong dự án
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
useEffect(() => {
  const fetch = async () => {
    setLoading(true);
    try { const res = await service.getAll(); setData(res.data); }
    catch { toast.error("Lỗi"); }
    finally { setLoading(false); }
  };
  fetch();
}, [deps]);
```

**Hệ quả**: Không cache, không auto-refetch, không đồng bộ data giữa pages, boilerplate lặp lại.

---

### 🟡 React Hook Form — Chỉ 3/8 form pages dùng

**Đã dùng** (3 files):
- `LoginPage.jsx` — `useForm()` + inline validation rules
- `RegisterPage.jsx` — `useForm()` + inline validation rules  
- `DoctorLoginPage.jsx` — `useForm()` + inline validation rules

**Chưa dùng** (8 files — vẫn dùng `useState` + `handleChange` thủ công):
- `AdminAddDoctorPage.jsx`
- `AdminEditDoctorPage.jsx`
- `AdminAddSpecialtyPage.jsx`
- `AdminEditSpecialtyPage.jsx`
- `AdminAddFAQPage.jsx`
- `AdminEditFAQPage.jsx`
- `AdminEditPatientPage.jsx`
- `PatientProfilePage.jsx`

---

### 🔴 Zod — Chưa cài

Hiện 3 form page dùng `react-hook-form` đều validate bằng inline rules:
```jsx
// ❌ Validation inline, không tái sử dụng
{...register("email", {
  required: "Vui lòng nhập email",
  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email không hợp lệ" },
})}
```

Cần Zod schema + `@hookform/resolvers` để tách validation ra riêng, dễ test + tái sử dụng.

---

### 🔴 Day.js — Chưa cài

**Hiện trạng**: ~50 chỗ trong code dùng `new Date()` thủ công với cú pháp dài dòng:
```jsx
// ❌ Lặp lại đủ kiểu pattern
new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" })
new Date(a.ngayDat).toLocaleDateString("vi-VN")
new Date().toISOString().split("T")[0]
new Date(year, month + 1, 0).getDate()
```

Các file dùng `new Date()` nhiều nhất:
- `DoctorSchedulePage.jsx` — **12 chỗ** (calendar logic)
- `DoctorAddShiftPage.jsx` — **10 chỗ** (calendar logic)
- `AdminDoctorSchedulesPage.jsx` — **6 chỗ**
- `AdminStatsPage.jsx` — **5 chỗ**
- `BookingPage.jsx` — **4 chỗ**
- `formatters.js` — **2 chỗ** (utility functions)

---

### ✅ Các thư mục rỗng cần dọn

| Thư mục | Status | Hành động |
|---------|--------|-----------|
| `hooks/` | Rỗng | Sẽ tận dụng cho React Query hooks |
| `context/` | Rỗng | **Xóa** — không cần (Zustand + React Query thay thế) |

---

## Proposed Changes — 5 Phases

### Phase 1: Cài đặt thư viện thiếu
> Cài `zod`, `@hookform/resolvers`, `dayjs` vào project

#### [MODIFY] `package.json`
```bash
npm install zod @hookform/resolvers dayjs
```

---

### Phase 2: Tạo Custom React Query Hooks (`hooks/queries/`)

Tầng hook trung gian giữa `services/` → `pages/`. Mỗi entity có 1 file.

#### [NEW] `hooks/queries/useDoctorQueries.js`

```js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorService } from '../../services/doctorService';

export const doctorKeys = {
  all: ['doctors'],
  lists: () => [...doctorKeys.all, 'list'],
  list: (filters) => [...doctorKeys.lists(), filters],
  details: () => [...doctorKeys.all, 'detail'],
  detail: (id) => [...doctorKeys.details(), id],
};

export const useDoctors = (filters = {}) =>
  useQuery({
    queryKey: doctorKeys.list(filters),
    queryFn: () => doctorService.getAll(filters),
  });

export const useDoctor = (id) =>
  useQuery({
    queryKey: doctorKeys.detail(id),
    queryFn: () => doctorService.getById(id),
    enabled: !!id,
  });

export const useCreateDoctor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => doctorService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: doctorKeys.lists() }),
  });
};

export const useUpdateDoctor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => doctorService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: doctorKeys.lists() });
      qc.invalidateQueries({ queryKey: doctorKeys.detail(id) });
    },
  });
};

export const useDeleteDoctor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => doctorService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: doctorKeys.lists() }),
  });
};
```

Tương tự cho các entity khác:

| File | Hooks |
|------|-------|
| [NEW] `useSpecialtyQueries.js` | `useSpecialties`, `useSpecialty(id)`, `useCreateSpecialty`, `useUpdateSpecialty`, `useDeleteSpecialty`, `useUploadSpecialtyImage` |
| [NEW] `useAppointmentQueries.js` | `useAppointments(filters)`, `useAppointmentsByDoctor(bacSiId)`, `useAppointmentsByPatient(benhNhanId)`, `useAppointment(id)`, `useSlotTrong(bacSiId, ngay)`, `useCreateAppointment`, `useUpdateStatus`, `useUpdatePayment`, `useDeleteAppointment` |
| [NEW] `usePatientQueries.js` | `usePatients(filters)`, `usePatient(id)`, `useUpdatePatient`, `useDeletePatient` |
| [NEW] `useFAQQueries.js` | `useFAQs`, `useFAQsAdmin(filters)`, `useFAQ(id)`, `useCreateFAQ`, `useUpdateFAQ`, `useDeleteFAQ` |
| [NEW] `useScheduleQueries.js` | `useLichLamViec(params)`, `useKhungGio`, `useCreateLichLamViec`, `useUpdateLichLamViec`, `useDeleteLichLamViec`, `useCreateKhungGio`, `useDeleteKhungGio` |
| [NEW] `useStatsQueries.js` | `useTongQuan`, `useLichHenStats(query)`, `useDoanhThuStats(query)` |
| [NEW] `usePaymentQueries.js` | `usePaymentMethods`, `useCreatePaymentMethod`, `useDeletePaymentMethod` |
| [NEW] `usePrescriptionQueries.js` | `usePrescription(id)`, `useCreatePrescription`, `useUpdatePrescription` |

---

### Phase 3: Tích hợp Day.js

#### [MODIFY] `utils/formatters.js`

Thay thế toàn bộ `new Date()` bằng `dayjs`:

```js
// TRƯỚC:
export function formatTime(timeInput) {
  const d = new Date(timeInput);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", ... });
}

// SAU:
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

export function formatTime(timeInput) {
  if (!timeInput) return "";
  if (typeof timeInput === "string" && !timeInput.includes("T") && timeInput.includes(":")) {
    return timeInput.substring(0, 5);
  }
  return dayjs(timeInput).tz("Asia/Ho_Chi_Minh").format("HH:mm");
}

export function formatDate(dateInput) {
  if (!dateInput) return "";
  return dayjs(dateInput).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY");
}

// Hàm mới tiện lợi
export function toDateString(date) {
  return dayjs(date).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD");
}
```

#### [MODIFY] Các pages dùng `new Date()` nhiều

Thay `new Date()` inline bằng `dayjs()`:

| File | Số chỗ thay | Ví dụ |
|------|:-----------:|-------|
| `DoctorSchedulePage.jsx` | ~12 | `dayjs().daysInMonth()`, `dayjs().startOf('month').day()` |
| `DoctorAddShiftPage.jsx` | ~10 | Tương tự calendar logic |
| `AdminDoctorSchedulesPage.jsx` | ~6 | `dayjs(date).format("YYYY-MM-DD")` |
| `AdminStatsPage.jsx` | ~5 | `dayjs().year()`, `dayjs().subtract(7, 'day')` |
| `AdminDashboardPage.jsx` | ~4 | `dayjs().format("YYYY-MM-DD")` |
| `BookingPage.jsx` | ~4 | `dayjs().add(i, 'day')` |
| + các pages khác | ~10 | `dayjs(date).format("DD/MM/YYYY")` thay `new Date().toLocaleDateString("vi-VN")` |

---

### Phase 4: Mở rộng React Hook Form + Zod

#### [NEW] `validations/` — Zod schemas tập trung

```
validations/
├── doctorSchema.js      # Schema form thêm/sửa bác sĩ
├── specialtySchema.js   # Schema form thêm/sửa chuyên khoa
├── faqSchema.js         # Schema form thêm/sửa FAQ
├── patientSchema.js     # Schema form sửa bệnh nhân
├── authSchema.js        # Schema login/register (refactor từ inline rules)
└── index.js            # Re-export
```

**Ví dụ `doctorSchema.js`:**
```js
import { z } from 'zod';

export const addDoctorSchema = z.object({
  tenBacSi: z.string().min(1, "Vui lòng nhập họ tên bác sĩ"),
  email: z.string().email("Email không hợp lệ"),
  matKhau: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  chuyenKhoaId: z.string().min(1, "Vui lòng chọn chuyên khoa"),
  hocViChucDanh: z.string().optional(),
  giaKham: z.coerce.number().nonnegative().optional(),
  moTaNgan: z.string().optional(),
  moTaChiTiet: z.string().optional(),
});
```

#### [MODIFY] 8 form pages — chuyển từ `useState` sang `useForm + zodResolver`

**TRƯỚC (AdminAddDoctorPage):**
```jsx
const [form, setForm] = useState({ tenBacSi: "", email: "", ... });
const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

// Validation thủ công
if (!form.tenBacSi.trim() || !form.chuyenKhoaId) {
  toast.warn("Vui lòng nhập đầy đủ...");
  return;
}
```

**SAU:**
```jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDoctorSchema } from '../../validations/doctorSchema';

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(addDoctorSchema),
});

// Validation tự động, error messages hiển thị inline
```

Danh sách 8 form pages cần chuyển:

| File | Schema |
|------|--------|
| `AdminAddDoctorPage.jsx` | `addDoctorSchema` |
| `AdminEditDoctorPage.jsx` | `editDoctorSchema` |
| `AdminAddSpecialtyPage.jsx` | `specialtySchema` |
| `AdminEditSpecialtyPage.jsx` | `specialtySchema` |
| `AdminAddFAQPage.jsx` | `faqSchema` |
| `AdminEditFAQPage.jsx` | `faqSchema` |
| `AdminEditPatientPage.jsx` | `patientSchema` |
| `PatientProfilePage.jsx` | `profileSchema` |

#### [MODIFY] 3 form pages đã dùng `useForm` — thêm Zod resolver

| File | Thay đổi |
|------|----------|
| `LoginPage.jsx` | Inline rules → `zodResolver(loginSchema)` |
| `RegisterPage.jsx` | Inline rules → `zodResolver(registerSchema)` |
| `DoctorLoginPage.jsx` | Inline rules → `zodResolver(loginSchema)` |

---

### Phase 5: Refactor Pages — Thay useEffect+useState bằng React Query hooks

#### Admin Pages (19 files)

| File | Hooks thay thế |
|------|----------------|
| `AdminDashboardPage.jsx` | `useTongQuan()`, `useAppointments()` |
| `AdminDoctorsPage.jsx` | `useDoctors(filters)`, `useSpecialties()`, `useTongQuan()`, `useUpdateDoctor()`, `useDeleteDoctor()` |
| `AdminAddDoctorPage.jsx` | `useSpecialties()`, `useCreateDoctor()` |
| `AdminEditDoctorPage.jsx` | `useDoctor(id)`, `useSpecialties()`, `useUpdateDoctor()` |
| `AdminPatientsPage.jsx` | `usePatients(filters)`, `useDeletePatient()` |
| `AdminPatientDetailPage.jsx` | `usePatient(id)`, `useAppointmentsByPatient()` |
| `AdminEditPatientPage.jsx` | `usePatient(id)`, `useUpdatePatient()` |
| `AdminSpecialtiesPage.jsx` | `useSpecialties()`, `useDeleteSpecialty()` |
| `AdminAddSpecialtyPage.jsx` | `useCreateSpecialty()`, `useUploadSpecialtyImage()` |
| `AdminEditSpecialtyPage.jsx` | `useSpecialty(id)`, `useUpdateSpecialty()`, `useUploadSpecialtyImage()` |
| `AdminAppointmentsPage.jsx` | `useAppointments(filters)`, `useUpdateStatus()`, `useUpdatePayment()` |
| `AdminAppointmentDetailPage.jsx` | `useAppointment(id)` + mutation hooks |
| `AdminFAQsPage.jsx` | `useFAQsAdmin()`, `useDeleteFAQ()` |
| `AdminAddFAQPage.jsx` | `useCreateFAQ()` |
| `AdminEditFAQPage.jsx` | `useFAQ(id)`, `useUpdateFAQ()` |
| `AdminStatsPage.jsx` | `useTongQuan()`, `useLichHenStats()`, `useDoanhThuStats()` |
| `AdminDoctorSchedulesPage.jsx` | `useLichLamViec()`, `useDoctors()`, `useSpecialties()` + mutation hooks |
| `AdminTimeSlotsPage.jsx` | `useKhungGio()`, `useCreateKhungGio()`, `useDeleteKhungGio()` |
| `AdminPaymentMethodsPage.jsx` | `usePaymentMethods()`, `useCreatePaymentMethod()`, `useDeletePaymentMethod()` |

#### Doctor Pages (8 files)

| File | Hooks thay thế |
|------|----------------|
| `DoctorDashboardPage.jsx` | `useAppointmentsByDoctor(bacSiId)`, `useUpdateStatus()` |
| `DoctorAppointmentsPage.jsx` | `useAppointmentsByDoctor(bacSiId)`, `useUpdateStatus()` |
| `DoctorAppointmentDetailPage.jsx` | `useAppointment(id)`, `useCreatePrescription()`, `useUpdatePrescription()` |
| `DoctorSchedulePage.jsx` | `useLichLamViec({ bacSiId })` + mutation hooks |
| `DoctorAddShiftPage.jsx` | `useKhungGio()`, `useCreateLichLamViec()` |
| `DoctorHistoryPage.jsx` | `useAppointmentsByDoctor(bacSiId)` |
| `DoctorProfilePage.jsx` | Giữ nguyên (dùng Zustand store) |
| `DoctorLoginPage.jsx` | Giữ `useForm` (thêm zodResolver) |

#### Patient Pages (13 files)

| File | Hooks thay thế |
|------|----------------|
| `HomePage.jsx` | `useDoctors({ limit: 4 })`, `useSpecialties()` |
| `DoctorListPage.jsx` | `useDoctors(filters)`, `useSpecialties()` |
| `DoctorDetailPage.jsx` | `useDoctor(id)` |
| `SpecialtyListPage.jsx` | `useSpecialties()` |
| `SpecialtyDetailPage.jsx` | `useSpecialty(id)` |
| `BookingPage.jsx` | `useDoctor(id)`, `useSlotTrong()`, `useCreateAppointment()`, `usePaymentMethods()` |
| `AppointmentHistoryPage.jsx` | `useAppointmentsByPatient(benhNhanId)` |
| `MedicalResultPage.jsx` | `useAppointment(id)` |
| `FAQPage.jsx` | `useFAQs()` |
| `PatientProfilePage.jsx` | Giữ Zustand + thêm `useForm` + `zodResolver` cho form edit |
| `LoginPage.jsx` | Giữ `useForm` (thêm zodResolver) |
| `RegisterPage.jsx` | Giữ `useForm` (thêm zodResolver) |
| `NotFoundPage.jsx` | Giữ nguyên (trang tĩnh) |

---

### Phase 6: Dọn dẹp

| Hành động | Chi tiết |
|-----------|----------|
| **Xóa** `context/` | Thư mục rỗng, không cần |
| **Kiểm tra** imports | Xóa các `useState`, `useEffect`, `useCallback` không còn dùng |

---

## Tổng kết thay đổi

| Hạng mục | Số lượng |
|----------|:--------:|
| Thư viện mới cần cài | **3** (`zod`, `@hookform/resolvers`, `dayjs`) |
| Custom hook files mới | **9** (trong `hooks/queries/`) |
| Zod schema files mới | **5** (trong `validations/`) |
| Pages refactor React Query | **~37** |
| Pages refactor Form (RHF+Zod) | **11** (8 chuyển mới + 3 nâng cấp) |
| Pages refactor Day.js | **~15** |
| Xóa thư mục rỗng | **1** (`context/`) |

---

## Open Questions

> [!IMPORTANT]
> **Thứ tự thực hiện?** Tôi đề xuất: Phase 1 (cài lib) → Phase 2 (hooks) → Phase 3 (dayjs) → Phase 4 (form+zod) → Phase 5 (refactor pages) → Phase 6 (cleanup). Bạn OK không?

> [!IMPORTANT]
> **Phạm vi refactor?** Đây là thay đổi lớn (~37 pages). Bạn muốn tôi làm **tất cả cùng lúc** hay **chia nhỏ theo portal** (Admin trước → Doctor → Patient)?

---

## Verification Plan

### Automated Tests
- `npm install` — verify cài thư viện thành công  
- `npm run build` — verify không lỗi compile
- `npm run lint` — verify không warnings

### Manual Verification
- Test từng portal trên browser:
  - **Cache**: Chuyển trang rồi quay lại → data load instant
  - **Invalidation**: CRUD → list tự cập nhật
  - **Form validation**: Submit form trống → hiện error messages từ Zod
  - **Date/time**: Hiển thị đúng múi giờ VN
