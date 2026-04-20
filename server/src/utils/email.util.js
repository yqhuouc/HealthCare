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
 * Gửi email đặt lại mật khẩu
 * @param {string} toEmail - Địa chỉ email người nhận
 * @param {string} resetToken - JWT token dùng để reset password
 */
const sendResetPasswordEmail = async (toEmail, resetToken) => {
  const resetUrl = `${config.clientUrl}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: '"HealthCare Support" <no-reply@healthcare.vn>',
    to: toEmail,
    subject: "Yêu cầu đặt lại mật khẩu — HealthCare",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e88e5, #1565c0); padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🏥 HealthCare</h1>
          <p style="color: #bbdefb; margin: 8px 0 0; font-size: 14px;">Nền tảng đặt lịch khám bệnh trực tuyến</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px;">
          <h2 style="color: #1e293b; margin: 0 0 16px;">Đặt lại mật khẩu</h2>
          <p style="color: #64748b; line-height: 1.6;">
            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. 
            Nhấn vào nút bên dưới để tạo mật khẩu mới:
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #1e88e5, #1565c0); color: #ffffff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
              Đặt lại mật khẩu
            </a>
          </div>

          <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
            ⏱️ Link này sẽ hết hạn sau <strong>15 phút</strong>.<br/>
            Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
          </p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

          <p style="color: #cbd5e1; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} HealthCare. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendResetPasswordEmail };
