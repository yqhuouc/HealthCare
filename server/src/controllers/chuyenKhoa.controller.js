/**
 * ============================================================
 * CONTROLLER: Chuyên khoa (Specialty)
 * ============================================================
 * - GET    /api/chuyen-khoa        → Lấy tất cả chuyên khoa
 * - GET    /api/chuyen-khoa/:id    → Lấy chi tiết 1 chuyên khoa
 * - POST   /api/chuyen-khoa        → Tạo mới (admin)
 * - PUT    /api/chuyen-khoa/:id    → Cập nhật (admin)
 * - DELETE /api/chuyen-khoa/:id    → Xóa (admin)
 * ============================================================
 */
const prisma = require("../utils/prisma");
const { sendSuccess, sendError } = require("../utils/response");

const getAll = async (req, res) => {
  const chuyenKhoas = await prisma.chuyenKhoa.findMany({
    include: {
      _count: { select: { bacSis: true } },
    },
    orderBy: { tenChuyenKhoa: "asc" },
  });

  return sendSuccess(res, chuyenKhoas, "Lấy danh sách chuyên khoa thành công");
};

const getById = async (req, res) => {
  const { id } = req.params;

  const chuyenKhoa = await prisma.chuyenKhoa.findUnique({
    where: { id: BigInt(id) },
    include: {
      bacSis: {
        select: { id: true, tenBacSi: true, hocViChucDanh: true, moTaNgan: true, giaKham: true },
      },
    },
  });

  if (!chuyenKhoa) {
    return sendError(res, "Không tìm thấy chuyên khoa", 404);
  }

  return sendSuccess(res, chuyenKhoa, "Lấy chi tiết chuyên khoa thành công");
};

const create = async (req, res) => {
  const { tenChuyenKhoa, anhChuyenKhoa, moTaChuyenKhoa } = req.body;

  const chuyenKhoa = await prisma.chuyenKhoa.create({
    data: { tenChuyenKhoa, anhChuyenKhoa, moTaChuyenKhoa },
  });

  return sendSuccess(res, chuyenKhoa, "Tạo chuyên khoa thành công", 201);
};

const update = async (req, res) => {
  const { id } = req.params;
  const { tenChuyenKhoa, anhChuyenKhoa, moTaChuyenKhoa } = req.body;

  const existing = await prisma.chuyenKhoa.findUnique({ where: { id: BigInt(id) } });
  if (!existing) {
    return sendError(res, "Không tìm thấy chuyên khoa", 404);
  }

  const chuyenKhoa = await prisma.chuyenKhoa.update({
    where: { id: BigInt(id) },
    data: { tenChuyenKhoa, anhChuyenKhoa, moTaChuyenKhoa },
  });

  return sendSuccess(res, chuyenKhoa, "Cập nhật chuyên khoa thành công");
};

const remove = async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.chuyenKhoa.findUnique({ where: { id: BigInt(id) } });
  if (!existing) {
    return sendError(res, "Không tìm thấy chuyên khoa", 404);
  }

  // Kiểm tra có bác sĩ nào thuộc chuyên khoa này không
  const doctorCount = await prisma.bacSi.count({ where: { chuyenKhoaId: BigInt(id) } });
  if (doctorCount > 0) {
    return sendError(res, `Không thể xóa vì có ${doctorCount} bác sĩ thuộc chuyên khoa này`, 400);
  }

  await prisma.chuyenKhoa.delete({ where: { id: BigInt(id) } });

  return sendSuccess(res, null, "Xóa chuyên khoa thành công");
};

module.exports = { getAll, getById, create, update, remove };
