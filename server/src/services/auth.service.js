/**
 * Service xác thực: bcrypt mật khẩu, JWT access/refresh, refresh chỉ lưu hash SHA-256 trong DB.
 * Controller set cookie; lỗi nghiệp vụ → AppError.
 */
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");
const config = require("../config");
const { AppError } = require("../middlewares/error.middleware");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

// Ký JWT access + refresh theo secret/expires trong config
const generateTokens = (taiKhoanId) => {
  const accessToken = jwt.sign({ id: taiKhoanId }, config.jwtAccessSecret, {
    expiresIn: config.jwtAccessExpires,
  });

  const refreshToken = jwt.sign({ id: taiKhoanId }, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpires,
  });

  return { accessToken, refreshToken };
};

// Transaction: tạo taiKhoan (benh_nhan) + benhNhan; email trùng → 409
const register = async ({ email, matKhau, hoTen, soDienThoai, gioiTinh, ngaySinh, diaChi }) => {
  const existingAccount = await prisma.taiKhoan.findUnique({ where: { email } });
  if (existingAccount) {
    throw new AppError("Email đã được sử dụng", 409);
  }

  const hashedPassword = await bcrypt.hash(matKhau, 10);

  const result = await prisma.$transaction(async (tx) => {
    const taiKhoan = await tx.taiKhoan.create({
      data: {
        email,
        matKhau: hashedPassword,
        vaiTro: "benh_nhan",
        trangThaiTaiKhoan: 1,
        gioiTinh: gioiTinh || null,
        ngaySinh: ngaySinh ? new Date(ngaySinh) : null,
        diaChi: diaChi || null,
      },
    });

    const benhNhan = await tx.benhNhan.create({
      data: {
        hoTen,
        soDienThoai: soDienThoai || null,
        emailLienHe: email,
        taiKhoanId: taiKhoan.id,
      },
    });

    return { taiKhoan, benhNhan };
  });

  return {
    id: result.taiKhoan.id,
    email: result.taiKhoan.email,
    vaiTro: result.taiKhoan.vaiTro,
    hoTen: result.benhNhan.hoTen,
  };
};

// Kiểm tra khóa, so khớp mật khẩu, lưu hash refresh; trả user + cặp token cho controller
const login = async ({ email, matKhau }) => {
  const taiKhoan = await prisma.taiKhoan.findUnique({
    where: { email },
    include: { bacSi: true, benhNhan: true },
  });

  if (!taiKhoan) {
    throw new AppError("Email hoặc mật khẩu không đúng", 401);
  }

  if (taiKhoan.trangThaiTaiKhoan === 0) {
    throw new AppError("Tài khoản đã bị khóa. Vui lòng liên hệ admin.", 403);
  }

  const isMatch = await bcrypt.compare(matKhau, taiKhoan.matKhau);
  if (!isMatch) {
    throw new AppError("Email hoặc mật khẩu không đúng", 401);
  }

  const { accessToken, refreshToken } = generateTokens(Number(taiKhoan.id));

  await prisma.taiKhoan.update({
    where: { id: taiKhoan.id },
    data: { refreshToken: hashToken(refreshToken) },
  });

  let hoTen = "Admin";
  if (taiKhoan.benhNhan) hoTen = taiKhoan.benhNhan.hoTen;
  if (taiKhoan.bacSi) hoTen = taiKhoan.bacSi.tenBacSi;

  return {
    user: {
      id: taiKhoan.id,
      email: taiKhoan.email,
      vaiTro: taiKhoan.vaiTro,
      hoTen,
    },
    accessToken,
    refreshToken,
  };
};

// Verify refresh JWT, so khớp hash DB, cấp token mới + cập nhật hash
const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError("Refresh token không hợp lệ", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
  } catch (error) {
    throw new AppError("Refresh token không hợp lệ hoặc đã hết hạn", 401);
  }

  const taiKhoan = await prisma.taiKhoan.findUnique({
    where: { id: BigInt(decoded.id) },
  });

  if (!taiKhoan || taiKhoan.refreshToken !== hashToken(refreshToken)) {
    throw new AppError("Refresh token không hợp lệ", 401);
  }

  const tokens = generateTokens(Number(taiKhoan.id));

  await prisma.taiKhoan.update({
    where: { id: taiKhoan.id },
    data: { refreshToken: hashToken(tokens.refreshToken) },
  });

  return tokens;
};

// Xóa refresh hash trong DB (cookie do controller clear)
const logout = async (userId) => {
  await prisma.taiKhoan.update({
    where: { id: BigInt(userId) },
    data: { refreshToken: null },
  });
  return { message: "Đăng xuất thành công" };
};

// Hồ sơ đầy đủ: taiKhoan + quan hệ bacSi/benhNhan
const getMe = async (userId) => {
  const taiKhoan = await prisma.taiKhoan.findUnique({
    where: { id: BigInt(userId) },
    select: {
      id: true,
      email: true,
      vaiTro: true,
      gioiTinh: true,
      ngaySinh: true,
      diaChi: true,
      anhDaiDien: true,
      ngayTao: true,
      trangThaiTaiKhoan: true,
      bacSi: true,
      benhNhan: true,
    },
  });

  if (!taiKhoan) {
    throw new AppError("Không tìm thấy tài khoản", 404);
  }

  return taiKhoan;
};

// So khớp mật khẩu cũ rồi hash mật khẩu mới
const doiMatKhau = async (userId, { matKhauCu, matKhauMoi }) => {
  const taiKhoan = await prisma.taiKhoan.findUnique({
    where: { id: BigInt(userId) },
  });

  if (!taiKhoan) {
    throw new AppError("Không tìm thấy tài khoản", 404);
  }

  const isMatch = await bcrypt.compare(matKhauCu, taiKhoan.matKhau);
  if (!isMatch) {
    throw new AppError("Mật khẩu cũ không đúng", 400);
  }

  const hashedPassword = await bcrypt.hash(matKhauMoi, 10);
  await prisma.taiKhoan.update({
    where: { id: BigInt(userId) },
    data: { matKhau: hashedPassword },
  });

  return { message: "Đổi mật khẩu thành công" };
};

// Cập nhật các trường trên bảng taiKhoan (giới tính, ngày sinh, địa chỉ, ảnh)
const capNhatHoSo = async (userId, data) => {
  const taiKhoan = await prisma.taiKhoan.findUnique({
    where: { id: BigInt(userId) },
  });

  if (!taiKhoan) {
    throw new AppError("Không tìm thấy tài khoản", 404);
  }

  const updated = await prisma.taiKhoan.update({
    where: { id: BigInt(userId) },
    data: {
      gioiTinh: data.gioiTinh !== undefined ? data.gioiTinh : undefined,
      ngaySinh: data.ngaySinh !== undefined ? new Date(data.ngaySinh) : undefined,
      diaChi: data.diaChi !== undefined ? data.diaChi : undefined,
      anhDaiDien: data.anhDaiDien !== undefined ? data.anhDaiDien : undefined,
    },
    select: {
      id: true, email: true, vaiTro: true, gioiTinh: true,
      ngaySinh: true, diaChi: true, anhDaiDien: true,
    },
  });

  return updated;
};

module.exports = { register, login, refreshAccessToken, logout, getMe, doiMatKhau, capNhatHoSo };
