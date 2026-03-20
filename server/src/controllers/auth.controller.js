const { asyncHandler } = require("../middlewares/error.middleware");
const authService = require("../services/auth.service");
const config = require("../config");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
};

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, message: "Đăng ký thành công", data: result });
});

const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);

  // Set refreshToken vào HttpOnly Cookie
  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

  res.json({
    success: true,
    message: "Đăng nhập thành công",
    data: { user, accessToken },
  });
});

const refresh = asyncHandler(async (req, res) => {
  const oldRefreshToken = req.cookies.refreshToken;
  const { accessToken, refreshToken } = await authService.refreshAccessToken(oldRefreshToken);

  // Set refreshToken mới vào HttpOnly Cookie
  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

  res.json({ success: true, data: { accessToken } });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);

  // Xóa cookie
  res.clearCookie("refreshToken", COOKIE_OPTIONS);

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
