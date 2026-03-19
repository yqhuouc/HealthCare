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
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ADMIN_FAQS } from "../../data/mockAdminData";

/** Cấu hình các tab lọc */
const TABS = [
  { value: "all", label: "Tất cả" },
  { value: "published", label: "Đã xuất bản" },
  { value: "draft", label: "Bản nháp" },
  { value: "archived", label: "Lưu trữ" },
];

const STATUS_MAP = {
  visible: { label: "Hiển thị", dotClass: "bg-emerald-500" },
  hidden: { label: "Ẩn", dotClass: "bg-slate-400" },
  draft: { label: "Bản nháp", dotClass: "bg-amber-500" },
  archived: { label: "Lưu trữ", dotClass: "bg-slate-400" },
};

const ITEMS_PER_PAGE = 5;

function AdminFAQsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [faqs, setFaqs] = useState(ADMIN_FAQS);

  const filtered = faqs.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "published") return item.status === "visible";
    if (activeTab === "draft") return item.status === "draft";
    if (activeTab === "archived") return item.status === "archived";
    return true;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleEdit = (id) => {
    toast.info("Chức năng chỉnh sửa đang phát triển");
  };

  const handleDelete = (id) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    toast.success("Đã xóa FAQ");
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

      <div className="border-b border-slate-200">
        <div className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setActiveTab(tab.value);
                setCurrentPage(1);
              }}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? "text-primary border-b-2 border-primary"
                  : "text-slate-500 hover:text-slate-700 border-b-2 border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
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
              {paginatedData.map((item) => {
                const statusInfo = STATUS_MAP[item.status] || STATUS_MAP.hidden;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 max-w-[320px]">
                      <p className="line-clamp-1 text-slate-800 font-medium">{item.question}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${item.categoryColor}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{item.createdAt}</td>
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
          {paginatedData.map((item) => {
            const statusInfo = STATUS_MAP[item.status] || STATUS_MAP.hidden;
            return (
              <div key={item.id} className="p-4 space-y-3">
                <p className="line-clamp-1 font-medium text-slate-800">{item.question}</p>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${item.categoryColor}`}>
                    {item.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${statusInfo.dotClass}`} />
                    <span className="text-xs text-slate-600">{statusInfo.label}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500">{item.createdAt}</p>
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
              Trang {currentPage} / {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="size-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
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
