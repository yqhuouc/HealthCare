import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { formatPrice } from "../../utils/formatters";

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // VNPay params
  const responseCode = searchParams.get("vnp_ResponseCode");
  const amount = Number(searchParams.get("vnp_Amount")) / 100;
  const ordInfo = searchParams.get("vnp_OrderInfo");
  const txnRef = searchParams.get("vnp_TxnRef");
  const bankCode = searchParams.get("vnp_BankCode");

  const isSuccess = responseCode === "00";

  useEffect(() => {
    // Giả lập thời gian load kết quả
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

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
        {/* State Banner */}
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

        {/* Details Section */}
        <div className="p-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Số tiền:</span>
              <span className="font-bold text-slate-800 text-lg">{formatPrice(amount)}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-slate-50 pt-4">
              <span className="text-slate-400">Nội dung:</span>
              <span className="text-slate-600 text-right max-w-[180px] break-words">{ordInfo}</span>
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

        {/* Footer info */}
        <div className="px-8 pb-8 text-center">
          <p className="text-[10px] text-slate-400 leading-relaxed uppercase tracking-widest font-bold">
            HealthCare Payment Gateway Service
          </p>
        </div>
      </div>
    </div>
  );
}
