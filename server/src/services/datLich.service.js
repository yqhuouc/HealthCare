/**
 * Lịch hẹn (datLich): admin xem tất cả; bệnh nhân/bác sĩ xem theo ownership.
 * Tạo lịch: tự tính gioKetThuc từ thoiLuongKham, check ca + capacity, transaction.
 * Xóa/hủy: giảm soBenhNhanHienTai trong LichLamViecBacSi.
 */
const prisma = require("../utils/prisma");
const { AppError } = require("../middlewares/error.middleware");

// Chuỗi "HH:mm" → Date (cùng ngày epoch, timezone VN UTC+7) để lưu/so khớp Prisma
const parseTime = (timeStr) => new Date(`1970-01-01T${timeStr}:00.000+07:00`);

// Date → "HH:mm" theo giờ VN
const formatTime = (date) => {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(date));
};

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

// ─── GET /dat-lich ──────────────────────────────────────────────
const getAll = async ({ trangThai, ngayDat, page = 1, limit = 10 }) => {
  const skip = (Number(page) - 1) * Number(limit);
  const where = {};
  if (trangThai !== undefined) where.trangThai = Number(trangThai);
  if (ngayDat) where.ngayDat = new Date(ngayDat);

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

const getById = async (id) => {
  const datLich = await prisma.datLich.findUnique({
    where: { id: BigInt(id) },
    include: defaultInclude,
  });
  if (!datLich) throw new AppError("Không tìm thấy lịch hẹn", 404);
  return datLich;
};

const getByBenhNhan = async (benhNhanId, requestUser) => {
  if (requestUser.vaiTro === "benh_nhan") {
    const benhNhan = await prisma.benhNhan.findUnique({
      where: { id: BigInt(benhNhanId) },
    });
    if (!benhNhan || benhNhan.taiKhoanId !== requestUser.id) {
      throw new AppError("Bạn không có quyền xem lịch hẹn này", 403);
    }
  }

  return prisma.datLich.findMany({
    where: { benhNhanId: BigInt(benhNhanId) },
    include: defaultInclude,
    orderBy: [{ ngayDat: "desc" }, { gioBatDau: "asc" }],
  });
};

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

// ─── POST /dat-lich ─────────────────────────────────────────────
// Flow: tìm BS → tính gioKetThuc → tìm ca phù hợp → check capacity → transaction
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

  // 2. Tính gioKetThuc = gioBatDau + thoiLuongKham (phút)
  const thoiLuongKham = bacSi.chuyenKhoa?.thoiLuongKham || 20;
  const gioBatDauDate = parseTime(data.gioBatDau);
  const gioKetThucDate = new Date(
    gioBatDauDate.getTime() + thoiLuongKham * 60_000,
  );

  // 3. Lấy tất cả các ca làm việc của bác sĩ trong ngày (đang mở)
  const availableShifts = await prisma.lichLamViecBacSi.findMany({
    where: {
      bacSiId: BigInt(data.bacSiId),
      ngayLamViec: new Date(data.ngayDat),
      sanSang: 1,
    },
    include: { khungGio: true },
  });

  // 4. Tìm ca làm việc nào đang "chứa" cái slot mà user request bằng vòng lặp y như getSlotTrong
  let lichLamViec = null;
  const requestedSlotStart = gioBatDauDate.getTime();
  const slotMs = thoiLuongKham * 60_000;

  for (const shift of availableShifts) {
    if (!shift.khungGio) continue;

    let cursor = shift.khungGio.gioBatDau.getTime();
    let sloted = 0;

    // Tự động quét các slot dựa theo giới hạn capacity (hỗ trợ Admin thêm giờ lố)
    while (sloted < shift.soBenhNhanToiDa) {
      if (cursor === requestedSlotStart) {
        lichLamViec = shift;
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

  // 4. Check capacity
  if (lichLamViec.soBenhNhanHienTai >= lichLamViec.soBenhNhanToiDa) {
    throw new AppError("Ca làm việc đã đầy, vui lòng chọn khung giờ khác", 400);
  }

  // 5. Check trùng slot (unique constraint cũng sẽ bắt, nhưng check trước cho UX tốt hơn)
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
    throw new AppError("Slot này đã được đặt. Vui lòng chọn giờ khác.", 409);
  }

  // 6. Transaction: tạo lịch + cập nhật capacity
  return prisma.$transaction(async (tx) => {
    const datLich = await tx.datLich.create({
      data: {
        ngayDat: new Date(data.ngayDat),
        gioBatDau: gioBatDauDate,
        gioKetThuc: gioKetThucDate,
        lyDoKham: data.lyDoKham,
        giaKham: data.giaKham ? parseFloat(data.giaKham) : bacSi.giaKham,
        trangThai: 0,
        bacSiId: BigInt(data.bacSiId),
        benhNhanId: BigInt(data.benhNhanId),
        hinhThucThanhToanId: data.hinhThucThanhToanId
          ? BigInt(data.hinhThucThanhToanId)
          : null,
        lichLamViecId: lichLamViec.id,
      },
      include: defaultInclude,
    });

    await tx.lichLamViecBacSi.update({
      where: { id: lichLamViec.id },
      data: { soBenhNhanHienTai: { increment: 1 } },
    });

    return datLich;
  });
};

// ─── PUT /dat-lich/:id/trang-thai ───────────────────────────────
// Khi hủy (trangThai = 3): giảm capacity. Khi khôi phục từ hủy: tăng lại.
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

// ─── DELETE /dat-lich/:id ───────────────────────────────────────
const remove = async (id, requestUser) => {
  const existing = await prisma.datLich.findUnique({
    where: { id: BigInt(id) },
  });
  if (!existing) throw new AppError("Không tìm thấy lịch hẹn", 404);

  if (requestUser.vaiTro === "benh_nhan") {
    const benhNhan = await prisma.benhNhan.findFirst({
      where: { taiKhoanId: requestUser.id },
    });
    if (!benhNhan || existing.benhNhanId !== benhNhan.id) {
      throw new AppError("Bạn không có quyền xóa lịch hẹn này", 403);
    }
  }

  if (existing.trangThai === 1 || existing.trangThai === 2) {
    throw new AppError("Không thể xóa lịch hẹn đã xác nhận hoặc đã khám", 400);
  }

  await prisma.$transaction(async (tx) => {
    await tx.donThuoc.deleteMany({ where: { datLichId: BigInt(id) } });
    await tx.datLich.delete({ where: { id: BigInt(id) } });

    // Giảm capacity nếu lịch chưa bị hủy trước đó
    if (existing.trangThai !== 3 && existing.lichLamViecId) {
      await tx.lichLamViecBacSi.update({
        where: { id: existing.lichLamViecId },
        data: { soBenhNhanHienTai: { decrement: 1 } },
      });
    }
  });
};

// ─── GET /dat-lich/slot-trong?bacSiId=1&ngayDat=2026-03-26 ─────
// Sinh danh sách slot trống cho FE hiển thị
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

    // Sinh slot dựa trên Công Suất Tối Đa (soBenhNhanToiDa) thay vì chốt chặn Giờ Kết Thúc
    // Điều này cho phép Admin "nới ca" thêm giờ lố bằng cách tăng soBenhNhanToiDa
    while (sloted < llv.soBenhNhanToiDa) {
      const slotStart = new Date(cursor);
      const slotEnd = new Date(cursor + slotMs);

      allSlots.push({
        gioBatDau: formatTime(slotStart),
        gioKetThuc: formatTime(slotEnd),
        daDat: bookedTimes.has(cursor),
        lichLamViecId: llv.id,
        conTrong: llv.soBenhNhanHienTai < llv.soBenhNhanToiDa,
        isOvertime: cursor + slotMs > caEnd, // true nếu slot này vượt ra ngoài giờ hành chính của ca
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

module.exports = {
  getAll,
  getById,
  getByBenhNhan,
  getByBacSi,
  create,
  updateTrangThai,
  remove,
  getSlotTrong,
};
