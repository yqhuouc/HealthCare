const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { registerValidator, loginValidator } = require("../validators/auth.validator");
const validate = require("../middlewares/validate");
const { authenticate } = require("../middlewares/auth");
const asyncHandler = require("../utils/asyncHandler");

// POST /api/auth/register - Đăng ký tài khoản
router.post("/register", registerValidator, validate, asyncHandler(authController.register));

// POST /api/auth/login - Đăng nhập
router.post("/login", loginValidator, validate, asyncHandler(authController.login));

// GET /api/auth/me - Lấy thông tin user đang đăng nhập (cần token)
router.get("/me", authenticate, asyncHandler(authController.getMe));

module.exports = router;
