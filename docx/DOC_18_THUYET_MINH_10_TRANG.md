# 📝 THUYẾT MINH CHI TIẾT 15 TRANG CHỨC NĂNG HỆ THỐNG (DOC_18)
> **HealthCare Project — Phân hệ Bệnh nhân & Khách vãng lai**
>
> Tài liệu này thuyết minh chi tiết cấu trúc, giao diện, luồng xử lý và mã nguồn (Frontend + Backend) của **15 trang** thuộc phân hệ Bệnh nhân trong hệ thống HealthCare. Bạn có thể sử dụng nội dung này để đưa vào báo cáo thuyết minh đồ án tốt nghiệp của mình.

---

## 1. TRANG CHỦ (HOMEPAGE)
* **Đường dẫn (Route):** `/`
* **Trạng thái truy cập:** Công khai (Không yêu cầu đăng nhập - `publicRoutes`)
* **Mô tả chức năng:** Điểm truy cập đầu tiên của hệ thống. Hiển thị banner giới thiệu, thanh tìm kiếm bác sĩ nhanh, danh mục chuyên khoa nổi bật, thông tin bác sĩ tiêu biểu và các câu hỏi thường gặp (FAQs).
* **Thiết kế giao diện (UI/UX):**
  * *Hero Section:* Banner lớn với câu slogan thương hiệu và hình nền y tế hiện đại. Tích hợp thanh tìm kiếm thông tin nhanh (Bác sĩ, Chuyên khoa).
  * *Specialties Grid:* Lưới hiển thị các thẻ chuyên khoa nổi bật (Nội khoa, Nhi khoa, Tai mũi họng...) kèm icon đại diện.
  * *Doctors Carousel:* Danh sách thẻ các bác sĩ nổi tiếng tại phòng khám, hiển thị ảnh, tên và học hàm/học vị.
* **Luồng xử lý (Data Flow):**
  1. Khi tải trang, Client tự động kích hoạt API `GET /api/chuyen-khoa` và `GET /api/bac-si?limit=4`.
  2. Phía Server: Gọi hàm service truy xuất CSDL qua Prisma. Hệ thống có cấu hình Redis Caching để lưu trữ kết quả này giúp tải trang ngay lập tức (dưới 10ms) mà không phải truy vấn lại DB nhiều lần.

### Mã nguồn Frontend (`client/src/pages/patient/HomePage.jsx`)
```javascript
import { useSpecialties } from "../../hooks/queries/useSpecialtyQueries";
import { useDoctors } from "../../hooks/queries/useDoctorQueries";
import { Link } from "react-router-dom";

export default function HomePage() {
  const { data: specRes } = useSpecialties();
  const { data: docRes } = useDoctors({ limit: 4 });

  return (
    <div className="homepage-container">
      <section className="hero-banner bg-primary/10 py-16 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
          Đặt Lịch Khám Bệnh Trực Tuyến Nhanh Chóng
        </h1>
        <p className="text-slate-600 max-w-xl mx-auto">
          Tìm kiếm bác sĩ dễ dàng, đặt hẹn chỉ trong vài cú click chuột.
        </p>
      </section>

      <section className="specialties-section py-12 container mx-auto">
        <h2 className="text-2xl font-bold mb-6">Chuyên khoa nổi bật</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {specRes?.data?.map(spec => (
            <Link to={`/specialties/${spec.id}`} key={spec.id} className="p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-all text-center">
              <h3 className="font-semibold text-slate-800">{spec.tenChuyenKhoa}</h3>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
```

---

## 2. TRANG ĐĂNG NHẬP (LOGIN PAGE)
* **Đường dẫn (Route):** `/login`
* **Trạng thái truy cập:** Công khai (Không yêu cầu đăng nhập - `publicRoutes`)
* **Mô tả chức năng:** Cho phép người dùng đăng nhập bằng tài khoản Email và Mật khẩu. Hỗ trợ xác thực kép qua token (Access/Refresh Token) được trả về dưới dạng HttpOnly Cookie bảo mật.
* **Thiết kế giao diện (UI/UX):** Layout 2 cột. Cột trái hiển thị banner thương hiệu y tế kỹ thuật số hiện đại. Cột phải là biểu mẫu đăng nhập với trường Email, Mật khẩu (có nút ẩn/hiện mật khẩu) và tích hợp widget xác thực Cloudflare Turnstile để chống spam.
* **Luồng xử lý (Data Flow):**
  1. Người dùng điền Form Đăng nhập và vượt qua Cloudflare Turnstile.
  2. Gửi request `POST /api/auth/login`. Server xác thực mật khẩu qua mã hóa Bcrypt và cấp cặp token JWT.
  3. Token được trình duyệt tự động ghim vào cookie HttpOnly; Client nhận thông tin User dạng JSON và chuyển hướng về trang trước đó.

### Mã nguồn Backend Controller (`server/src/controllers/auth.controller.js`)
```javascript
const login = async (req, res, next) => {
  try {
    const { email, matKhau } = req.body;
    const { user, accessToken, refreshToken } = await authService.login({ email, matKhau });

    // Set token vào HttpOnly Cookie bảo mật tối đa tránh tấn công XSS
    res.cookie("accessToken", accessToken, { httpOnly: true, secure: true, sameSite: "strict" });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "strict" });

    return res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};
```

---

## 3. TRANG ĐĂNG KÝ TÀI KHOẢN (REGISTER PAGE)
* **Đường dẫn (Route):** `/register`
* **Trạng thái truy cập:** Công khai (Không yêu cầu đăng nhập - `publicRoutes`)
* **Mô tả chức năng:** Cho phép bệnh nhân mới đăng ký tài khoản thành viên trên hệ thống.
* **Thiết kế giao diện (UI/UX):** Tương tự trang Login nhưng biểu mẫu yêu cầu thêm: Họ và tên, Số điện thoại (kiểm tra định dạng regex số điện thoại Việt Nam), Mật khẩu và Xác nhận mật khẩu.
* **Luồng xử lý (Data Flow):**
  1. Client validate dữ liệu form bằng thư viện Zod kết hợp `react-hook-form`.
  2. Gửi request `POST /api/auth/register` kèm theo `turnstileToken` bảo mật.
  3. Server xác minh token Turnstile hợp lệ, tiến hành băm mật khẩu bằng `bcryptjs` và lưu thông tin bệnh nhân mới vào PostgreSQL.

### Mã nguồn Frontend Submit Form (`client/src/pages/patient/RegisterPage.jsx`)
```javascript
const onSubmit = async (data) => {
  if (!turnstileToken) {
    toast.error("Vui lòng xác minh bảo mật (Turnstile).");
    return;
  }
  setLoading(true);
  try {
    await authService.register({
      hoTen: data.fullName,
      email: data.email,
      soDienThoai: data.phone,
      matKhau: data.password,
    }, turnstileToken);
    toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
    navigate("/login");
  } catch (err) {
    toast.error(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
  } finally {
    setLoading(false);
  }
};
```

---

## 4. TRANG QUÊN MẬT KHẨU (FORGOT PASSWORD PAGE)
* **Đường dẫn (Route):** `/forgot-password`
* **Trạng thái truy cập:** Công khai (Không yêu cầu đăng nhập - `publicRoutes`)
* **Mô tả chức năng:** Hỗ trợ bệnh nhân khôi phục tài khoản khi quên mật khẩu qua việc nhận mã OTP xác thực từ Email.
* **Thiết kế giao diện (UI/UX):** Biểu mẫu đơn giản chỉ yêu cầu nhập Email tài khoản đã đăng ký.
* **Luồng xử lý (Data Flow):**
  1. Người dùng gửi Email yêu cầu khôi phục mật khẩu.
  2. Server kiểm tra Email tồn tại trong hệ thống, tự động tạo mã OTP ngẫu nhiên gồm 6 chữ số, lưu trữ mã OTP này vào Redis với thời gian hết hạn (TTL) là 5 phút.
  3. Gửi Email chứa mã OTP này tới hòm thư người dùng qua dịch vụ Nodemailer. Sau đó Client được chuyển hướng sang trang Đặt lại mật khẩu.

### Mã nguồn Backend Service gửi OTP (`server/src/services/auth.service.js`)
```javascript
const forgotPassword = async (email) => {
  const user = await prisma.taiKhoan.findUnique({ where: { email } });
  if (!user) throw new AppError("Email không tồn tại trong hệ thống", 404);

  // Tạo OTP và lưu vào Redis với TTL là 5 phút (300 giây)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redisClient.setEx(`otp:${email}`, 300, otp);

  // Gửi mail OTP bằng Nodemailer
  await mailService.sendOTPEmail(email, otp);
  return { message: "Mã OTP đã được gửi về email của bạn." };
};
```

---

## 5. TRANG ĐẶT LẠI MẬT KHẨU (RESET PASSWORD PAGE)
* **Đường dẫn (Route):** `/reset-password`
* **Trạng thái truy cập:** Công khai (Không yêu cầu đăng nhập - `publicRoutes`)
* **Mô tả chức năng:** Xác nhận mã OTP hợp lệ và tiến hành cập nhật mật khẩu mới cho bệnh nhân.
* **Thiết kế giao diện (UI/UX):** Form nhập Email, mã OTP 6 chữ số, Mật khẩu mới và Xác nhận mật khẩu mới.
* **Luồng xử lý (Data Flow):**
  1. Bệnh nhân nhập mã OTP nhận được từ email và điền mật khẩu mới.
  2. Gửi request `POST /api/auth/reset-password`.
  3. Server đối chiếu mã OTP trong Redis. Nếu khớp và chưa hết hạn, Server băm mật khẩu mới và cập nhật bản ghi mật khẩu của tài khoản đó trong PostgreSQL.

### Mã nguồn Backend Reset Mật khẩu (`server/src/services/auth.service.js`)
```javascript
const resetPassword = async ({ email, otp, matKhauMoi }) => {
  const cachedOtp = await redisClient.get(`otp:${email}`);
  if (!cachedOtp) throw new AppError("Mã OTP đã hết hạn hoặc không tồn tại", 400);
  if (cachedOtp !== otp) throw new AppError("Mã OTP không chính xác", 400);

  // Băm mật khẩu mới
  const hashedPassword = await bcrypt.hash(matKhauMoi, 10);
  await prisma.taiKhoan.update({
    where: { email },
    data: { matKhau: hashedPassword },
  });

  // Xóa mã OTP khỏi Redis sau khi đổi mật khẩu thành công
  await redisClient.del(`otp:${email}`);
};
```

---

## 6. TRANG DANH SÁCH CHUYÊN KHOA (SPECIALTY LIST PAGE)
* **Đường dẫn (Route):** `/specialties`
* **Trạng thái truy cập:** Công khai (Không yêu cầu đăng nhập - `publicRoutes`)
* **Mô tả chức năng:** Hiển thị toàn bộ danh sách các chuyên khoa của phòng khám cùng thống kê số lượng bác sĩ trực thuộc từng khoa.
* **Thiết kế giao diện (UI/UX):** Lưới các thẻ chuyên khoa lớn, có hiệu ứng zoom nhẹ khi rê chuột (hover). Mỗi thẻ hiển thị tên chuyên khoa, hình ảnh thu nhỏ, mô tả ngắn và nhãn "Số lượng bác sĩ: X".
* **Luồng xử lý (Data Flow):**
  1. Gọi API `GET /api/chuyen-khoa`.
  2. Server thực hiện truy vấn DB kết hợp hàm đếm số lượng bác sĩ liên đới (`_count.bacSiList`) và trả về danh sách đã được sắp xếp theo bảng chữ cái.

### Mã nguồn Backend Service (`server/src/services/chuyenKhoa.service.js`)
```javascript
const getAll = async () => {
  return prisma.chuyenKhoa.findMany({
    include: {
      _count: {
        select: { bacSiList: true }
      }
    },
    orderBy: { tenChuyenKhoa: "asc" }
  });
};
```

---

## 7. TRANG CHI TIẾT CHUYÊN KHOA (SPECIALTY DETAIL PAGE)
* **Đường dẫn (Route):** `/specialties/:id`
* **Trạng thái truy cập:** Công khai (Không yêu cầu đăng nhập - `publicRoutes`)
* **Mô tả chức năng:** Xem mô tả chi tiết của một chuyên khoa và danh sách toàn bộ các bác sĩ đang công tác tại khoa đó.
* **Thiết kế giao diện (UI/UX):** Phần đầu trang hiển thị mô tả chi tiết về chuyên môn thế mạnh của chuyên khoa. Phần dưới hiển thị danh sách các bác sĩ thuộc khoa dưới dạng hàng ngang (Doctor Row Cards) để người dùng dễ chọn bác sĩ.
* **Luồng xử lý (Data Flow):**
  1. Client truyền `:id` của khoa lên URL.
  2. Kích hoạt API `GET /api/chuyen-khoa/:id`.
  3. Trả về thông tin chuyên khoa kèm danh sách bác sĩ thuộc về chuyên khoa đó.

### Mã nguồn Frontend (`client/src/pages/patient/SpecialtyDetailPage.jsx`)
```javascript
import { useParams } from "react-router-dom";
import { useSpecialty } from "../../hooks/queries/useSpecialtyQueries";

export default function SpecialtyDetailPage() {
  const { id } = useParams();
  const { data: res, isLoading } = useSpecialty(id);
  const specialty = res?.data;

  if (isLoading) return <p>Đang tải chuyên khoa...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{specialty?.tenChuyenKhoa}</h1>
      <p className="text-slate-600 mb-8">{specialty?.moTaChuyenKhoa}</p>
      <h2 className="text-xl font-bold mb-6">Đội ngũ bác sĩ chuyên khoa:</h2>
      <div className="space-y-4">
        {specialty?.bacSiList?.map(doc => (
          <div key={doc.id} className="p-4 border rounded-lg bg-white shadow-sm flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">{doc.tenBacSi}</h3>
              <p className="text-slate-500 text-sm">Học vị: {doc.hocViChucDanh}</p>
            </div>
            <Link to={`/doctors/${doc.id}`} className="bg-primary text-white px-4 py-2 rounded">
              Xem chi tiết
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 8. TRANG DANH SÁCH BÁC SĨ (DOCTOR LIST PAGE)
* **Đường dẫn (Route):** `/doctors`
* **Trạng thái truy cập:** Công khai (Không yêu cầu đăng nhập - `publicRoutes`)
* **Mô tả chức năng:** Cung cấp bộ lọc tìm kiếm bác sĩ theo chuyên khoa, từ khóa (tên bác sĩ) và hỗ trợ phân trang (Pagination).
* **Thiết kế giao diện (UI/UX):** Sidebar chứa bộ lọc chọn chuyên khoa và ô nhập từ khóa tìm kiếm. Vùng chính hiển thị lưới danh sách bác sĩ kèm theo thanh phân trang số (Trang trước, Trang sau, Số trang).
* **Luồng xử lý (Data Flow):**
  1. Khi người dùng thay đổi bộ lọc, Client tự động kích hoạt gọi API `GET /api/bac-si?chuyenKhoaId=...&search=...&page=...`.
  2. Server thực hiện truy vấn động (Dynamic Query) bằng Prisma, tính toán giá trị `skip`/`take` và trả về danh sách bác sĩ cùng thông tin phân trang `pagination` (tổng số trang, trang hiện tại).

### Mã nguồn Backend Service (`server/src/services/bacSi.service.js`)
```javascript
const getAll = async ({ chuyenKhoaId, search, page = 1, limit = 10 }) => {
  const skip = (Number(page) - 1) * Number(limit);
  const where = {};

  if (chuyenKhoaId) where.chuyenKhoaId = BigInt(chuyenKhoaId);
  if (search) {
    where.tenBacSi = { contains: search, mode: "insensitive" };
  }

  const [bacSiList, total] = await Promise.all([
    prisma.bacSi.findMany({ where, skip, take: Number(limit), include: { chuyenKhoa: true } }),
    prisma.bacSi.count({ where })
  ]);

  return {
    bacSiList,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) }
  };
};
```

---

## 9. TRANG CHI TIẾT BÁC SĨ (DOCTOR DETAIL PAGE)
* **Đường dẫn (Route):** `/doctors/:id`
* **Trạng thái truy cập:** Công khai (Không yêu cầu đăng nhập - `publicRoutes`)
* **Mô tả chức năng:** Hiển thị thông tin học vấn, kinh nghiệm công tác chi tiết, giá khám bệnh và lịch trực (Time slots) trong ngày của bác sĩ để bệnh nhân chuẩn bị đăng ký lịch khám.
* **Thiết kế giao diện (UI/UX):** Bố cục dạng thẻ chi tiết. Hiển thị ảnh chân dung bác sĩ lớn bên trái. Bên phải hiển thị thông tin bằng cấp, thế mạnh chuyên khoa, giá khám công khai và nút lớn "Đặt lịch khám ngay".
* **Luồng xử lý (Data Flow):**
  1. Nhận `:id` từ URL, gọi API `GET /api/bac-si/:id`.
  2. Server trả về đầy đủ thông tin bác sĩ và chuyên khoa để hiển thị lên màn hình.

### Mã nguồn Frontend (`client/src/pages/patient/DoctorDetailPage.jsx`)
```javascript
export default function DoctorDetailPage() {
  const { id } = useParams();
  const { data: res } = useDoctor(id);
  const doctor = res?.data;

  return (
    <div className="doctor-detail container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="col-span-1 text-center">
        <img src={doctor?.taiKhoan?.anhDaiDien} alt={doctor?.tenBacSi} className="w-48 h-48 rounded-full object-cover mx-auto mb-4" />
        <h1 className="text-2xl font-bold">{doctor?.tenBacSi}</h1>
        <p className="text-slate-500 font-semibold">{doctor?.hocViChucDanh}</p>
      </div>
      <div className="col-span-2">
        <h2 className="text-xl font-bold mb-4">Thông tin giới thiệu</h2>
        <div className="bio mb-6">{doctor?.moTaChiTiet}</div>
        <p className="price text-lg font-bold text-primary mb-6">Giá khám: {doctor?.giaKham} VNĐ</p>
        <Link to={`/booking/${doctor?.id}`} className="bg-primary hover:bg-primary/95 text-white px-6 py-3 rounded-lg font-bold inline-block shadow-lg">
          Đặt lịch khám ngay
        </Link>
      </div>
    </div>
  );
}
```

---

## 10. TRANG ĐẶT LỊCH KHÁM (BOOKING PAGE)
* **Đường dẫn (Route):** `/booking/:doctorId`
* **Trạng thái truy cập:** Bảo mật (Yêu cầu đăng nhập - `privateRoutes`)
* **Mô tả chức năng:** Cho phép chọn ngày/giờ, lý do khám và gửi yêu cầu tạo lịch hẹn miễn phí (khám xong mới thanh toán).
* **Thiết kế giao diện (UI/UX):** Định dạng dạng Step Wizard (Từng bước). Bước 1: Chọn ngày khám trên thanh trượt 21 ngày. Lựa chọn khung giờ (Time slots) trống hiển thị dưới dạng lưới nút bấm. Nhập lý do khám. Bước 2: Xem lại toàn bộ thông tin và bấm "Xác nhận đặt lịch".
* **Luồng xử lý (Data Flow):**
  1. Client gửi request `POST /api/dat-lich` chứa thông tin lịch hẹn.
  2. Server kiểm tra trùng ca khám, kiểm tra giới hạn số lượng bệnh nhân tối đa trên ca trực của bác sĩ.
  3. Áp dụng Database Transaction của Prisma để đảm bảo ghi nhận đồng thời lịch đặt lịch và tăng số bệnh nhân hiện tại của ca trực bác sĩ, tránh xung đột bất đồng bộ.

### Mã nguồn Backend Giao dịch Đặt Lịch (`server/src/services/datLich.service.js`)
```javascript
const create = async (data, requestUser = null) => {
  const bacSi = await prisma.bacSi.findUnique({
    where: { id: BigInt(data.bacSiId) },
    include: { chuyenKhoa: { select: { thoiLuongKham: true } } },
  });
  if (!bacSi) throw new AppError("Không tìm thấy bác sĩ", 404);

  const thoiLuongKham = bacSi.chuyenKhoa?.thoiLuongKham || 20;
  const gioBatDauDate = parseTime(data.gioBatDau);
  const gioKetThucDate = dayjs(gioBatDauDate).add(thoiLuongKham, "minute").toDate();

  return prisma.$transaction(async (tx) => {
    const datLich = await tx.datLich.create({
      data: {
        ngayDat: new Date(data.ngayDat),
        gioBatDau: gioBatDauDate,
        gioKetThuc: gioKetThucDate,
        lyDoKham: data.lyDoKham,
        giaKham: bacSi.giaKham,
        trangThai: 0, // Chờ xác nhận
        trangThaiThanhToan: 0, // Chưa thanh toán
        bacSiId: BigInt(data.bacSiId),
        benhNhanId: BigInt(data.benhNhanId),
      },
    });

    // Tăng số bệnh nhân đã đặt ca làm việc của bác sĩ lên 1
    await tx.lichLamViecBacSi.update({
      where: { id: data.lichLamViecId },
      data: { soBenhNhanHienTai: { increment: 1 } },
    });

    // Clear cache slot trống trên Redis của bác sĩ và ngày đã chọn
    await redisClient.del(`cache:slot:${data.bacSiId}:${data.ngayDat}`);
    return datLich;
  });
};
```

---

## 11. TRANG HỒ SƠ CÁ NHÂN (PATIENT PROFILE PAGE)
* **Đường dẫn (Route):** `/profile`
* **Trạng thái truy cập:** Bảo mật (Yêu cầu đăng nhập - `privateRoutes`)
* **Mô tả chức năng:** Cho phép bệnh nhân thay đổi thông tin cá nhân (Ngày sinh, giới tính, số điện thoại, địa chỉ) và cập nhật ảnh đại diện lên Cloudinary.
* **Thiết kế giao diện (UI/UX):** Biểu mẫu phân chia thành 2 khu vực: Thông tin chung (nhập liệu) và Thông tin tài khoản kèm khung cập nhật ảnh đại diện.
* **Luồng xử lý (Data Flow):**
  1. Người dùng chọn ảnh mới, Client gửi `FormData` chứa file ảnh lên API `PUT /api/auth/cap-nhat-avatar`.
  2. Server qua middleware Multer tải ảnh lên Cloudinary và lưu link URL vào PostgreSQL qua Prisma.

### Mã nguồn Frontend Upload Avatar (`client/src/pages/patient/PatientProfilePage.jsx`)
```javascript
const handleAvatarChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("avatar", file);

  try {
    const res = await api.put("/auth/cap-nhat-avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    toast.success("Cập nhật ảnh đại diện thành công!");
    updateUserAvatarInGlobalState(res.data.anhDaiDien);
  } catch (err) {
    toast.error("Lỗi upload ảnh.");
  }
};
```

---

## 12. TRANG LỊCH SỬ KHÁM BỆNH (APPOINTMENT HISTORY PAGE)
* **Đường dẫn (Route):** `/appointments`
* **Trạng thái truy cập:** Bảo mật (Yêu cầu đăng nhập - `privateRoutes`)
* **Mô tả chức năng:** Bệnh nhân xem danh sách các lịch hẹn đã đặt, sắp xếp theo thời gian mới nhất. Cho phép theo dõi trạng thái lịch và thực hiện Hủy lịch.
* **Thiết kế giao diện (UI/UX):** Các dòng lịch đặt được bố trí dạng danh sách (List View). Mỗi lịch đặt hiển thị tên bác sĩ, ngày khám, giờ khám, nhãn trạng thái (Chờ duyệt, Đã khám, Đã hủy) và các nút thao tác như "Hủy lịch" hoặc "Xem kết quả khám".
* **Luồng xử lý (Data Flow):**
  1. Khởi chạy API `GET /api/dat-lich/benh-nhan/:id`.
  2. Người dùng bấm Hủy lịch $\rightarrow$ API `DELETE /api/dat-lich/:id` được gọi. Server kiểm tra nếu lịch ở trạng thái Chờ (0) mới cho phép xóa, đồng thời hoàn trả 1 chỉ số trống (`decrement`) về cho lịch trực bác sĩ.

### Mã nguồn Backend Service Hủy lịch (`server/src/services/datLich.service.js`)
```javascript
const remove = async (id, requestUser) => {
  const existing = await prisma.datLich.findUnique({ where: { id: BigInt(id) } });
  if (!existing) throw new AppError("Không tìm thấy dữ liệu để xóa", 404);

  // Chỉ cho hủy lịch khi lịch đang ở trạng thái chưa khám
  if (existing.trangThai === 1 || existing.trangThai === 2) {
    throw new AppError("Không thể hủy lịch khám đã xác nhận hoặc đã hoàn tất.", 400);
  }

  await prisma.$transaction(async (tx) => {
    await tx.datLich.delete({ where: { id: BigInt(id) } });

    // Trả lại 1 slot trống cho ca làm việc của bác sĩ
    if (existing.lichLamViecId) {
      await tx.lichLamViecBacSi.update({
        where: { id: existing.lichLamViecId },
        data: { soBenhNhanHienTai: { decrement: 1 } }
      });
    }
  });
};
```

---

## 13. TRANG KẾT QUẢ KHÁM VÀ ĐƠN THUỐC (MEDICAL RESULT PAGE)
* **Đường dẫn (Route):** `/medical-results/:id`
* **Trạng thái truy cập:** Bảo mật (Yêu cầu đăng nhập - `privateRoutes`)
* **Mô tả chức năng:** Xem chẩn đoán của bác sĩ và thông tin đơn thuốc. Tích hợp thanh toán online và tính năng bảo mật khóa đơn thuốc.
* **Thiết kế giao diện (UI/UX):** Thông tin bệnh án hiển thị dạng hóa đơn chi tiết. Nếu hóa đơn chưa thanh toán, danh sách đơn thuốc bị làm mờ (blur) kèm theo nút "Thanh toán ngay bằng VNPay". Sau khi thanh toán thành công, danh sách thuốc và liều lượng sẽ hiển thị đầy đủ.
* **Cơ chế bảo mật Khóa đơn thuốc:** Bệnh nhân chỉ được xem chi tiết đơn thuốc sau khi đã thanh toán hóa đơn. Nếu chưa thanh toán, Server trả về mảng rỗng cho đơn thuốc để chống thất thoát.

### Mã nguồn Backend Khóa Đơn Thuốc (`server/src/services/datLich.service.js`)
```javascript
const redactSensitiveData = (data, requestUser) => {
  if (!data) return data;

  // Nếu là bệnh nhân truy cập và hóa đơn chưa được thanh toán thành công (trangThaiThanhToan < 2)
  if (requestUser?.vaiTro === "benh_nhan" && data.trangThaiThanhToan < 2) {
    if (data.donThuoc) {
      // Ẩn chi tiết danh sách thuốc kê để bảo mật hóa đơn thuốc
      data.donThuoc.chiTietDonThuoc = []; 
      data.donThuoc.message = "Vui lòng hoàn tất thanh toán tiền thuốc trực tuyến để xem chi tiết đơn thuốc.";
      data.donThuoc.isLocked = true;
    }
  }
  return data;
};
```

---

## 14. TRANG KẾT QUẢ THANH TOÁN (PAYMENT RESULT PAGE)
* **Đường dẫn (Route):** `/payment/result`
* **Trạng thái truy cập:** Bảo mật (Yêu cầu đăng nhập - `privateRoutes`)
* **Mô tả chức năng:** Nhận kết quả phản hồi từ cổng thanh toán VNPay để thông báo cho người dùng và cập nhật trạng thái hóa đơn.
* **Thiết kế giao diện (UI/UX):** Hiển thị hộp trạng thái dạng pop-up lớn. Nếu thành công: hiển thị dấu tích xanh lá, mã giao dịch, số tiền thanh toán và nút "Xem đơn thuốc". Nếu thất bại: hiển thị dấu chéo đỏ và lỗi chi tiết.
* **Luồng xử lý (Data Flow):**
  1. VNPay chuyển hướng người dùng về trang `/payment/result` kèm các tham số giao dịch trên URL.
  2. Frontend gửi các tham số này qua API `GET /api/thanh-toan/vnpay-return` để Server xác thực chữ ký bảo mật HMAC-SHA512.
  3. Nếu chữ ký hợp lệ, Server cập nhật trạng thái `trangThaiThanhToan = 2` (Đã thanh toán) và lưu log vào bảng `GiaoDich`.

### Mã nguồn Backend Verifying Payment Signature (`server/src/services/thanhToan.service.js`)
```javascript
const verifyVNPayReturn = async (queryParams) => {
  const secureHash = queryParams["vnp_SecureHash"];
  
  // Tiến hành build lại chuỗi hash từ các tham số trả về để so sánh
  let vnpParams = { ...queryParams };
  delete vnpParams["vnp_SecureHash"];
  delete vnpParams["vnp_SecureHashType"];
  
  // Sắp xếp tham số theo thứ tự alphabet
  vnpParams = sortObject(vnpParams);
  
  const signData = querystring.stringify(vnpParams, { encode: false });
  const hashValue = crypto.createHmac("sha512", vnp_HashSecret).update(signData).digest("hex");

  if (secureHash === hashValue) {
    const isSuccess = queryParams["vnp_ResponseCode"] === "00";
    const datLichId = queryParams["vnp_TxnRef"];

    if (isSuccess) {
      // Cập nhật trạng thái đã đóng tiền trong cơ sở dữ liệu
      await prisma.datLich.update({
        where: { id: BigInt(datLichId) },
        data: { trangThaiThanhToan: 2 } // 2: Đã thanh toán
      });
      return { success: true, datLichId };
    }
  }
  return { success: false };
};
```

---

## 15. TRANG HỎI ĐÁP FAQ (FAQ PAGE)
* **Đường dẫn (Route):** `/faq`
* **Trạng thái truy cập:** Công khai (Không yêu cầu đăng nhập - `publicRoutes`)
* **Mô tả chức năng:** Cung cấp thông tin trợ giúp, giải đáp các thắc mắc thường gặp của bệnh nhân về quy trình khám bệnh, đặt lịch và thanh toán.
* **Thiết kế giao diện (UI/UX):** Bố cục dạng Accordion (Đóng/Mở linh hoạt). Người dùng click vào câu hỏi để trượt mở rộng hiển thị nội dung câu trả lời.
* **Luồng xử lý (Data Flow):**
  1. Client gọi API `GET /api/faq`.
  2. Server lấy dữ liệu từ PostgreSQL (đã qua Redis Cache) để trả về cho Client hiển thị.

### Mã nguồn Frontend FAQ Accordion (`client/src/pages/patient/FAQPage.jsx`)
```javascript
import { useState } from "react";
import { useFAQs } from "../../hooks/queries/useFAQQueries";

export default function FAQPage() {
  const { data: res } = useFAQs();
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Câu hỏi thường gặp</h1>
      <div className="space-y-4">
        {res?.data?.map((faq, index) => (
          <div key={faq.id} className="border-b pb-4">
            <button onClick={() => toggleFAQ(index)} className="w-full flex justify-between items-center text-left py-2 font-semibold text-lg text-slate-800">
              <span>{faq.cauHoi}</span>
              <span>{activeIndex === index ? "−" : "+"}</span>
            </button>
            {activeIndex === index && (
              <p className="mt-2 text-slate-600 leading-relaxed transition-all">
                {faq.cauTraLoi}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🎨 CƠ SỞ THỰC TIỄN VÀ LÝ DO LỰA CHỌN THIẾT KẾ (DESIGN JUSTIFICATION)

Để thuyết phục Hội đồng chấm đồ án tốt nghiệp, dưới đây là các căn cứ thực tiễn khoa học và kỹ thuật đằng sau các quyết định thiết kế UX/UI cho phân hệ Bệnh nhân:

### 1. Thiết kế biểu mẫu Đặt lịch khám dạng "Step Wizard" (Từng bước)
* **Cơ sở thực tiễn (UX Best Practices):** Tránh hiện tượng **Quá tải nhận thức (Cognitive Overload)** của người dùng. Bệnh nhân khi tìm kiếm dịch vụ y tế thường trong tâm trạng bối rối hoặc lo âu. Nếu hiển thị tất cả các trường nhập liệu (Chọn chuyên khoa, Chọn bác sĩ, Lựa chọn khung giờ, Nhập triệu chứng bệnh lý) trên cùng một biểu mẫu dài sẽ tạo cảm giác phức tạp và dễ dẫn đến sai sót.
* **Giải pháp thực tế:** Chia nhỏ quy trình thành 2 bước tuyến tính trực quan giúp bệnh nhân tập trung hoàn thành từng phần nhỏ một cách trơn tru, nâng cao tỷ lệ hoàn thành đặt lịch thành công (Conversion Rate).

### 2. Thiết kế giao diện Hỏi đáp FAQ dạng "Accordion"
* **Cơ sở thực tiễn (Information Density & Scanability):** Trang câu hỏi thường gặp chứa khối lượng lớn nội dung văn bản. Việc hiển thị toàn bộ nội dung của tất cả các câu trả lời sẽ khiến trang web trở nên quá dài (Wall of text), gây khó khăn cho việc quét thông tin bằng mắt (Scanning).
* **Giải pháp thực tế:** Bố cục Accordion giúp ẩn đi các câu trả lời dài khi chưa cần thiết, tiết kiệm tối đa không gian màn hình theo chiều dọc (Vertical Space). Người dùng có thể nhanh chóng quét qua danh sách các câu hỏi lớn và chỉ nhấp mở rộng nội dung mình thực sự quan tâm, cải thiện đáng kể trải nghiệm đọc.

### 3. Cơ chế bảo mật "Khóa đơn thuốc" trên trang Kết quả khám
* **Cơ sở thực tiễn (Business & Privacy Logic):** Đảm bảo tính minh bạch tài chính cho phòng khám tư nhân. Quy trình hoạt động cần kiểm soát chặt chẽ việc: Bệnh nhân nhận chẩn đoán sơ bộ $\rightarrow$ Thanh toán viện phí/phí thuốc $\rightarrow$ Xem đơn thuốc để đi mua thuốc hoặc nhận thuốc tại quầy.
* **Giải pháp thực tế:** Nếu hóa đơn chưa thanh toán, danh sách đơn thuốc sẽ bị che mờ (blur) ở Frontend. Đặc biệt, để ngăn chặn những bệnh nhân có kiến thức kỹ thuật sử dụng công cụ DevTools (F12) của trình duyệt để gỡ bỏ hiệu ứng che mờ và xem trộm dữ liệu, Backend đã áp dụng cơ chế lọc sâu dữ liệu (Data Redaction): Khi phát hiện hóa đơn chưa thanh toán, Server trả về mảng chi tiết thuốc rỗng (`chiTietDonThuoc: []`). Đây là phương pháp **Bảo mật chuyên sâu (Security in Depth)** chuẩn công nghiệp.

### 4. Lựa chọn kiến trúc Single Page Application (SPA) kết hợp React Query
* **Cơ sở thực tiễn (Performance & UX):** Trong lĩnh vực y tế trực tuyến, tốc độ phản hồi nhanh là yếu tố cốt lõi. Mô hình MVC truyền thống tải lại toàn bộ trang (Full Page Reload) sau mỗi lần click menu tạo cảm giác chậm trễ và gián đoạn.
* **Giải pháp thực tế:** Lựa chọn SPA viết bằng React.js giúp tải tài nguyên một lần duy nhất. Các thao tác chuyển trang tiếp theo diễn ra tức thì trong vài mili-giây. Ngoài ra, việc tích hợp **React Query** giúp tự động quản lý bộ đệm (Caching) dữ liệu ở phía Client, giảm tải số lượng request trùng lặp gửi lên Server và tăng trải nghiệm phản hồi mượt mà như một ứng dụng di động nguyên bản (Native App).

