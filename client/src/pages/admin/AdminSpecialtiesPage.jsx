/**
 * ============================================================
 * TRANG: Quản lý chuyên khoa (Admin)
 * Đường dẫn: /admin/specialties
 * ============================================================
 *
 * Chức năng:
 * - Danh sách chuyên khoa: icon, tên, mô tả, số lượng bác sĩ
 * - Phân trang (5 chuyên khoa/trang)
 * - Nút Sửa/Xóa cho mỗi chuyên khoa
 * - Nút "Thêm chuyên khoa" → /admin/specialties/add
 * - 3 card thông tin cuối: lưu ý khi xóa, trạng thái hoạt động, yêu cầu mới
 * - Responsive: mobile card view, desktop table view
 *
 * State:
 * - currentPage: trang hiện tại
 *
 * Dữ liệu: ADMIN_SPECIALTIES từ mockAdminData.js
 * ============================================================
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { ADMIN_SPECIALTIES } from "../../data/mockAdminData";

const ITEMS_PER_PAGE = 5;

function AdminSpecialtiesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const data = ADMIN_SPECIALTIES;
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = data.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý chuyên khoa</h1>
          <p className="text-slate-500 mt-1">Quản lý danh sách các chuyên khoa trong hệ thống</p>
        </div>
        <Link
          to="/admin/specialties/add"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Thêm chuyên khoa
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Tên chuyên khoa</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Mô tả</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Số lượng bác sĩ</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary text-xl">{item.icon}</span>
                      </div>
                      <span className="font-bold text-slate-800">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600 max-w-[280px] line-clamp-1">{item.description}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                      <span className="material-symbols-outlined text-base">groups</span>
                      {item.doctorCount}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button className="size-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-xl">edit_square</span>
                      </button>
                      <button className="size-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-colors">
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="block md:hidden divide-y divide-slate-100">
          {paginatedData.map((item) => (
            <div key={item.id} className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-xl">{item.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                  <span className="material-symbols-outlined text-base">groups</span>
                  {item.doctorCount} bác sĩ
                </span>
                <div className="flex items-center gap-1">
                  <button className="size-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100">
                    <span className="material-symbols-outlined text-xl">edit_square</span>
                  </button>
                  <button className="size-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-rose-50 hover:text-rose-500">
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-slate-700">
          Khi xóa một chuyên khoa, hãy đảm bảo không còn bác sĩ hoặc lịch khám nào đang liên kết với chuyên khoa đó.
        </div>
        <div className="p-4 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-between">
          <span className="font-medium">Hoạt động</span>
          <span className="flex items-center gap-1.5 font-bold">
            <span className="material-symbols-outlined text-xl">verified</span>
            12/12
          </span>
        </div>
        <div className="p-4 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-between">
          <span className="font-medium">Yêu cầu mới</span>
          <span className="flex items-center gap-1.5 font-bold">
            <span className="material-symbols-outlined text-xl">medical_information</span>
            03
          </span>
        </div>
      </div>
    </div>
  );
}

export default AdminSpecialtiesPage;
