/**
 * ============================================================================
 * LỊCH LÀM VIỆC SERVICE (Dịch vụ quản lý Ca làm việc lớn & Lịch Bác sĩ)
 * ============================================================================
 * Tổng quan luồng thiết kế:
 * 1. Khung Giờ (KhungGio): Thường được hiểu như "Ca Làm Việc".
 *    Ví dụ: Ca Sáng (07:00-11:00), Ca Chiều (13:00-17:00).
 *    Admin tự do tạo trước các Khung Giờ chung này để dùng cho toàn hệ thống.
 * 
 * 2. Lịch Làm Việc (LichLamViecBacSi): Bác sĩ sẽ "gắn kết" bản thân với 1 
 *    Khung Giờ vào 1 Ngày Cụ Thể (ví dụ: Bác sĩ A làm sáng 27/03/2026).
 *    Nếu thời gian khám 1 lượt của chuyên khoa bác sĩ đó là 30 phút, 
 *    hệ thống có thể chia ca 4 tiếng (07h-11h) thành 8 bệnh nhân (soBenhNhanToiDa).
 * 
 * KhungGio không bao giờ cho bệnh nhân đặt trực tiếp. Nó chỉ là khuôn viền
 * để backend tính toán số lượng slot và validator giới hạn giờ hợp lệ.
 */

const prisma = require("../utils/prisma");
const { AppError } = require("../middlewares/error.middleware");

/**
 * Hàm parseTime:
 * Chuyển chuỗi "HH:mm" thành kiểu Date. Do Backend ở các máy chủ cloud
 * thường dùng múi giờ UTC, ta sử dụng thẳng "+07:00" để ép tạo Date theo
 * đúng múi giờ VN (khi DB lưu dưới dạng chuẩn UTC 00 thì sẽ tự lùi đi 7 tiếng).
 * 
 * @param {string} timeStr Chuỗi giờ phút, ví dụ: "13:00"
 * @returns {Date} Object Date quy chiếu theo 01/01/1970
 */
const parseTime = (timeStr) => new Date(`1970-01-01T${timeStr}:00.000+07:00`);

// ============================================================================
// PHẦN 1: QUẢN LÝ KHUNG GIỜ (CA LÀM VIỆC TỔNG)
// ============================================================================

/**
 * Láy toàn bộ danh sách các Khung Giờ (Ca) có sẵn.
 * Thường dùng làm danh sách Dropdown cho Admin hoặc Bác Sĩ chọn.
 */
const getAllKhungGio = async () => {
  return prisma.khungGio.findMany({ orderBy: { gioBatDau: "asc" } });
};

/**
 * Trở thành Admin: Thêm Khung Giờ tùy ý
 * (Ví dụ: Thêm ca Tối 18:00 - 21:00)
 */
const createKhungGio = async (data) => {
  // 1. Ép chuỗi thành kiểu Date với múi giờ +07:00 để so khớp
  const gioBatDau = parseTime(data.gioBatDau);
  const gioKetThuc = parseTime(data.gioKetThuc);

  // 2. Chặn lỗi logic: Giờ kết thúc ca làm không thể sớm hơn hoặc bằng lúc bắt đầu.
  // Ví dụ: Bắt đầu 21:00 nhưng lại kết thúc lúc 18:00 -> Vô lý.
  if (gioKetThuc <= gioBatDau) {
    throw new AppError("Giờ kết thúc không hợp lý! Phải sau giờ bắt đầu.", 400);
  }

  // 3. Khởi tạo và lưu thẳng vào thư viện
  return prisma.khungGio.create({
    data: { gioBatDau, gioKetThuc },
  });
};

/**
 * Xóa một Khung Giờ chung.
 * Cần kiểm tra kỹ: Nếu có ai đó (Bác sĩ) đang đăng ký nằm vùng trong ca này,
 * hệ thống sẽ cấm xóa để khỏi mồ côi dữ liệu lịch làm việc bác sĩ bên trong.
 */
const deleteKhungGio = async (id) => {
  const existing = await prisma.khungGio.findUnique({
    where: { id: BigInt(id) },
  });
  if (!existing) throw new AppError("Khung giờ mà bạn định xóa không tồn tại!", 404);

  // Đếm xem khung giờ này đã có ai (bác sĩ) dùng chưa
  const usageCount = await prisma.lichLamViecBacSi.count({
    where: { khungGioId: BigInt(id) },
  });
  
  if (usageCount > 0) {
    throw new AppError(
      `Khung giờ này vẫn đang được (${usageCount}) bác sĩ sử dụng, vui lòng xóa Lịch bác sĩ trước.`,
      400,
    );
  }

  await prisma.khungGio.delete({ where: { id: BigInt(id) } });
};

// ============================================================================
// PHẦN 2: QUẢN LÝ LỊCH LÀM VIỆC (Gắn Bác Sĩ + Khung Giờ + Ngày tháng)
// ============================================================================

/**
 * Lấy danh sách Lịch Làm Việc (của 1 Bác Sĩ duy nhất hoặc Ngày cụ thể).
 * Hiển thị ra bác sĩ, khung giờ họ chọn, và số lượng lịch hẹn đã được đặt.
 */
const getLichLamViec = async ({ bacSiId, ngayLamViec }) => {
  const where = {};
  if (bacSiId) where.bacSiId = BigInt(bacSiId);
  if (ngayLamViec) where.ngayLamViec = new Date(ngayLamViec);

  return prisma.lichLamViecBacSi.findMany({
    where,
    include: {
      bacSi: {
        select: {
          id: true,
          tenBacSi: true,
          // Rất cần thời lượng khám (vd: 30p) để Frontend biết hiển thị cách slot ngắn dài
          chuyenKhoa: { select: { tenChuyenKhoa: true, thoiLuongKham: true } },
        },
      },
      khungGio: true, // Bao gồm giờ bắt đầu, giờ kết thúc của Ca lớn
      _count: { select: { datLichs: true } }, // Kèm cả số lượng lịch đã nhận vào ca
    },
    // Ưu tiên hiển thị ca theo Ngày làm việc sắp tới, nếu chùng dòng ngày thì sort theo sáng/chiều
    orderBy: [{ ngayLamViec: "asc" }, { khungGio: { gioBatDau: "asc" } }],
  });
};

/**
 * Tạo Lịch Làm Việc (Khi bác sĩ đăng ký đi làm vào ngày/khung nào đó).
 * Quy tắc: [1 Bác Sĩ] + [1 Ngày] + [1 Khung Giờ] = Phải là Duy Nhất, không đè lặp.
 */
const createLichLamViec = async (data) => {
  // Lấy thông tin Bác Sĩ + Thông số "Tốc độ khám 1 bệnh nhân" của chuyên môn
  const bacSi = await prisma.bacSi.findUnique({
    where: { id: BigInt(data.bacSiId) },
    include: { chuyenKhoa: { select: { thoiLuongKham: true } } },
  });
  if (!bacSi) throw new AppError("Bác sĩ không tồn tại hoặc đã bị xóa.", 404);

  // Lấy khung giờ gốc mà bác sĩ chọn để tính khối lượng thời gian
  const khungGio = await prisma.khungGio.findUnique({
    where: { id: BigInt(data.khungGioId) },
  });
  if (!khungGio) throw new AppError("Không tìm thấy khung giờ", 404);

  const existing = await prisma.lichLamViecBacSi.findFirst({
    where: {
      bacSiId: BigInt(data.bacSiId),
      ngayLamViec: new Date(data.ngayLamViec),
      khungGioId: BigInt(data.khungGioId),
    },
  });

  if (existing)
    throw new AppError("Bác sĩ đã có lịch làm việc vào khung giờ này", 409);

  // Tự tính soBenhNhanToiDa nếu không truyền
  let soBenhNhanToiDa = data.soBenhNhanToiDa;
  if (!soBenhNhanToiDa) {
    const thoiLuongKham = bacSi.chuyenKhoa?.thoiLuongKham || 20;
    const caStart = khungGio.gioBatDau.getTime();
    const caEnd = khungGio.gioKetThuc.getTime();
    const caLengthMinutes = (caEnd - caStart) / 60000;
    soBenhNhanToiDa = Math.floor(caLengthMinutes / thoiLuongKham);
  }

  return prisma.lichLamViecBacSi.create({
    data: {
      ngayLamViec: new Date(data.ngayLamViec),
      soBenhNhanHienTai: 0,
      soBenhNhanToiDa, // Đã tính xong
      sanSang: 1, // Trạng thái: Cửa mở
      bacSiId: BigInt(data.bacSiId),
      khungGioId: BigInt(data.khungGioId),
    },
    include: {
      bacSi: {
        select: {
          id: true,
          tenBacSi: true,
          chuyenKhoa: { select: { tenChuyenKhoa: true, thoiLuongKham: true } },
        },
      },
      khungGio: true,
    },
  });
};

/**
 * Cập nhật động thái / Chỉnh sửa Lịch.
 * Ví dụ: Bác sĩ đột xuất bận, họ có thể tắt cờ sanSang (Trạng thái = Cửa đóng chống nhận hẹn thêm),
 *        hoặc tinh chỉnh nâng sốBenhNhanToiDa lên để tiếp thêm bệnh nhân (Cấp thẻ vàng VIP).
 */
const updateLichLamViec = async (id, data) => {
  const existing = await prisma.lichLamViecBacSi.findUnique({
    where: { id: BigInt(id) },
  });
  if (!existing) throw new AppError("Lịch làm việc không được tìm thấy trên hệ thống.", 404);

  // undefined: Bỏ qua trường không truyền lên. Chỉ update đúng field nào có gửi giá trị.
  return prisma.lichLamViecBacSi.update({
    where: { id: BigInt(id) },
    data: {
      sanSang: data.sanSang !== undefined ? data.sanSang : undefined,
      soBenhNhanHienTai:
        data.soBenhNhanHienTai !== undefined
          ? data.soBenhNhanHienTai
          : undefined, // Cẩn thận: Việc tăng/giảm số bệnh nhân thường làm tự động ở hàm datLich qua $transaction!
      soBenhNhanToiDa:
        data.soBenhNhanToiDa !== undefined ? data.soBenhNhanToiDa : undefined,
    },
  });
};

/**
 * Hủy hoàn toàn 1 Bản ghi ca lịch của bác sĩ.
 * Rất nguy hiểm vì liên đới đến Bệnh nhân: Phải check chặn đứng việc xóa Nếu ca khám này
 * ĐÃ CHỨA ÍT NHẤT 1 BỆNH NHÂN ĐANG GỬI LỊCH CHỜ Khám hoặc Xác nhận.
 */
const deleteLichLamViec = async (id) => {
  const existing = await prisma.lichLamViecBacSi.findUnique({
    where: { id: BigInt(id) },
  });
  if (!existing) throw new AppError("Lịch trống trơn hoặc không tồn tại.", 404);

  // notIn: [3] -> Tìm các lịch không thuộc dạng bị Hủy. (Tức Cò Đang Chờ/Xác nhận/Đã Khám)
  const datLichCount = await prisma.datLich.count({
    where: { lichLamViecId: BigInt(id), trangThai: { notIn: [3] } },
  });
  
  if (datLichCount > 0) {
    throw new AppError(
      `Từ chối hủy Ca: Đang có (${datLichCount}) bệnh nhân hẹn khám trong ca này! Vui lòng gọi điện dời lịch và hủy lịch bệnh nhân trước.`,
      400,
    );
  }

  // Tiến hành xóa record lịch của Bác sĩ ra khỏi CSDL
  await prisma.lichLamViecBacSi.delete({ where: { id: BigInt(id) } });
};

module.exports = {
  getAllKhungGio,
  createKhungGio,
  deleteKhungGio,
  getLichLamViec,
  createLichLamViec,
  updateLichLamViec,
  deleteLichLamViec,
};
