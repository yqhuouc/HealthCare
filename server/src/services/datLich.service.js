/**
 * ============================================================================
 * DAT LICH SERVICE (DỊCH VỤ QUẢN LÝ LỊCH HẸN)
 * ============================================================================
 * Chịu trách nhiệm xử lý toàn bộ logic nghiệp vụ liên quan đến lịch hẹn:
 * - Tra cứu: Tìm kiếm slot khám bệnh, xem lịch sử theo bệnh nhân/bác sĩ.
 * - Đặt lịch: Kiểm tra công suất ca trực (Capacity), tính toán giờ kết thúc,
 *   đảm bảo tính toàn vẹn dữ liệu qua Transaction.
 * - Cập nhật/Xóa: Thay đổi trạng thái, thanh toán, giải phóng slot khi hủy.
 *
 * Tính năng nổi bật: "Nới ca (Overtime)" - Tự động sinh slot ngoài giờ hành chính
 * nếu Admin tăng giới hạn số lượng bệnh nhân của ca làm việc.
 */

const prisma = require("../utils/prisma");
const { AppError } = require("../middlewares/error.middleware");
const { dayjs, vnDay } = require("../utils/dateUtils");

// ============================================================================
// 1. TIỆN ÍCH XỬ LÝ THỜI GIAN VÀ DỮ LIỆU
// ============================================================================

/**
 * Chuyển đổi chuỗi "HH:mm" thành đối tượng Date thông qua Day.js.
 * Cố định mốc ngày 2000-01-01 để chuẩn hóa việc so sánh giờ.
 *
 * @param {string} timeStr - Chuỗi thời gian định dạng "HH:mm"
 * @returns {Date} Đối tượng Date
 */
const parseTime = (timeStr) => {
  return vnDay(`2000-01-01T${timeStr}:00`).toDate();
};

/**
 * Định dạng đối tượng Date thành chuỗi "HH:mm" chuẩn theo múi giờ Việt Nam.
 *
 * @param {Date|string|number} date - Thời gian cần định dạng
 * @returns {string} Chuỗi hiển thị thời gian "HH:mm"
 */
const formatTime = (date) => {
  return dayjs.utc(date).year(2000).tz("Asia/Ho_Chi_Minh").format("HH:mm");
};

/**
 * Bình chuẩn hóa Date thành chuỗi "HH:mm" để so sánh,
 * bỏ qua mọi khác biệt về ngày/tháng/năm.
 *
 * @param {Date|string|number} date - Thời gian cần chuẩn hóa
 * @returns {string} Chuỗi "HH:mm"
 */
const normalizeTime = (date) => {
  return dayjs.utc(date).year(2000).tz("Asia/Ho_Chi_Minh").format("HH:mm");
};

/**
 * Ẩn các thông tin nhạy cảm (như Chi tiết Đơn thuốc) dựa trên quyền
 * và trạng thái thanh toán của người dùng hiện tại (Data Ownership).
 *
 * @param {Object|Array} data - Dữ liệu lịch hẹn cần xử lý
 * @param {Object} requestUser - Thông tin người dùng đang gọi API
 * @returns {Object|Array} Dữ liệu đã được làm sạch
 */
const redactSensitiveData = (data, requestUser) => {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item, requestUser));
  }

  // Khóa đơn thuốc nếu bệnh nhân chưa thanh toán đầy đủ (trangThaiThanhToan < 2)
  if (requestUser?.vaiTro === "benh_nhan" && data.trangThaiThanhToan < 2) {
    if (data.donThuoc) {
      data.donThuoc = {
        id: data.donThuoc.id,
        tongTien: data.donThuoc.tongTien, // Giữ lại tổng tiền để Frontend tạo giao dịch thanh toán
        message:
          "Vui lòng hoàn tất thanh toán để xem chi tiết đơn thuốc và kết quả khám.",
        isLocked: true,
      };
    }
  }

  return data;
};

/**
 * Cấu hình Prisma include mặc định để join các bảng liên quan.
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
  benhNhan: {
    select: {
      id: true,
      hoTen: true,
      soDienThoai: true,
      taiKhoan: { select: { anhDaiDien: true } },
    },
  },
  hinhThucThanhToan: true,
  lichLamViec: { include: { khungGio: true } },
  donThuoc: { include: { chiTietDonThuoc: true } },
};

// ============================================================================
// 2. CÁC NGHIỆP VỤ TRUY VẤN (QUERIES)
// ============================================================================

/**
 * Lấy danh sách toàn bộ lịch hẹn có phân trang (Chủ yếu dành cho Admin).
 * Hỗ trợ lọc theo trạng thái, ngày đặt và tìm kiếm đa năng.
 */
const getAll = async ({ trangThai, ngayDat, search, page = 1, limit = 10 }) => {
  const skip = (Number(page) - 1) * Number(limit);
  const where = {};

  if (trangThai !== undefined) where.trangThai = Number(trangThai);
  if (ngayDat) where.ngayDat = new Date(ngayDat);

  // Logic tìm kiếm đa năng (Mã lịch, Tên bác sĩ, Tên bệnh nhân)
  if (search) {
    let searchId = null;
    let searchString = search.trim();

    // Nếu bắt đầu bằng LK, ví dụ: LK25 -> lấy 25
    if (/^LK/i.test(searchString)) {
      const match = searchString.match(/^LK(\d+)$/i);
      if (match) searchId = match[1];
    } else if (/^\d+$/.test(searchString)) {
      // Nếu chỉ nhập số 25 -> searchId = 25
      searchId = searchString;
    }

    where.OR = [
      {
        bacSi: {
          tenBacSi: { contains: searchString, mode: "insensitive" },
        },
      },
      {
        benhNhan: {
          hoTen: { contains: searchString, mode: "insensitive" },
        },
      },
    ];

    // Chỉ thêm tìm kiếm theo ID nếu có giá trị ID hợp lệ
    if (searchId) {
      where.OR.push({ id: BigInt(searchId) });
    }
  }

  const [datLichs, total] = await Promise.all([
    prisma.datLich.findMany({
      where,
      include: defaultInclude,
      skip,
      take: Number(limit),
      orderBy: [{ ngayDat: "desc" }, { gioBatDau: "asc" }],
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
 * Lấy chi tiết một lịch hẹn cụ thể.
 * Tích hợp kiểm tra quyền truy cập: Bệnh nhân/Bác sĩ chỉ được xem lịch liên quan.
 */
const getById = async (id, requestUser) => {
  const datLich = await prisma.datLich.findUnique({
    where: { id: BigInt(id) },
    include: defaultInclude,
  });

  if (!datLich) throw new AppError("Không tìm thấy lịch hẹn", 404);

  // Bảo mật Data Ownership
  if (requestUser?.vaiTro === "benh_nhan") {
    if (
      !requestUser.benhNhan ||
      datLich.benhNhanId !== requestUser.benhNhan.id
    ) {
      throw new AppError("Bạn không có quyền xem lịch hẹn này", 403);
    }
  }

  if (requestUser?.vaiTro === "bac_si") {
    if (!requestUser.bacSi || datLich.bacSiId !== requestUser.bacSi.id) {
      throw new AppError("Bạn không có quyền xem lịch hẹn này", 403);
    }
  }

  return redactSensitiveData(datLich, requestUser);
};

/**
 * Lấy danh sách lịch sử khám bệnh của một bệnh nhân.
 * Chỉ cho phép chính Bệnh nhân đó hoặc Admin. Bác sĩ bị chặn.
 */
const getByBenhNhan = async (benhNhanId, requestUser) => {
  if (requestUser.vaiTro === "benh_nhan") {
    if (
      !requestUser.benhNhan ||
      BigInt(benhNhanId) !== requestUser.benhNhan.id
    ) {
      throw new AppError(
        "Bạn không có quyền xem lịch hẹn của bệnh nhân khác",
        403,
      );
    }
  }

  if (requestUser.vaiTro === "bac_si") {
    throw new AppError(
      "Bác sĩ không có quyền xem toàn bộ lịch sử khám của bệnh nhân",
      403,
    );
  }

  const results = await prisma.datLich.findMany({
    where: { benhNhanId: BigInt(benhNhanId) },
    include: defaultInclude,
    orderBy: [{ ngayDat: "desc" }, { gioBatDau: "asc" }],
  });

  return redactSensitiveData(results, requestUser);
};

/**
 * Lấy danh sách lịch hẹn thuộc về một bác sĩ cụ thể.
 * Chỉ cho phép chính Bác sĩ đó hoặc Admin truy cập.
 */
const getByBacSi = async (bacSiId, requestUser) => {
  if (requestUser.vaiTro === "bac_si") {
    if (!requestUser.bacSi || BigInt(bacSiId) !== requestUser.bacSi.id) {
      throw new AppError(
        "Bạn không có quyền xem lịch khám của bác sĩ khác",
        403,
      );
    }
  }

  if (requestUser.vaiTro === "benh_nhan") {
    throw new AppError(
      "Bệnh nhân không có quyền xem danh sách lịch khám của bác sĩ",
      403,
    );
  }

  return prisma.datLich.findMany({
    where: { bacSiId: BigInt(bacSiId) },
    include: defaultInclude,
    orderBy: [{ ngayDat: "desc" }, { gioBatDau: "asc" }],
  });
};

// ============================================================================
// 3. CÁC NGHIỆP VỤ THAY ĐỔI DỮ LIỆU (MUTATIONS)
// ============================================================================

/**
 * Đặt lịch mới (Quy trình lõi).
 * Bao gồm tính toán thời gian, kiểm tra công suất ca trực và ghi nhận qua Transaction.
 */
const create = async (data, requestUser = null) => {
  // Phân quyền (Data Ownership): Bệnh nhân chỉ được gửi lịch dưới tên mình
  if (requestUser?.vaiTro === "benh_nhan") {
    if (BigInt(data.benhNhanId) !== requestUser.benhNhan?.id) {
      throw new AppError("Bạn không có quyền đặt lịch khám cho bệnh nhân khác", 403);
    }
  }

  // 1. Xác thực thông tin liên đới
  const bacSi = await prisma.bacSi.findUnique({
    where: { id: BigInt(data.bacSiId) },
    include: { chuyenKhoa: { select: { thoiLuongKham: true } } },
  });
  if (!bacSi) throw new AppError("Không tìm thấy bác sĩ", 404);

  const benhNhan = await prisma.benhNhan.findUnique({
    where: { id: BigInt(data.benhNhanId) },
  });
  if (!benhNhan) throw new AppError("Không tìm thấy bệnh nhân", 404);

  // 2. Tính toán khung giờ
  const thoiLuongKham = bacSi.chuyenKhoa?.thoiLuongKham || 20;
  const gioBatDauDate = parseTime(data.gioBatDau);
  const gioKetThucDate = dayjs(gioBatDauDate).add(thoiLuongKham, "minute").toDate();

  // 3. Lấy danh sách ca làm việc hợp lệ trong ngày của bác sĩ
  const availableShifts = await prisma.lichLamViecBacSi.findMany({
    where: {
      bacSiId: BigInt(data.bacSiId),
      ngayLamViec: new Date(data.ngayDat),
      sanSang: 1, // Ca làm việc đang mở
    },
    include: { khungGio: true },
  });

  // 4. Đối chiếu giờ bắt đầu với các slot thời gian trong ca làm việc
  let lichLamViec = null;
  const slotMs = thoiLuongKham * 60_000;

  for (const shift of availableShifts) {
    if (!shift.khungGio) continue;

    let cursor = dayjs(shift.khungGio.gioBatDau);
    let sloted = 0;

    // Quét slot dựa trên sức chứa (soBenhNhanToiDa)
    while (sloted < shift.soBenhNhanToiDa) {
      if (cursor.format("HH:mm") === dayjs(gioBatDauDate).format("HH:mm")) {
        lichLamViec = shift;
        break;
      }
      cursor = cursor.add(slotMs, "millisecond");
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

  // 5. Kiểm tra sức chứa thực tế của ca
  if (lichLamViec.soBenhNhanHienTai >= lichLamViec.soBenhNhanToiDa) {
    throw new AppError(
      "Ca làm việc đã đầy hoặc không còn slot trống, vui lòng chọn ca khác.",
      400,
    );
  }

  // 6. Chống đặt trùng (Unique Constraint: Bác Sĩ + Ngày + Giờ)
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
      "Khung giờ này đã có người đăng ký, vui lòng chọn khung giờ khác.",
      409,
    );
  }

  // 7. Transaction: Ghi nhận lịch hẹn và phân bổ slot
  return prisma.$transaction(async (tx) => {
    // Lấy mã loại để phân luồng thanh toán (OFFLINE / VNPAY)
    const hinhThuc = await tx.hinhThucThanhToan.findUnique({
      where: { id: BigInt(data.hinhThucThanhToanId) },
    });

    const datLich = await tx.datLich.create({
      data: {
        ngayDat: new Date(data.ngayDat),
        gioBatDau: gioBatDauDate,
        gioKetThuc: gioKetThucDate,
        lyDoKham: data.lyDoKham,
        giaKham: data.giaKham ? parseFloat(data.giaKham) : bacSi.giaKham,
        trangThai: 0,
        trangThaiThanhToan: 0, // Luôn khởi tạo là 0, cập nhật qua VNPay IPN sau
        bacSiId: BigInt(data.bacSiId),
        benhNhanId: BigInt(data.benhNhanId),
        hinhThucThanhToanId: data.hinhThucThanhToanId
          ? BigInt(data.hinhThucThanhToanId)
          : null,
        lichLamViecId: lichLamViec.id,
      },
      include: defaultInclude,
    });

    // Tăng số lượng bệnh nhân đang chiếm dụng trong ca
    await tx.lichLamViecBacSi.update({
      where: { id: lichLamViec.id },
      data: { soBenhNhanHienTai: { increment: 1 } },
    });

    // Trả về kèm maLoai để controller xử lý redirect phí khám
    return {
      ...datLich,
      _maLoai: hinhThuc?.maLoai || "OFFLINE",
    };
  });
};

/**
 * Cập nhật trạng thái tổng thể của lịch hẹn.
 * Tự động hoàn trả slot cho ca làm việc nếu lịch bị Hủy (Trạng thái 3).
 */
const updateTrangThai = async (id, trangThai, requestUser = null) => {
  const existing = await prisma.datLich.findUnique({
    where: { id: BigInt(id) },
  });

  if (!existing) throw new AppError("Không tìm thấy lịch hẹn", 404);

  // Phân quyền (Data Ownership): Bác sĩ chỉ được cập nhật trạng thái lịch của chính mình
  if (requestUser?.vaiTro === "bac_si" && existing.bacSiId !== requestUser.bacSi?.id) {
    throw new AppError("Bạn không có quyền cập nhật trạng thái lịch hẹn của bác sĩ khác", 403);
  }

  const oldTrangThai = existing.trangThai;
  const newTrangThai = Number(trangThai);

  return prisma.$transaction(async (tx) => {
    const datLich = await tx.datLich.update({
      where: { id: BigInt(id) },
      data: { trangThai: newTrangThai },
      include: defaultInclude,
    });

    // Nếu vừa hủy lịch -> Giải phóng slot
    if (oldTrangThai !== 3 && newTrangThai === 3 && existing.lichLamViecId) {
      await tx.lichLamViecBacSi.update({
        where: { id: existing.lichLamViecId },
        data: { soBenhNhanHienTai: { decrement: 1 } },
      });
    }

    // Nếu khôi phục từ trạng thái hủy -> Chiếm lại slot
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
 * Cập nhật tiến độ thanh toán của lịch hẹn.
 * (0: Chưa thanh toán, 1: Thanh toán phí khám, 2: Hoàn tất toàn bộ).
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

/**
 * Xóa vĩnh viễn dữ liệu lịch hẹn (Hard Delete).
 * Đi kèm với các hệ quả: dọn dẹp đơn thuốc và trả lại sức chứa ca làm việc.
 */
const remove = async (id, requestUser) => {
  const existing = await prisma.datLich.findUnique({
    where: { id: BigInt(id) },
  });

  if (!existing) throw new AppError("Không tìm thấy dữ liệu để xóa", 404);

  if (requestUser.vaiTro === "benh_nhan") {
    const benhNhan = await prisma.benhNhan.findFirst({
      where: { taiKhoanId: requestUser.id },
    });
    if (!benhNhan || existing.benhNhanId !== benhNhan.id) {
      throw new AppError("Bạn không có quyền can thiệp vào lịch hẹn này", 403);
    }
  }

  // Phân quyền (Data Ownership): Bác sĩ không được xóa càn lịch của người khác
  if (requestUser.vaiTro === "bac_si" && existing.bacSiId !== requestUser.bacSi?.id) {
    throw new AppError("Bạn không có quyền xóa lịch khám của bệnh nhân thuộc bác sĩ khác", 403);
  }

  if (existing.trangThai === 1 || existing.trangThai === 2) {
    throw new AppError(
      "Không thể xóa cứng đối với lịch hẹn đã xác nhận hoặc đã khám.",
      400,
    );
  }

  await prisma.$transaction(async (tx) => {
    // Dọn dẹp dữ liệu con
    await tx.donThuoc.deleteMany({ where: { datLichId: BigInt(id) } });
    await tx.giaoDich.deleteMany({ where: { datLichId: BigInt(id) } });

    // Xóa bản ghi gốc
    await tx.datLich.delete({ where: { id: BigInt(id) } });

    // Khôi phục sức chứa nếu lịch chưa hủy
    if (existing.trangThai !== 3 && existing.lichLamViecId) {
      await tx.lichLamViecBacSi.update({
        where: { id: existing.lichLamViecId },
        data: { soBenhNhanHienTai: { decrement: 1 } },
      });
    }
  });
};

/**
 * Lấy danh sách các Slot khả dụng để Bệnh nhân đặt lịch trên Website.
 * Kết hợp thông vị ca làm việc và danh sách các lịch đã book để trả về các Slot còn chỗ.
 */
const getSlotTrong = async ({ bacSiId, ngayDat }) => {
  if (!bacSiId || !ngayDat) {
    throw new AppError("Yêu cầu thông tin Bác sĩ và Ngày đặt", 400);
  }

  const bacSi = await prisma.bacSi.findUnique({
    where: { id: BigInt(bacSiId) },
    include: {
      chuyenKhoa: { select: { thoiLuongKham: true, tenChuyenKhoa: true } },
    },
  });

  if (!bacSi) throw new AppError("Không tìm thấy bác sĩ", 404);

  const thoiLuongKham = bacSi.chuyenKhoa?.thoiLuongKham || 20;

  // Thu thập các ca làm việc khả dụng
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

  // Thu thập danh sách Slot đã bị chiếm dụng
  const datLichs = await prisma.datLich.findMany({
    where: {
      bacSiId: BigInt(bacSiId),
      ngayDat: new Date(ngayDat),
      trangThai: { not: 3 }, // Bỏ qua những lịch đã hủy
    },
    select: { gioBatDau: true },
  });

  const bookedTimes = new Set(datLichs.map((d) => d.gioBatDau.getTime()));
  const allSlots = [];

  for (const llv of lichLamViecs) {
    if (!llv.khungGio) continue;

    const caStart = llv.khungGio.gioBatDau.getTime();
    const caEnd = llv.khungGio.gioKetThuc.getTime();
    const slotMs = thoiLuongKham * 60_000;

    let cursor = dayjs(llv.khungGio.gioBatDau);
    let sloted = 0;

    // Sinh các danh sách Slot linh động theo mức tối đa cho phép
    while (sloted < llv.soBenhNhanToiDa) {
      const slotStart = cursor.toDate();
      const slotEnd = cursor.add(slotMs, "millisecond").toDate();

      allSlots.push({
        gioBatDau: formatTime(slotStart),
        gioKetThuc: formatTime(slotEnd),
        daDat: bookedTimes.has(cursor.valueOf()),
        lichLamViecId: llv.id,
        conTrong: llv.soBenhNhanHienTai < llv.soBenhNhanToiDa,
        isOvertime: cursor.add(slotMs, "millisecond").isAfter(dayjs(llv.khungGio.gioKetThuc)), // Cờ báo làm thêm giờ
      });

      cursor = cursor.add(slotMs, "millisecond");
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
