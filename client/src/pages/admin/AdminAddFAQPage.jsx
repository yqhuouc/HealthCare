/**
 * ============================================================
 * TRANG: Thêm câu hỏi FAQ mới (Admin)
 * Đường dẫn: /admin/faqs/add
 * ============================================================
 *
 * Chức năng:
 * - Form thêm FAQ: câu hỏi, câu trả lời, chuyên mục (dropdown), trạng thái (dropdown)
 * - Preview badge chuyên mục khi đã chọn
 * - Validate: bắt buộc nhập câu hỏi + câu trả lời + chọn chuyên mục
 * - Breadcrumb: Quản lý FAQs / Thêm câu hỏi mới
 * - Nút "Lưu câu hỏi" → toast thành công → quay về /admin/faqs
 *
 * State:
 * - form: { question, answer, category, status }
 *
 * Dữ liệu: CATEGORIES (danh sách chuyên mục + badge color)
 * ============================================================
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

/** Danh sách chuyên mục FAQ kèm màu badge */
const CATEGORIES = [
  { value: "Hướng dẫn", color: "bg-blue-100 text-blue-800" },
  { value: "Thanh toán", color: "bg-purple-100 text-purple-800" },
  { value: "Dịch vụ", color: "bg-orange-100 text-orange-800" },
  { value: "Thông tin", color: "bg-emerald-100 text-emerald-800" },
];

function AdminAddFAQPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    question: "",
    answer: "",
    category: "",
    status: "visible",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    if (!form.question.trim()) {
      toast.warn("Vui lòng nhập câu hỏi.");
      return;
    }
    if (!form.answer.trim()) {
      toast.warn("Vui lòng nhập câu trả lời.");
      return;
    }
    if (!form.category) {
      toast.warn("Vui lòng chọn chuyên mục.");
      return;
    }
    toast.success("Đã thêm FAQ mới thành công!");
    navigate("/admin/faqs");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link
          to="/admin/faqs"
          className="text-slate-500 hover:text-primary transition-colors"
        >
          Quản lý FAQs
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-medium">Thêm câu hỏi mới</span>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">
          Thêm câu hỏi mới
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Tạo câu hỏi thường gặp mới cho hệ thống HealthCare.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Câu hỏi <span className="text-red-500">*</span>
            </label>
            <input
              name="question"
              value={form.question}
              onChange={handleChange}
              placeholder="VD: Làm thế nào để đặt lịch hẹn khám bệnh?"
              className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Câu trả lời <span className="text-red-500">*</span>
            </label>
            <textarea
              name="answer"
              value={form.answer}
              onChange={handleChange}
              rows={5}
              placeholder="Nhập câu trả lời chi tiết cho câu hỏi này..."
              className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Chuyên mục <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
              >
                <option value="">-- Chọn chuyên mục --</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.value}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Trạng thái
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
              >
                <option value="visible">Hiển thị</option>
                <option value="hidden">Ẩn</option>
                <option value="draft">Bản nháp</option>
              </select>
            </div>
          </div>

          {form.category && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Chuyên mục:</span>
              <span
                className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${
                  CATEGORIES.find((c) => c.value === form.category)?.color || ""
                }`}
              >
                {form.category}
              </span>
            </div>
          )}
        </div>

        <div className="bg-slate-50 px-6 sm:px-8 py-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-200">
          <button
            onClick={() => navigate("/admin/faqs")}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-semibold shadow-md shadow-primary/20 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">save</span>
            Lưu câu hỏi
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminAddFAQPage;
