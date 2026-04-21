/**
 * Tiện ích gửi email — sử dụng nodemailer.
 * Dùng Mailtrap (sandbox) trong môi trường development, có thể chuyển sang
 * Gmail / SendGrid / SES khi deploy production.
 */
const nodemailer = require("nodemailer");
const config = require("../config");

// Tạo transporter SMTP
const transporter = nodemailer.createTransport({
  host: config.emailHost,
  port: Number(config.emailPort),
  secure: Number(config.emailPort) === 465, // true cho cổng 465 (Gmail SSL), false cho cổng khác
  auth: {
    user: config.emailUser,
    pass: config.emailPass,
  },
});

/**
 * Gửi email chứa mã OTP đặt lại mật khẩu
 * @param {string} toEmail - Địa chỉ email người nhận
 * @param {string} otp - Mã OTP 6 số
 */
const sendOTPEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: '"HealthCare Support" <no-reply@healthcare.vn>',
    to: toEmail,
    subject: "Mã OTP đặt lại mật khẩu — HealthCare",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #f1f5f9;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e88e5, #0d47a1); padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px;">🏥 HealthCare</h1>
          <p style="color: #bbdefb; margin: 10px 0 0; font-size: 15px;">Nền tảng chăm sóc sức khỏe trực tuyến</p>
        </div>

        <!-- Body -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #0f172a; margin: 0 0 20px; font-size: 22px;">Yêu cầu đặt lại mật khẩu</h2>
          <p style="color: #475569; line-height: 1.6; font-size: 16px; margin-bottom: 30px;">
            Chào bạn,<br/><br/>
            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản ứng với email này. Dưới đây là mã xác thực (OTP) của bạn:
          </p>

          <div style="text-align: center; margin: 40px 0; background-color: #f8fafc; padding: 30px; border-radius: 12px; border: 1px dashed #cbd5e1;">
            <span style="font-size: 42px; font-weight: bold; color: #1e88e5; letter-spacing: 8px; font-family: monospace;">${otp}</span>
          </div>

          <p style="color: #64748b; font-size: 14px; line-height: 1.6; background-color: #fffbeb; padding: 15px; border-left: 4px solid #f59e0b; border-radius: 4px;">
            ⚠️ <strong>Lưu ý:</strong> Mã OTP này chỉ có hiệu lực trong vòng <strong>5 phút</strong>. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.
          </p>
          
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin-top: 20px;">
            Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này hoặc liên hệ ngay với bộ phận hỗ trợ nếu nghi ngờ tài khoản bị xâm nhập.
          </p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />

          <p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} HealthCare. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };
