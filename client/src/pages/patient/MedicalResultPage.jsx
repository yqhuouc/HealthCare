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

export default function MedicalResultPage() {
  const { id } = useParams();
  const { data: aptRes, isLoading: loading } = useAppointment(id);
  const appointment = aptRes?.data || null;

  /** Lệnh in phiếu kết quả */
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <span className="material-symbols-outlined text-5xl text-primary animate-spin">
          progress_activity
        </span>
        <p className="mt-4 text-slate-500">Đang tải kết quả khám...</p>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-300">
          search_off
        </span>
        <h2 className="text-xl font-semibold text-slate-700 mt-4">
          Không tìm thấy kết quả
        </h2>
        <Link
          to="/appointments"
          className="inline-block mt-6 px-6 py-2 bg-primary text-white rounded-lg"
        >
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

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-2 sm:px-6">
      {/* Nút điều hướng & In (Ẩn khi in) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 print:hidden">
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
          <Link to="/" className="hover:text-primary">Trang chủ</Link>
          <span className="material-symbols-outlined text-base">chevron_right</span>
          <Link to="/appointments" className="hover:text-primary">Lịch sử</Link>
          <span className="material-symbols-outlined text-base">chevron_right</span>
          <span className="text-slate-700 font-medium tracking-tight">Kết quả</span>
        </nav>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition font-medium text-sm shadow-sm"
          >
            <span className="material-symbols-outlined text-xl text-slate-500">print</span>
            In kết quả
          </button>
          <Link
            to="/appointments"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition font-medium text-sm shadow-sm"
          >
            <span className="material-symbols-outlined text-xl">history</span>
            Lịch sử
          </Link>
        </div>
      </div>

      {/* TỜ PHIẾU KẾT QUẢ KHÁM BỆNH (Vùng In) */}
      <div className="bg-white rounded-xl shadow-md border border-slate-100 p-4 sm:p-8 md:p-12 print:shadow-none print:border-none print:p-0">
        {/* CLINIC HEADER (Giả lập thông tin phòng khám) */}
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start text-center sm:text-left gap-6 border-b-2 border-primary/10 pb-8 mb-10">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-2xl sm:text-4xl">medical_services</span>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-none">HEALTHCARE</h2>
              <p className="text-slate-500 text-[10px] sm:text-xs mt-1 font-medium italic">Chuyên nghiệp - Tận tâm</p>
            </div>
          </div>
          <div className="text-xs text-slate-400 space-y-1 sm:text-right">
            <p>Địa chỉ: 123 Đường Cầu Giấy, Hà Nội</p>
            <p>Hotline: (024) 3333-8888</p>
          </div>
        </div>

        {/* TIÊU ĐỀ PHIẾU */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">
            Phiếu Kết Quả Khám Bệnh
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            Số hiệu: #{String(appointment.id).padStart(6, "0")}
          </p>
        </div>

        {/* GRID THÔNG TIN HÀNH CHÍNH */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 mb-12 bg-slate-50/50 p-4 sm:p-6 rounded-2xl border border-slate-100">
          {/* Bệnh nhân */}
          <div>
            <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">person</span>
              Thông tin bệnh nhân
            </h3>
            <div className="space-y-3">
              <p className="text-xs sm:text-sm font-semibold text-slate-700">
                Họ và tên:{" "}
                <span className="text-slate-900 border-b border-dotted border-slate-300 ml-1">
                  {patient?.hoTen || "—"}
                </span>
              </p>
              <p className="text-xs sm:text-sm text-slate-600">
                Số điện thoại:{" "}
                <span className="text-slate-800 border-b border-dotted border-slate-300 ml-1">
                  {patient?.soDienThoai || "—"}
                </span>
              </p>
              <div className="flex flex-wrap gap-x-4">
                <p className="text-xs sm:text-sm text-slate-600">
                  Ngày:{" "}
                  <span className="text-slate-800 border-b border-dotted border-slate-300 ml-1">
                    {formatDate(appointment.ngayDat)}
                  </span>
                </p>
                <p className="text-xs sm:text-sm text-slate-600">
                  Giờ:{" "}
                  <span className="text-slate-800 border-b border-dotted border-slate-300 ml-1">
                    {formatTime(appointment.gioBatDau)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Bác sĩ & Chẩn đoán */}
          <div>
            <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">
                clinical_notes
              </span>
              Kết luận từ bác sĩ
            </h3>
            <div className="space-y-3">
              <p className="text-xs sm:text-sm font-semibold text-slate-800">
                BS phụ trách:{" "}
                <span className="text-slate-900">
                  {doctor?.hocViChucDanh} {doctor?.tenBacSi}
                </span>
              </p>
              <p className="text-xs sm:text-sm text-slate-500 italic">
                Chuyên khoa: {doctor?.chuyenKhoa?.tenChuyenKhoa}
              </p>
              <div className="mt-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">
                  Chẩn đoán chính:
                </p>
                <p className="text-xs sm:text-sm font-bold text-primary leading-relaxed">
                  {isLocked
                    ? "— Đang chờ thanh toán —"
                    : donThuoc?.chanDoan || "Chưa có kết luận cụ thể"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* LÝ DO KHÁM & GHI CHÚ */}
        <div className="space-y-8 mb-12">
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Triệu chứng & Lý do khám
            </h3>
            <p className="text-sm text-slate-700 bg-slate-50/30 p-4 rounded-lg border-l-4 border-slate-200 italic leading-relaxed">
              "{appointment.lyDoKham || "Bệnh nhân không ghi chú lý do cụ thể."}
              "
            </p>
          </section>

          {donThuoc && !isLocked && donThuoc.ghiChu && (
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                Lời dặn của bác sĩ
              </h3>
              <p className="text-sm text-slate-700 bg-blue-50/50 p-4 rounded-lg border-l-4 border-primary/40 leading-relaxed">
                {donThuoc.ghiChu}
              </p>
            </section>
          )}
        </div>

        {/* ĐƠN THUỐC CHI TIẾT */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">
                medication
              </span>
              Chi tiết đơn thuốc
            </h3>
            <span className="text-xs text-slate-400 italic">
              Hệ thống cấp đơn tự động
            </span>
          </div>

          {!donThuoc ? (
            <div className="bg-slate-50 rounded-xl p-8 text-center">
              <p className="text-slate-400 text-sm">
                Bác sĩ không kê đơn thuốc cho ca khám này.
              </p>
            </div>
          ) : isLocked ? (
            /* ĐƠN THUỐC BỊ KHÓA */
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-amber-500 mb-3 block">
                lock_person
              </span>
              <p className="text-amber-700 font-bold mb-2 uppercase tracking-tight">
                {donThuoc.message}
              </p>
              <p className="text-amber-600 text-sm max-w-md mx-auto">
                Vui lòng hoàn tất thanh toán hóa đơn để hệ thống tự động mở khóa
                chi tiết đơn thuốc kê bởi bác sĩ.
              </p>
            </div>
          ) : (
            /* BẢNG ĐƠN THUỐC (MAPPING SQL CHUẨN) */
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[650px] text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="py-4 px-6 font-bold text-slate-600 truncate">STT</th>
                      <th className="py-4 px-6 font-bold text-slate-600">Tên thuốc</th>
                      <th className="py-4 px-2 text-center font-bold text-slate-600">SL</th>
                      <th className="py-4 px-4 text-right font-bold text-slate-600">Đơn giá</th>
                      <th className="py-4 px-4 text-right font-bold text-slate-600">Thành tiền</th>
                      <th className="py-4 px-6 font-bold text-slate-600">Liều & Cách dùng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {donThuoc.chiTietDonThuoc?.map((med, index) => {
                      const quantity = Number(med.soLuong || 1);
                      const unitPrice = Number(med.donGia || 0);
                      const subtotal = quantity * unitPrice;

                      return (
                        <tr
                          key={index}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-4 px-6 text-slate-400 font-mono text-xs">
                            {index + 1}
                          </td>
                          <td className="py-4 px-6 font-bold text-slate-800">
                            {med.tenThuoc}
                          </td>
                          <td className="py-4 px-6 text-center font-bold text-primary">
                            {quantity}
                          </td>
                          <td className="py-4 px-4 text-right text-slate-500 whitespace-nowrap">
                            {formatPrice(unitPrice)}
                          </td>
                          <td className="py-4 px-4 text-right font-bold text-slate-700 whitespace-nowrap">
                            {formatPrice(subtotal)}
                          </td>
                          <td className="py-4 px-6 text-[10px] sm:text-xs text-slate-500 leading-relaxed min-w-[200px]">
                            <div>
                              <span className="font-bold text-slate-400 uppercase text-[8px]">
                                Liều:
                              </span>{" "}
                              {med.lieuDung || "—"}
                            </div>
                            {med.ghiChu && (
                              <div className="mt-1 italic">
                                <span className="font-bold text-slate-400 uppercase text-[8px]">
                                  HD:
                                </span>{" "}
                                {med.ghiChu}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Footer đơn thuốc: Tổng tiền thuốc */}
              <div className="bg-slate-50/50 p-4 flex justify-end text-sm border-t border-slate-100">
                <span className="text-slate-500 mr-3">Tổng phí thuốc:</span>
                <span className="font-black text-slate-800">
                  {formatPrice(donThuoc.tongTien)}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* TÓM TẮT HÓA ĐƠN & THANH TOÁN */}
        <div className="border-t-2 border-dashed border-slate-200 pt-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${appointment.trangThaiThanhToan >= 1 ? "bg-green-500" : "bg-red-400 animate-pulse"}`}
                />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Trạng thái thanh toán
                </span>
              </div>
              <p className="text-xs sm:text-sm font-black text-slate-800">
                {appointment.trangThaiThanhToan >= 2
                  ? "Đã thanh toán toàn bộ"
                  : appointment.trangThaiThanhToan === 1
                    ? "Đang nợ phí thuốc"
                    : "Chưa thanh toán"}
              </p>
              {appointment.hinhThucThanhToan && (
                <p className="text-[9px] text-primary uppercase font-bold tracking-tight">
                  Cổng: {appointment.hinhThucThanhToan.tenHinhThuc}
                </p>
              )}
            </div>

            <div className="w-full md:w-auto space-y-2 bg-primary/5 p-5 sm:p-6 rounded-2xl border border-primary/10">
              <div className="flex justify-between items-center gap-10 text-xs sm:text-sm">
                <span className="text-slate-500">Phí khám bệnh:</span>
                <span className="font-semibold text-slate-700">
                  {formatPrice(examFee)}
                </span>
              </div>
              <div className="flex justify-between items-center gap-10 text-xs sm:text-sm">
                <span className="text-slate-500">Chi phí thuốc:</span>
                <span className="font-semibold text-slate-700">
                  {formatPrice(medicineFee)}
                </span>
              </div>
              <div className="flex justify-between items-center gap-10 pt-4 border-t border-primary/10">
                <span className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-tight">
                  TỔNG CỘNG:
                </span>
                <span className="text-lg sm:text-2xl font-black text-primary">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CHỮ KÝ (Cho việc in ấn) */}
        <div className="hidden print:flex mt-20 justify-end">
          <div className="text-center w-64">
            <p className="text-sm text-slate-800 mb-20 font-bold italic">
              Bác sĩ kết luận (Ký tên)
            </p>
            <p className="text-lg font-black text-slate-800">
              {doctor?.tenBacSi}
            </p>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">
              HEALTHCARE CLINIC REPORT
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER ĐIỀU HƯỚNG CUỐI TRANG */}
      <div className="mt-8 flex justify-center print:hidden">
        <p className="text-xs text-slate-400">
          © 2026 HealthCare Provider. Phiếu này chỉ có giá trị tại cơ sở y tế
          HealthCare.
        </p>
      </div>

      {/* CSS CHO IN ẤN */}
      <style>{`
        @media print {
          body { background: white !important; margin: 0; padding: 0; }
          .max-w-4xl { max-width: 100% !important; margin: 0 !important; }
          header, footer, nav, .print\\:hidden { display: none !important; }
          .bg-slate-50\\/50 { background-color: transparent !important; }
          .bg-primary\\/5 { background-color: transparent !important; border: 1px solid #efefef !important; }
          .p-8, .p-12 { padding: 0 !important; }
          table { border-collapse: collapse !important; }
          th, td { border: 1px solid #efefef !important; }
        }
      `}</style>
    </div>
  );
}
