const { asyncHandler, AppError } = require("../middlewares/error.middleware");
const { PrismaClient } = require("@prisma/client");
const vnpayService = require("../services/vnpay.service");

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

// Helper handle bigInt serialization
BigInt.prototype.toJSON = function () {
  return Number(this);
};

// @desc    Tạo URL thanh toán VNPay
// @route   POST /api/vnpay/create-payment
// @access  Private (Patient)
const createPayment = asyncHandler(async (req, res, next) => {
  const { datLichId, loaiGiaoDich } = req.body; // "PHI_KHAM" | "DON_THUOC"
  const ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (!datLichId || !loaiGiaoDich) {
    return next(new AppError("Thiếu thông tin đặt lịch hoặc loại giao dịch", 400));
  }

  const datLich = await prisma.datLich.findUnique({
    where: { id: BigInt(datLichId) },
    include: { donThuoc: true },
  });

  if (!datLich) {
    return next(new AppError("Không tìm thấy lịch hẹn", 404));
  }

  // Quyền sở hữu
  if (datLich.benhNhanId !== req.user.id && req.user.vaiTro !== "admin") {
    return next(new AppError("Bạn không có quyền thanh toán cho lịch hẹn này", 403));
  }

  let amount = 0;
  if (loaiGiaoDich === "PHI_KHAM") {
    amount = Number(datLich.giaKham);
    if (datLich.trangThaiThanhToan >= 1) {
      return next(new AppError("Phí khám đã được thanh toán", 400));
    }
  } else if (loaiGiaoDich === "DON_THUOC") {
    if (!datLich.donThuoc) {
      return next(new AppError("Lịch hẹn chưa có đơn thuốc", 400));
    }
    amount = Number(datLich.donThuoc.tongTien);
    if (datLich.trangThaiThanhToan >= 2) {
      return next(new AppError("Đơn thuốc đã được thanh toán", 400));
    }
  } else {
    return next(new AppError("Loại giao dịch không hợp lệ", 400));
  }

  const paymentUrl = await vnpayService.createPaymentUrl({
    datLichId: datLich.id,
    amount,
    loaiGiaoDich,
    ipAddr,
  });

  // Lưu log giao dịch ở trạng thái chờ
  await prisma.giaoDich.create({
    data: {
      datLichId: datLich.id,
      loaiGiaoDich,
      soTien: amount,
      maThamChieu: paymentUrl.split("vnp_TxnRef=")[1]?.split("&")[0],
      trangThai: 0, // 0: Chờ
    },
  });

  res.status(200).json({
    success: true,
    paymentUrl,
  });
});

// @desc    Xử lý VNPay trả về (Redirect)
// @route   GET /api/vnpay/return
// @access  Public
const vnpayReturn = asyncHandler(async (req, res) => {
  const vnp_Params = req.query;
  const isValid = vnpayService.verifyReturnUrl({ ...vnp_Params });

  if (isValid) {
    const responseCode = vnp_Params["vnp_ResponseCode"];
    if (responseCode === "00") {
      res.status(200).json({ success: true, message: "Thanh toán thành công" });
    } else {
      res.status(200).json({ success: false, message: "Thanh toán thất bại", code: responseCode });
    }
  } else {
    res.status(400).json({ success: false, message: "Chữ ký không hợp lệ" });
  }
});

// @desc    Xử lý VNPay IPN (Server-to-Server)
// @route   GET /api/vnpay/ipn
// @access  Public
const vnpayIpn = asyncHandler(async (req, res) => {
  let vnp_Params = req.query;
  const secureHash = vnp_Params["vnp_SecureHash"];

  const isValid = vnpayService.verifyReturnUrl({ ...vnp_Params });

  if (!isValid) {
    return res.status(200).json({ RspCode: "97", Message: "Checksum failed" });
  }

  const vnp_TxnRef = vnp_Params["vnp_TxnRef"];
  const vnp_ResponseCode = vnp_Params["vnp_ResponseCode"];
  const vnp_TransactionNo = vnp_Params["vnp_TransactionNo"];
  const vnp_Amount = Number(vnp_Params["vnp_Amount"]) / 100;

  // Parse TxnRef: {datLichId}_{loaiGiaoDich}_{timestamp}
  const [datLichId, loaiGiaoDich] = vnp_TxnRef.split("_");

  try {
    const datLich = await prisma.datLich.findUnique({
      where: { id: BigInt(datLichId) },
    });

    if (!datLich) {
      return res.status(200).json({ RspCode: "01", Message: "Order not found" });
    }

    // Kiểm tra số tiền (tùy chọn nhưng nên làm)
    // if (vnp_Amount !== ...)

    if (vnp_ResponseCode === "00") {
      // Thanh toán thành công
      await prisma.$transaction([
        // 1. Cập nhật trạng thái thanh toán của lịch hẹn
        prisma.datLich.update({
          where: { id: BigInt(datLichId) },
          data: {
            trangThaiThanhToan: loaiGiaoDich === "PHI_KHAM" ? 1 : 2,
          },
        }),
        // 2. Cập nhật giao dịch
        prisma.giaoDich.updateMany({
          where: { maThamChieu: vnp_TxnRef },
          data: {
            trangThai: 1, // Thành công
            maGiaoDichVNP: vnp_TransactionNo,
          },
        }),
      ]);
      return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
    } else {
      // Thanh toán thất bại
      await prisma.giaoDich.updateMany({
        where: { maThamChieu: vnp_TxnRef },
        data: {
          trangThai: 2, // Thất bại
          maGiaoDichVNP: vnp_TransactionNo,
        },
      });
      return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
    }
  } catch (error) {
    console.error("VNPay IPN Error:", error);
    return res.status(200).json({ RspCode: "99", Message: "Unknow error" });
  }
});

module.exports = {
  createPayment,
  vnpayReturn,
  vnpayIpn,
};
