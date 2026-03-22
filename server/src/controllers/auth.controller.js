const { asyncHandler } = require("../middlewares/error.middleware");
const authService = require("../services/auth.service");
const config = require("../config");

// ===== COOKIE OPTIONS =====
// Options chung (dùng cho clearCookie — KHÔNG có maxAge)
const COOKIE_BASE = {
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: "strict",
};

// Access Token: ngắn hạn (15 phút), gửi kèm mọi request
const ACCESS_COOKIE_OPTIONS = {
  ...COOKIE_BASE,
  maxAge: 15 * 60 * 1000, // 15 phút
  path: "/",
};

// Refresh Token: dài hạn (7 ngày), CHỈ gửi khi gọi /api/auth
const REFRESH_COOKIE_OPTIONS = {
  ...COOKIE_BASE,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
  path: "/api/auth",
};

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, message: "Đăng ký thành công", data: result });
});

const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);

  // Set cả 2 token vào HttpOnly Cookie
  res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

  // KHÔNG trả token trong JSON body → bảo mật tối đa
  res.json({
    success: true,
    message: "Đăng nhập thành công",
    data: { user },
  });
});

const refresh = asyncHandler(async (req, res) => {
  const oldRefreshToken = req.cookies.refreshToken;
  const { accessToken, refreshToken } = await authService.refreshAccessToken(oldRefreshToken);

  // Set token mới vào HttpOnly Cookie
  res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

  res.json({ success: true, message: "Token đã được làm mới" });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);

  // Xóa cả 2 cookie — chỉ truyền options cần thiết (KHÔNG có maxAge)
  res.clearCookie("accessToken", { ...COOKIE_BASE, path: "/" });
  res.clearCookie("refreshToken", { ...COOKIE_BASE, path: "/api/auth" });

  res.json({ success: true, message: "Đăng xuất thành công" });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  res.json({ success: true, data: user });
});

const doiMatKhau = asyncHandler(async (req, res) => {
  const result = await authService.doiMatKhau(req.user.id, req.body);
  res.json({ success: true, message: result.message });
});

const capNhatHoSo = asyncHandler(async (req, res) => {
  const result = await authService.capNhatHoSo(req.user.id, req.body);
  res.json({ success: true, message: "Cập nhật hồ sơ thành công", data: result });
});

module.exports = { register, login, refresh, logout, getMe, doiMatKhau, capNhatHoSo };
