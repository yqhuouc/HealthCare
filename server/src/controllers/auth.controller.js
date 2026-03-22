/**
 * Controller xác thực: nhận HTTP, gọi auth.service, set/xóa cookie JWT, trả JSON.
 * Lỗi nghiệp vụ do service ném → asyncHandler chuyển sang errorHandler.
 */
const { asyncHandler } = require("../middlewares/error.middleware");
const authService = require("../services/auth.service");
const config = require("../config");

// Thuộc tính chung cho cookie (clearCookie cũng dùng; không set maxAge khi xóa)
const COOKIE_BASE = {
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: "strict",
};

// Access: ngắn, path / — browser gửi kèm request tới API (cùng site hoặc CORS + credentials)
const ACCESS_COOKIE_OPTIONS = {
  ...COOKIE_BASE,
  maxAge: 15 * 60 * 1000,
  path: "/",
};

// Refresh: dài, path /api/auth — chỉ gửi khi URL khớp prefix auth (giảm rủi ro lộ token)
const REFRESH_COOKIE_OPTIONS = {
  ...COOKIE_BASE,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/api/auth",
};

// POST /register — tạo tài khoản + bệnh nhân (logic trong service)
const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, message: "Đăng ký thành công", data: result });
});

// POST /login — token chỉ trong HttpOnly cookie, body chỉ trả user
const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);

  res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

  res.json({
    success: true,
    message: "Đăng nhập thành công",
    data: { user },
  });
});

// POST /refresh — đọc refresh từ cookie, cấp cặp token mới + ghi đè cookie
const refresh = asyncHandler(async (req, res) => {
  const oldRefreshToken = req.cookies.refreshToken;
  const { accessToken, refreshToken } = await authService.refreshAccessToken(oldRefreshToken);

  res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

  res.json({ success: true, message: "Token đã được làm mới" });
});

// POST /logout — xóa refresh ở DB + xóa cookie (path phải khớp lúc set)
const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);

  res.clearCookie("accessToken", { ...COOKIE_BASE, path: "/" });
  res.clearCookie("refreshToken", { ...COOKIE_BASE, path: "/api/auth" });

  res.json({ success: true, message: "Đăng xuất thành công" });
});

// GET /me — cần authenticate; req.user do middleware gắn
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  res.json({ success: true, data: user });
});

// PUT /doi-mat-khau — đã đăng nhập
const doiMatKhau = asyncHandler(async (req, res) => {
  const result = await authService.doiMatKhau(req.user.id, req.body);
  res.json({ success: true, message: result.message });
});

// PUT /cap-nhat-ho-so — cập nhật trường trên taiKhoan
const capNhatHoSo = asyncHandler(async (req, res) => {
  const result = await authService.capNhatHoSo(req.user.id, req.body);
  res.json({ success: true, message: "Cập nhật hồ sơ thành công", data: result });
});

module.exports = { register, login, refresh, logout, getMe, doiMatKhau, capNhatHoSo };
