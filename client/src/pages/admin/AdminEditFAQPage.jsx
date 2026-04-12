import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useFAQ, useUpdateFAQ } from "../../hooks/queries/useFAQQueries";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { faqSchema } from "../../validations/adminSchema";

/**
 * Trang AdminEditFAQPage - Chỉnh sửa Câu hỏi thường gặp (FAQ)
 * Kiến trúc: Wrapper (fetch + loading) → Child Form (để tránh setState trong useEffect)
 */
function AdminEditFAQPage() {
  const { id } = useParams();
  const { data: faqRes, isLoading: loading } = useFAQ(id);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  return <EditFAQForm faqData={faqRes?.data} faqId={id} />;
}

function EditFAQForm({ faqData, faqId }) {
  const navigate = useNavigate();
  const updateMutation = useUpdateFAQ();
  const saving = updateMutation.isPending;

  // Khởi tạo form state trực tiếp từ props
  const item = faqData || {};
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      cauHoi: item.cauHoi || "",
      traLoi: item.traLoi || "",
      dangHoatDong: item.dangHoatDong ?? 1,
    },
  });

  const onSubmit = (data) => {
    updateMutation.mutate(
      { id: faqId, data },
      {
        onSuccess: () => {
          toast.success("Cập nhật câu hỏi thành công!");
          navigate("/admin/faqs");
        },
        onError: (err) => toast.error(err.message || "Có lỗi xảy ra khi cập nhật!"),
      },
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb dẫn hướng */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link to="/admin/faqs" className="text-slate-500 hover:text-primary transition-colors">
          Quản lý FAQs
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-medium">Chỉnh sửa câu hỏi</span>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Chỉnh sửa câu hỏi</h2>
        <p className="text-slate-500 text-sm mt-1">Cập nhật nội dung câu hỏi thường gặp ID #{faqId}.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          {/* Ô nhập Nội dung câu hỏi */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Câu hỏi <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("cauHoi")}
              rows={2}
              placeholder="VD: Làm thế nào để đặt lịch khám?"
              className={`w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary ${errors.cauHoi ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
            />
            {errors.cauHoi && <p className="text-red-500 text-xs mt-1">{errors.cauHoi.message}</p>}
          </div>

          {/* Ô nhập Nội dung câu trả lời */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Câu trả lời <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("traLoi")}
              rows={6}
              placeholder="Nhập nội dung câu trả lời chi tiết..."
              className={`w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary ${errors.traLoi ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
            />
            {errors.traLoi && <p className="text-red-500 text-xs mt-1">{errors.traLoi.message}</p>}
          </div>

          {/* Lựa chọn trạng thái hiển thị */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Trạng thái hiển thị</label>
            <select
              {...register("dangHoatDong")}
              className={`w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary ${errors.dangHoatDong ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
            >
              <option value={1}>Đang hoạt động (Hiển thị)</option>
              <option value={0}>Tạm ẩn</option>
            </select>
          </div>
        </div>

        {/* Thanh tác vụ phía dưới form */}
        <div className="bg-slate-50 px-6 sm:px-8 py-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-200">
          {/* Nút hủy bỏ */}
          <button
            onClick={() => navigate("/admin/faqs")}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Hủy
          </button>
          {/* Nút lưu thay đổi */}
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={saving}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
              saving ? "bg-slate-300" : "bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
            }`}
          >
            {saving ? (
              <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
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
