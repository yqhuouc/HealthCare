const { VNPay, ProductCode, VnpLocale, ignoreLogger } = require("vnpay");
const { PrismaClient } = require("@prisma/client");
const { AppError } = require("../middlewares/error.middleware");

const prisma = new PrismaClient();

/**
 * Service xử lý thanh toán VNPay sử dụng thư viện vnpayjs.
 * Cấu hình được tối ưu hóa dựa trên các best practice chống lỗi checksum và format.
 */
const vnpayInstance = new VNPay({
  tmnCode: process.env.VNP_TMN_CODE,
  secureSecret: process.env.VNP_HASH_SECRET,
  vnpayHost: "https://sandbox.vnpayment.vn",
  testMode: true,
  hashAlgorithm: "SHA512",
  enableLog: false,
  loggerFn: ignoreLogger,
});

/**
 * Helper: Chuẩn hóa IP address để đảm bảo định dạng IPv4 mà VNPay yêu cầu.
 */
function getIpAddress(ip) {
  if (!ip) return "127.0.0.1";
  if (ip === "::1" || ip === "::ffff:127.0.0.1") return "127.0.0.1";
  if (ip.startsWith("::ffff:")) return ip.substring(7);
  return ip;
}

/**
 * Helper: Làm sạch nội dung thanh toán (OrderInfo).
 * Loại bỏ tiếng Việt có dấu và ký tự đặc biệt để tránh lỗi Checksum của VNPay 2.1.0.
 */
function sanitizeOrderInfo(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu tiếng Việt
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9\s]/g, "") // Chỉ giữ lại chữ và số
    .substring(0, 255);
}

/**
 * Xử lý nghiệp vụ tạo thanh toán: kiểm tra lịch hẹn, tính tiền và tạo log giao dịch.
 */
const initiatePayment = async ({ datLichId, loaiGiaoDich, ipAddr, user }) => {
  const datLich = await prisma.datLich.findUnique({
    where: { id: BigInt(datLichId) },
    include: { donThuoc: true },
  });

  if (!datLich) {
    throw new AppError("Không tìm thấy lịch hẹn", 404);
  }

  if (datLich.benhNhanId !== user.benhNhan?.id && user.vaiTro !== "admin") {
    throw new AppError("Bạn không có quyền thanh toán cho lịch hẹn này", 403);
  }

  let amount = 0;
  if (loaiGiaoDich === "PHI_KHAM") {
    amount = Number(datLich.giaKham);
    if (datLich.trangThaiThanhToan >= 1) throw new AppError("Phí khám đã được thanh toán", 400);
  } else if (loaiGiaoDich === "DON_THUOC") {
    if (!datLich.donThuoc) throw new AppError("Lịch hẹn chưa có đơn thuốc", 400);
    amount = Number(datLich.donThuoc.tongTien);
    if (datLich.trangThaiThanhToan >= 2) throw new AppError("Đơn thuốc đã được thanh toán", 400);
  } else if (loaiGiaoDich === "TAT_CA") {
    if (!datLich.donThuoc) throw new AppError("Lịch hẹn chưa có đơn thuốc để thanh toán gộp", 400);
    amount = Number(datLich.giaKham) + Number(datLich.donThuoc.tongTien);
    if (datLich.trangThaiThanhToan >= 2) throw new AppError("Toàn bộ hóa đơn đã được thanh toán", 400);
  } else {
    throw new AppError("Loại giao dịch không hợp lệ", 400);
  }

  const txnRef = `${datLichId}_${loaiGiaoDich}_${Date.now()}`;
  const orderInfo = sanitizeOrderInfo(
    `Thanh toan ${
      loaiGiaoDich === "PHI_KHAM" ? "phi kham" : loaiGiaoDich === "TAT_CA" ? "tong hoa don" : "don thuoc"
    } Ma ${datLichId}`
  );

  const paymentUrl = vnpayInstance.buildPaymentUrl({
    vnp_Amount: amount,
    vnp_IpAddr: getIpAddress(ipAddr),
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: ProductCode.Other,
    vnp_ReturnUrl: process.env.VNP_RETURN_URL,
    vnp_Locale: VnpLocale.VN,
    vnp_CurrCode: "VND",
  });

  // Lưu log giao dịch
  await prisma.giaoDich.create({
    data: {
      datLichId: datLich.id,
      loaiGiaoDich,
      soTien: amount,
      maThamChieu: txnRef,
      trangThai: 0,
    },
  });

  return paymentUrl;
};

/**
 * Xử lý kết quả IPN từ VNPay và cập nhật Database một cách an toàn.
 */
const processIpn = async (vnpParams) => {
  const verify = vnpayInstance.verifyIpnCall(vnpParams); // Dùng verifyIpnCall chuyên dụng
  
  if (!verify.isVerified) {
    return { RspCode: "97", Message: "Invalid Checksum" };
  }

  const vnp_TxnRef = vnpParams["vnp_TxnRef"];
  const vnp_ResponseCode = vnpParams["vnp_ResponseCode"];
  const vnp_TransactionNo = vnpParams["vnp_TransactionNo"];
  const vnp_Amount = Number(vnpParams["vnp_Amount"]) / 100;

  // Cấu trúc txnRef: {datLichId}_{loaiGiaoDich}_{timestamp}
  // Ví dụ: 30_PHI_KHAM_123456789 -> parts: ["30", "PHI", "KHAM", "123456789"]
  const parts = vnp_TxnRef.split("_");
  const datLichIdStr = parts[0];
  const loaiGiaoDich = parts.slice(1, -1).join("_"); // Ghép lại "PHI_KHAM"
  const datLichId = BigInt(datLichIdStr);

  const datLich = await prisma.datLich.findUnique({ where: { id: datLichId } });
  if (!datLich) return { RspCode: "01", Message: "Order not found" };

  if (verify.isSuccess && vnp_ResponseCode === "00") {
    // Xác định trạng thái thanh toán mới
    let newStatus = 0;
    if (loaiGiaoDich === "PHI_KHAM") newStatus = 1;
    else if (loaiGiaoDich === "DON_THUOC" || loaiGiaoDich === "TAT_CA") newStatus = 2;
    
    // Nếu loaiGiaoDich không khớp (do lỗi logic split cũ), log ra để debug
    console.log(`[VNPAY IPN] datLichId: ${datLichId}, loai: ${loaiGiaoDich}, status: ${newStatus}`);


    await prisma.$transaction([
      prisma.datLich.update({
        where: { id: datLichId },
        data: { trangThaiThanhToan: newStatus },
      }),
      prisma.giaoDich.updateMany({
        where: { maThamChieu: vnp_TxnRef },
        data: {
          trangThai: 1,
          maGiaoDichVNP: vnp_TransactionNo,
        },
      }),
    ]);
  } else {
    await prisma.giaoDich.updateMany({
      where: { maThamChieu: vnp_TxnRef },
      data: {
        trangThai: 2,
        maGiaoDichVNP: vnp_TransactionNo,
      },
    });
  }

  return { RspCode: "00", Message: "Confirm Success" };
};

/**
 * Hàm xác thực chủ động dành cho Frontend (Verify & Sync)
 * Giúp localhost vẫn cập nhật được DB mà không cần IPN.
 */
const verifyAndSyncPayment = async (vnpParams) => {
  const verify = vnpayInstance.verifyReturnUrl(vnpParams);

  if (!verify.isSuccess) {
    throw new AppError("Chữ ký giao dịch không hợp lệ", 400);
  }

  const vnp_ResponseCode = vnpParams["vnp_ResponseCode"];
  
  // Nếu thành công, gọi processIpn để đồng bộ DB (tận dụng logic có sẵn)
  if (vnp_ResponseCode === "00") {
    await processIpn(vnpParams);
  }

  return {
    success: vnp_ResponseCode === "00",
    message: vnp_ResponseCode === "00" ? "Thanh toán thành công" : "Thanh toán thất bại",
    vnp_ResponseCode,
  };
};

const verifyReturnUrl = (vnpParams) => {
  return vnpayInstance.verifyReturnUrl(vnpParams);
};

module.exports = {
  initiatePayment,
  processIpn,
  verifyReturnUrl,
  verifyAndSyncPayment,
};
