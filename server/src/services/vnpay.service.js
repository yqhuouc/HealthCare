const crypto = require("crypto");
const dayjs = require("dayjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Hàm hỗ trợ sắp xếp các tham số VNPay theo bảng chữ cái (required by VNPay)
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

const createPaymentUrl = async ({ datLichId, amount, loaiGiaoDich, ipAddr }) => {
  const tmnCode = process.env.VNP_TMN_CODE;
  const secretKey = process.env.VNP_HASH_SECRET;
  const vnpUrl = process.env.VNP_URL;
  const returnUrl = process.env.VNP_RETURN_URL;

  const date = dayjs();
  const createDate = date.format("YYYYMMDDHHmmss");

  const vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: `${datLichId}_${loaiGiaoDich}_${date.valueOf()}`, // id_loai_timestamp
    vnp_OrderInfo: `Thanh toan ${loaiGiaoDich.toLowerCase() === "phi_kham" ? "phi kham" : "don thuoc"} - Ma lich: ${datLichId}`,
    vnp_OrderType: "other",
    vnp_Amount: amount * 100, // VNPay tính theo đồng * 100
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  const sortedParams = sortObject(vnp_Params);
  const signData = require("qs").stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  sortedParams["vnp_SecureHash"] = signed;

  const queryParams = require("qs").stringify(sortedParams, { encode: false });
  return `${vnpUrl}?${queryParams}`;
};

const verifyReturnUrl = (vnpParams) => {
  const secretKey = process.env.VNP_HASH_SECRET;
  const secureHash = vnpParams["vnp_SecureHash"];

  delete vnpParams["vnp_SecureHash"];
  delete vnpParams["vnp_SecureHashType"];

  const sortedParams = sortObject(vnpParams);
  const signData = require("qs").stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  return secureHash === signed;
};

module.exports = {
  createPaymentUrl,
  verifyReturnUrl,
};
