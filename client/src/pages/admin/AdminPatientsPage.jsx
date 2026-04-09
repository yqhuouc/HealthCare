import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { patientService } from "../../services/patientService";
import ConfirmModal from "../../components/ui/ConfirmModal";

const ITEMS_PER_PAGE = 8;

export default function AdminPatientsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);

  // Modal states
  const [modalMode, setModalMode] = useState(null); // 'delete' | 'lock' | 'unlock'
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
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
        setPatients(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalPatients(res.pagination?.total || 0);
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

  const openActionModal = (patient, mode) => {
    setSelectedPatient(patient);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedPatient) return;

    try {
      if (modalMode === 'delete') {
        await patientService.remove(selectedPatient.id);
        toast.success(`Đã xóa hồ sơ bệnh nhân ${selectedPatient.hoTen}`);
      } else {
        const newStatus = modalMode === 'lock' ? 0 : 1;
        await patientService.update(selectedPatient.id, { 
          trangThaiTaiKhoan: newStatus 
        });
        toast.success(`${modalMode === 'lock' ? "Khóa" : "Mở khóa"} tài khoản thành công!`);
      }
      // Đợi fetch lại dữ liệu mới nhất
      await fetchPatients();
    } catch (err) {
      toast.error(err.message || "Thao tác thất bại");
    } finally {
      setIsModalOpen(false);
      setSelectedPatient(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý bệnh nhân</h1>
          <p className="text-slate-500 text-sm mt-1">
            Điều chỉnh trạng thái hoạt động và hồ sơ bệnh nhân hệ thống.
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex items-center gap-4 shrink-0 px-6">
          <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
            <span className="material-symbols-outlined text-primary text-2xl font-light">groups</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tổng bệnh nhân</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <p className="text-2xl font-black text-slate-900">
                {totalPatients.toLocaleString("vi-VN")}
              </p>
              <p className="text-[10px] font-bold text-slate-400">hồ sơ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl transition-colors group-focus-within:text-primary">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo mã BN, tên, số điện thoại..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-transparent bg-slate-50 focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm font-medium"
          />
        </div>
      </div>

      {/* Main content - Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mã BN</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Họ tên bệnh nhân</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Liên hệ</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trạng thái</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Tùy chọn hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-24">
                    <span className="material-symbols-outlined animate-spin text-primary/30 text-5xl">progress_activity</span>
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-24">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <span className="material-symbols-outlined text-6xl font-light">person_search</span>
                      <p className="text-sm font-medium">Không tìm thấy bệnh nhân nào trong hệ thống.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-5 px-6">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-black font-mono">
                        BN{p.id}
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      <p className="font-bold text-slate-900 text-sm">{p.hoTen}</p>
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5 uppercase tracking-wider">
                        Tham gia: {p.taiKhoan?.ngayTao ? new Date(p.taiKhoan.ngayTao).toLocaleDateString("vi-VN") : "—"}
                      </p>
                    </td>
                    <td className="py-5 px-6">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-700">{p.soDienThoai || "—"}</p>
                        <p className="text-[11px] text-slate-400 font-medium truncate max-w-[180px]">
                          {p.taiKhoan?.email || p.emailLienHe || "Chưa cập nhật email"}
                        </p>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      {p.taiKhoan?.trangThaiTaiKhoan === 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-wider border border-rose-100 shadow-sm shadow-rose-100/50">
                          <span className="size-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                          Đã khóa tài khoản
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-emerald-100 shadow-sm shadow-emerald-100/50">
                          <span className="size-1.5 rounded-full bg-emerald-500"></span>
                          Đang hoạt động
                        </span>
                      )}
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/admin/patients/${p.id}`}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/5 transition-all text-[10px] font-bold border border-transparent hover:border-primary/10"
                          title="Xem chi tiết"
                        >
                          <span className="material-symbols-outlined text-base">visibility</span>
                          CHI TIẾT
                        </Link>
                        
                        {p.taiKhoan?.trangThaiTaiKhoan === 0 ? (
                          <button
                            onClick={() => openActionModal(p, 'unlock')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all text-[10px] font-bold shadow-sm shadow-emerald-500/20"
                          >
                            <span className="material-symbols-outlined text-base">lock_open</span>
                            MỞ KHÓA
                          </button>
                        ) : (
                          <button
                            onClick={() => openActionModal(p, 'lock')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition-all text-[10px] font-bold shadow-sm shadow-slate-800/20"
                          >
                            <span className="material-symbols-outlined text-base">lock</span>
                            KHÓA TK
                          </button>
                        )}
                        
                        <button
                          onClick={() => openActionModal(p, 'delete')}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                          title="Xóa hồ sơ"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Improved Pagination */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Trang {page} / {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page <= 1}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-all shadow-sm hover:shadow-md"
            >
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-all shadow-sm hover:shadow-md"
            >
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Action Modal */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmAction}
        title={
          modalMode === 'delete' 
            ? "Xác nhận xóa bệnh nhân" 
            : modalMode === 'lock' 
              ? "Xác nhận khóa tài khoản" 
              : "Xác nhận mở khóa tài khoản"
        }
        message={
          modalMode === 'delete' ? (
            <>
              Hệ thống sẽ xóa vĩnh viễn hồ sơ của bệnh nhân <strong>{selectedPatient?.hoTen}</strong>. 
              Các tài khoản liên kết và lịch sử cũng sẽ bị ảnh hưởng. Thao tác này <strong>không thể hoàn tác</strong>.
            </>
          ) : modalMode === 'lock' ? (
            <>
              Tài khoản của bệnh nhân <strong>{selectedPatient?.hoTen}</strong> sẽ bị tạm ngưng. 
              Người dùng này sẽ không thể đăng nhập cho đến khi được mở khóa lại.
            </>
          ) : (
            <>Bạn có chắc muốn khôi phục quyền truy cập cho bệnh nhân <strong>{selectedPatient?.hoTen}</strong> không?</>
          )
        }
        confirmText={
          modalMode === 'delete' ? "Xóa vĩnh viễn" : modalMode === 'lock' ? "Khóa tài khoản ngay" : "Mở khóa ngay"
        }
        type={modalMode === 'delete' || modalMode === 'lock' ? 'danger' : 'success'}
      />
    </div>
  );
}
