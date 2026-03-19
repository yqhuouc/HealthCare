/**
 * ============================================================
 * CONTROLLER: Lịch làm việc bác sĩ + Khung giờ
 * ============================================================
 * KHUNG GIỜ:
 * - GET    /api/lich-lam-viec/khung-gio       → Lấy tất cả khung giờ
 * - POST   /api/lich-lam-viec/khung-gio       → Tạo khung giờ mới
 * - DELETE /api/lich-lam-viec/khung-gio/:id   → Xóa khung giờ
 *
 * LỊCH LÀM VIỆC:
 * - GET    /api/lich-lam-viec                  → Lấy lịch theo ngày + bác sĩ
 * - POST   /api/lich-lam-viec                  → Tạo lịch làm việc
 * - PUT    /api/lich-lam-viec/:id              → Cập nhật trạng thái sẵn sàng
 * - DELETE /api/lich-lam-viec/:id              → Xóa lịch làm việc
 * ============================================================
 */
const prisma = require("../utils/prisma");
const { sendSuccess, sendError } = require("../utils/response");

const parseTime = (timeStr) => new Date(`1970-01-01T${timeStr}:00.000Z`);

// ===== KHUNG GIỜ =====

const getAllKhungGio = async (req, res) => {
  const khungGios = await prisma.khungGio.findMany({
    orderBy: { gioBatDau: "asc" },
  });
  return sendSuccess(res, khungGios, "Lấy danh sách khung giờ thành công");
};

const createKhungGio = async (req, res) => {
  const { gioBatDau, gioKetThuc } = req.body;

  const khungGio = await prisma.khungGio.create({
    data: {
      gioBatDau: parseTime(gioBatDau),
      gioKetThuc: parseTime(gioKetThuc),
    },
  });

  return sendSuccess(res, khungGio, "Tạo khung giờ thành công", 201);
};

const deleteKhungGio = async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.khungGio.findUnique({ where: { id: BigInt(id) } });
  if (!existing) return sendError(res, "Không tìm thấy khung giờ", 404);

  // Kiểm tra khung giờ đang được sử dụng
  const usageCount = await prisma.lichLamViecBacSi.count({ where: { khungGioId: BigInt(id) } });
  if (usageCount > 0) {
    return sendError(res, `Không thể xóa vì khung giờ đang được ${usageCount} lịch sử dụng`, 400);
  }

  await prisma.khungGio.delete({ where: { id: BigInt(id) } });
  return sendSuccess(res, null, "Xóa khung giờ thành công");
};

// ===== LỊCH LÀM VIỆC =====

/**
 * Lấy lịch làm việc. Query params:
 * - bacSiId: lọc theo bác sĩ (bắt buộc hoặc tùy chọn)
 * - ngayLamViec: lọc theo ngày cụ thể
 */
const getLichLamViec = async (req, res) => {
  const { bacSiId, ngayLamViec } = req.query;

  const where = {};
  if (bacSiId) where.bacSiId = BigInt(bacSiId);
  if (ngayLamViec) where.ngayLamViec = new Date(ngayLamViec);

  const lichLamViecs = await prisma.lichLamViecBacSi.findMany({
    where,
    include: {
      bacSi: { select: { id: true, tenBacSi: true } },
      khungGio: true,
    },
    orderBy: [{ ngayLamViec: "asc" }, { khungGio: { gioBatDau: "asc" } }],
  });

  return sendSuccess(res, lichLamViecs, "Lấy lịch làm việc thành công");
};

const createLichLamViec = async (req, res) => {
  const { ngayLamViec, bacSiId, khungGioId } = req.body;

  // Kiểm tra bác sĩ tồn tại
  const bacSi = await prisma.bacSi.findUnique({ where: { id: BigInt(bacSiId) } });
  if (!bacSi) return sendError(res, "Không tìm thấy bác sĩ", 404);

  // Kiểm tra khung giờ tồn tại
  const khungGio = await prisma.khungGio.findUnique({ where: { id: BigInt(khungGioId) } });
  if (!khungGio) return sendError(res, "Không tìm thấy khung giờ", 404);

  // Kiểm tra trùng: cùng bác sĩ + cùng ngày + cùng khung giờ
  const existing = await prisma.lichLamViecBacSi.findFirst({
    where: {
      bacSiId: BigInt(bacSiId),
      ngayLamViec: new Date(ngayLamViec),
      khungGioId: BigInt(khungGioId),
    },
  });

  if (existing) {
    return sendError(res, "Bác sĩ đã có lịch làm việc vào khung giờ này", 409);
  }

  const lichLamViec = await prisma.lichLamViecBacSi.create({
    data: {
      ngayLamViec: new Date(ngayLamViec),
      soBenhNhanHienTai: 0,
      sanSang: 1,
      bacSiId: BigInt(bacSiId),
      khungGioId: BigInt(khungGioId),
    },
    include: {
      bacSi: { select: { id: true, tenBacSi: true } },
      khungGio: true,
    },
  });

  return sendSuccess(res, lichLamViec, "Tạo lịch làm việc thành công", 201);
};

const updateLichLamViec = async (req, res) => {
  const { id } = req.params;
  const { sanSang, soBenhNhanHienTai } = req.body;

  const existing = await prisma.lichLamViecBacSi.findUnique({ where: { id: BigInt(id) } });
  if (!existing) return sendError(res, "Không tìm thấy lịch làm việc", 404);

  const lichLamViec = await prisma.lichLamViecBacSi.update({
    where: { id: BigInt(id) },
    data: {
      sanSang: sanSang !== undefined ? sanSang : undefined,
      soBenhNhanHienTai: soBenhNhanHienTai !== undefined ? soBenhNhanHienTai : undefined,
    },
  });

  return sendSuccess(res, lichLamViec, "Cập nhật lịch làm việc thành công");
};

const deleteLichLamViec = async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.lichLamViecBacSi.findUnique({ where: { id: BigInt(id) } });
  if (!existing) return sendError(res, "Không tìm thấy lịch làm việc", 404);

  await prisma.lichLamViecBacSi.delete({ where: { id: BigInt(id) } });
  return sendSuccess(res, null, "Xóa lịch làm việc thành công");
};

module.exports = {
  getAllKhungGio, createKhungGio, deleteKhungGio,
  getLichLamViec, createLichLamViec, updateLichLamViec, deleteLichLamViec,
};
