const prisma = require("../utils/prisma");
const { AppError } = require("../middlewares/error.middleware");

const parseTime = (timeStr) => new Date(`1970-01-01T${timeStr}:00.000Z`);

const defaultInclude = {
  bacSi: {
    select: { id: true, tenBacSi: true, hocViChucDanh: true, chuyenKhoa: { select: { tenChuyenKhoa: true } } },
  },
  benhNhan: { select: { id: true, hoTen: true, soDienThoai: true } },
  hinhThucThanhToan: true,
  donThuoc: { include: { chiTietDonThuoc: true } },
};

const getAll = async ({ trangThai, ngayDat, page = 1, limit = 10 }) => {
  const skip = (Number(page) - 1) * Number(limit);
  const where = {};
  if (trangThai !== undefined) where.trangThai = Number(trangThai);
  if (ngayDat) where.ngayDat = new Date(ngayDat);

  const [datLichs, total] = await Promise.all([
    prisma.datLich.findMany({
      where, include: defaultInclude, skip, take: Number(limit),
      orderBy: [{ ngayDat: "desc" }, { gioBatDau: "asc" }],
    }),
    prisma.datLich.count({ where }),
  ]);

  return {
    datLichs,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
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
  // Kiểm tra ownership: bệnh nhân chỉ xem lịch của mình
  if (requestUser.vaiTro === "benh_nhan") {
    const benhNhan = await prisma.benhNhan.findUnique({ where: { id: BigInt(benhNhanId) } });
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
  // Kiểm tra ownership: bác sĩ chỉ xem lịch của mình
  if (requestUser.vaiTro === "bac_si") {
    const bacSi = await prisma.bacSi.findUnique({ where: { id: BigInt(bacSiId) } });
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

const create = async (data) => {
  const bacSi = await prisma.bacSi.findUnique({ where: { id: BigInt(data.bacSiId) } });
  if (!bacSi) throw new AppError("Không tìm thấy bác sĩ", 404);

  const benhNhan = await prisma.benhNhan.findUnique({ where: { id: BigInt(data.benhNhanId) } });
  if (!benhNhan) throw new AppError("Không tìm thấy bệnh nhân", 404);

  // Kiểm tra bác sĩ có lịch làm việc cho ngày này không
  const lichLamViec = await prisma.lichLamViecBacSi.findFirst({
    where: {
      bacSiId: BigInt(data.bacSiId),
      ngayLamViec: new Date(data.ngayDat),
      sanSang: 1,
    },
  });

  if (!lichLamViec) {
    throw new AppError("Bác sĩ không có lịch làm việc vào ngày này", 400);
  }

  // Kiểm tra trùng lịch
  const trungLich = await prisma.datLich.findUnique({
    where: {
      unique_lich: {
        bacSiId: BigInt(data.bacSiId),
        ngayDat: new Date(data.ngayDat),
        gioBatDau: parseTime(data.gioBatDau),
      },
    },
  });

  if (trungLich) {
    throw new AppError("Bác sĩ đã có lịch hẹn vào khung giờ này. Vui lòng chọn giờ khác.", 409);
  }

  return prisma.datLich.create({
    data: {
      ngayDat: new Date(data.ngayDat),
      gioBatDau: parseTime(data.gioBatDau),
      gioKetThuc: parseTime(data.gioKetThuc),
      lyDoKham: data.lyDoKham,
      giaKham: data.giaKham ? parseFloat(data.giaKham) : bacSi.giaKham,
      trangThai: 0,
      bacSiId: BigInt(data.bacSiId),
      benhNhanId: BigInt(data.benhNhanId),
      hinhThucThanhToanId: data.hinhThucThanhToanId ? BigInt(data.hinhThucThanhToanId) : null,
    },
    include: defaultInclude,
  });
};

const updateTrangThai = async (id, trangThai) => {
  const existing = await prisma.datLich.findUnique({ where: { id: BigInt(id) } });
  if (!existing) throw new AppError("Không tìm thấy lịch hẹn", 404);

  return prisma.datLich.update({
    where: { id: BigInt(id) },
    data: { trangThai: Number(trangThai) },
    include: defaultInclude,
  });
};

const remove = async (id, requestUser) => {
  const existing = await prisma.datLich.findUnique({ where: { id: BigInt(id) } });
  if (!existing) throw new AppError("Không tìm thấy lịch hẹn", 404);

  // Ownership check: bệnh nhân chỉ xóa lịch của mình
  if (requestUser.vaiTro === "benh_nhan") {
    const benhNhan = await prisma.benhNhan.findFirst({ where: { taiKhoanId: requestUser.id } });
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
  });
};

module.exports = { getAll, getById, getByBenhNhan, getByBacSi, create, updateTrangThai, remove };
