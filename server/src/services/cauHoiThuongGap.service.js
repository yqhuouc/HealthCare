const prisma = require("../utils/prisma");
const { AppError } = require("../middlewares/error.middleware");

const getActive = async () => {
  return prisma.cauHoiThuongGap.findMany({ where: { dangHoatDong: 1 }, orderBy: { id: "asc" } });
};

const getAll = async ({ page = 1, limit = 20 }) => {
  const skip = (Number(page) - 1) * Number(limit);
  const [faqs, total] = await Promise.all([
    prisma.cauHoiThuongGap.findMany({ skip, take: Number(limit), orderBy: { id: "asc" } }),
    prisma.cauHoiThuongGap.count(),
  ]);

  return {
    faqs,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
  };
};

const getById = async (id) => {
  const faq = await prisma.cauHoiThuongGap.findUnique({ where: { id: BigInt(id) } });
  if (!faq) throw new AppError("Không tìm thấy câu hỏi", 404);
  return faq;
};

const create = async (data) => {
  return prisma.cauHoiThuongGap.create({
    data: {
      cauHoi: data.cauHoi,
      traLoi: data.traLoi,
      dangHoatDong: data.dangHoatDong !== undefined ? data.dangHoatDong : 1,
    },
  });
};

const update = async (id, data) => {
  const existing = await prisma.cauHoiThuongGap.findUnique({ where: { id: BigInt(id) } });
  if (!existing) throw new AppError("Không tìm thấy câu hỏi", 404);

  return prisma.cauHoiThuongGap.update({
    where: { id: BigInt(id) },
    data: { cauHoi: data.cauHoi, traLoi: data.traLoi, dangHoatDong: data.dangHoatDong },
  });
};

const remove = async (id) => {
  const existing = await prisma.cauHoiThuongGap.findUnique({ where: { id: BigInt(id) } });
  if (!existing) throw new AppError("Không tìm thấy câu hỏi", 404);

  await prisma.cauHoiThuongGap.delete({ where: { id: BigInt(id) } });
};

module.exports = { getActive, getAll, getById, create, update, remove };
