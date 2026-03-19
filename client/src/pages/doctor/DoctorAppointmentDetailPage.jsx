/**
 * ============================================================
 * TRANG: Chi tiết lịch hẹn & Nhập kết quả khám (Bác sĩ)
 * Đường dẫn: /doctor/appointments/:id
 * ============================================================
 *
 * Chức năng:
 * - Hiển thị thông tin bệnh nhân (tên, mã BN, giới tính, tuổi)
 * - Form nhập kết quả khám bệnh:
 *   + Triệu chứng & chẩn đoán sơ bộ (textarea)
 *   + Kết luận bệnh lý (input text)
 *   + Lời dặn bác sĩ (input text)
 * - Bảng đơn thuốc động: thêm/xóa thuốc, nhập tên, số lượng, liều dùng
 * - Nút "Hoàn tất & Gửi đơn thuốc" → lưu + thông báo cho bệnh nhân
 * - Chế độ chỉ xem (readonly) khi lịch hẹn đã hoàn thành (isCompleted)
 * - Xử lý 404 khi không tìm thấy lịch hẹn
 *
 * State:
 * - symptoms: triệu chứng bệnh nhân
 * - conclusion: kết luận bệnh lý
 * - doctorAdvice: lời dặn của bác sĩ
 * - prescription: mảng thuốc [{ name, quantity, dosageUsage }]
 *
 * Params:
 * - id (URL param): ID của lịch hẹn
 *
 * Dữ liệu: DOCTOR_APPOINTMENTS từ mockDoctorData.js
 * ============================================================
 */
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DOCTOR_APPOINTMENTS } from "../../data/mockDoctorData";
import { toast } from "react-toastify";

/** Template thuốc rỗng dùng khi thêm dòng mới vào đơn thuốc */
const EMPTY_MED = { name: "", quantity: "", dosageUsage: "" };

function DoctorAppointmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const appointment = DOCTOR_APPOINTMENTS.find((a) => a.id === Number(id));

  const isCompleted = appointment?.status === "completed";

  const [symptoms, setSymptoms] = useState(appointment?.reason || "");
  const [conclusion, setConclusion] = useState(appointment?.diagnosis || "");
  const [doctorAdvice, setDoctorAdvice] = useState(appointment?.notes || "");
  const [prescription, setPrescription] = useState(() => {
    if (appointment?.prescription?.length) {
      return appointment.prescription.map((p) => ({
        name: p.name,
        quantity: p.dosage,
        dosageUsage: p.duration,
      }));
    }
    return [{ ...EMPTY_MED }];
  });

  if (!appointment) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="material-symbols-outlined text-7xl text-slate-300 mb-4">
          search_off
        </span>
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          Không tìm thấy lịch hẹn
        </h2>
        <p className="text-slate-500 mb-6">
          Lịch hẹn #{id} không tồn tại hoặc đã bị xóa.
        </p>
        <button
          onClick={() => navigate("/doctor/appointments")}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Quay lại
        </button>
      </div>
    );
  }

  const handleAddMed = () =>
    setPrescription((prev) => [...prev, { ...EMPTY_MED }]);

  const handleRemoveMed = (index) => {
    setPrescription((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length === 0 ? [{ ...EMPTY_MED }] : next;
    });
  };

  const handleMedChange = (index, field, value) => {
    setPrescription((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Đã hoàn tất & gửi đơn thuốc cho bệnh nhân!");
    navigate("/doctor/appointments");
  };

  return (
    <div className="sm:p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <div className="flex justify-end">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Quay lại
        </button>
      </div>

      {/* Patient Info Card */}
      <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="size-16 sm:size-20 rounded-full overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl sm:text-4xl text-slate-400">
              person
            </span>
          </div>
          <div className="flex-1 min-w-0 w-full">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  {appointment.patientName}
                </h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                  <span>
                    Mã BN:{" "}
                    <span className="font-semibold text-slate-700">
                      BN-{String(appointment.id).padStart(6, "0")}
                    </span>
                  </span>
                  <span>
                    Giới tính:{" "}
                    <span className="font-semibold text-slate-700">
                      {appointment.patientGender}
                    </span>
                  </span>
                  <span>
                    Tuổi:{" "}
                    <span className="font-semibold text-slate-700">
                      {appointment.patientAge}
                    </span>
                  </span>
                </div>
              </div>
              <button className="px-4 py-1.5 text-xs font-semibold text-primary border border-primary hover:bg-primary/5 rounded-full transition-all shrink-0 self-start">
                Xem hồ sơ bệnh án
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Medical Results Form */}
      <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6 space-y-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            analytics
          </span>
          Kết quả khám bệnh
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">
              Triệu chứng &amp; Chẩn đoán sơ bộ
            </label>
            {isCompleted ? (
              <p className="whitespace-pre-wrap text-slate-700 bg-slate-50 rounded-lg px-4 py-3 border border-slate-200 text-sm">
                {symptoms || "—"}
              </p>
            ) : (
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Nhập các biểu hiện lâm sàng của bệnh nhân..."
                rows={3}
                className="w-full rounded-lg border-slate-200 focus:ring-primary focus:border-primary text-sm"
              />
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Kết luận bệnh lý
            </label>
            {isCompleted ? (
              <p className="text-slate-700 bg-slate-50 rounded-lg px-4 py-3 border border-slate-200 text-sm">
                {conclusion || "—"}
              </p>
            ) : (
              <input
                type="text"
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                placeholder="Tên bệnh lý xác định"
                className="w-full rounded-lg border-slate-200 focus:ring-primary focus:border-primary text-sm"
              />
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Lời dặn bác sĩ
            </label>
            {isCompleted ? (
              <p className="text-slate-700 bg-slate-50 rounded-lg px-4 py-3 border border-slate-200 text-sm">
                {doctorAdvice || "—"}
              </p>
            ) : (
              <input
                type="text"
                value={doctorAdvice}
                onChange={(e) => setDoctorAdvice(e.target.value)}
                placeholder="Chế độ ăn uống, sinh hoạt..."
                className="w-full rounded-lg border-slate-200 focus:ring-primary focus:border-primary text-sm"
              />
            )}
          </div>
        </div>
      </section>

      {/* Prescription Table */}
      <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              medication
            </span>
            Đơn thuốc
          </h3>
          {!isCompleted && (
            <button
              type="button"
              onClick={handleAddMed}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-all"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Thêm thuốc
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm uppercase">
                <th className="px-4 py-3 font-semibold border-b border-slate-200">
                  Tên thuốc
                </th>
                <th className="px-4 py-3 font-semibold border-b border-slate-200">
                  Số lượng
                </th>
                <th className="px-4 py-3 font-semibold border-b border-slate-200">
                  Liều dùng &amp; Cách dùng
                </th>
                {!isCompleted && (
                  <th className="px-4 py-3 font-semibold border-b border-slate-200"></th>
                )}
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {prescription.map((item, index) =>
                isCompleted ? (
                  <tr key={index}>
                    <td className="px-4 py-4 font-medium">{item.name}</td>
                    <td className="px-4 py-4 text-slate-500">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-4 text-slate-500">
                      {item.dosageUsage}
                    </td>
                  </tr>
                ) : (
                  <tr key={index}>
                    <td className="px-4 py-4">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          handleMedChange(index, "name", e.target.value)
                        }
                        placeholder="Tên thuốc"
                        className="w-full rounded-lg border-slate-200 focus:ring-primary focus:border-primary text-sm"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="text"
                        value={item.quantity}
                        onChange={(e) =>
                          handleMedChange(index, "quantity", e.target.value)
                        }
                        placeholder="Số lượng"
                        className="w-full rounded-lg border-slate-200 focus:ring-primary focus:border-primary text-sm"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="text"
                        value={item.dosageUsage}
                        onChange={(e) =>
                          handleMedChange(index, "dosageUsage", e.target.value)
                        }
                        placeholder="Liều dùng & cách dùng"
                        className="w-full rounded-lg border-slate-200 focus:ring-primary focus:border-primary text-sm"
                      />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveMed(index)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">
                          delete
                        </span>
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Submit button */}
      {!isCompleted && (
        <div className="pt-4 pb-12">
          <button
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-white text-lg font-bold rounded-lg shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
          >
            <span className="material-symbols-outlined">send</span>
            Hoàn tất &amp; Gửi đơn thuốc cho bệnh nhân
          </button>
          <p className="text-center text-sm text-slate-500 mt-4 italic">
            * Thông tin sẽ được tự động lưu vào hồ sơ bệnh án và gửi thông báo
            cho bệnh nhân qua ứng dụng HealthCare.
          </p>
        </div>
      )}
    </div>
  );
}

export default DoctorAppointmentDetailPage;
