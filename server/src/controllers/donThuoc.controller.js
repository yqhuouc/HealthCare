/**
 * ============================================================
 * CONTROLLER: Đơn thuốc (Prescription)
 * ============================================================
 * - GET    /api/don-thuoc           → Lấy tất cả đơn thuốc
 * - GET    /api/don-thuoc/:id       → Lấy chi tiết đơn thuốc
 * - POST   /api/don-thuoc           → Tạo đơn thuốc từ lịch hẹn
 * - DELETE /api/don-thuoc/:id       → Xóa đơn thuốc
 * ============================================================
 */
const prisma = require("../utils/prisma");
const { sendSuccess, sendError } = require("../utils/response");

const getAll = async (req, res) => {
  const donThuocs = await prisma.donThuoc.findMany({
    include: {
      datLich: {
        include: {
          bacSi: { select: { id: true, tenBacSi: true } },
          benhNhan: { select: { id: true, hoTen: true } },
        },
      },
    },
    orderBy: { ngayTao: "desc" },
  });

  return sendSuccess(res, donThuocs, "Lấy danh sách đơn thuốc thành công");
};

const getById = async (req, res) => {
  const { id } = req.params;

  const donThuoc = await prisma.donThuoc.findUnique({
    where: { id: BigInt(id) },
    include: {
      datLich: {
        include: {
          bacSi: { select: { id: true, tenBacSi: true, hocViChucDanh: true } },
          benhNhan: { select: { id: true, hoTen: true, soDienThoai: true } },
        },
      },
    },
  });

  if (!donThuoc) return sendError(res, "Không tìm thấy đơn thuốc", 404);
  return sendSuccess(res, donThuoc, "Lấy chi tiết đơn thuốc thành công");
};

/**
 * TẠO ĐƠN THUỐC.
 * Ràng buộc: mỗi lịch hẹn chỉ có 1 đơn thuốc (datLichId UNIQUE).
 * Chỉ tạo được khi lịch hẹn ở trạng thái "đã khám" (trangThai = 2).
 */
const create = async (req, res) => {
  const { datLichId } = req.body;

  const datLich = await prisma.datLich.findUnique({ where: { id: BigInt(datLichId) } });
  if (!datLich) return sendError(res, "Không tìm thấy lịch hẹn", 404);

  if (datLich.trangThai !== 2) {
    return sendError(res, "Chỉ tạo đơn thuốc cho lịch hẹn đã khám xong (trạng thái = 2)", 400);
  }

  // Kiểm tra đã có đơn thuốc cho lịch hẹn này chưa
  const existing = await prisma.donThuoc.findUnique({ where: { datLichId: BigInt(datLichId) } });
  if (existing) {
    return sendError(res, "Lịch hẹn này đã có đơn thuốc", 409);
  }

  const donThuoc = await prisma.donThuoc.create({
    data: { datLichId: BigInt(datLichId) },
    include: {
      datLich: {
        include: {
          bacSi: { select: { id: true, tenBacSi: true } },
          benhNhan: { select: { id: true, hoTen: true } },
        },
      },
    },
  });

  return sendSuccess(res, donThuoc, "Tạo đơn thuốc thành công", 201);
};

const remove = async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.donThuoc.findUnique({ where: { id: BigInt(id) } });
  if (!existing) return sendError(res, "Không tìm thấy đơn thuốc", 404);

  await prisma.donThuoc.delete({ where: { id: BigInt(id) } });
  return sendSuccess(res, null, "Xóa đơn thuốc thành công");
};

module.exports = { getAll, getById, create, remove };
