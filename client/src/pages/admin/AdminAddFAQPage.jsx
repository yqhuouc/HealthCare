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

import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useCreateFAQ } from "../../hooks/queries/useFAQQueries";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { faqSchema } from "../../validations/adminSchema";

/**
 * Component AdminAddFAQPage - Cho phép quản trị viên tạo câu hỏi thường gặp mới
 */
function AdminAddFAQPage() {
  const navigate = useNavigate();

  // TanStack Query: Mutation tạo FAQ mới (auto-invalidate list)
  const createMutation = useCreateFAQ();
  const loading = createMutation.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      cauHoi: "",
      traLoi: "",
      dangHoatDong: 1,
    },
  });

  /**
   * Gửi dữ liệu FAQ mới lên server để lưu trữ
   */
  const onSubmit = (data) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Đã thêm FAQ mới thành công!");
        navigate("/admin/faqs");
      },
      onError: (err) => toast.error(err.message || "Lỗi khi thêm câu hỏi"),
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb điều hướng */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link to="/admin/faqs" className="text-slate-500 hover:text-primary transition-colors">
          Quản lý FAQs
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-medium">Thêm câu hỏi mới</span>
      </div>

      {/* Header trang */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Thêm câu hỏi mới</h2>
        <p className="text-slate-500 text-sm mt-1">Tạo câu hỏi thường gặp mới cho hệ thống HealthCare.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          {/* Nhập câu hỏi */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Câu hỏi <span className="text-red-500">*</span>
            </label>
            <input
              {...register("cauHoi")}
              placeholder="VD: Làm thế nào để đặt lịch hẹn khám bệnh?"
              className={`w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary ${errors.cauHoi ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
            />
            {errors.cauHoi && <p className="text-red-500 text-xs mt-1">{errors.cauHoi.message}</p>}
          </div>

          {/* Nhập câu trả lời */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Câu trả lời <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("traLoi")}
              rows={5}
              placeholder="Nhập câu trả lời chi tiết cho câu hỏi này..."
              className={`w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary ${errors.traLoi ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
            />
            {errors.traLoi && <p className="text-red-500 text-xs mt-1">{errors.traLoi.message}</p>}
          </div>

          {/* Chọn trạng thái hiển thị */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Trạng thái hiển thị</label>
              <select
                {...register("dangHoatDong")}
                className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
              >
                <option value="1">Hiển thị</option>
                <option value="0">Ẩn / Bản nháp</option>
              </select>
            </div>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="bg-slate-50 px-6 sm:px-8 py-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-200">
          <button
            onClick={() => navigate("/admin/faqs")}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
              loading ? "bg-slate-300 cursor-not-allowed" : "bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
            }`}
          >
            {loading ? (
              <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-sm">save</span>
            )}
            Lưu câu hỏi
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminAddFAQPage;
