/**
 * ============================================================
 * TRANG: Quản lý bệnh nhân (Admin)
 * Đường dẫn: /admin/patients
 * ============================================================
 *
 * Chức năng:
 * - Danh sách bệnh nhân: mã BN, tên (avatar initials), SĐT, email, ngày đăng ký
 * - Tìm kiếm theo mã, tên, SĐT, email (realtime)
 * - Phân trang (5 BN/trang)
 * - Card tổng số BN ở góc trên phải
 * - Nút "Chi tiết" xem thông tin BN, nút "Chặn" chặn tài khoản
 * - Responsive: mobile card view, desktop table view
 *
 * State:
 * - search: chuỗi tìm kiếm
 * - page: trang hiện tại
 *
 * Dữ liệu: ADMIN_PATIENTS từ mockAdminData.js
 * ============================================================
 */
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { patientService } from "../../services/patientService";
import { getInitials } from "../../utils/formatters";

const ITEMS_PER_PAGE = 5;

export default function AdminPatientsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset trang khi tìm kiếm mới
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await patientService.getAll({
        page,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch,
      });
      if (res.success) {
        setPatients(res.data.benhNhans || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalPatients(res.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi lấy danh sách bệnh nhân");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleDetail = (id) => {
    toast.info(`Tính năng xem chi tiết #${id} đang được phát triển`);
  };

  const handleBlock = async (id) => {
    toast.warning(`Tính năng chặn người dùng #${id} đang được phát triển`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý bệnh nhân</h1>
          <p className="text-slate-500 mt-1">
            Theo dõi và quản lý thông tin bệnh nhân đăng ký trên hệ thống.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center gap-3 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-2xl">group</span>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Tổng bệnh nhân</p>
            <p className="text-xl font-bold text-primary">
              {totalPatients.toLocaleString("vi-VN")}
            </p>
          </div>
        </div>
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
            placeholder="Tìm theo mã, tên, SĐT, email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Mã BN</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Họ tên</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Số điện thoại</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Email</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Ngày đăng ký</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10">
                    <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-500">
                    Chưa có bệnh nhân nào.
                  </td>
                </tr>
              ) : patients.map((p) => {
                const dateRaw = p.taiKhoan?.ngayTao;
                const formattedDate = dateRaw ? new Date(dateRaw).toLocaleDateString("vi-VN") : "Chưa xác định";
                return (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4">
                      <span className="text-primary font-semibold">BN{p.id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                          {getInitials(p.hoTen)}
                        </div>
                        <span className="font-medium text-slate-800">{p.hoTen}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{p.soDienThoai || "—"}</td>
                    <td className="py-3 px-4 text-slate-600">{p.taiKhoan?.email || p.emailLienHe || "—"}</td>
                    <td className="py-3 px-4 text-slate-600">{formattedDate}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDetail(p.id)}
                          className="px-3 py-1.5 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/5 transition"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => handleBlock(p.id)}
                          className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-500"
                          aria-label="Chặn"
                        >
                          <span className="material-symbols-outlined text-xl">block</span>
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
          {patients.map((p) => {
            const dateRaw = p.taiKhoan?.ngayTao;
            const formattedDate = dateRaw ? new Date(dateRaw).toLocaleDateString("vi-VN") : "Chưa xác định";
            return (
              <div key={p.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                    {getInitials(p.hoTen)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-primary">BN{p.id}</p>
                    <p className="font-medium text-slate-800">{p.hoTen}</p>
                    <p className="text-sm text-slate-500">{p.soDienThoai || "—"}</p>
                    <p className="text-sm text-slate-500 truncate">{p.taiKhoan?.email || p.emailLienHe || "—"}</p>
                    <p className="text-sm text-slate-500 mt-1">{formattedDate}</p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleDetail(p.id)}
                        className="px-3 py-1.5 rounded-lg border border-primary text-primary text-sm font-medium"
                      >
                        Chi tiết
                      </button>
                      <button
                        onClick={() => handleBlock(p.id)}
                        className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-500"
                      >
                        <span className="material-symbols-outlined text-xl">block</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50/50">
          <p className="text-sm text-slate-500">
            Trang {page} / {totalPages}
          </p>
          {totalPages > 1 && (
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
          )}
        </div>
      </div>
    </div>
  );
}
