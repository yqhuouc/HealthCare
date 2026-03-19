/**
 * ============================================================
 * CONTROLLER: Bệnh nhân (Patient)
 * ============================================================
 * - GET    /api/benh-nhan           → Lấy tất cả bệnh nhân (admin)
 * - GET    /api/benh-nhan/:id       → Lấy chi tiết 1 bệnh nhân
 * - PUT    /api/benh-nhan/:id       → Cập nhật thông tin
 * - DELETE /api/benh-nhan/:id       → Xóa bệnh nhân (admin)
 * ============================================================
 */
const prisma = require("../utils/prisma");
const { sendSuccess, sendError } = require("../utils/response");

const getAll = async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where = {};
  if (search) {
    where.hoTen = { contains: search, mode: "insensitive" };
  }

  const [benhNhans, total] = await Promise.all([
    prisma.benhNhan.findMany({
      where,
      include: {
        taiKhoan: { select: { id: true, email: true, anhDaiDien: true, trangThaiTaiKhoan: true, ngayTao: true } },
      },
      skip,
      take: Number(limit),
      orderBy: { hoTen: "asc" },
    }),
    prisma.benhNhan.count({ where }),
  ]);

  return sendSuccess(res, {
    benhNhans,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  }, "Lấy danh sách bệnh nhân thành công");
};

const getById = async (req, res) => {
  const { id } = req.params;

  const benhNhan = await prisma.benhNhan.findUnique({
    where: { id: BigInt(id) },
    include: {
      taiKhoan: {
        select: { id: true, email: true, anhDaiDien: true, gioiTinh: true, ngaySinh: true, diaChi: true, ngayTao: true },
      },
    },
  });

  if (!benhNhan) {
    return sendError(res, "Không tìm thấy bệnh nhân", 404);
  }

  return sendSuccess(res, benhNhan, "Lấy chi tiết bệnh nhân thành công");
};

const update = async (req, res) => {
  const { id } = req.params;
  const { hoTen, soDienThoai, emailLienHe, gioiTinh, ngaySinh, diaChi, anhDaiDien } = req.body;

  const existing = await prisma.benhNhan.findUnique({ where: { id: BigInt(id) } });
  if (!existing) {
    return sendError(res, "Không tìm thấy bệnh nhân", 404);
  }

  // Transaction: cập nhật BenhNhan + TaiKhoan liên kết (nếu có thay đổi profile chung)
  const result = await prisma.$transaction(async (tx) => {
    const benhNhan = await tx.benhNhan.update({
      where: { id: BigInt(id) },
      data: { hoTen, soDienThoai, emailLienHe },
    });

    if (existing.taiKhoanId && (gioiTinh !== undefined || ngaySinh !== undefined || diaChi !== undefined || anhDaiDien !== undefined)) {
      await tx.taiKhoan.update({
        where: { id: existing.taiKhoanId },
        data: {
          gioiTinh: gioiTinh !== undefined ? gioiTinh : undefined,
          ngaySinh: ngaySinh !== undefined ? new Date(ngaySinh) : undefined,
          diaChi: diaChi !== undefined ? diaChi : undefined,
          anhDaiDien: anhDaiDien !== undefined ? anhDaiDien : undefined,
        },
      });
    }

    return benhNhan;
  });

  return sendSuccess(res, result, "Cập nhật bệnh nhân thành công");
};

const remove = async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.benhNhan.findUnique({ where: { id: BigInt(id) } });
  if (!existing) {
    return sendError(res, "Không tìm thấy bệnh nhân", 404);
  }

  const appointmentCount = await prisma.datLich.count({ where: { benhNhanId: BigInt(id) } });
  if (appointmentCount > 0) {
    return sendError(res, `Không thể xóa vì bệnh nhân có ${appointmentCount} lịch hẹn`, 400);
  }

  await prisma.$transaction(async (tx) => {
    await tx.benhNhan.delete({ where: { id: BigInt(id) } });
    if (existing.taiKhoanId) {
      await tx.taiKhoan.delete({ where: { id: existing.taiKhoanId } });
    }
  });

  return sendSuccess(res, null, "Xóa bệnh nhân thành công");
};

module.exports = { getAll, getById, update, remove };
