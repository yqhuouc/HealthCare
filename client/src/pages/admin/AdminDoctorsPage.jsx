/**
 * ============================================================
 * TRANG: Quản lý bác sĩ (Admin)
 * Đường dẫn: /admin/doctors
 * ============================================================
 *
 * Chức năng:
 * - Danh sách bác sĩ dạng bảng: avatar (initials), tên, mã, chuyên khoa, KN, trạng thái
 * - Tìm kiếm theo tên, mã, chuyên khoa (realtime)
 * - Phân trang (5 bác sĩ/trang)
 * - Nút Sửa/Xóa hiện khi hover (desktop) hoặc luôn hiện (mobile)
 * - Nút "Thêm bác sĩ mới" → /admin/doctors/add
 * - 3 card thống kê cuối: BS mới tháng này, tỷ lệ hoạt động, số chuyên khoa
 * - Responsive: mobile card view, desktop table view
 *
 * State:
 * - search: chuỗi tìm kiếm
 * - page: trang hiện tại
 *
 * Logic tính toán:
 * - filtered: lọc ADMIN_DOCTORS theo search (useMemo)
 * - paginated: cắt filtered theo page (useMemo)
 *
 * Dữ liệu: ADMIN_DOCTORS, DOCTOR_STATUS_CONFIG từ mockAdminData.js
 * ============================================================
 */
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ADMIN_DOCTORS, DOCTOR_STATUS_CONFIG } from "../../data/mockAdminData";

const ITEMS_PER_PAGE = 5;

/** Lấy 2 ký tự đầu tên (bỏ prefix "BS.") để làm avatar initials */
function getInitials(name) {
  const parts = name.replace(/^BS\.\s*/i, "").trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function AdminDoctorsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim()) return ADMIN_DOCTORS;
    const q = search.toLowerCase();
    return ADMIN_DOCTORS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q)
    );
  }, [search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);


  const handleEdit = (id) => {
    toast.info(`Chỉnh sửa bác sĩ #${id}`);
  };

  const handleDelete = (id) => {
    toast.warning(`Xóa bác sĩ #${id} - chức năng sẽ được triển khai.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Danh sách bác sĩ</h1>
          <p className="text-slate-500 mt-1">
            Quản lý thông tin và lịch làm việc của đội ngũ y bác sĩ.
          </p>
        </div>
        <Link
          to="/admin/doctors/add"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-semibold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition"
        >
          <span className="material-symbols-outlined text-xl">person_add</span>
          Thêm bác sĩ mới
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo tên, mã, chuyên khoa..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Ảnh</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Họ tên + ID</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Chuyên khoa</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Kinh nghiệm</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Trạng thái</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((doc) => {
                const statusCfg = DOCTOR_STATUS_CONFIG[doc.status] || DOCTOR_STATUS_CONFIG.active;
                return (
                  <tr
                    key={doc.id}
                    className="group border-b border-slate-100 hover:bg-slate-50/50 transition"
                  >
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                        {getInitials(doc.name)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{doc.name}</p>
                      <p className="text-sm text-slate-500">{doc.code}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium">
                        {doc.specialty}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{doc.experience}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium ${statusCfg.className}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotColor}`} />
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleEdit(doc.id)}
                          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-primary"
                          aria-label="Chỉnh sửa"
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-500"
                          aria-label="Xóa"
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

        <div className="md:hidden divide-y divide-slate-100">
          {paginated.map((doc) => {
            const statusCfg = DOCTOR_STATUS_CONFIG[doc.status] || DOCTOR_STATUS_CONFIG.active;
            return (
              <div key={doc.id} className="p-4 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                  {getInitials(doc.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">{doc.name}</p>
                  <p className="text-sm text-slate-500">{doc.code}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                      {doc.specialty}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${statusCfg.className}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotColor}`} />
                      {statusCfg.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{doc.experience}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleEdit(doc.id)}
                      className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                    >
                      <span className="material-symbols-outlined text-xl">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-500"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
            <p className="text-sm text-slate-500">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium disabled:opacity-50 hover:bg-slate-100"
              >
                Trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium disabled:opacity-50 hover:bg-slate-100"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-primary/10 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-2xl">person_add</span>
          </div>
          <div>
            <p className="text-sm text-slate-600 font-medium">Mới tháng này</p>
            <p className="text-xl font-bold text-primary">+12 Bác sĩ</p>
          </div>
        </div>
        <div className="bg-green-100 text-green-600 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-200/50 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">verified</span>
          </div>
          <div>
            <p className="text-sm text-green-700 font-medium">Tỷ lệ hoạt động</p>
            <p className="text-xl font-bold">94.2%</p>
          </div>
        </div>
        <div className="bg-amber-100 text-amber-600 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-200/50 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">medical_information</span>
          </div>
          <div>
            <p className="text-sm text-amber-700 font-medium">Chuyên khoa</p>
            <p className="text-xl font-bold">18 Ngành</p>
          </div>
        </div>
      </div>
    </div>
  );
}
