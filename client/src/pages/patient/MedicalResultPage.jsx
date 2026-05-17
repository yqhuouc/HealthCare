/**
 * ============================================================
 * TRANG: Kết quả khám bệnh & Đơn thuốc (Bệnh nhân)
 * Đường dẫn: /medical-results/:id
 * ============================================================
 *
 * Chức năng:
 * - Hiển thị Phiếu kết quả khám bệnh chuyên nghiệp (Document style)
 * - Tách bạch Phí khám và Phí đơn thuốc (khớp với SQL)
 * - Hiển thị chi tiết đơn thuốc: Số lượng, Liều dùng, Ghi chú cách dùng
 * - Tự động tính toán tổng hóa đơn
 * - Hỗ trợ in ấn (Print) tờ kết quả
 *
 * Dữ liệu: API /api/dat-lich/:id (kèm donThuoc, benhNhan, bacSi nested)
 * ============================================================
 */
import { useParams, Link } from "react-router-dom";
import { useAppointment } from "../../hooks/queries/useAppointmentQueries";
import { formatPrice } from "../../utils/formatters";
import { formatTime, formatDate } from "../../utils/dateUtils";
import { paymentService } from "../../services/paymentService";
import { toast } from "react-toastify";
import { useState } from "react";

export default function MedicalResultPage() {
  const { id } = useParams();
  const { data: aptRes, isLoading: loading } = useAppointment(id);
  const appointment = aptRes?.data || null;

  /** Lệnh in phiếu kết quả */
  const handlePrint = () => {
    window.print();
  };

  /** Xử lý thanh toán VNPay */
  const [paying, setPaying] = useState(false);
  const handlePayment = async (loaiGiaoDich) => {
    if (paying) return;
    try {
      setPaying(true);
      toast.info("Đang xử lý yêu cầu thanh toán...");
      const res = await paymentService.createVnpayPayment({
        datLichId: id,
        loaiGiaoDich: loaiGiaoDich, // "PHI_KHAM" hoặc "DON_THUOC"
      });
      if (res.paymentUrl) {
        window.location.assign(res.paymentUrl);
      } else {
        toast.error("Không nhận được liên kết thanh toán từ hệ thống.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error(err?.response?.data?.message || "Không thể tạo liên kết thanh toán. Vui lòng thử lại sau.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
        <p className="mt-4 text-slate-500">Đang tải kết quả khám...</p>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-300">search_off</span>
        <h2 className="text-xl font-semibold text-slate-700 mt-4">Không tìm thấy kết quả</h2>
        <Link to="/appointments" className="inline-block mt-6 px-6 py-2 bg-primary text-white rounded-lg">
          Quay lại lịch sử
        </Link>
      </div>
    );
  }

  const doctor = appointment.bacSi;
  const patient = appointment.benhNhan;
  const donThuoc = appointment.donThuoc;
  const isLocked = donThuoc?.isLocked === true;

  // Tổng tiền hóa đơn = Phí khám + Phí thuốc
  const examFee = Number(appointment.giaKham || 0);
  const medicineFee = Number(donThuoc?.tongTien || 0);
  const totalAmount = examFee + medicineFee;

  const daKham = appointment.trangThai === 2;
  const coDonThuoc = !!donThuoc;
  const daThanhToanXong = coDonThuoc
    ? appointment.trangThaiThanhToan >= 2
    : appointment.trangThaiThanhToan >= 1;
  const canShowPayment = daKham && !daThanhToanXong;

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 sm:px-6">
      {/* Nút điều hướng & In (Ẩn khi in) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 print:hidden">
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
          <Link to="/" className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <span className="material-symbols-outlined text-base">chevron_right</span>
          <Link to="/appointments" className="hover:text-primary transition-colors">
            Lịch sử
          </Link>
          <span className="material-symbols-outlined text-base">chevron_right</span>
          <span className="text-slate-900 font-semibold">Chi tiết kết quả</span>
        </nav>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-all font-semibold text-sm shadow-sm"
          >
            <span className="material-symbols-outlined text-lg">print</span>
            In phiếu
          </button>
          <Link
            to="/appointments"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all font-semibold text-sm shadow-sm"
          >
            <span className="material-symbols-outlined text-lg">history</span>
            Lịch sử khám
          </Link>
        </div>
      </div>

      {/* TỜ PHIẾU KẾT QUẢ KHÁM BỆNH (Vùng In) */}
      <div className="bg-white border-2 border-slate-200 p-6 sm:p-10 md:p-14 print:border-none print:p-0">
        {/* CLINIC HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start text-center sm:text-left gap-6 border-b border-slate-200 pb-10 mb-12">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-primary tracking-tight">HEALTHCARE CLINIC</h2>
            <p className="text-slate-500 text-xs font-medium italic">Hệ thống quản lý phòng khám chuyên nghiệp</p>
          </div>
          <div className="text-xs text-slate-500 space-y-1 sm:text-right font-medium">
            <p>Địa chỉ: 123 Đường Cầu Giấy, Hà Nội</p>
            <p>Điện thoại: (024) 3333-8888</p>
            <p>Email: contact@healthcare.vn</p>
          </div>
        </div>

        {/* TIÊU ĐỀ PHIẾU */}
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase border-b-2 border-slate-900 inline-block pb-2 px-4">
            Phiếu Kết Quả Khám Bệnh
          </h1>
          <p className="text-slate-500 text-sm mt-4 font-mono">
            Mã số hồ sơ: #{String(appointment.id).padStart(6, "0")}
          </p>
        </div>

        {/* THÔNG TIN HÀNH CHÍNH */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          {/* Bệnh nhân */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">person</span>
              Thông tin bệnh nhân
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex border-b border-slate-100 pb-2">
                <span className="text-slate-500 w-32 border-r border-slate-100 mr-4">Họ và tên</span>
                <span className="text-slate-900 font-bold">{patient?.hoTen || "—"}</span>
              </div>
              <div className="flex border-b border-slate-100 pb-2">
                <span className="text-slate-500 w-32 border-r border-slate-100 mr-4">Điện thoại</span>
                <span className="text-slate-900">{patient?.soDienThoai || "—"}</span>
              </div>
              <div className="flex border-b border-slate-100 pb-2">
                <span className="text-slate-500 w-32 border-r border-slate-100 mr-4">Thời gian khám</span>
                <span className="text-slate-900">
                  {formatDate(appointment.ngayDat)} - {formatTime(appointment.gioBatDau)}
                </span>
              </div>
            </div>
          </div>

          {/* Bác sĩ & Chẩn đoán */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">clinical_notes</span>
              Kết quả chuẩn đoán
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex border-b border-slate-100 pb-2">
                <span className="text-slate-500 w-32 border-r border-slate-100 mr-4">Bác sĩ phụ trách</span>
                <span className="text-slate-900 font-bold">
                  {doctor?.hocViChucDanh} {doctor?.tenBacSi}
                </span>
              </div>
              <div className="flex border-b border-slate-100 pb-2">
                <span className="text-slate-500 w-32 border-r border-slate-100 mr-4">Chuyên khoa</span>
                <span className="text-slate-900">{doctor?.chuyenKhoa?.tenChuyenKhoa}</span>
              </div>
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-400 uppercase block mb-2">Chẩn đoán:</span>
                <p className="text-primary font-bold leading-relaxed bg-primary/5 p-3 rounded-lg border border-primary/10">
                  {isLocked
                    ? "— Đang chờ thanh toán để xem chi tiết —"
                    : donThuoc?.chanDoan || "Chưa có kết luận cụ thể"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CHI TIẾT TRIỆU CHỨNG */}
        <div className="mb-16 space-y-10">
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Lý do khám bện</h3>
            <p className="text-sm text-slate-700 bg-slate-50 p-5 rounded-lg border border-slate-200 italic">
              "{appointment.lyDoKham || "Không có ghi chú cụ thể."}"
            </p>
          </section>

          {donThuoc && !isLocked && donThuoc.ghiChu && (
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Lời dặn bác sĩ</h3>
              <p className="text-sm text-slate-800 bg-blue-50/30 p-5 rounded-lg border border-blue-200/50">
                {donThuoc.ghiChu}
              </p>
            </section>
          )}
        </div>

        {/* ĐƠN THUỐC */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8 pb-3 border-b-2 border-slate-900">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">medication</span>
              Đơn thuốc kê khai
            </h3>
            <span className="text-[10px] text-slate-400 font-medium italic">HealthCare Prescription System</span>
          </div>

          {!donThuoc ? (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-10 text-center text-slate-400 text-sm">
              Bác sĩ không kê đơn thuốc cho ca khám này.
            </div>
          ) : isLocked ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-10 text-center space-y-4">
              <span className="material-symbols-outlined text-4xl text-amber-500">lock</span>
              <p className="text-amber-800 font-bold uppercase text-sm tracking-tight">{donThuoc.message}</p>
              <p className="text-amber-700/70 text-xs max-w-sm mx-auto font-medium">
                Chi phí đơn thuốc chưa được thanh toán. Vui lòng hoàn tất giao dịch để mở khóa thông tin kê đơn.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px] text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b-2 border-slate-200 text-slate-700 font-bold">
                      <th className="py-4 px-6 w-16">STT</th>
                      <th className="py-4 px-6">Tên thuốc / Hàm lượng</th>
                      <th className="py-4 px-4 text-center">SL</th>
                      <th className="py-4 px-6 text-right">Đơn giá</th>
                      <th className="py-4 px-6 text-right">Thành tiền</th>
                      <th className="py-4 px-8">Cách dùng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {donThuoc.chiTietDonThuoc?.map((med, index) => {
                      const quantity = Number(med.soLuong || 1);
                      const unitPrice = Number(med.donGia || 0);
                      return (
                        <tr key={index} className="text-slate-800">
                          <td className="py-5 px-6 font-mono text-xs text-slate-400">{index + 1}</td>
                          <td className="py-5 px-6 font-bold">{med.tenThuoc}</td>
                          <td className="py-5 px-4 text-center font-bold text-primary">{quantity}</td>
                          <td className="py-5 px-6 text-right font-medium text-slate-600">{formatPrice(unitPrice)}</td>
                          <td className="py-5 px-6 text-right font-bold">{formatPrice(quantity * unitPrice)}</td>
                          <td className="py-5 px-8 text-xs text-slate-500 leading-relaxed font-medium">
                            <span className="text-slate-900 font-bold">Liều:</span> {med.lieuDung || "—"}
                            {med.ghiChu && <div className="mt-1 italic text-primary/70">{med.ghiChu}</div>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="bg-slate-50 p-5 flex justify-end items-center gap-4 text-sm border-t border-slate-200">
                <span className="text-slate-500 font-bold">Tổng phí thuốc:</span>
                <span className="text-lg font-bold text-slate-900">{formatPrice(donThuoc.tongTien)}</span>
              </div>
            </div>
          )}
        </section>

        {/* TỔNG KẾT & THANH TOÁN */}
        <div className="border-t border-slate-200 pt-16">
          {!daKham && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 mb-8 print:hidden">
              Lịch hẹn chưa hoàn tất khám. Thanh toán sẽ khả dụng sau khi bác sĩ cập nhật trạng thái đã khám.
            </p>
          )}

          <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
            {/* Status Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tình trạng thanh toán</h3>
              <div className="flex items-center gap-3">
                <span
                  className={`w-3 h-3 rounded-full ${daThanhToanXong ? "bg-green-500" : "bg-red-500"}`}
                />
                <p className="text-sm font-bold text-slate-900">
                  {!daKham
                    ? "Chưa khám xong"
                    : daThanhToanXong
                      ? "Đã hoàn tất thanh toán"
                      : coDonThuoc
                        ? "Chưa thanh toán (phí khám + thuốc)"
                        : "Chưa thanh toán phí khám"}
                </p>
              </div>
              {appointment.hinhThucThanhToan && (
                <div className="inline-block px-3 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                  Phương thức: {appointment.hinhThucThanhToan.tenHinhThuc}
                </div>
              )}
            </div>

            {/* Price Table & Buttons */}
            <div className="w-full lg:w-96 space-y-6">
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-lg space-y-4 shadow-inner">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tiền khám:</span>
                  <span className="font-bold">{formatPrice(examFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tiền thuốc:</span>
                  <span className="font-bold">{formatPrice(medicineFee)}</span>
                </div>
                <div className="pt-4 border-t-2 border-slate-200 flex justify-between items-center text-primary">
                  <span className="text-sm font-black uppercase">Tổng thanh toán:</span>
                  <span className="text-2xl font-black">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              {canShowPayment && (
                <div className="space-y-3 print:hidden">
                  {coDonThuoc ? (
                    <button
                      onClick={() => handlePayment("TAT_CA")}
                      disabled={paying}
                      className="w-full py-4 bg-primary text-white rounded-lg font-bold text-sm shadow-md hover:bg-primary/95 active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer"
                    >
                      <span className="material-symbols-outlined">payments</span>
                      Thanh toán online ({formatPrice(totalAmount)})
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePayment("PHI_KHAM")}
                      disabled={paying}
                      className="w-full py-4 bg-primary text-white rounded-lg font-bold text-sm shadow-md hover:bg-primary/95 active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer"
                    >
                      <span className="material-symbols-outlined">payments</span>
                      Thanh toán phí khám ({formatPrice(examFee)})
                    </button>
                  )}
                  <p className="text-[10px] text-slate-400 text-center italic leading-normal">
                    Thanh toán qua VNPay hoặc trả tiền mặt tại quầy — nhân viên sẽ xác nhận trên hệ thống.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CHỮ KÝ */}
        <div className="hidden print:flex mt-24 justify-end">
          <div className="text-center w-72">
            <p className="text-sm font-bold text-slate-900 mb-24 italic underline decoration-slate-200 underline-offset-8">
              Chữ ký bác sĩ chuyên khoa
            </p>
            <p className="text-lg font-bold text-slate-900">{doctor?.tenBacSi}</p>
            <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest font-bold">
              HealthCare Clinical Center
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-12 text-center print:hidden border-t border-slate-100 pt-8">
        <p className="text-xs text-slate-400 font-medium">
          © 2026 HealthCare Provider. Phiếu được cấp điện tử và in trực tiếp từ hệ thống.
        </p>
      </div>

      {/* PRINT CSS OVERRIDES */}
      <style>{`
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact; }
          .max-w-4xl { max-width: 100% !important; margin: 0 !important; width: 100% !important; }
          .p-6, .p-10, .p-14 { padding: 0 !important; }
          .border-2 { border-width: 1px !important; border-color: #e2e8f0 !important; }
          .print\\:hidden, nav, header, footer { display: none !important; }
          .bg-slate-50, .bg-primary\\/5, .bg-blue-50\\/30 { background-color: transparent !important; border: 1px solid #e2e8f0 !important; }
          table { border-collapse: collapse !important; width: 100% !important; }
          th, td { border: 1px solid #e2e8f0 !important; padding: 12px !important; }
          .text-primary { color: #000 !important; }
          h1, h2, h3, .font-bold { color: #000 !important; }
        }
      `}</style>
    </div>
  );
}
