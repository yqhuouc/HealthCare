/**
 * Đơn thuốc 1-1 với datLich (đã khám xong). Tạo kèm chi tiết thuốc nested create.
 * Xóa đơn: chi tiết cascade theo schema Prisma.
 */
const prisma = require("../utils/prisma");
const { delCache } = require("../utils/redis.util");
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

const getAll = async ({ page = 1, limit = 10 }, user = null) => {
  const skip = (Number(page) - 1) * Number(limit);

  // Khởi tạo điều kiện lọc (Data Ownership)
  let where = {};

  if (user?.vaiTro === "bac_si") {
    // Bác sĩ chỉ xem đơn thuốc do chính mình kê
    where = { datLich: { bacSiId: user.bacSi?.id } };
  } else if (user?.vaiTro === "benh_nhan") {
    // Bệnh nhân chỉ xem đơn thuốc của chính mình
    where = { datLich: { benhNhanId: user.benhNhan?.id } };
  }
  // Admin mặc định where = {} (Lấy tất cả)

  const [donThuocs, total] = await Promise.all([
    prisma.donThuoc.findMany({
      where,
      include: defaultInclude,
      skip,
      take: Number(limit),
      orderBy: { ngayTao: "desc" },
    }),
    prisma.donThuoc.count({ where }),
  ]);

  return {
    donThuocs,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

/**
 * Lấy chi tiết đơn thuốc.
 * Nếu user là bệnh nhân và chưa thanh toán xong (trangThaiThanhToan < 2),
 * hệ thống sẽ ẩn danh sách thuốc chi tiết và trả về thông báo yêu cầu thanh toán.
 */
const getById = async (id, user = null) => {
  const donThuoc = await prisma.donThuoc.findUnique({
    where: { id: BigInt(id) },
    include: {
      ...defaultInclude,
      datLich: {
        include: {
          bacSi: { select: { id: true, tenBacSi: true, hocViChucDanh: true } },
          benhNhan: {
            select: { id: true, hoTen: true, soDienThoai: true, taiKhoanId: true },
          },
        },
      },
    },
  });
  if (!donThuoc) throw new AppError("Không tìm thấy đơn thuốc", 404);

  // Bảo vệ quyền riêng tư (Data Ownership)
  if (user?.vaiTro === "benh_nhan") {
    if (!user.benhNhan || donThuoc.datLich?.benhNhan?.id !== user.benhNhan.id) {
      throw new AppError("Bạn không có quyền xem đơn thuốc này", 403);
    }
  }

  if (user?.vaiTro === "bac_si") {
    if (!user.bacSi || donThuoc.datLich?.bacSi?.id !== user.bacSi.id) {
      throw new AppError("Bạn không có quyền xem đơn thuốc do bác sĩ khác kê", 403);
    }
  }

  // Nếu người gọi là bệnh nhân → kiểm tra thanh toán
  if (user && user.vaiTro === "benh_nhan") {
    const trangThaiTT = donThuoc.datLich?.trangThaiThanhToan ?? 0;
    if (trangThaiTT < 2) {
      // Ẩn chi tiết y tế, chỉ trả về thông tin tài chính để phục vụ thanh toán
      return {
        ...donThuoc,
        chanDoan: "*** (Yêu cầu thanh toán)",
        ghiChu: "*** (Yêu cầu thanh toán)",
        chiTietDonThuoc: [],
        isLocked: true,
        _thongBao: "Vui lòng thanh toán để xem chi tiết đơn thuốc.",
      };
    }
  }

  return donThuoc;
};

// Chỉ khi datLich.trangThai === 2; mỗi lịch một đơn
const create = async (data, requestUser = null) => {
  const datLich = await prisma.datLich.findUnique({
    where: { id: BigInt(data.datLichId) },
    include: {
      benhNhan: {
        include: { taiKhoan: true }
      }
    }
  });
  if (!datLich) throw new AppError("Không tìm thấy lịch hẹn", 404);

  // Phân quyền (Data Ownership): Bác sĩ chỉ được kê đơn cho lịch khám của chính mình
  if (requestUser?.vaiTro === "bac_si" && datLich.bacSiId !== requestUser.bacSi?.id) {
    throw new AppError("Bạn không có quyền kê đơn thuốc cho lịch khám của bác sĩ khác", 403);
  }

  if (datLich.trangThai !== 2) {
    throw new AppError("Chỉ tạo đơn thuốc cho lịch hẹn đã khám xong (trạng thái = 2)", 400);
  }

  const existing = await prisma.donThuoc.findUnique({
    where: { datLichId: BigInt(data.datLichId) },
  });
  if (existing) throw new AppError("Lịch hẹn này đã có đơn thuốc", 409);

  // Tính tổng tiền đơn thuốc
  const tongTien =
    data.chiTietDonThuoc?.reduce((sum, item) => {
      const lineTotal = (item.soLuong || 0) * (item.donGia || 0);
      return sum + lineTotal;
    }, 0) || 0;

  const result = await prisma.donThuoc.create({
    data: {
      datLichId: BigInt(data.datLichId),
      chanDoan: data.chanDoan || null,
      ghiChu: data.ghiChu || null,
      tongTien: tongTien,
      chiTietDonThuoc: data.chiTietDonThuoc?.length
        ? {
            create: data.chiTietDonThuoc.map((ct) => ({
              tenThuoc: ct.tenThuoc,
              soLuong: ct.soLuong || null,
              donGia: ct.donGia || 0,
              lieuDung: ct.lieuDung || null,
              ghiChu: ct.ghiChu || null,
            })),
          }
        : undefined,
    },
    include: defaultInclude,
  });

  await delCache("cache:stats:overview");

  // Gửi email thông báo chẩn đoán sau khám (fire-and-forget)
  const emailTo = datLich.benhNhan?.emailLienHe || datLich.benhNhan?.taiKhoan?.email;
  if (emailTo) {
    const { sendPostExamEmail } = require("../utils/email.util");
    const tongThuTien = Number(datLich.giaKham || 0) + Number(tongTien || 0);
    sendPostExamEmail(
      emailTo,
      datLich.benhNhan?.hoTen || "Quý khách",
      data.chanDoan,
      tongThuTien
    ).catch(err => console.error("[Email Error] Lỗi gửi email sau khám:", err));
  }

  return result;
};

const update = async (id, data, requestUser) => {
  const existing = await prisma.donThuoc.findUnique({
    where: { id: BigInt(id) },
    include: { datLich: true },
  });
  if (!existing) throw new AppError("Không tìm thấy đơn thuốc", 404);

  // Chỉ bác sĩ kê đơn (hoặc Admin) mới được quyền sửa
  if (requestUser?.vaiTro === "bac_si") {
    if (!requestUser.bacSi || existing.datLich?.bacSiId !== requestUser.bacSi.id) {
      throw new AppError("Bạn không có quyền chỉnh sửa đơn thuốc do bác sĩ khác kê", 403);
    }
  } else if (requestUser?.vaiTro === "benh_nhan") {
    throw new AppError("Bệnh nhân không có quyền chỉnh sửa đơn thuốc", 403);
  }

  // Chặn sửa nếu trạng thái thanh toán là 2 (Đã thanh toán xong)
  if (existing.datLich?.trangThaiThanhToan === 2 && requestUser?.vaiTro !== "admin") {
    throw new AppError("Đơn thuốc này đã được bệnh nhân thanh toán, không thể chỉnh sửa thêm", 400);
  }

  // Tính lại tổng tiền
  const tongTien =
    data.chiTietDonThuoc?.reduce((sum, item) => {
      const lineTotal = (item.soLuong || 0) * (item.donGia || 0);
      return sum + lineTotal;
    }, 0) || 0;

  const updated = await prisma.$transaction(async (tx) => {
    // 1. Xóa toàn bộ chiTietDonThuoc cũ
    await tx.chiTietDonThuoc.deleteMany({
      where: { donThuocId: BigInt(id) },
    });

    // 2. Cập nhật donThuoc và tạo lại chiTiet mới
    return tx.donThuoc.update({
      where: { id: BigInt(id) },
      data: {
        chanDoan: data.chanDoan !== undefined ? data.chanDoan : existing.chanDoan,
        ghiChu: data.ghiChu !== undefined ? data.ghiChu : existing.ghiChu,
        tongTien: data.chiTietDonThuoc ? tongTien : existing.tongTien,
        chiTietDonThuoc: data.chiTietDonThuoc?.length
          ? {
              create: data.chiTietDonThuoc.map((ct) => ({
                tenThuoc: ct.tenThuoc,
                soLuong: ct.soLuong || null,
                donGia: ct.donGia || 0,
                lieuDung: ct.lieuDung || null,
                ghiChu: ct.ghiChu || null,
              })),
            }
          : undefined,
      },
      include: defaultInclude,
    });
  });

  const { delCache } = require("../utils/redis.util");
  await delCache("cache:stats:overview");
  return updated;
};

const remove = async (id) => {
  const existing = await prisma.donThuoc.findUnique({
    where: { id: BigInt(id) },
  });
  if (!existing) throw new AppError("Không tìm thấy đơn thuốc", 404);

  await prisma.donThuoc.delete({ where: { id: BigInt(id) } });

  await delCache("cache:stats:overview");
};

module.exports = { getAll, getById, create, update, remove };
