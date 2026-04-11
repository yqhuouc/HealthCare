const { asyncHandler, AppError } = require("../middlewares/error.middleware");
const vnpayService = require("../services/vnpay.service");

/**
 * @desc    Tạo URL thanh toán VNPay
 * @route   POST /api/vnpay/create-payment
 * @access  Private (Patient)
 */
const createPayment = asyncHandler(async (req, res) => {
  const { datLichId, loaiGiaoDich } = req.body;
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  // Xử lý IP localhost IPv6
  if (ipAddr === "::1" || ipAddr === "::ffff:127.0.0.1") {
    ipAddr = "127.0.0.1";
  }

  if (!datLichId || !loaiGiaoDich) {
    throw new AppError("Thiếu thông tin đặt lịch hoặc loại giao dịch", 400);
  }

  // Gọi Service để xử lý toàn bộ logic nghiệp vụ & DB
  const paymentUrl = await vnpayService.initiatePayment({
    datLichId,
    loaiGiaoDich,
    ipAddr,
    user: req.user,
  });

  res.status(200).json({
    success: true,
    paymentUrl,
  });
});

/**
 * @desc    Xử lý VNPay trả về (Redirect URL cho người dùng)
 * @route   GET /api/vnpay/return
 * @access  Public
 */
const vnpayReturn = asyncHandler(async (req, res) => {
  const vnpParams = req.query;
  const verify = vnpayService.verifyReturnUrl(vnpParams);

  if (verify.isSuccess) {
    const responseCode = vnpParams["vnp_ResponseCode"];
    if (responseCode === "00") {
      res.status(200).json({ success: true, message: "Thanh toán thành công" });
    } else {
      res.status(200).json({
        success: false,
        message: "Thanh toán thất bại",
        code: responseCode,
      });
    }
  } else {
    res.status(400).json({ success: false, message: "Chữ ký không hợp lệ" });
  }
});

/**
 * @desc    Xử lý VNPay IPN (Server-to-Server callback)
 * @route   GET /api/vnpay/ipn
 * @access  Public
 */
const vnpayIpn = asyncHandler(async (req, res) => {
  const vnpParams = req.query;

  // Gọi Service để thực hiện xác thực và cập nhật Database (Prisma Transaction)
  const result = await vnpayService.processIpn(vnpParams);

  // VNPay yêu cầu trả về theo cấu trúc RspCode & Message
  res.status(200).json(result);
});

module.exports = {
  createPayment,
  vnpayReturn,
  vnpayIpn,
};
