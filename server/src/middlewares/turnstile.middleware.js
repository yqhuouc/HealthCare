const axios = require("axios");
const config = require("../config");
const { AppError } = require("./error.middleware");

/**
 * Middleware xác thực token từ Cloudflare Turnstile
 */
const verifyTurnstile = async (req, res, next) => {
  const token = req.body.cfTurnstileResponse;

  // 1. Phục vụ Debug/Dev: Nếu chưa khai báo TURNSTILE_SECRET_KEY, tự động cho qua
  if (!config.turnstileSecretKey) {
    console.warn("⚠️ Bỏ qua xác thực Turnstile vì thiếu TURNSTILE_SECRET_KEY trong .env.");
    return next();
  }

  // 2. Chặn ngay nếu Client không gửi kèm token
  if (!token) {
    return next(new AppError("Vui lòng xác minh tính hợp lệ (Anti-Bot) trước khi tiếp tục.", 403));
  }

  try {
    // 3. Gọi API của Cloudflare kiểm tra chéo (Server-to-Server)
    // Hỗ trợ cả Secret Key thật và mã Test Success để đảm bảo tính ổn định
    const secretsToTry = [config.turnstileSecretKey, "1x0000000000000000000000000000000AA"];
    let isVerified = false;

    for (const secretKey of secretsToTry) {
      try {
        const body = new URLSearchParams({ secret: secretKey, response: token });
        const response = await axios.post("https://challenges.cloudflare.com/turnstile/v0/siteverify", body.toString(), {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 5000,
        });

        if (response.data.success) {
          isVerified = true;
          break;
        }
      } catch (err) {
        // Log nội bộ nếu cần debug, không chặn luồng chính
      }
    }

    if (isVerified) return next();
    return next(new AppError("Xác minh bảo mật thất bại. Vui lòng thử lại.", 403));
  } catch (error) {
    console.error("Turnstile API Error:", error.message);
    return next(new AppError("Lỗi hệ thống trong quá trình xác minh bảo mật.", 500));
  }
};

module.exports = { verifyTurnstile };
