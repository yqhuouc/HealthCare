/**
 * Master khungGio (ca làm lớn) + lichLamViecBacSi (bác sĩ + ngày + khung).
 * Parse "HH:mm" lưu kiểu Date; xóa khung giờ chỉ khi không còn lịch dùng.
 * Validate giờ bắt đầu < giờ kết thúc.
 */
const prisma = require("../utils/prisma");
const { AppError } = require("../middlewares/error.middleware");

const parseTime = (timeStr) => new Date(`1970-01-01T${timeStr}:00.000Z`);

// --- Khung giờ (Ca làm việc) ---

const getAllKhungGio = async () => {
  return prisma.khungGio.findMany({ orderBy: { gioBatDau: "asc" } });
};

const createKhungGio = async (data) => {
  const gioBatDau = parseTime(data.gioBatDau);
  const gioKetThuc = parseTime(data.gioKetThuc);

  // Double-check: giờ kết thúc phải sau giờ bắt đầu (validation Zod cũng đã check)
  if (gioKetThuc <= gioBatDau) {
    throw new AppError("Giờ kết thúc phải sau giờ bắt đầu", 400);
  }

  return prisma.khungGio.create({
    data: { gioBatDau, gioKetThuc },
  });
};

const deleteKhungGio = async (id) => {
  const existing = await prisma.khungGio.findUnique({
    where: { id: BigInt(id) },
  });
  if (!existing) throw new AppError("Không tìm thấy khung giờ", 404);

  const usageCount = await prisma.lichLamViecBacSi.count({
    where: { khungGioId: BigInt(id) },
  });
  if (usageCount > 0) {
    throw new AppError(
      `Không thể xóa vì khung giờ đang được ${usageCount} lịch sử dụng`,
      400,
    );
  }

  await prisma.khungGio.delete({ where: { id: BigInt(id) } });
};

// --- Lịch làm việc bác sĩ ---

// Query: bacSiId, ngayLamViec (tuỳ chọn)
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
          chuyenKhoa: { select: { tenChuyenKhoa: true, thoiLuongKham: true } },
        },
      },
      khungGio: true,
      _count: { select: { datLichs: true } },
    },
    orderBy: [{ ngayLamViec: "asc" }, { khungGio: { gioBatDau: "asc" } }],
  });
};

// Một bác sĩ + một ngày + một khung chỉ một bản ghi
// Tự tính soBenhNhanToiDa nếu không truyền: dựa trên thoiLuongKham
const createLichLamViec = async (data) => {
  const bacSi = await prisma.bacSi.findUnique({
    where: { id: BigInt(data.bacSiId) },
    include: { chuyenKhoa: { select: { thoiLuongKham: true } } },
  });
  if (!bacSi) throw new AppError("Không tìm thấy bác sĩ", 404);

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
      soBenhNhanToiDa,
      sanSang: 1,
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

const updateLichLamViec = async (id, data) => {
  const existing = await prisma.lichLamViecBacSi.findUnique({
    where: { id: BigInt(id) },
  });
  if (!existing) throw new AppError("Không tìm thấy lịch làm việc", 404);

  return prisma.lichLamViecBacSi.update({
    where: { id: BigInt(id) },
    data: {
      sanSang: data.sanSang !== undefined ? data.sanSang : undefined,
      soBenhNhanHienTai:
        data.soBenhNhanHienTai !== undefined
          ? data.soBenhNhanHienTai
          : undefined,
      soBenhNhanToiDa:
        data.soBenhNhanToiDa !== undefined ? data.soBenhNhanToiDa : undefined,
    },
  });
};

const deleteLichLamViec = async (id) => {
  const existing = await prisma.lichLamViecBacSi.findUnique({
    where: { id: BigInt(id) },
  });
  if (!existing) throw new AppError("Không tìm thấy lịch làm việc", 404);

  // Kiểm tra có lịch hẹn nào đang dùng ca này không
  const datLichCount = await prisma.datLich.count({
    where: { lichLamViecId: BigInt(id), trangThai: { notIn: [3] } },
  });
  if (datLichCount > 0) {
    throw new AppError(
      `Không thể xóa vì ca đang có ${datLichCount} lịch hẹn chưa hủy`,
      400,
    );
  }

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
