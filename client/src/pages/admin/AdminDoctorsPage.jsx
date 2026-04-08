import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { doctorService } from "../../services/doctorService";
import { specialtyService } from "../../services/specialtyService";
import { adminStatsService } from "../../services/adminStatsService";
import { formatPrice } from "../../utils/formatters";
import ConfirmModal from "../../components/ui/ConfirmModal";

const ITEMS_PER_PAGE = 8;

export default function AdminDoctorsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [stats, setStats] = useState({ tongBacSi: 0, tongChuyenKhoa: 0 });

  // Modal xóa
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingDoctor, setDeletingDoctor] = useState(null);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Lấy danh sách chuyên khoa + Thống kê tổng quan
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [specRes, statsRes] = await Promise.all([
          specialtyService.getAll(),
          adminStatsService.getTongQuan(),
        ]);
        if (specRes.success) setSpecialties(specRes.data);
        if (statsRes.success) setStats(statsRes.data);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu ban đầu:", err);
      }
    };
    fetchData();
  }, []);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await doctorService.getAll({
        page,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch,
        chuyenKhoaId: selectedSpecialty || undefined,
      });
      if (res.success) {
        setDoctors(res.data);
        setTotalPages(Number(res.pagination?.totalPages || 1));
        setTotalDoctors(Number(res.pagination?.total || 0));
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi lấy danh sách bác sĩ");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, selectedSpecialty]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleEdit = (id) => {
    navigate(`/admin/doctors/edit/${id}`);
  };

  const confirmDelete = (doc) => {
    setDeletingDoctor(doc);
    setIsDeleting(true);
  };

  const handleDelete = async () => {
    if (!deletingDoctor) return;
    try {
      await doctorService.remove(deletingDoctor.id);
      toast.success(`Xóa bác sĩ "${deletingDoctor.tenBacSi}" thành công!`);
      fetchDoctors();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Không thể xóa bác sĩ này!");
    } finally {
      setIsDeleting(false);
      setDeletingDoctor(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Danh sách bác sĩ</h1>
          <p className="text-slate-500 text-sm mt-1">
            Quản lý thông tin và tài khoản của đội ngũ y bác sĩ.
          </p>
        </div>
        <Link
          to="/admin/doctors/add"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all text-sm"
        >
          <span className="material-symbols-outlined text-xl">person_add</span>
          Thêm bác sĩ mới
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative font-sans">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên bác sĩ..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm"
          />
        </div>
        
        <div className="w-full md:w-72 relative font-sans">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            filter_list
          </span>
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm appearance-none cursor-pointer font-medium text-slate-700 bg-white"
          >
            <option value="">Tất cả chuyên khoa</option>
            {specialties.map((s) => (
              <option key={s.id} value={s.id}>
                {s.tenChuyenKhoa}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">
            unfold_more
          </span>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Mã BS</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Họ tên + Học vị</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Chuyên khoa</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Giá khám</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <span className="material-symbols-outlined animate-spin text-4xl text-primary/30">progress_activity</span>
                  </td>
                </tr>
              ) : doctors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <span className="material-symbols-outlined text-5xl">person_search</span>
                      <p className="text-sm font-medium">Không tìm thấy bác sĩ nào phù hợp.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                doctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold font-mono">
                        BS{doc.id}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900 text-sm">
                        {doc.hocViChucDanh ? `${doc.hocViChucDanh} ` : ""}{doc.tenBacSi}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{doc.taiKhoan?.email}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-primary/40"></span>
                        <span className="text-sm font-medium text-slate-700">
                          {doc.chuyenKhoa?.tenChuyenKhoa || "Chưa phân khoa"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-bold text-primary font-sans">
                        {doc.giaKham ? formatPrice(doc.giaKham) : "Miễn phí"}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(doc.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/10 transition-all"
                          title="Chỉnh sửa"
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button
                          onClick={() => confirmDelete(doc)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                          title="Xóa bác sĩ"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-5 hover:border-primary/50 transition-colors">
          <div className="size-16 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
            <span className="material-symbols-outlined text-primary text-3xl font-light">groups</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Toàn hệ thống</p>
            <div className="flex items-baseline gap-1 mt-1">
              <h3 className="text-3xl font-black text-slate-900 leading-none">
                {selectedSpecialty ? totalDoctors : stats.tongBacSi}
              </h3>
              <p className="text-xs font-bold text-slate-400 underline decoration-primary/30 underline-offset-4">
                {selectedSpecialty ? "bác sĩ" : "thành viên"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-5 hover:border-amber-500/50 transition-colors">
          <div className="size-16 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100">
            <span className="material-symbols-outlined text-amber-600 text-3xl font-light">medical_information</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Chuyên khoa</p>
            <div className="flex items-baseline gap-1 mt-1">
              <h3 className="text-3xl font-black text-slate-900 leading-none">{stats.tongChuyenKhoa || specialties.length}</h3>
              <p className="text-xs font-bold text-slate-400 underline decoration-amber-500/30 underline-offset-4">ngành y</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa bác sĩ"
        message={
          <>
            Bạn có chắc chắn muốn xóa bác sĩ <strong>{deletingDoctor?.tenBacSi}</strong> không? 
            Tài khoản liên kết <strong>{deletingDoctor?.taiKhoan?.email}</strong> cũng sẽ bị xóa vĩnh viễn khỏi hệ thống.
          </>
        }
        confirmText="Xóa vĩnh viễn"
        type="danger"
      />
    </div>
  );
}
