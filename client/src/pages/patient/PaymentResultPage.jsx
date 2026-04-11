/**
 * ============================================================
 * TRANG: Kết quả thanh toán VNPay (Bệnh nhân)
 * Đường dẫn: /payment/result
 * ============================================================
 * 
 * Chức năng:
 * - Tiếp nhận người dùng quay trở lại từ cổng VNPay.
 * - Đọc các tham số (vnp_ResponseCode, vnp_Amount...) từ URL.
 * - Hiển thị thông báo Thành công / Thất bại trực quan.
 * - Điều hướng người dùng về trang Lịch sử hoặc Trang chủ.
 */
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { formatPrice } from "../../utils/formatters";
import { paymentService } from "../../services/paymentService";


export default function PaymentResultPage() {
  // Hook để lấy các tham số "query string" trên thanh địa chỉ (URL)
  const [searchParams] = useSearchParams();
  
  // 1. TRÍCH XUẤT DỮ LIỆU TỪ VNPAY GỬI VỀ
  // Mã phản hồi: "00" là thành công, còn lại là lỗi
  const responseCode = searchParams.get("vnp_ResponseCode");
  
  // Số tiền: VNPay gửi đơn vị đồng nhưng nhân 100 (cent), nên ta phải chia lại 100
  const amount = Number(searchParams.get("vnp_Amount")) / 100;
  
  // Thông tin nội dung thanh toán bạn đã nhập ở Backend
  const ordInfo = searchParams.get("vnp_OrderInfo");
  
  // Mã tham chiếu duy nhất của giao dịch (ID lịch hẹn_loại_timestamp)
  const txnRef = searchParams.get("vnp_TxnRef");
  
  // Mã ngân hàng thực hiện giao dịch (VD: NCB, VCB...)
  const bankCode = searchParams.get("vnp_BankCode");

  // Biến cờ (flag) để kiểm tra nhanh giao dịch có thành công không
  const isSuccess = responseCode === "00";

  // Trạng thái chờ: Chỉ "loading" nếu giao dịch thành công và cần xác thực với Backend
  const [loading, setLoading] = useState(isSuccess);

  useEffect(() => {
    // 2. GỬI DỮ LIỆU LÊN BACKEND ĐỂ XÁC THỰC & ĐỒNG BỘ DB
    // Bước này cực kỳ quan trọng để localhost vẫn cập nhật được "Đã thanh toán"
    if (isSuccess) {
      // Chuyển searchParams thành object đơn giản để gửi API
      const params = Object.fromEntries(searchParams.entries());
      
      paymentService
        .verifyVnpayPayment(params)
        .then(() => {
          console.log("Đã đồng bộ trạng thái thanh toán thành công.");
        })
        .catch((err) => {
          console.error("Lỗi đồng bộ thanh toán:", err);
        })
        .finally(() => {
          // Sau khi xử lý xong (hoặc lỗi) thì mới tắt loading
          setLoading(false);
        });
    }
  }, [isSuccess, searchParams]);


  // Giao diện hiển thị lúc đang "xác thực"
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">Đang xác thực giao dịch...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* PHẦN BANNER: Màu xanh nếu thành công, Màu đỏ nếu thất bại */}
        <div className={`py-12 text-center ${isSuccess ? "bg-emerald-500" : "bg-red-500"}`}>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
            <span className="material-symbols-outlined text-5xl text-white">
              {isSuccess ? "check_circle" : "error"}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            {isSuccess ? "Thanh toán thành công" : "Giao dịch thất bại"}
          </h1>
          <p className="text-white/80 text-sm mt-1">
            {isSuccess ? "Cảm ơn bạn đã sử dụng dịch vụ" : "Vui lòng thử lại hoặc liên hệ hỗ trợ"}
          </p>
        </div>

        {/* PHẦN CHI TIẾT GIAO DỊCH: Hiển thị các thông tin hóa đơn */}
        <div className="p-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Số tiền:</span>
              <span className="font-bold text-slate-800 text-lg">{formatPrice(amount)}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm border-t border-slate-50 pt-4">
              <span className="text-slate-400">Nội dung:</span>
              <span className="text-slate-600 text-right max-w-[180px] wrap-break-word">{ordInfo}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm border-t border-slate-50 pt-4">
              <span className="text-slate-400">Ngân hàng:</span>
              <span className="font-medium text-slate-700">{bankCode}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm border-t border-slate-50 pt-4">
              <span className="text-slate-400">Mã tham chiếu:</span>
              <span className="font-mono text-xs text-slate-500">{txnRef}</span>
            </div>
          </div>

          {/* CÁC NÚT ĐIỀU HƯỚNG */}
          <div className="mt-10 space-y-3">
            <Link
              to="/appointments"
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition shadow-lg ${
                isSuccess 
                  ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              <span className="material-symbols-outlined">
                {isSuccess ? "history" : "refresh"}
              </span>
              {isSuccess ? "Xem lịch sử khám" : "Thanh toán lại"}
            </Link>
            
            <Link
              to="/"
              className="w-full py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition border border-transparent flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">home</span>
              Về trang chủ
            </Link>
          </div>
        </div>

        {/* CHỮ KÝ DƯỚI CÙNG: Tăng độ tin cậy cho giao diện */}
        <div className="px-8 pb-8 text-center">
          <p className="text-[10px] text-slate-400 leading-relaxed uppercase tracking-widest font-bold">
            HealthCare Payment Gateway Service
          </p>
        </div>
      </div>
    </div>
  );
}
