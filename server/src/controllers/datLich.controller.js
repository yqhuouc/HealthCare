/**
 * ============================================================
 * CONTROLLER: Đặt lịch (Appointment)
 * ============================================================
 * - GET    /api/dat-lich                → Lấy tất cả lịch hẹn (admin)
 * - GET    /api/dat-lich/:id            → Lấy chi tiết 1 lịch hẹn
 * - GET    /api/dat-lich/benh-nhan/:id  → Lấy lịch hẹn theo bệnh nhân
 * - GET    /api/dat-lich/bac-si/:id     → Lấy lịch hẹn theo bác sĩ
 * - POST   /api/dat-lich                → Tạo lịch hẹn mới
 * - PUT    /api/dat-lich/:id/trang-thai → Cập nhật trạng thái
 * - DELETE /api/dat-lich/:id            → Hủy/xóa lịch hẹn
 * ============================================================
 *
 * TRẠNG THÁI LỊCH HẸN:
 * 0 = Chờ xác nhận
 * 1 = Đã xác nhận
 * 2 = Đã khám xong
 * 3 = Đã hủy
 * ============================================================
 */
const prisma = require("../utils/prisma");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * Helper: chuyển chuỗi "HH:mm" thành Date object (Prisma cần kiểu Date cho Time).
 * PostgreSQL lưu TIME nhưng Prisma cần DateTime → dùng ngày mặc định 1970-01-01.
 */
const parseTime = (timeStr) => new Date(`1970-01-01T${timeStr}:00.000Z`);

// Include mặc định khi query đặt lịch (tránh lặp code)
const defaultInclude = {
  bacSi: {
    select: { id: true, tenBacSi: true, hocViChucDanh: true, chuyenKhoa: { select: { tenChuyenKhoa: true } } },
  },
  benhNhan: {
    select: { id: true, hoTen: true, soDienThoai: true },
  },
  hinhThucThanhToan: true,
  donThuoc: true,
};

const getAll = async (req, res) => {
  const { trangThai, ngayDat, page = 1, limit = 10 } = req.query;
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

  return sendSuccess(res, {
    datLichs,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
  }, "Lấy danh sách lịch hẹn thành công");
};

const getById = async (req, res) => {
  const { id } = req.params;

  const datLich = await prisma.datLich.findUnique({
    where: { id: BigInt(id) },
    include: defaultInclude,
  });

  if (!datLich) return sendError(res, "Không tìm thấy lịch hẹn", 404);
  return sendSuccess(res, datLich, "Lấy chi tiết lịch hẹn thành công");
};

const getByBenhNhan = async (req, res) => {
  const { id } = req.params;

  const datLichs = await prisma.datLich.findMany({
    where: { benhNhanId: BigInt(id) },
    include: defaultInclude,
    orderBy: [{ ngayDat: "desc" }, { gioBatDau: "asc" }],
  });

  return sendSuccess(res, datLichs, "Lấy lịch hẹn theo bệnh nhân thành công");
};

const getByBacSi = async (req, res) => {
  const { id } = req.params;

  const datLichs = await prisma.datLich.findMany({
    where: { bacSiId: BigInt(id) },
    include: defaultInclude,
    orderBy: [{ ngayDat: "desc" }, { gioBatDau: "asc" }],
  });

  return sendSuccess(res, datLichs, "Lấy lịch hẹn theo bác sĩ thành công");
};

/**
 * TẠO LỊCH HẸN MỚI.
 *
 * Logic chính:
 * 1. Kiểm tra bác sĩ và bệnh nhân tồn tại
 * 2. Kiểm tra trùng lịch (unique constraint: bacSiId + ngayDat + gioBatDau)
 * 3. Lấy giá khám từ bác sĩ (nếu client không gửi)
 * 4. Tạo record DatLich
 *
 * Ràng buộc CSDL unique_lich sẽ ngăn trùng lịch ở tầng DB,
 * nhưng ta kiểm tra trước ở code để trả lỗi thân thiện hơn.
 */
const create = async (req, res) => {
  const { ngayDat, gioBatDau, gioKetThuc, lyDoKham, bacSiId, benhNhanId, hinhThucThanhToanId, giaKham } = req.body;

  // 1. Kiểm tra bác sĩ tồn tại
  const bacSi = await prisma.bacSi.findUnique({ where: { id: BigInt(bacSiId) } });
  if (!bacSi) return sendError(res, "Không tìm thấy bác sĩ", 404);

  // 2. Kiểm tra bệnh nhân tồn tại
  const benhNhan = await prisma.benhNhan.findUnique({ where: { id: BigInt(benhNhanId) } });
  if (!benhNhan) return sendError(res, "Không tìm thấy bệnh nhân", 404);

  // 3. Kiểm tra trùng lịch: cùng bác sĩ + cùng ngày + cùng giờ bắt đầu
  const trungLich = await prisma.datLich.findUnique({
    where: {
      unique_lich: {
        bacSiId: BigInt(bacSiId),
        ngayDat: new Date(ngayDat),
        gioBatDau: parseTime(gioBatDau),
      },
    },
  });

  if (trungLich) {
    return sendError(res, "Bác sĩ đã có lịch hẹn vào khung giờ này. Vui lòng chọn giờ khác.", 409);
  }

  // 4. Tạo lịch hẹn
  const datLich = await prisma.datLich.create({
    data: {
      ngayDat: new Date(ngayDat),
      gioBatDau: parseTime(gioBatDau),
      gioKetThuc: parseTime(gioKetThuc),
      lyDoKham,
      giaKham: giaKham ? parseFloat(giaKham) : bacSi.giaKham,
      trangThai: 0, // mặc định: chờ xác nhận
      bacSiId: BigInt(bacSiId),
      benhNhanId: BigInt(benhNhanId),
      hinhThucThanhToanId: hinhThucThanhToanId ? BigInt(hinhThucThanhToanId) : null,
    },
    include: defaultInclude,
  });

  return sendSuccess(res, datLich, "Đặt lịch thành công", 201);
};

/**
 * CẬP NHẬT TRẠNG THÁI lịch hẹn.
 * Chỉ admin và bác sĩ mới được cập nhật.
 */
const updateTrangThai = async (req, res) => {
  const { id } = req.params;
  const { trangThai } = req.body;

  const existing = await prisma.datLich.findUnique({ where: { id: BigInt(id) } });
  if (!existing) return sendError(res, "Không tìm thấy lịch hẹn", 404);

  const datLich = await prisma.datLich.update({
    where: { id: BigInt(id) },
    data: { trangThai: Number(trangThai) },
    include: defaultInclude,
  });

  return sendSuccess(res, datLich, "Cập nhật trạng thái lịch hẹn thành công");
};

const remove = async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.datLich.findUnique({ where: { id: BigInt(id) } });
  if (!existing) return sendError(res, "Không tìm thấy lịch hẹn", 404);

  // Chỉ cho phép xóa lịch hẹn đang ở trạng thái "chờ xác nhận" hoặc "đã hủy"
  if (existing.trangThai === 1 || existing.trangThai === 2) {
    return sendError(res, "Không thể xóa lịch hẹn đã xác nhận hoặc đã khám", 400);
  }

  // Xóa đơn thuốc liên kết (nếu có) trước khi xóa lịch hẹn
  await prisma.$transaction(async (tx) => {
    await tx.donThuoc.deleteMany({ where: { datLichId: BigInt(id) } });
    await tx.datLich.delete({ where: { id: BigInt(id) } });
  });

  return sendSuccess(res, null, "Xóa lịch hẹn thành công");
};

module.exports = { getAll, getById, getByBenhNhan, getByBacSi, create, updateTrangThai, remove };
