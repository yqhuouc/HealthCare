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

/**
 * Gửi email thông báo sau khi khám (Cảm ơn + Chẩn đoán)
 * @param {string} toEmail - Email bệnh nhân
 * @param {string} patientName - Tên bệnh nhân
 * @param {string} diagnosis - Chẩn đoán bệnh
 * @param {number} totalAmount - Tổng tiền thanh toán (Phí khám + Thuốc)
 */
const sendPostExamEmail = async (toEmail, patientName, diagnosis, totalAmount) => {
  const loginUrl = `${config.clientUrl}/login`;

  // Format tiền tệ
  const formattedAmount = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalAmount);

  const mailOptions = {
    from: '"HealthCare Clinic" <no-reply@healthcare.vn>',
    to: toEmail,
    subject: "Kết quả thăm khám và Chẩn đoán bệnh — HealthCare",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0ea5e9, #0369a1); padding: 35px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; letter-spacing: 0.5px;">🏥 Phòng Khám HealthCare</h1>
          <p style="color: #e0f2fe; margin: 8px 0 0; font-size: 15px;">Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ</p>
        </div>

        <!-- Body -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #0f172a; margin: 0 0 15px; font-size: 20px;">Kính gửi ${patientName},</h2>
          <p style="color: #475569; line-height: 1.6; font-size: 15px; margin-bottom: 25px;">
            Quá trình thăm khám của bạn đã hoàn tất. Dưới đây là thông tin chẩn đoán sơ bộ từ Bác sĩ điều trị:
          </p>

          <!-- Diagnosis Box -->
          <div style="background-color: #f8fafc; border-left: 4px solid #0ea5e9; padding: 20px; border-radius: 0 8px 8px 0; margin-bottom: 30px;">
            <p style="margin: 0; font-size: 13px; color: #64748b; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Kết luận chẩn đoán</p>
            <p style="margin: 8px 0 0; font-size: 18px; color: #0f172a; font-weight: 500;">
              ${diagnosis || "Chưa có kết luận cụ thể"}
            </p>
          </div>

          <!-- Payment Info -->
          <div style="background-color: #fffbeb; border: 1px solid #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
            <p style="margin: 0; color: #b45309; font-size: 14px; font-weight: 500;">Tổng thanh toán (Bao gồm tiền thuốc)</p>
            <p style="margin: 5px 0 0; color: #d97706; font-size: 24px; font-weight: bold;">${formattedAmount}</p>
          </div>

          <p style="color: #475569; line-height: 1.6; font-size: 15px; margin-bottom: 25px;">
            Để xem chi tiết Toa Thuốc (bao gồm danh sách thuốc và liều lượng) cũng như tiến hành thanh toán Online tiện lợi, vui lòng truy cập hệ thống của chúng tôi.
          </p>

          <!-- Call to Action -->
          <div style="text-align: center; margin: 35px 0;">
            <a href="${loginUrl}" style="background-color: #0ea5e9; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.2);">
              Xem Chi Tiết & Thanh Toán
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />

          <p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 0; line-height: 1.5;">
            Trân trọng,<br/>
            <strong>Đội ngũ Y Bác sĩ HealthCare</strong>
          </p>
        </div>
      </div>
    `,
  };
};

module.exports = { sendOTPEmail, sendPostExamEmail };
