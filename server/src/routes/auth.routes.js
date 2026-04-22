/**
 * Routes /api/auth — đăng ký, đăng nhập, refresh/logout, đổi mật khẩu, cập nhật hồ sơ, cập nhật ảnh đại diện, quên/đặt lại mật khẩu.
 */
const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { multerUpload } = require("../config/cloudinary.config");
const { verifyTurnstile } = require("../middlewares/turnstile.middleware");
const { registerSchema, loginSchema, doiMatKhauSchema, capNhatHoSoSchema, forgotPasswordSchema, resetPasswordSchema } = require("../validations/auth.validation");

// POST /api/auth/register - Đăng ký (bệnh nhân)
router.post("/register", verifyTurnstile, validate(registerSchema), authController.register);

// POST /api/auth/login - Đăng nhập
router.post("/login", verifyTurnstile, validate(loginSchema), authController.login);

// POST /api/auth/refresh - Làm mới access token
router.post("/refresh", authController.refresh);

// POST /api/auth/logout - Đăng xuất
router.post("/logout", authenticate, authController.logout);

// GET /api/auth/me - Lấy thông tin tài khoản
router.get("/me", authenticate, authController.getMe);

// PUT /api/auth/doi-mat-khau - Đổi mật khẩu
router.put("/doi-mat-khau", authenticate, validate(doiMatKhauSchema), authController.doiMatKhau);

// PUT /api/auth/cap-nhat-ho-so - Cập nhật hồ sơ
router.put("/cap-nhat-ho-so", authenticate, validate(capNhatHoSoSchema), authController.capNhatHoSo);

// PUT /api/auth/cap-nhat-avatar - Tải ảnh đại diện (multipart/form-data qua Cloudinary)
router.put("/cap-nhat-avatar", authenticate, multerUpload.single("avatar"), authController.capNhatAvatar);

// POST /api/auth/forgot-password - Quên mật khẩu (gửi email reset)
router.post("/forgot-password", verifyTurnstile, validate(forgotPasswordSchema), authController.forgotPassword);

// POST /api/auth/reset-password - Đặt lại mật khẩu (dùng token từ email)
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;

