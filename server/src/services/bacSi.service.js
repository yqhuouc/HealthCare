/**
 * Bác sĩ: lọc theo chuyên khoa + tên; tạo transaction taiKhoan (bac_si) + bacSi.
 * Xóa kèm taiKhoan nếu không còn lịch hẹn.
 */
const bcrypt = require("bcryptjs");
const prisma = require("../utils/prisma");
const { AppError } = require("../middlewares/error.middleware");
const { getCache, setCache, delCache } = require("../utils/redis.util");

// Các prefix cache key
const CACHE_PREFIX = "cache:bacsi";
const getListKey = (ck, q, p, l) => `${CACHE_PREFIX}:all:ck:${ck || 'all'}:q:${q || 'none'}:p:${p}:l:${l}`;
const getDetailKey = (id) => `${CACHE_PREFIX}:${id}`;

// Lọc chuyenKhoaId + search tên; include chuyenKhoa + taiKhoan (không matKhau)
const getAll = async ({ chuyenKhoaId, search, page = 1, limit = 10 }) => {
  // 1. Check cache
  const cacheKey = getListKey(chuyenKhoaId, search, page, limit);
  const cachedData = await getCache(cacheKey);
  if (cachedData) return cachedData;

  const skip = (Number(page) - 1) * Number(limit);
  const where = {};
  if (chuyenKhoaId) where.chuyenKhoaId = BigInt(chuyenKhoaId);
  if (search) where.tenBacSi = { contains: search, mode: "insensitive" };

  const [bacSiList, total] = await Promise.all([
    prisma.bacSi.findMany({
      where,
      include: {
        chuyenKhoa: { select: { id: true, tenChuyenKhoa: true } },
        taiKhoan: {
          select: {
            id: true,
            email: true,
            anhDaiDien: true,
            trangThaiTaiKhoan: true,
          },
        },
      },
      skip,
      take: Number(limit),
      orderBy: { tenBacSi: "asc" },
    }),
    prisma.bacSi.count({ where }),
  ]);

  return {
    bacSiList,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };

  // 2. Save result to cache (TTL 10 mins = 600s)
  await setCache(cacheKey, result, 600);
  return result;
};

// Chi tiết + chuyenKhoa + taiKhoan (không trả matKhau)
const getById = async (id) => {
  // 1. Check cache
  const cacheKey = getDetailKey(id);
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const bacSi = await prisma.bacSi.findUnique({
    where: { id: BigInt(id) },
    include: {
      chuyenKhoa: true,
      taiKhoan: {
        select: {
          id: true,
          email: true,
          anhDaiDien: true,
          gioiTinh: true,
          ngaySinh: true,
          diaChi: true,
          trangThaiTaiKhoan: true,
        },
      },
    },
  });

  if (!bacSi) throw new AppError("Không tìm thấy bác sĩ", 404);

  // 2. Save to cache (TTL 15 mins = 900s)
  await setCache(cacheKey, bacSi, 900);
  return bacSi;
};

// Bắt buộc có email/matKhau và định danh vaiTro là bac_si. Nếu trùng email -> 409
const create = async (data) => {
  const exists = await prisma.taiKhoan.findUnique({
    where: { email: data.email },
  });
  if (exists) throw new AppError("Email đã được sử dụng", 409);

  const hashedPassword = await bcrypt.hash(data.matKhau, 10);

  const result = await prisma.$transaction(async (tx) => {
    const taiKhoan = await tx.taiKhoan.create({
      data: {
        email: data.email,
        matKhau: hashedPassword,
        vaiTro: "bac_si",
        trangThaiTaiKhoan: 1,
        gioiTinh: data.gioiTinh || null,
        ngaySinh: data.ngaySinh ? new Date(data.ngaySinh) : null,
        diaChi: data.diaChi || null,
      },
    });

    const bacSi = await tx.bacSi.create({
      data: {
        tenBacSi: data.tenBacSi,
        hocViChucDanh: data.hocViChucDanh || null,
        moTaNgan: data.moTaNgan || null,
        moTaChiTiet: data.moTaChiTiet || null,
        giaKham: data.giaKham ? parseFloat(data.giaKham) : null,
        chuyenKhoaId: BigInt(data.chuyenKhoaId),
        taiKhoanId: taiKhoan.id,
      },
    });

    return bacSi;
  });

  // Xóa mọi cache liên quan đến bác sĩ (bao gồm detail và list)
  await delCache(`${CACHE_PREFIX}:*`);
  await delCache("cache:stats:overview");
  return result;
};

// Cập nhật từng field tùy body; parse giaKham / chuyenKhoaId + Cập nhật Email/Mật khẩu
const update = async (id, data) => {
  const existing = await prisma.bacSi.findUnique({
    where: { id: BigInt(id) },
    include: { taiKhoan: true },
  });
  if (!existing) throw new AppError("Không tìm thấy bác sĩ", 404);

  const finalResult = await prisma.$transaction(async (tx) => {
    // 1. Cập nhật tài khoản liên kết
    if (existing.taiKhoanId) {
      const accountUpdate = {};

      if (data.email && data.email !== existing.taiKhoan?.email) {
        const emailExists = await tx.taiKhoan.findUnique({ where: { email: data.email } });
        if (emailExists) throw new AppError("Email này đã được sử dụng", 409);
        accountUpdate.email = data.email;
      }

      if (data.matKhau && data.matKhau.trim() !== "") {
        accountUpdate.matKhau = await bcrypt.hash(data.matKhau, 10);
      }

      if (data.trangThaiTaiKhoan !== undefined) {
        accountUpdate.trangThaiTaiKhoan = Number(data.trangThaiTaiKhoan);
      }

      if (Object.keys(accountUpdate).length > 0) {
        await tx.taiKhoan.update({
          where: { id: existing.taiKhoanId },
          data: accountUpdate,
        });
      }
    }

    // 2. Cập nhật bảng BacSi (chỉ chạy nếu có trường dữ liệu thay đổi)
    const updateData = {};
    if (data.tenBacSi !== undefined) updateData.tenBacSi = data.tenBacSi;
    if (data.hocViChucDanh !== undefined) updateData.hocViChucDanh = data.hocViChucDanh;
    if (data.moTaNgan !== undefined) updateData.moTaNgan = data.moTaNgan;
    if (data.moTaChiTiet !== undefined) updateData.moTaChiTiet = data.moTaChiTiet;
    if (data.giaKham !== undefined) updateData.giaKham = parseFloat(data.giaKham);
    if (data.chuyenKhoaId !== undefined) updateData.chuyenKhoaId = BigInt(data.chuyenKhoaId);

    if (Object.keys(updateData).length > 0) {
      await tx.bacSi.update({ where: { id: BigInt(id) }, data: updateData });
    }

    // 3. Trả về kết quả mới nhất
    return tx.bacSi.findUnique({
      where: { id: BigInt(id) },
      include: {
        chuyenKhoa: { select: { id: true, tenChuyenKhoa: true } },
        taiKhoan: {
          select: { id: true, email: true, trangThaiTaiKhoan: true, anhDaiDien: true },
        },
      },
    });
  });

  // Xóa mọi cache liên quan đến bác sĩ
  await delCache(`${CACHE_PREFIX}:*`);

  return finalResult;
};

// Cấm xóa nếu còn lịch; xóa bacSi rồi taiKhoan liên kết
const remove = async (id) => {
  const existing = await prisma.bacSi.findUnique({ where: { id: BigInt(id) } });
  if (!existing) throw new AppError("Không tìm thấy bác sĩ", 404);

  const appointmentCount = await prisma.datLich.count({
    where: { bacSiId: BigInt(id) },
  });
  if (appointmentCount > 0) {
    throw new AppError(
      `Không thể xóa vì bác sĩ có ${appointmentCount} lịch hẹn`,
      400,
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.bacSi.delete({ where: { id: BigInt(id) } });
    if (existing.taiKhoanId) {
      await tx.taiKhoan.delete({ where: { id: existing.taiKhoanId } });
    }
  });

  // Xóa mọi cache liên quan đến bác sĩ
  await delCache(`${CACHE_PREFIX}:*`);
  await delCache("cache:stats:overview");
};

module.exports = { getAll, getById, create, update, remove };
