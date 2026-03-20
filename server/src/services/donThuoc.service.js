const prisma = require("../utils/prisma");
const { AppError } = require("../middlewares/error.middleware");

const defaultInclude = {
  datLich: {
    include: {
      bacSi: { select: { id: true, tenBacSi: true, hocViChucDanh: true } },
      benhNhan: { select: { id: true, hoTen: true, soDienThoai: true } },
    },
  },
  chiTietDonThuoc: true,
};

const getAll = async ({ page = 1, limit = 10 }) => {
  const skip = (Number(page) - 1) * Number(limit);

  const [donThuocs, total] = await Promise.all([
    prisma.donThuoc.findMany({
      include: defaultInclude,
      skip,
      take: Number(limit),
      orderBy: { ngayTao: "desc" },
    }),
    prisma.donThuoc.count(),
  ]);

  return {
    donThuocs,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
  };
};

const getById = async (id) => {
  const donThuoc = await prisma.donThuoc.findUnique({
    where: { id: BigInt(id) },
    include: defaultInclude,
  });
  if (!donThuoc) throw new AppError("Không tìm thấy đơn thuốc", 404);
  return donThuoc;
};

const create = async (data) => {
  const datLich = await prisma.datLich.findUnique({ where: { id: BigInt(data.datLichId) } });
  if (!datLich) throw new AppError("Không tìm thấy lịch hẹn", 404);

  if (datLich.trangThai !== 2) {
    throw new AppError("Chỉ tạo đơn thuốc cho lịch hẹn đã khám xong (trạng thái = 2)", 400);
  }

  const existing = await prisma.donThuoc.findUnique({ where: { datLichId: BigInt(data.datLichId) } });
  if (existing) throw new AppError("Lịch hẹn này đã có đơn thuốc", 409);

  return prisma.donThuoc.create({
    data: {
      datLichId: BigInt(data.datLichId),
      chanDoan: data.chanDoan || null,
      ghiChu: data.ghiChu || null,
      chiTietDonThuoc: data.chiTietDonThuoc?.length
        ? {
            create: data.chiTietDonThuoc.map((ct) => ({
              tenThuoc: ct.tenThuoc,
              soLuong: ct.soLuong || null,
              lieuDung: ct.lieuDung || null,
              ghiChu: ct.ghiChu || null,
            })),
          }
        : undefined,
    },
    include: defaultInclude,
  });
};

const remove = async (id) => {
  const existing = await prisma.donThuoc.findUnique({ where: { id: BigInt(id) } });
  if (!existing) throw new AppError("Không tìm thấy đơn thuốc", 404);

  // ChiTietDonThuoc sẽ tự xóa nhờ onDelete: Cascade
  await prisma.donThuoc.delete({ where: { id: BigInt(id) } });
};

module.exports = { getAll, getById, create, remove };
