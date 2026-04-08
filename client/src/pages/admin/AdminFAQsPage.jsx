/**
 * ============================================================
 * TRANG: Quản lý FAQs (Admin)
 * Đường dẫn: /admin/faqs
 * ============================================================
 *
 * Chức năng:
 * - Danh sách câu hỏi thường gặp dạng bảng
 * - Tabs lọc: Tất cả / Đã xuất bản / Bản nháp / Lưu trữ
 * - Mỗi FAQ hiển thị: câu hỏi, chuyên mục (badge màu), trạng thái (dot), ngày tạo
 * - Nút Sửa/Xóa cho mỗi FAQ
 * - Nút "Thêm câu hỏi" → /admin/faqs/add
 * - Phân trang
 * - Responsive: mobile card view, desktop table view
 *
 * State:
 * - activeTab: tab đang active ("all", "published", "draft", "archived")
 * - currentPage: trang hiện tại
 *
 * Logic lọc:
 * - "all" → hiển thị tất cả
 * - "published" → status === "visible"
 * - "draft" → status === "draft"
 * - "archived" → status === "archived"
 *
 * Dữ liệu: ADMIN_FAQS từ mockAdminData.js
 * ============================================================
 */
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { faqService } from "../../services/faqService";

const STATUS_MAP = {
  1: { label: "Hiển thị", dotClass: "bg-emerald-500" },
  0: { label: "Ẩn", dotClass: "bg-slate-400" },
};

const ITEMS_PER_PAGE = 5;

function AdminFAQsPage() {
  const [page, setPage] = useState(1);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await faqService.getAllAdmin({ page, limit: ITEMS_PER_PAGE });
      if (res.success) {
        setFaqs(res.data.faqs || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi lấy danh sách FAQ");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const handleEdit = (id) => {
    toast.info(`Chức năng chỉnh sửa FAQ #${id} đang phát triển`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này không?")) return;
    
    try {
      await faqService.remove(id);
      toast.success("Đã xóa câu hỏi thành công");
      fetchFaqs();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Lỗi khi xóa câu hỏi");
    }
  };

  return (
    <div className="space-y-6">
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



      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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
                <tr>
                  <td colSpan="5" className="text-center py-10">
                    <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
                  </td>
                </tr>
              ) : faqs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-slate-500">
                    Chưa có câu hỏi nào được lưu trong hệ thống.
                  </td>
                </tr>
              ) : faqs.map((item) => {
                const statusInfo = STATUS_MAP[item.dangHoatDong] || STATUS_MAP[0];
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 max-w-[320px]">
                      <p className="line-clamp-1 text-slate-800 font-medium">{item.cauHoi}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary`}>
                        {item.cauHoiThuongGap_ChuyenMuc?.tenChuyenMuc || "Hệ thống"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {new Date(item.ngayTao || Date.now()).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`size-2 rounded-full ${statusInfo.dotClass}`} />
                        <span className="text-slate-700">{statusInfo.label}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="size-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
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

        <div className="block md:hidden divide-y divide-slate-100">
          {faqs.map((item) => {
            const statusInfo = STATUS_MAP[item.dangHoatDong] || STATUS_MAP[0];
            return (
              <div key={item.id} className="p-4 space-y-3">
                <p className="line-clamp-1 font-medium text-slate-800">{item.cauHoi}</p>
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
                  {new Date(item.ngayTao || Date.now()).toLocaleDateString("vi-VN")}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(item.id)}
                    className="size-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100"
                  >
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="size-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-rose-50 hover:text-rose-500"
                  >
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">
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
