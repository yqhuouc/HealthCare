/**
 * ============================================================
 * CONTROLLER: Câu hỏi thường gặp (FAQ)
 * ============================================================
 * - GET    /api/cau-hoi-thuong-gap        → Lấy tất cả FAQ (public: chỉ active)
 * - GET    /api/cau-hoi-thuong-gap/all    → Lấy tất cả FAQ (admin: cả ẩn)
 * - GET    /api/cau-hoi-thuong-gap/:id    → Lấy chi tiết 1 FAQ
 * - POST   /api/cau-hoi-thuong-gap        → Tạo FAQ mới (admin)
 * - PUT    /api/cau-hoi-thuong-gap/:id    → Cập nhật FAQ (admin)
 * - DELETE /api/cau-hoi-thuong-gap/:id    → Xóa FAQ (admin)
 * ============================================================
 */
const prisma = require("../utils/prisma");
const { sendSuccess, sendError } = require("../utils/response");

// Public: chỉ trả FAQ đang hoạt động
const getActive = async (req, res) => {
  const faqs = await prisma.cauHoiThuongGap.findMany({
    where: { dangHoatDong: 1 },
    orderBy: { id: "asc" },
  });
  return sendSuccess(res, faqs, "Lấy danh sách câu hỏi thường gặp thành công");
};

// Admin: lấy tất cả (cả ẩn)
const getAll = async (req, res) => {
  const faqs = await prisma.cauHoiThuongGap.findMany({
    orderBy: { id: "asc" },
  });
  return sendSuccess(res, faqs, "Lấy tất cả câu hỏi thường gặp thành công");
};

const getById = async (req, res) => {
  const { id } = req.params;

  const faq = await prisma.cauHoiThuongGap.findUnique({ where: { id: BigInt(id) } });
  if (!faq) return sendError(res, "Không tìm thấy câu hỏi", 404);

  return sendSuccess(res, faq, "Lấy chi tiết câu hỏi thành công");
};

const create = async (req, res) => {
  const { cauHoi, traLoi, dangHoatDong } = req.body;

  const faq = await prisma.cauHoiThuongGap.create({
    data: {
      cauHoi,
      traLoi,
      dangHoatDong: dangHoatDong !== undefined ? dangHoatDong : 1,
    },
  });

  return sendSuccess(res, faq, "Tạo câu hỏi thường gặp thành công", 201);
};

const update = async (req, res) => {
  const { id } = req.params;
  const { cauHoi, traLoi, dangHoatDong } = req.body;

  const existing = await prisma.cauHoiThuongGap.findUnique({ where: { id: BigInt(id) } });
  if (!existing) return sendError(res, "Không tìm thấy câu hỏi", 404);

  const faq = await prisma.cauHoiThuongGap.update({
    where: { id: BigInt(id) },
    data: { cauHoi, traLoi, dangHoatDong },
  });

  return sendSuccess(res, faq, "Cập nhật câu hỏi thường gặp thành công");
};

const remove = async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.cauHoiThuongGap.findUnique({ where: { id: BigInt(id) } });
  if (!existing) return sendError(res, "Không tìm thấy câu hỏi", 404);

  await prisma.cauHoiThuongGap.delete({ where: { id: BigInt(id) } });
  return sendSuccess(res, null, "Xóa câu hỏi thường gặp thành công");
};

module.exports = { getActive, getAll, getById, create, update, remove };
