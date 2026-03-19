/**
 * ============================================================
 * CONTROLLER: Xác thực (Authentication)
 * ============================================================
 * - POST /api/auth/register  → Đăng ký tài khoản bệnh nhân
 * - POST /api/auth/login     → Đăng nhập (trả JWT)
 * - GET  /api/auth/me        → Lấy thông tin user đang đăng nhập
 * ============================================================
 */
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");
const config = require("../config");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * ĐĂNG KÝ tài khoản mới (mặc định vai trò "benh_nhan").
 * Flow: check email trùng → hash mật khẩu → tạo TaiKhoan + BenhNhan trong transaction
 */
const register = async (req, res) => {
  const { email, matKhau, hoTen, soDienThoai, gioiTinh, ngaySinh, diaChi } = req.body;

  // Kiểm tra email đã tồn tại chưa
  const existingAccount = await prisma.taiKhoan.findUnique({ where: { email } });
  if (existingAccount) {
    return sendError(res, "Email đã được sử dụng", 409);
  }

  // Hash mật khẩu với bcrypt (salt rounds = 10)
  const hashedPassword = await bcrypt.hash(matKhau, 10);

  // Transaction: tạo TaiKhoan + BenhNhan cùng lúc, đảm bảo tính nhất quán
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

  // Tạo JWT token
  const token = jwt.sign(
    { id: result.taiKhoan.id, email: result.taiKhoan.email, vaiTro: result.taiKhoan.vaiTro },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  return sendSuccess(res, {
    token,
    user: {
      id: result.taiKhoan.id,
      email: result.taiKhoan.email,
      vaiTro: result.taiKhoan.vaiTro,
      hoTen: result.benhNhan.hoTen,
    },
  }, "Đăng ký thành công", 201);
};

/**
 * ĐĂNG NHẬP.
 * Flow: tìm tài khoản theo email → so sánh mật khẩu → kiểm tra trạng thái → trả JWT
 */
const login = async (req, res) => {
  const { email, matKhau } = req.body;

  // Tìm tài khoản kèm thông tin bác sĩ/bệnh nhân
  const taiKhoan = await prisma.taiKhoan.findUnique({
    where: { email },
    include: { bacSi: true, benhNhan: true },
  });

  if (!taiKhoan) {
    return sendError(res, "Email hoặc mật khẩu không đúng", 401);
  }

  // Kiểm tra tài khoản có bị khóa không
  if (taiKhoan.trangThaiTaiKhoan === 0) {
    return sendError(res, "Tài khoản đã bị khóa. Vui lòng liên hệ admin.", 403);
  }

  // So sánh mật khẩu đã hash
  const isMatch = await bcrypt.compare(matKhau, taiKhoan.matKhau);
  if (!isMatch) {
    return sendError(res, "Email hoặc mật khẩu không đúng", 401);
  }

  const token = jwt.sign(
    { id: taiKhoan.id, email: taiKhoan.email, vaiTro: taiKhoan.vaiTro },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  // Lấy tên hiển thị tùy vai trò
  let hoTen = "Admin";
  if (taiKhoan.benhNhan) hoTen = taiKhoan.benhNhan.hoTen;
  if (taiKhoan.bacSi) hoTen = taiKhoan.bacSi.tenBacSi;

  return sendSuccess(res, {
    token,
    user: {
      id: taiKhoan.id,
      email: taiKhoan.email,
      vaiTro: taiKhoan.vaiTro,
      hoTen,
    },
  }, "Đăng nhập thành công");
};

/**
 * LẤY THÔNG TIN user đang đăng nhập (từ JWT token).
 */
const getMe = async (req, res) => {
  const taiKhoan = await prisma.taiKhoan.findUnique({
    where: { id: BigInt(req.user.id) },
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
    return sendError(res, "Không tìm thấy tài khoản", 404);
  }

  return sendSuccess(res, taiKhoan, "Lấy thông tin thành công");
};

module.exports = { register, login, getMe };
