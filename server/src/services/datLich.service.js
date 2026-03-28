/**
 * ============================================================================
 * DỊCH VỤ ĐẶT LỊCH (DAT LICH SERVICE)
 * ============================================================================
 * File này quản lý toàn bộ vòng đời của một Lịch Hẹn:
 * 1. Tra cứu: Slot trống, Lịch theo Bệnh nhân/Bác sĩ.
 * 2. Tạo mới: Tính toán giờ kết thúc, kiểm tra ca làm việc (Shift),
 *    kiểm tra công suất (Capacity), và thực hiện Transaction để đảm bảo dữ liệu.
 * 3. Cập nhật: Thay đổi trạng thái (Hủy/Xác nhận) và hoàn trả capacity.
 * 4. Xóa: Xóa cứng record và xử lý liên đới đơn thuốc.
 *
 * ĐIỂM ĐẶC BIỆT: Hệ thống hỗ trợ "Nới ca Admin" - Tức là sinh slot lố giờ hành chính
 * nếu Admin chủ động tăng soBenhNhanToiDa trong LichLamViecBacSi.
 */

const prisma = require("../utils/prisma");
const { AppError } = require("../middlewares/error.middleware");

/**
 * parseTime: Chuyển "HH:mm" thành Date (Múi giờ VN +07:00)
 * Giúp Prisma lưu vào DB dưới dạng chuẩn UTC chuẩn xác.
 */
const parseTime = (timeStr) => new Date(`2000-01-01T${timeStr}:00.000+07:00`);

/**
 * formatTime: Chuyển Date thành chuỗi "HH:mm" hiển thị đúng giờ VN
 * Sử dụng Intl.DateTimeFormat để đảm bảo độ chính xác bất kể server đặt ở đâu.
 */
const formatTime = (date) => {
  const d = new Date(date);
  d.setFullYear(2000); // Đưa về năm 2000 để tránh lỗi múi giờ lịch sử 1970 (+8)
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
};

// Hàm chuẩn hóa thời gian để so sánh (chỉ lấy giờ/phút, bỏ qua năm)
const normalizeTime = (date) => {
  const d = new Date(date);
  d.setFullYear(2000, 0, 1); 
  d.setSeconds(0, 0);
  return d.getTime();
};

/**
 * redactSensitiveData: Hàm phụ để ẩn thông tin nhạy cảm (Đơn thuốc)
 * dựa trên quyền hạn và trạng thái thanh toán.
 */
const redactSensitiveData = (data, requestUser) => {
  if (!data) return data;

  // Nếu là mảng (ví dụ kết quả findMany)
  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item, requestUser));
  }

  // Logic chặn: Nếu role là bệnh nhân và chưa trả tiền thuốc (status < 2)
  // thì ẩn donThuoc đi hoặc chỉ để lại thông báo.
  if (requestUser?.vaiTro === "benh_nhan" && data.trangThaiThanhToan < 2) {
    if (data.donThuoc) {
      data.donThuoc = {
        message: "Vui lòng hoàn tất thanh toán để xem chi tiết đơn thuốc và kết quả khám.",
        isLocked: true,
      };
    }
  }

  return data;
};

/**
 * defaultInclude: Cấu hình mặc định khi Query để lấy đầy đủ thông tin liên quan
 * (Bác sĩ, Bệnh nhân, Hình thức thanh toán, Đơn thuốc...)
 */
const defaultInclude = {
  bacSi: {
    select: {
      id: true,
      tenBacSi: true,
      hocViChucDanh: true,
      chuyenKhoa: { select: { tenChuyenKhoa: true, thoiLuongKham: true } },
    },
  },
  benhNhan: { select: { id: true, hoTen: true, soDienThoai: true } },
  hinhThucThanhToan: true,
  lichLamViec: { include: { khungGio: true } },
  donThuoc: { include: { chiTietDonThuoc: true } },
};

// ─── LẤY DANH SÁCH LỊCH HẸN (Dành cho Admin quản lý tổng) ──────────
const getAll = async ({ trangThai, ngayDat, page = 1, limit = 10 }) => {
  const skip = (Number(page) - 1) * Number(limit);
  const where = {};

  // Lọc theo trạng thái (0: Chờ, 1: Xác nhận, 2: Đã khám, 3: Hủy)
  if (trangThai !== undefined) where.trangThai = Number(trangThai);

  // Lọc theo ngày cụ thể
  if (ngayDat) where.ngayDat = new Date(ngayDat);

  const [datLichs, total] = await Promise.all([
    prisma.datLich.findMany({
      where,
      include: defaultInclude,
      skip,
      take: Number(limit),
      orderBy: [{ ngayDat: "desc" }, { gioBatDau: "asc" }], // Ngày mới nhất lên đầu, trong ngày thì sort theo giờ
    }),
    prisma.datLich.count({ where }),
  ]);

  return {
    datLichs,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

/**
 * Lấy chi tiết 1 lịch hẹn qua ID
 */
const getById = async (id, requestUser) => {
  const datLich = await prisma.datLich.findUnique({
    where: { id: BigInt(id) },
    include: defaultInclude,
  });
  if (!datLich) throw new AppError("Không tìm thấy lịch hẹn", 404);

  return redactSensitiveData(datLich, requestUser);
};

/**
 * Lấy danh sách lịch hẹn của 1 Bệnh nhân cụ thể.
 * Có kiểm tra Ownership: Bệnh nhân chỉ được xem lịch của chính mình.
 */
const getByBenhNhan = async (benhNhanId, requestUser) => {
  if (requestUser.vaiTro === "benh_nhan") {
    const benhNhan = await prisma.benhNhan.findUnique({
      where: { id: BigInt(benhNhanId) },
    });
    // Chặn nếu bệnh nhân này định "xem lén" ID bệnh nhân khác
    if (!benhNhan || benhNhan.taiKhoanId !== requestUser.id) {
      throw new AppError("Bạn không có quyền xem lịch hẹn này", 403);
    }
  }

  const results = await prisma.datLich.findMany({
    where: { benhNhanId: BigInt(benhNhanId) },
    include: defaultInclude,
    orderBy: [{ ngayDat: "desc" }, { gioBatDau: "asc" }],
  });

  return redactSensitiveData(results, requestUser);
};

/**
 * Lấy lịch hẹn của 1 Bác sĩ cụ thể.
 * Có kiểm tra Ownership: Bác sĩ chỉ xem được danh sách bệnh nhân đặt mình.
 */
const getByBacSi = async (bacSiId, requestUser) => {
  if (requestUser.vaiTro === "bac_si") {
    const bacSi = await prisma.bacSi.findUnique({
      where: { id: BigInt(bacSiId) },
    });
    if (!bacSi || bacSi.taiKhoanId !== requestUser.id) {
      throw new AppError("Bạn không có quyền xem lịch hẹn này", 403);
    }
  }

  return prisma.datLich.findMany({
    where: { bacSiId: BigInt(bacSiId) },
    include: defaultInclude,
    orderBy: [{ ngayDat: "desc" }, { gioBatDau: "asc" }],
  });
};

// ─── TẠO MỚI LỊCH HẸN (LUỒNG QUAN TRỌNG NHẤT) ──────────────────────────
// Flow: Tìm BS -> Tính giờ kết thúc -> Khớp Ca làm việc -> Check sức chứa -> Transaction lưu DB
const create = async (data) => {
  // 1. Tìm bác sĩ + lấy thoiLuongKham từ chuyên khoa
  const bacSi = await prisma.bacSi.findUnique({
    where: { id: BigInt(data.bacSiId) },
    include: { chuyenKhoa: { select: { thoiLuongKham: true } } },
  });
  if (!bacSi) throw new AppError("Không tìm thấy bác sĩ", 404);

  const benhNhan = await prisma.benhNhan.findUnique({
    where: { id: BigInt(data.benhNhanId) },
  });
  if (!benhNhan) throw new AppError("Không tìm thấy bệnh nhân", 404);

  // 2. Tự động tính gioKetThuc dựa trên thoiLuongKham của Chuyên Khoa
  const thoiLuongKham = bacSi.chuyenKhoa?.thoiLuongKham || 20; // Mặc định 20p nếu thiếu data
  const gioBatDauDate = parseTime(data.gioBatDau);
  const gioKetThucDate = new Date(
    gioBatDauDate.getTime() + thoiLuongKham * 60_000,
  );

  // 3. Lấy danh sách các ca (Shift) mà bác sĩ này đăng ký trong ngày
  const availableShifts = await prisma.lichLamViecBacSi.findMany({
    where: {
      bacSiId: BigInt(data.bacSiId),
      ngayLamViec: new Date(data.ngayDat),
      sanSang: 1, // Chỉ lấy những ca bác sĩ đang mở cửa nhận khách
    },
    include: { khungGio: true },
  });

  // 4. XÁC THỰC KHUNG GIỜ: Kiểm tra xem cái "Giờ bắt đầu" mà bệnh nhân chọn
  // có nằm trong danh sách các Slot có thể sinh ra từ Ca làm việc đó không.
  let lichLamViec = null;
  const slotMs = thoiLuongKham * 60_000;

  for (const shift of availableShifts) {
    if (!shift.khungGio) continue;

    let cursor = shift.khungGio.gioBatDau.getTime();
    let sloted = 0;

    // Quét qua toàn bộ slot mà ca này cho phép (dựa theo soBenhNhanToiDa)
    while (sloted < shift.soBenhNhanToiDa) {
      if (normalizeTime(cursor) === normalizeTime(gioBatDauDate)) {
        lichLamViec = shift; // Tìm thấy ca "chủ quản" của slot này
        break;
      }
      cursor += slotMs;
      sloted++;
    }

    if (lichLamViec) break;
  }

  if (!lichLamViec) {
    throw new AppError(
      `Không thể đặt lịch: Slot ${data.gioBatDau} – ${formatTime(gioKetThucDate)} này không nằm trong bất kỳ ca làm việc nào hoặc ca đó đã bị đóng/kín chỗ.`,
      400,
    );
  }

  // 5. Kiểm tra sức chứa (Capacity) của Ca
  if (lichLamViec.soBenhNhanHienTai >= lichLamViec.soBenhNhanToiDa) {
    throw new AppError(
      "Ca làm việc đã đầy, hoặc hiện tại không còn slot trống nào, vui lòng chọn ca khác.",
      400,
    );
  }

  // 6. Chặn đặt trùng slot: 1 Bác sĩ - 1 Ngày - 1 Giờ chỉ có duy nhất 1 Bệnh nhân
  const trungLich = await prisma.datLich.findUnique({
    where: {
      unique_lich: {
        bacSiId: BigInt(data.bacSiId),
        ngayDat: new Date(data.ngayDat),
        gioBatDau: gioBatDauDate,
      },
    },
  });
  if (trungLich) {
    throw new AppError(
      "Xin lỗi, khung giờ này vừa có người khác nhanh tay đặt mất rồi. Vui lòng chọn giờ khác!",
      409,
    );
  }

  // 7. THỰC HIỆN TRANSACTION: Đảm bảo "Đặt lịch" đi đôi với "Tăng sĩ số ca"
  // Nếu 1 trong 2 bước lỗi (ví dụ DB rớt mạng giữa chừng), hệ thống sẽ ROLLBACK lại hết.
  return prisma.$transaction(async (tx) => {
    const datLich = await tx.datLich.create({
      data: {
        ngayDat: new Date(data.ngayDat),
        gioBatDau: gioBatDauDate,
        gioKetThuc: gioKetThucDate, // Lưu giờ kết thúc đã tính ở bước 2
        lyDoKham: data.lyDoKham,
        giaKham: data.giaKham ? parseFloat(data.giaKham) : bacSi.giaKham,
        trangThai: 0, // 0: Chờ xác nhận
        trangThaiThanhToan: data.trangThaiThanhToan
          ? Number(data.trangThaiThanhToan)
          : 0,
        bacSiId: BigInt(data.bacSiId),
        benhNhanId: BigInt(data.benhNhanId),
        hinhThucThanhToanId: data.hinhThucThanhToanId
          ? BigInt(data.hinhThucThanhToanId)
          : null,
        lichLamViecId: lichLamViec.id,
      },
      include: defaultInclude,
    });

    // Cập nhật tăng số người hiện tại đang chiếm trong Ca này
    await tx.lichLamViecBacSi.update({
      where: { id: lichLamViec.id },
      data: { soBenhNhanHienTai: { increment: 1 } },
    });

    return datLich;
  });
};

/**
 * Cập nhật Trạng thái Lịch hẹn (Xác nhận/Hủy/Khám xong).
 * Đặc biệt xử lý logic Hủy: Trả lại 1 slot trống cho Ca làm việc.
 */
const updateTrangThai = async (id, trangThai) => {
  const existing = await prisma.datLich.findUnique({
    where: { id: BigInt(id) },
  });
  if (!existing) throw new AppError("Không tìm thấy lịch hẹn", 404);

  const oldTrangThai = existing.trangThai;
  const newTrangThai = Number(trangThai);

  return prisma.$transaction(async (tx) => {
    const datLich = await tx.datLich.update({
      where: { id: BigInt(id) },
      data: { trangThai: newTrangThai },
      include: defaultInclude,
    });

    // Hủy lịch (chuyển sang 3) → giảm capacity
    if (oldTrangThai !== 3 && newTrangThai === 3 && existing.lichLamViecId) {
      await tx.lichLamViecBacSi.update({
        where: { id: existing.lichLamViecId },
        data: { soBenhNhanHienTai: { decrement: 1 } },
      });
    }

    // Khôi phục từ hủy (từ 3 → khác 3) → tăng capacity
    if (oldTrangThai === 3 && newTrangThai !== 3 && existing.lichLamViecId) {
      await tx.lichLamViecBacSi.update({
        where: { id: existing.lichLamViecId },
        data: { soBenhNhanHienTai: { increment: 1 } },
      });
    }

    return datLich;
  });
};

/**
 * Xóa vĩnh viễn Lịch hẹn khỏi DB (Thường chỉ Admin mới dùng).
 * Cần dọn dẹp Đơn thuốc đi kèm và trả lại Capacity nếu lịch chưa bị Hủy.
 */
const remove = async (id, requestUser) => {
  const existing = await prisma.datLich.findUnique({
    where: { id: BigInt(id) },
  });
  if (!existing) throw new AppError("Không tìm thấy dữ liệu để xóa", 404);

  // Quyền sở hữu: Bệnh nhân chỉ được xóa (hủy/xóa) lịch của chính họ
  if (requestUser.vaiTro === "benh_nhan") {
    const benhNhan = await prisma.benhNhan.findFirst({
      where: { taiKhoanId: requestUser.id },
    });
    if (!benhNhan || existing.benhNhanId !== benhNhan.id) {
      throw new AppError("Bạn không có quyền can thiệp vào lịch hẹn này", 403);
    }
  }

  // Chặn xóa nếu lịch đã ở trạng thái quan trọng (Xác nhận / Đã khám)
  if (existing.trangThai === 1 || existing.trangThai === 2) {
    throw new AppError(
      "Lịch đã xác nhận hoặc đã khám xong, không thể xóa cứng khỏi hệ thống.",
      400,
    );
  }

  await prisma.$transaction(async (tx) => {
    // 1. Xóa các dữ liệu phụ liên quan (Đơn thuốc)
    await tx.donThuoc.deleteMany({ where: { datLichId: BigInt(id) } });

    // 2. Xóa lịch hẹn chính
    await tx.datLich.delete({ where: { id: BigInt(id) } });

    // 3. Nếu lịch đang ở trạng thái 'Đang hoạt động' (0/1/2) mà bị xóa -> lùi sĩ số Ca lại
    if (existing.trangThai !== 3 && existing.lichLamViecId) {
      await tx.lichLamViecBacSi.update({
        where: { id: existing.lichLamViecId },
        data: { soBenhNhanHienTai: { decrement: 1 } },
      });
    }
  });
};

/**
 * LẤY DANH SÁCH SLOT TRỐNG (Dành cho Frontend hiển thị cho bệnh nhân chọn giờ)
 * Hàm này sinh ra các mốc giờ 08:00, 08:20... dựa trên Ca làm việc.
 */
const getSlotTrong = async ({ bacSiId, ngayDat }) => {
  if (!bacSiId || !ngayDat) {
    throw new AppError("Cần truyền bacSiId và ngayDat", 400);
  }

  // Lấy bác sĩ + thoiLuongKham
  const bacSi = await prisma.bacSi.findUnique({
    where: { id: BigInt(bacSiId) },
    include: {
      chuyenKhoa: { select: { thoiLuongKham: true, tenChuyenKhoa: true } },
    },
  });
  if (!bacSi) throw new AppError("Không tìm thấy bác sĩ", 404);

  const thoiLuongKham = bacSi.chuyenKhoa?.thoiLuongKham || 20;

  // Lấy tất cả ca làm việc của BS ngày đó
  const lichLamViecs = await prisma.lichLamViecBacSi.findMany({
    where: {
      bacSiId: BigInt(bacSiId),
      ngayLamViec: new Date(ngayDat),
      sanSang: 1,
    },
    include: { khungGio: true },
    orderBy: { khungGio: { gioBatDau: "asc" } },
  });

  if (lichLamViecs.length === 0) return [];

  // Lấy tất cả DatLich (chưa hủy) của BS ngày đó để loại slot đã đặt
  const datLichs = await prisma.datLich.findMany({
    where: {
      bacSiId: BigInt(bacSiId),
      ngayDat: new Date(ngayDat),
      trangThai: { not: 3 },
    },
    select: { gioBatDau: true },
  });

  const bookedTimes = new Set(datLichs.map((d) => d.gioBatDau.getTime()));

  // Sinh slot cho từng ca
  const allSlots = [];
  for (const llv of lichLamViecs) {
    if (!llv.khungGio) continue;

    const caStart = llv.khungGio.gioBatDau.getTime();
    const caEnd = llv.khungGio.gioKetThuc.getTime();
    const slotMs = thoiLuongKham * 60_000;

    let cursor = caStart;
    let sloted = 0;

    /**
     * THUẬT TOÁN SINH SLOT ĐỘNG:
     * Chạy vòng lặp đúng số lần 'soBenhNhanToiDa'.
     * Nếu Admin tăng con số này lên lố giờ ca hành chính,
     * vòng lặp while sẽ tự động đẻ thêm các Slot nằm ngoài ca (isOvertime = true).
     */
    while (sloted < llv.soBenhNhanToiDa) {
      const slotStart = new Date(cursor);
      const slotEnd = new Date(cursor + slotMs);

      allSlots.push({
        gioBatDau: formatTime(slotStart),
        gioKetThuc: formatTime(slotEnd),
        daDat: bookedTimes.has(cursor), // Slot này đã có BN khác book chưa?
        lichLamViecId: llv.id,
        conTrong: llv.soBenhNhanHienTai < llv.soBenhNhanToiDa,
        isOvertime: cursor + slotMs > caEnd, // Cờ báo hiệu đây là slot làm thêm giờ
      });

      cursor += slotMs;
      sloted++;
    }
  }

  return {
    bacSi: {
      id: bacSi.id,
      tenBacSi: bacSi.tenBacSi,
      chuyenKhoa: bacSi.chuyenKhoa?.tenChuyenKhoa,
      thoiLuongKham,
    },
    ngayDat,
    slots: allSlots,
    slotTrong: allSlots.filter((s) => !s.daDat && s.conTrong),
  };
};

/**
 * Cập nhật Trạng thái Thanh toán (0: Chưa, 1: Tiền khám, 2: Toàn bộ)
 * Dùng cho Admin (xác nhận offline) hoặc hệ thống (xác nhận thanh toán online).
 */
const updateThanhToan = async (id, trangThaiThanhToan) => {
  const existing = await prisma.datLich.findUnique({
    where: { id: BigInt(id) },
  });
  if (!existing) throw new AppError("Không tìm thấy lịch hẹn", 404);

  return prisma.datLich.update({
    where: { id: BigInt(id) },
    data: { trangThaiThanhToan: Number(trangThaiThanhToan) },
    include: defaultInclude,
  });
};

module.exports = {
  getAll,
  getById,
  getByBenhNhan,
  getByBacSi,
  create,
  updateTrangThai,
  updateThanhToan,
  remove,
  getSlotTrong,
};
