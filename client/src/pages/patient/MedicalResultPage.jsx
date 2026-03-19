/**
 * ============================================================
 * TRANG: Kết quả khám bệnh (Bệnh nhân)
 * Đường dẫn: /medical-results/:id
 * ============================================================
 *
 * Chức năng:
 * - Hiển thị kết quả khám bệnh chi tiết sau khi hoàn thành lịch hẹn
 * - Các phần hiển thị: thông tin BS, lý do khám, chẩn đoán, ghi chú BS, đơn thuốc
 * - Đơn thuốc dạng bảng: tên thuốc, liều lượng, cách dùng
 * - Nút "Tải PDF" (đang phát triển) và "Quay lại lịch sử"
 * - Xử lý trường hợp không tìm thấy (404 fallback)
 *
 * Params:
 * - id (URL param): ID của lịch hẹn, dùng useParams() để lấy
 *
 * Dữ liệu: APPOINTMENTS từ mockAppointments.js
 * ============================================================
 */
import { useParams, Link } from "react-router-dom";
import { APPOINTMENTS } from "../../data/mockAppointments";

/** Đơn thuốc mẫu — sẽ được thay bằng dữ liệu thực từ API */
const MOCK_PRESCRIPTIONS = [
  {
    name: "Amoxicillin 500mg",
    dosage: "1 viên x 3 lần/ngày",
    usage: "Uống sau ăn, dùng trong 7 ngày",
  },
  {
    name: "Bromhexin 8mg",
    dosage: "1 viên x 2 lần/ngày",
    usage: "Uống sau ăn sáng và tối",
  },
  {
    name: "Paracetamol 500mg",
    dosage: "1 viên khi sốt trên 38.5°C",
    usage: "Uống khi cần, cách nhau ít nhất 4 giờ",
  },
];

/** Format "2026-03-15" thành "15/03/2026" */
function formatDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export default function MedicalResultPage() {
  const { id } = useParams();
  const appointment = APPOINTMENTS.find((a) => a.id === Number(id));

  if (!appointment) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-300">
          search_off
        </span>
        <h2 className="text-xl font-semibold text-slate-700 mt-4">
          Không tìm thấy kết quả khám
        </h2>
        <p className="text-slate-500 mt-2">
          Lịch hẹn không tồn tại hoặc chưa có kết quả khám bệnh.
        </p>
        <Link
          to="/appointments"
          className="inline-block mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition"
        >
          Quay lại lịch sử
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
        <Link to="/" className="hover:text-primary transition">
          Trang chủ
        </Link>
        <span className="material-symbols-outlined text-base">
          chevron_right
        </span>
        <Link to="/appointments" className="hover:text-primary transition">
          Lịch sử khám
        </Link>
        <span className="material-symbols-outlined text-base">
          chevron_right
        </span>
        <span className="text-slate-700 font-medium">Kết quả khám</span>
      </nav>

      {/* Thẻ kết quả chính */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Kết quả khám bệnh
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Ngày khám: {formatDate(appointment.date)}
            </p>
          </div>
          <span className="material-symbols-outlined text-4xl text-primary">
            clinical_notes
          </span>
        </div>

        {/* Thông tin bác sĩ */}
        <div className="flex items-center gap-4 bg-slate-50 rounded-lg p-4 mb-6">
          <img
            src={appointment.doctorImage}
            alt={appointment.doctorName}
            className="w-14 h-14 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-slate-800">
              {appointment.doctorName}
            </p>
            <p className="text-sm text-slate-500">{appointment.specialty}</p>
          </div>
        </div>

        {/* Lý do khám */}
        <section className="border-t border-slate-100 pt-6 mb-6">
          <h3 className="font-semibold text-slate-700 flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary">
              help_outline
            </span>
            Lý do khám
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            {appointment.reason || "Không có thông tin"}
          </p>
        </section>

        {/* Chẩn đoán */}
        <section className="border-t border-slate-100 pt-6 mb-6">
          <h3 className="font-semibold text-slate-700 flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary">
              diagnosis
            </span>
            Chẩn đoán
          </h3>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-slate-700 text-sm font-medium">
              Viêm phế quản cấp, theo dõi hen phế quản
            </p>
          </div>
        </section>

        {/* Ghi chú bác sĩ */}
        <section className="border-t border-slate-100 pt-6 mb-6">
          <h3 className="font-semibold text-slate-700 flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary">
              sticky_note_2
            </span>
            Ghi chú của bác sĩ
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            {appointment.notes || "Bác sĩ chưa ghi chú cho lần khám này."}
          </p>
        </section>

        {/* Đơn thuốc */}
        <section className="border-t border-slate-100 pt-6 mb-6">
          <h3 className="font-semibold text-slate-700 flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">
              medication
            </span>
            Đơn thuốc
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left py-3 px-4 font-semibold text-slate-600 rounded-tl-lg">
                    Tên thuốc
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">
                    Liều lượng
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600 rounded-tr-lg">
                    Cách dùng
                  </th>
                </tr>
              </thead>
              <tbody>
                {MOCK_PRESCRIPTIONS.map((med, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {med.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{med.dosage}</td>
                    <td className="py-3 px-4 text-slate-600">{med.usage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Nút hành động */}
        <div className="border-t border-slate-100 pt-6 flex items-center justify-between">
          <Link
            to="/appointments"
            className="flex items-center gap-2 text-slate-600 hover:text-primary transition text-sm font-medium"
          >
            <span className="material-symbols-outlined text-lg">
              arrow_back
            </span>
            Quay lại lịch sử
          </Link>
          <button
            disabled
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-200 text-slate-400 text-sm font-medium cursor-not-allowed"
            title="Tính năng đang phát triển"
          >
            <span className="material-symbols-outlined text-lg">
              download
            </span>
            Tải PDF
          </button>
        </div>
      </div>
    </div>
  );
}
