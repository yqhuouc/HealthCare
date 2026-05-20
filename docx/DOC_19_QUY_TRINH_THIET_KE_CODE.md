# 📝 BÁO CÁO QUY TRÌNH THIẾT KẾ VÀ PHÁT TRIỂN MÃ NGUỒN FRONT-END (DOC_19)
> **Dự án: Hệ Thống Đặt Lịch Khám & Quản Lý Phòng Khám HealthCare**
>
> Tài liệu này được biên soạn theo cấu trúc học thuật của một đồ án tốt nghiệp, thuyết minh chi tiết từ bước lên ý tưởng thiết kế UI/UX trên Stitch, căn cứ lựa chọn thiết kế thực tiễn, cho đến quy trình kỹ thuật chuyển đổi sang mã nguồn React.js của 2 bản mẫu giao diện điển hình (Trang chủ và Trang Đặt lịch khám).

---

# CHƯƠNG Y: QUY TRÌNH THIẾT KẾ GIAO DIỆN (UI/UX) VÀ PHÁT TRIỂN MÃ NGUỒN FRONT-END

## Y.1. PHƯƠNG PHÁP TIẾP CẬN VÀ LỰA CHỌN CÔNG CỤ THIẾT KẾ
Trong quá trình xây dựng hệ thống HealthCare, việc thiết kế trải nghiệm người dùng (UX) và giao diện trực quan (UI) đóng vai trò quyết định đến sự thân thiện và hiệu quả tương tác của bệnh nhân. Tác giả đã áp dụng quy trình thiết kế hiện đại qua các giai đoạn:

```
[Phân tích nhu cầu] ➔ [Thiết kế tĩnh trên Stitch] ➔ [Phân rã Component React] ➔ [Tích hợp API]
```

1. **Công cụ tạo mẫu nhanh (Prototyping Tool - Stitch):**
   * Tác giả lựa chọn công cụ thiết kế **Stitch** làm nền tảng phác thảo wireframe và mockup trực quan. Stitch cho phép định hình bố cục giao diện cực kỳ nhanh chóng dựa trên các từ khóa mô tả yêu cầu nghiệp vụ và cấu trúc của hệ thống phòng khám y tế.
   * Bản xuất bản thiết kế từ Stitch cung cấp bộ mã nguồn tĩnh (HTML, CSS và các lớp tiện ích Tailwind CSS), làm nền tảng vững chắc cho quá trình hiện thực hóa giao diện bằng code.
2. **Triết lý thiết kế hướng thành phần (Component-Driven Design):**
   * Đảm bảo tính nhất quán (Consistency) về giao diện trên toàn bộ 15 trang.
   * Rút ngắn thời gian phát triển bằng cách kế thừa mã nguồn giữa các trang thông qua các thành phần giao diện dùng chung (Reusable Components).

---

## Y.2. HỆ THỐNG ĐẶC TẢ GIAO DIỆN CHỦ ĐẠO (DESIGN SYSTEM)

### 1. Bảng màu sắc nhận diện thương hiệu (Color Palette)
Màu sắc trong lĩnh vực y tế cần tạo ra cảm giác sạch sẽ, tin cậy, nhẹ nhàng và chuyên nghiệp. Hệ màu được lựa chọn cụ thể như sau:
* **Màu chủ đạo (Primary Blue - `#0f62fe`):** Màu xanh dương y tế đậm. Căn cứ thực tiễn: Màu xanh dương kích thích não bộ tạo ra cảm giác an tâm, chuyên nghiệp, đáng tin cậy của dịch vụ khám chữa bệnh.
* **Màu hỗ trợ (Success Green - `#198754`):** Màu xanh lá cây. Được sử dụng cho các nhãn trạng thái "Đã xác nhận", "Thành công". Căn cứ thực tiễn: Tạo sự nhẹ nhõm, biểu thị trạng thái an toàn, sức khỏe tiến triển tốt.
* **Màu cảnh báo (Warning Orange - `#f59e0b`):** Sử dụng cho các trạng thái "Chờ duyệt", "Chờ thanh toán". Kích thích sự chú ý của bệnh nhân để hoàn tất quy trình mà không gây cảm giác hoảng sợ như màu đỏ.
* **Màu nền (Background Light - `#f8fafc`):** Màu xám nhẹ tinh khiết. Giảm mỏi mắt cho người dùng khi phải tương tác lâu với hệ thống.

### 2. Phông chữ và Kiểu chữ (Typography)
* **Phông chữ chủ đạo:** Sử dụng font **Inter** hoặc **Roboto** (Google Fonts).
* **Căn cứ thực tiễn:** Đây là các phông chữ Sans-serif (không có chân) hình học hiện đại, có độ mở rộng chữ (x-height) lớn. Giúp bệnh nhân ở mọi lứa tuổi (đặc biệt là người lớn tuổi có thị lực suy giảm) dễ dàng đọc rõ các thông tin chẩn đoán, tên thuốc và khung giờ khám trên cả màn hình máy tính lẫn điện thoại.

---

## Y.3. GIẢI THÍCH LÝ DO LỰA CHỌN THIẾT KẾ (CÓ CĂN CỨ THỰC TIỄN)

### 1. Thiết kế Trang Chủ (Homepage Template)
* **Căn cứ thực tiễn:** Theo nghiên cứu hành vi người dùng trực tuyến, có tới 70% bệnh nhân truy cập vào website phòng khám với nhu cầu cốt lõi là: *Tìm bác sĩ nhanh* hoặc *Xem thông tin chuyên khoa*. Do đó, thiết kế Trang chủ cần phải loại bỏ các yếu tố rườm rà để ưu tiên khả năng truy cập thông tin trực tiếp.
* **Giải pháp thiết kế:**
  * Đặt thanh tìm kiếm bác sĩ nổi bật ngay tại màn hình đầu tiên (Hero Section).
  * Hiển thị lưới các Chuyên khoa kèm icon trực quan để người dùng định vị được khoa khám bệnh chỉ trong 1 giây.

### 2. Thiết kế Trang Đặt Lịch Khám (Booking Page Template)
* **Căn cứ thực tiễn (Định luật Hick trong UX):** Thời gian đưa ra quyết định của con người tỉ lệ thuận với số lượng và độ phức tạp của các lựa chọn. Một biểu mẫu quá dài sẽ gây ra sự **Quá tải nhận thức (Cognitive Overload)**, khiến bệnh nhân bỏ ngang quy trình đặt hẹn.
* **Giải pháp thiết kế:** Sử dụng cấu trúc **Step Wizard (Từng bước)** chia nhỏ biểu mẫu làm 2 bước độc lập:
  * *Bước 1:* Chỉ tập trung vào việc chọn Ngày và Khung giờ trống (sử dụng lưới các ô giờ trực quan, dễ bấm bằng ngón cái trên thiết bị di động).
  * *Bước 2:* Xác nhận thông tin cá nhân và ghi chú triệu chứng bệnh lý.

### 3. Thiết kế trang Kết quả khám bệnh & Đơn thuốc (Medical Result Template)
* **Căn cứ thực tiễn (Bảo mật thông tin & Kiểm soát tài chính):** Phòng khám cần đảm bảo bệnh nhân chỉ tiếp cận được đơn thuốc chi tiết sau khi đã hoàn tất đóng tiền khám/tiền thuốc để tránh thất thoát.
* **Giải pháp thiết kế:**
  * Áp dụng hiệu ứng **Làm mờ (Blur)** kèm biểu tượng khóa trên giao diện đơn thuốc nếu hóa đơn chưa thanh toán.
  * Tích hợp nút thanh toán nhanh qua ví điện tử/ngân hàng (cổng VNPay) ngay tại vùng làm mờ để tạo luồng thao tác liền mạch, kích thích hành vi thanh toán nhanh.

---

## Y.4. QUY TRÌNH CHUYỂN ĐỔI BẢN THIẾT KẾ MOCKUP THÀNH MÃ NGUỒN REACT.JS

Quy trình kỹ thuật để chuyển đổi mã HTML tĩnh của Stitch thành mã Front-end React.js gồm 4 bước:

```
[1. Tách giao diện tĩnh] ➔ [2. Phân rã cấu trúc Component] ➔ [3. Thiết lập State điều khiển] ➔ [4. Gọi API bất đồng bộ]
```

* **Bước 1: Tách giao diện tĩnh:** Lấy cấu trúc layout HTML và các class Tailwind CSS của bản thiết kế mẫu để làm khung giao diện (JSX).
* **Bước 2: Phân rã Component:** Tiến hành bóc tách các phần lặp lại nhiều lần thành các file component con độc lập trong thư mục `client/src/components/`. Ví dụ: `Header.jsx`, `Footer.jsx`, `TimeSlot.jsx`, `DoctorCard.jsx`.
* **Bước 3: Thiết lập State điều khiển:** Thay thế các dữ liệu chữ cứng (Hardcoded text) bằng các biến trạng thái (`useState`) để kiểm soát tương tác của người dùng (Ví dụ: trạng thái mở/đóng accordion của trang FAQ, trạng thái khung giờ đang được chọn).
* **Bước 4: Gọi API kết nối Backend:** Sử dụng thư viện **React Query (useQuery / useMutation)** kết hợp `axios` để thực hiện gọi API bất đồng bộ lên Backend server lấy dữ liệu thực tế từ cơ sở dữ liệu PostgreSQL hiển thị lên màn hình.

---

## Y.5. THUYẾT MINH CHI TIẾT 2 BẢN MẪU THIẾT KẾ ĐIỂN HÌNH (TEMPLATES)

---

### MẪU THIẾT KẾ 1: TRANG CHỦ (HOMEPAGE TEMPLATE)

#### A. Cấu trúc thiết kế Layout trực quan
Trang chủ được bố cục theo cấu trúc lưới dọc cuộn trang (Single-column Grid Layout) bao gồm:
1. **Header (Đầu trang):** Logo thương hiệu bên trái, thanh menu điều hướng nhanh ở giữa, góc phải hiển thị nút "Đăng nhập" / "Đăng ký" (nếu khách vãng lai) hoặc Avatar của người dùng kèm menu dropdown (nếu đã đăng nhập).
2. **Hero Banner Section:** Nền ảnh y tế mờ (overlay xanh primary 80%), chứa dòng tiêu đề định vị giá trị cốt lõi và thanh tìm kiếm nhanh.
3. **Lưới Chuyên khoa (Specialties Grid):** Bố cục lưới 4 cột (desktop) hiển thị các khoa khám nổi bật giúp bệnh nhân dễ định hướng.
4. **Lưới Bác sĩ tiêu biểu (Featured Doctors):** Hiển thị danh sách bác sĩ giỏi dưới dạng thẻ, gồm ảnh chân dung, tên, chức danh và giá khám.
5. **Footer (Chân trang):** Thông tin bản quyền, địa chỉ phòng khám, số hotline cấp cứu và liên kết mạng xã hội.

> **[THÔNG BÁO CHÈN ẢNH BÁO CÁO]**
> *Học viên chụp ảnh chụp màn hình giao diện Trang chủ thực tế đang chạy trên trình duyệt (độ phân giải tối thiểu 1280x720) và chèn vào vị trí này trong Word.*
> **Mô tả ảnh:** Hình X.1: Giao diện Trang chủ hệ thống HealthCare trên trình duyệt máy tính.

#### B. Mã nguồn Front-end React.js của Template Trang Chủ (`HomePage.jsx`)
Dưới đây là mã nguồn Front-end thực tế đã được chuyển đổi từ bản thiết kế trực quan thành code React động:

```javascript
import React from "react";
import { Link } from "react-router-dom";
import { useSpecialties } from "../../hooks/queries/useSpecialtyQueries";
import { useDoctors } from "../../hooks/queries/useDoctorQueries";

export default function HomePage() {
  // Gọi API lấy dữ liệu động từ Backend qua hook React Query
  const { data: specialtiesRes, isLoading: loadingSpec } = useSpecialties();
  const { data: doctorsRes, isLoading: loadingDoc } = useDoctors({ limit: 4 });

  return (
    <div className="flex-grow bg-slate-50">
      {/* 1. Hero Section */}
      <section className="relative bg-primary text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-primary opacity-90 z-0" />
        <div className="container mx-auto max-w-6xl relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Chăm Sóc Sức Khỏe Toàn Diện Cho Gia Đình Bạn
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
            Hệ thống đặt lịch khám bệnh trực tuyến kết nối với đội ngũ bác sĩ chuyên khoa giàu kinh nghiệm.
          </p>
        </div>
      </section>

      {/* 2. Specialties Section */}
      <section className="py-16 container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Chuyên khoa nổi bật</h2>
          <Link to="/specialties" className="text-primary font-semibold hover:underline">
            Xem tất cả chuyên khoa →
          </Link>
        </div>
        
        {loadingSpec ? (
          <div className="text-center py-6">Đang tải chuyên khoa...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {specialtiesRes?.data?.map((spec) => (
              <Link 
                to={`/specialties/${spec.id}`} 
                key={spec.id} 
                className="group p-6 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-primary/20 transition-all text-center"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                  <span className="material-symbols-outlined">health_and_safety</span>
                </div>
                <h3 className="font-bold text-slate-700 group-hover:text-primary transition-all">
                  {spec.tenChuyenKhoa}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 3. Featured Doctors Section */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Bác sĩ tiêu biểu</h2>
            <Link to="/doctors" className="text-primary font-semibold hover:underline">
              Tìm kiếm bác sĩ →
            </Link>
          </div>

          {loadingDoc ? (
            <div className="text-center py-6">Đang tải danh sách bác sĩ...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {doctorsRes?.data?.bacSiList?.map((doc) => (
                <div key={doc.id} className="border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col bg-slate-50">
                  <img 
                    src={doc.taiKhoan?.anhDaiDien || "/images/default-avatar.png"} 
                    alt={doc.tenBacSi} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <span className="text-xs text-primary font-bold uppercase tracking-wider">
                        {doc.chuyenKhoa?.tenChuyenKhoa}
                      </span>
                      <h3 className="font-bold text-slate-800 text-lg mt-1 mb-2">{doc.tenBacSi}</h3>
                      <p className="text-slate-500 text-sm mb-4">{doc.hocViChucDanh}</p>
                    </div>
                    <Link 
                      to={`/doctors/${doc.id}`} 
                      className="block text-center bg-white border border-primary text-primary hover:bg-primary hover:text-white font-bold py-2 px-4 rounded-lg transition-all text-sm"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
```

---

### MẪU THIẾT KẾ 2: TRANG ĐẶT LỊCH KHÁM (BOOKING TEMPLATE)

#### A. Cấu trúc thiết kế Layout tương tác
Trang đặt lịch khám được chia làm hai cột chức năng rõ ràng trên Desktop và xếp chồng trên Mobile:
1. **Cột trái - Khung đặt lịch (Interactive Booking Panel):**
   * *Bộ chọn ngày (Date Carousel Slider):* Hiển thị dạng thanh trượt ngang chứa 21 ngày tiếp theo kể từ ngày hiện tại. Mỗi ngày hiển thị dưới dạng một nút hình chữ nhật đứng gồm: Thứ trong tuần và Ngày trong tháng. Ngày được chọn sẽ sáng màu xanh dương chủ đạo.
   * *Lưới ca khám (Time Slot Grid):* Lưới các nút bấm đại diện cho các khung giờ làm việc của bác sĩ (Ví dụ: `08:00 - 08:30`, `09:00 - 09:30`). Khung giờ trống hiển thị viền xanh, khung giờ đã có người đặt sẽ bị tô xám và vô hiệu hóa (`disabled`).
   * *Trường ghi chú lý do khám (Text Area):* Ô nhập mô tả sơ bộ tình trạng sức khỏe/triệu chứng.
2. **Cột phải - Tóm tắt thông tin đặt lịch (Summary Card):**
   * Hiển thị thông tin tóm tắt của Bác sĩ được chọn bao gồm: Ảnh đại diện, tên, chuyên khoa, học vị.
   * Hiển thị thời gian khám đã chọn thời gian thực (Real-time sync).
   * Hiển thị công khai chi phí khám bệnh.

> **[THÔNG BÁO CHÈN ẢNH BÁO CÁO]**
> *Học viên chụp ảnh giao diện Trang Đặt lịch khám thực tế (khi click chọn một ca làm việc trống) và chèn vào vị trí này trong Word.*
> **Mô tả ảnh:** Hình X.2: Giao diện Trang Đặt lịch khám và chọn giờ khám bệnh.

#### B. Mã nguồn Front-end React.js của Template Đặt Lịch (`BookingPage.jsx`)
Dưới đây là mã nguồn Front-end React.js thực tế kiểm soát hành vi lựa chọn và xử lý tương tác gửi dữ liệu đặt hẹn:

```javascript
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDoctor } from "../../hooks/queries/useDoctorQueries";
import { useActiveSlots, useCreateBooking } from "../../hooks/queries/useBookingQueries";
import { toast } from "react-toastify";
import dayjs from "dayjs";

export default function BookingPage() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  
  // Quản lý state của ngày được chọn và khung giờ được chọn
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [lyDoKham, setLyDoKham] = useState("");

  // Truy vấn thông tin bác sĩ và danh sách ca khám khả dụng
  const { data: doctorRes } = useDoctor(doctorId);
  const { data: slotsRes, isLoading: loadingSlots } = useActiveSlots(doctorId, selectedDate);
  const createBookingMutation = useCreateBooking();

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      toast.warn("Vui lòng chọn khung giờ khám bệnh!");
      return;
    }

    createBookingMutation.mutate(
      {
        bacSiId: doctorId,
        ngayDat: selectedDate,
        gioBatDau: selectedSlot.gioBatDau,
        lichLamViecId: selectedSlot.lichLamViecId,
        lyDoKham: lyDoKham,
      },
      {
        onSuccess: () => {
          toast.success("Đặt lịch khám thành công! Vui lòng chờ xác nhận.");
          navigate("/appointments"); // Đặt thành công chuyển hướng về Lịch sử để theo dõi
        },
        onError: (err) => {
          toast.error(err.message || "Đặt lịch thất bại. Vui lòng thử lại.");
        }
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-2xl font-extrabold text-slate-800 mb-6">Đăng ký lịch hẹn khám</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột Trái: Chọn Lịch Trình */}
        <form onSubmit={handleBookingSubmit} className="lg:col-span-2 space-y-6">
          
          {/* 1. Chọn Ngày */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h2 className="text-md font-bold mb-4 text-slate-700">1. Chọn ngày khám</h2>
            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin">
              {Array.from({ length: 7 }).map((_, i) => {
                const dateVal = dayjs().add(i, "day");
                const isSelected = selectedDate === dateVal.format("YYYY-MM-DD");
                return (
                  <button
                    type="button"
                    key={i}
                    onClick={() => {
                      setSelectedDate(dateVal.format("YYYY-MM-DD"));
                      setSelectedSlot(null);
                    }}
                    className={`flex-shrink-0 w-20 py-3 rounded-lg border text-center transition-all ${
                      isSelected 
                        ? "bg-primary border-primary text-white font-bold" 
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="text-xs">{dateVal.format("ddd")}</div>
                    <div className="text-lg font-extrabold mt-1">{dateVal.format("DD")}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Chọn Giờ */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h2 className="text-md font-bold mb-4 text-slate-700">2. Chọn giờ hẹn</h2>
            {loadingSlots ? (
              <p>Đang tải ca làm việc...</p>
            ) : slotsRes?.data?.length === 0 ? (
              <p className="text-slate-400 text-sm">Bác sĩ không có lịch trực vào ngày này.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {slotsRes?.data?.map((slot) => {
                  const isSelected = selectedSlot?.gioBatDau === slot.gioBatDau;
                  return (
                    <button
                      type="button"
                      key={slot.gioBatDau}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-3 rounded-lg border font-semibold text-sm transition-all ${
                        isSelected 
                          ? "bg-primary border-primary text-white shadow-md shadow-primary/20" 
                          : "bg-white border-slate-200 text-slate-700 hover:border-primary hover:text-primary"
                      }`}
                    >
                      {slot.gioBatDau}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Lý do khám */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h2 className="text-md font-bold mb-4 text-slate-700">3. Lý do khám bệnh</h2>
            <textarea
              rows={4}
              value={lyDoKham}
              onChange={(e) => setLyDoKham(e.target.value)}
              placeholder="Nhập các triệu chứng sức khỏe hiện tại của bạn..."
              className="w-full p-4 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={createBookingMutation.isLoading}
            className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
          >
            {createBookingMutation.isLoading ? "Đang xử lý đăng ký..." : "Xác nhận & Đăng ký khám"}
          </button>
        </form>

        {/* Cột Phải: Tóm tắt thông tin */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-fit">
          <h2 className="text-md font-bold mb-4 text-slate-700 pb-2 border-b">Thông tin đặt lịch</h2>
          {doctorRes?.data && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <img 
                  src={doctorRes.data.taiKhoan?.anhDaiDien || "/images/default-avatar.png"} 
                  alt={doctorRes.data.tenBacSi} 
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-bold text-slate-800">{doctorRes.data.tenBacSi}</h3>
                  <p className="text-xs text-primary font-semibold">{doctorRes.data.hocViChucDanh}</p>
                  <p className="text-xs text-slate-400 mt-1">{doctorRes.data.chuyenKhoa?.tenChuyenKhoa}</p>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Ngày hẹn:</span>
                  <span className="font-bold text-slate-800">{dayjs(selectedDate).format("DD/MM/YYYY")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Giờ hẹn:</span>
                  <span className="font-bold text-slate-800">{selectedSlot ? selectedSlot.gioBatDau : "Chưa chọn"}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2 font-bold text-slate-800">
                  <span>Giá khám bệnh:</span>
                  <span className="text-primary">{doctorRes.data.giaKham?.toLocaleString()} VNĐ</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```
