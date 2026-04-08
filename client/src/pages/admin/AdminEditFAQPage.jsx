import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { faqService } from "../../services/faqService";

function AdminEditFAQPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    cauHoi: "",
    traLoi: "",
    dangHoatDong: 1,
  });

  useEffect(() => {
    const fetchFAQ = async () => {
      try {
        const res = await faqService.getById(id);
        if (res.success) {
          const item = res.data;
          setForm({
            cauHoi: item.cauHoi || "",
            traLoi: item.traLoi || "",
            dangHoatDong: item.dangHoatDong ?? 1,
          });
        }
      } catch (error) {
        console.error(error);
        toast.error("Không tìm thấy câu hỏi!");
        navigate("/admin/faqs");
      } finally {
        setLoading(false);
      }
    };
    fetchFAQ();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSave = async () => {
    if (!form.cauHoi.trim() || !form.traLoi.trim()) {
      toast.warn("Vui lòng nhập đầy đủ câu hỏi và câu trả lời.");
      return;
    }

    setSaving(true);
    try {
      await faqService.update(id, form);
      toast.success("Cập nhật câu hỏi thành công!");
      navigate("/admin/faqs");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi cập nhật!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">
          progress_activity
        </span>
      </div>
    );
  }

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
        <span className="text-slate-900 font-medium">Chỉnh sửa câu hỏi</span>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">
          Chỉnh sửa câu hỏi
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Cập nhật nội dung câu hỏi thường gặp ID #{id}.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Câu hỏi <span className="text-red-500">*</span>
            </label>
            <textarea
              name="cauHoi"
              value={form.cauHoi}
              onChange={handleChange}
              rows={2}
              placeholder="VD: Làm thế nào để đặt lịch khám?"
              className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Câu trả lời <span className="text-red-500">*</span>
            </label>
            <textarea
              name="traLoi"
              value={form.traLoi}
              onChange={handleChange}
              rows={6}
              placeholder="Nhập nội dung câu trả lời chi tiết..."
              className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Trạng thái hiển thị
            </label>
            <select
              name="dangHoatDong"
              value={form.dangHoatDong}
              onChange={handleChange}
              type="number"
              className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
            >
              <option value={1}>Đang hoạt động (Hiển thị)</option>
              <option value={0}>Tạm ẩn</option>
            </select>
          </div>
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
            disabled={saving}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
              saving
                ? "bg-slate-300"
                : "bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
            }`}
          >
            {saving ? (
              <span className="material-symbols-outlined animate-spin text-sm">
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined text-sm">save</span>
            )}
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminEditFAQPage;
