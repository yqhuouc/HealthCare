/**
 * ============================================================
 * CONTROLLER: Bác sĩ (Doctor)
 * ============================================================
 * - GET    /api/bac-si              → Lấy tất cả bác sĩ (hỗ trợ filter theo chuyên khoa)
 * - GET    /api/bac-si/:id          → Lấy chi tiết 1 bác sĩ
 * - POST   /api/bac-si              → Tạo bác sĩ mới (admin)
 * - PUT    /api/bac-si/:id          → Cập nhật (admin)
 * - DELETE /api/bac-si/:id          → Xóa (admin)
 * ============================================================
 */
const bcrypt = require("bcryptjs");
const prisma = require("../utils/prisma");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * Lấy danh sách bác sĩ. Query params:
 * - chuyenKhoaId: lọc theo chuyên khoa
 * - search: tìm theo tên bác sĩ
 * - page, limit: phân trang
 */
const getAll = async (req, res) => {
  const { chuyenKhoaId, search, page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where = {};
  if (chuyenKhoaId) where.chuyenKhoaId = BigInt(chuyenKhoaId);
  if (search) {
    where.tenBacSi = { contains: search, mode: "insensitive" };
  }

  const [bacSis, total] = await Promise.all([
    prisma.bacSi.findMany({
      where,
      include: {
        chuyenKhoa: { select: { id: true, tenChuyenKhoa: true } },
        taiKhoan: { select: { id: true, email: true, anhDaiDien: true, trangThaiTaiKhoan: true } },
      },
      skip,
      take: Number(limit),
      orderBy: { tenBacSi: "asc" },
    }),
    prisma.bacSi.count({ where }),
  ]);

  return sendSuccess(res, {
    bacSis,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  }, "Lấy danh sách bác sĩ thành công");
};

const getById = async (req, res) => {
  const { id } = req.params;

  const bacSi = await prisma.bacSi.findUnique({
    where: { id: BigInt(id) },
    include: {
      chuyenKhoa: true,
      taiKhoan: {
        select: { id: true, email: true, anhDaiDien: true, gioiTinh: true, ngaySinh: true, diaChi: true },
      },
    },
  });

  if (!bacSi) {
    return sendError(res, "Không tìm thấy bác sĩ", 404);
  }

  return sendSuccess(res, bacSi, "Lấy chi tiết bác sĩ thành công");
};

/**
 * Tạo bác sĩ mới (Admin).
 * Flow: tạo TaiKhoan (vai trò "bac_si") → tạo BacSi liên kết, dùng transaction.
 */
const create = async (req, res) => {
  const {
    tenBacSi, hocViChucDanh, moTaNgan, moTaChiTiet, giaKham,
    chuyenKhoaId, email, matKhau, gioiTinh, ngaySinh, diaChi,
  } = req.body;

  // Kiểm tra email trùng
  if (email) {
    const exists = await prisma.taiKhoan.findUnique({ where: { email } });
    if (exists) return sendError(res, "Email đã được sử dụng", 409);
  }

  const result = await prisma.$transaction(async (tx) => {
    // Tạo tài khoản cho bác sĩ
    const taiKhoan = await tx.taiKhoan.create({
      data: {
        email: email || `doctor_${Date.now()}@clinic.local`,
        matKhau: await bcrypt.hash(matKhau || "doctor123", 10),
        vaiTro: "bac_si",
        trangThaiTaiKhoan: 1,
        gioiTinh: gioiTinh || null,
        ngaySinh: ngaySinh ? new Date(ngaySinh) : null,
        diaChi: diaChi || null,
      },
    });

    const bacSi = await tx.bacSi.create({
      data: {
        tenBacSi,
        hocViChucDanh,
        moTaNgan,
        moTaChiTiet,
        giaKham: giaKham ? parseFloat(giaKham) : null,
        chuyenKhoaId: chuyenKhoaId ? BigInt(chuyenKhoaId) : null,
        taiKhoanId: taiKhoan.id,
      },
    });

    return bacSi;
  });

  return sendSuccess(res, result, "Tạo bác sĩ thành công", 201);
};

const update = async (req, res) => {
  const { id } = req.params;
  const { tenBacSi, hocViChucDanh, moTaNgan, moTaChiTiet, giaKham, chuyenKhoaId } = req.body;

  const existing = await prisma.bacSi.findUnique({ where: { id: BigInt(id) } });
  if (!existing) {
    return sendError(res, "Không tìm thấy bác sĩ", 404);
  }

  const bacSi = await prisma.bacSi.update({
    where: { id: BigInt(id) },
    data: {
      tenBacSi,
      hocViChucDanh,
      moTaNgan,
      moTaChiTiet,
      giaKham: giaKham !== undefined ? parseFloat(giaKham) : undefined,
      chuyenKhoaId: chuyenKhoaId !== undefined ? BigInt(chuyenKhoaId) : undefined,
    },
  });

  return sendSuccess(res, bacSi, "Cập nhật bác sĩ thành công");
};

const remove = async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.bacSi.findUnique({ where: { id: BigInt(id) } });
  if (!existing) {
    return sendError(res, "Không tìm thấy bác sĩ", 404);
  }

  // Kiểm tra bác sĩ có lịch hẹn nào không
  const appointmentCount = await prisma.datLich.count({ where: { bacSiId: BigInt(id) } });
  if (appointmentCount > 0) {
    return sendError(res, `Không thể xóa vì bác sĩ có ${appointmentCount} lịch hẹn`, 400);
  }

  // Transaction: xóa BacSi trước, rồi xóa TaiKhoan liên kết
  await prisma.$transaction(async (tx) => {
    await tx.bacSi.delete({ where: { id: BigInt(id) } });
    if (existing.taiKhoanId) {
      await tx.taiKhoan.delete({ where: { id: existing.taiKhoanId } });
    }
  });

  return sendSuccess(res, null, "Xóa bác sĩ thành công");
};

module.exports = { getAll, getById, create, update, remove };
