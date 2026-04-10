/**
 * ============================================================
 * TRANG: Quản lý FAQs (Admin)
 * Đường dẫn: /admin/faqs
 * ============================================================
 *
 * Chức năng chính:
 * - Hiển thị danh sách các câu hỏi thường gặp (FAQs) dưới dạng bảng (Desktop) hoặc thẻ (Mobile).
 * - Quản lý trạng thái hiển thị (Hiển thị/Ẩn) của từng câu hỏi.
 * - Cho phép thêm mới, chỉnh sửa và xóa câu hỏi.
 * - Hỗ trợ phân trang dữ liệu từ Server.
 *
 * Data fetching: TanStack Query (useFAQsAdmin, useDeleteFAQ)
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useFAQsAdmin, useDeleteFAQ } from "../../hooks/queries/useFAQQueries";
import { formatDate, dayjs } from "../../utils/dateUtils";

// Bản đồ trạng thái dùng để hiển thị nhãn và màu sắc tương ứng
const STATUS_MAP = {
  1: { label: "Hiển thị", dotClass: "bg-emerald-500" },
  0: { label: "Ẩn", dotClass: "bg-slate-400" },
};

// Cấu hình số lượng bản ghi hiển thị trên mỗi trang
const ITEMS_PER_PAGE = 5;

function AdminFAQsPage() {
  // State quản lý phân trang
  const [page, setPage] = useState(1);

  // TanStack Query: Lấy danh sách FAQ (auto-cache, auto-refetch khi page thay đổi)
  const { data: faqsRes, isLoading: loading } = useFAQsAdmin({ page, limit: ITEMS_PER_PAGE });
  const faqs = faqsRes?.data || [];
  const totalPages = faqsRes?.pagination?.totalPages || 1;

  // TanStack Query: Mutation xóa FAQ (auto-invalidate danh sách sau khi xóa)
  const deleteMutation = useDeleteFAQ();

  /**
   * Xử lý xóa một câu hỏi dựa trên ID
   * Có yêu cầu xác nhận từ người dùng trước khi thực hiện
   */
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này không?")) return;
    
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success("Đã xóa câu hỏi thành công"),
      onError: (err) => toast.error(err.message || "Lỗi khi xóa câu hỏi"),
    });
  };

  return (
    <div className="space-y-6">
      {/* Phần tiêu đề và nút thêm mới */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý FAQs</h1>
          <p className="text-slate-500 mt-1">Danh sách các câu hỏi thường gặp hệ thống HealthCare</p>
        </div>
        <Link
          to="/admin/faqs/add"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Thêm câu hỏi
        </Link>
      </div>

      {/* Container chính chứa bảng danh sách */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* VIEW: DESKTOP (Hiển thị dạng bảng Table) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Câu hỏi</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Chuyên mục</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Ngày tạo</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Trạng thái</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                // Hiển thị trạng thái đang tải
                <tr>
                  <td colSpan="5" className="text-center py-10">
                    <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
                  </td>
                </tr>
              ) : faqs.length === 0 ? (
                // Hiển thị khi danh sách trống
                <tr>
                  <td colSpan="5" className="text-center py-10 text-slate-500">
                    Chưa có câu hỏi nào được lưu trong hệ thống.
                  </td>
                </tr>
              ) : faqs.map((item) => {
                const statusInfo = STATUS_MAP[item.dangHoatDong] || STATUS_MAP[0];
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Cột Nội dung câu hỏi */}
                    <td className="px-5 py-4 max-w-[320px]">
                      <p className="line-clamp-1 text-slate-800 font-medium" title={item.cauHoi}>{item.cauHoi}</p>
                    </td>
                    {/* Cột Chuyên mục */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary`}>
                        {item.cauHoiThuongGap_ChuyenMuc?.tenChuyenMuc || "Hệ thống"}
                      </span>
                    </td>
                    {/* Cột Ngày tạo */}
                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(item.ngayTao || dayjs())}
                    </td>
                    {/* Cột Trạng thái dot color */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`size-2 rounded-full ${statusInfo.dotClass}`} />
                        <span className="text-slate-700">{statusInfo.label}</span>
                      </div>
                    </td>
                    {/* Cột Nút hành động */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/admin/faqs/edit/${item.id}`}
                          className="size-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="size-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* VIEW: MOBILE (Hiển thị dạng thẻ Card dọc) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {faqs.map((item) => {
            const statusInfo = STATUS_MAP[item.dangHoatDong] || STATUS_MAP[0];
            return (
              <div key={item.id} className="p-4 space-y-3">
                <p className="line-clamp-2 font-medium text-slate-800">{item.cauHoi}</p>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary`}>
                    {item.cauHoiThuongGap_ChuyenMuc?.tenChuyenMuc || "Hệ thống"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${statusInfo.dotClass}`} />
                    <span className="text-xs text-slate-600">{statusInfo.label}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  {formatDate(item.ngayTao || dayjs())}
                </p>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/admin/faqs/edit/${item.id}`}
                    className="flex-1 py-2 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center gap-1 hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                    Sửa nội dung
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="size-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* PHẦN ĐIỀU KHIỂN PHÂN TRANG */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500 text-center sm:text-left">
              Trang {page} / {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="size-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="size-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminFAQsPage;
