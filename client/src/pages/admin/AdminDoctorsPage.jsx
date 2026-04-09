import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { doctorService } from "../../services/doctorService";
import { specialtyService } from "../../services/specialtyService";
import { adminStatsService } from "../../services/adminStatsService";
import { formatPrice } from "../../utils/formatters";
import ConfirmModal from "../../components/ui/ConfirmModal";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const ITEMS_PER_PAGE = 8; // Số lượng bác sĩ hiển thị trên mỗi trang

/**
 * Trang AdminDoctorsPage - Quản lý danh sách bác sĩ dành cho Quản trị viên
 * Chức năng: Tìm kiếm, Lọc theo chuyên khoa, Khóa/Mở khóa tài khoản, Xóa bác sĩ.
 */
export default function AdminDoctorsPage() {
  const navigate = useNavigate();
  
  // State quản lý bộ lọc và tìm kiếm
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedSpecialty, setSelectedSpecialty] = useState(""); // ID chuyên khoa đang lọc
  
  // State lưu trữ dữ liệu từ API
  const [doctors, setDoctors] = useState([]);      // Danh sách bác sĩ hiển thị
  const [specialties, setSpecialties] = useState([]); // Danh sách tất cả chuyên khoa để làm bộ lọc
  const [loading, setLoading] = useState(true);      // Trạng thái đang tải dữ liệu
  const [totalPages, setTotalPages] = useState(1);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [stats, setStats] = useState({ tongBacSi: 0, tongChuyenKhoa: 0 }); // Thống kê nhanh ở cuối trang

  // State quản lý Modal xác nhận (Dùng chung cho Xóa, Khóa, Mở khóa)
  const [modalMode, setModalMode] = useState(null); // 'delete' | 'lock' | 'unlock'
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Xử lý Debounce tìm kiếm: Chỉ tìm sau khi người dùng ngừng gõ 500ms
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Quay về trang 1 khi từ khóa tìm kiếm thay đổi
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  /**
   * Lấy danh mục chuyên khoa và các thông số thống kê cơ bản
   */
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

  /**
   * Hàm lấy danh sách bác sĩ dựa trên phân trang, tìm kiếm và chuyên khoa
   */
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

  // Tự động gọi fetch mỗi khi các tham số lọc thay đổi
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  /**
   * Mở modal xác nhận hành động
   * @param {Object} doc - Dữ liệu bác sĩ tương ứng
   * @param {string} mode - Loại hành động ('delete', 'lock', 'unlock')
   */
  const openActionModal = (doc, mode) => {
    setSelectedDoctor(doc);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  /**
   * Xử lý thực hiện hành động sau khi người dùng bấm "Xác nhận" trong Modal
   */
  const handleConfirmAction = async () => {
    if (!selectedDoctor) return;

    try {
      if (modalMode === 'delete') {
        // Hành động XÓA bác sĩ
        await doctorService.remove(selectedDoctor.id);
        toast.success(`Đã xóa hồ sơ bác sĩ ${selectedDoctor.tenBacSi}`);
      } else {
        // Hành động KHÓA hoặc MỞ KHÓA (Cập nhật trạng thái tài khoản)
        const newStatus = modalMode === 'lock' ? 0 : 1; // 0: Khóa, 1: Hoạt động
        await doctorService.update(selectedDoctor.id, { 
          trangThaiTaiKhoan: newStatus 
        });
        toast.success(`${modalMode === 'lock' ? "Khóa" : "Mở khóa"} tài khoản bác sĩ thành công!`);
      }
      // Tải lại danh sách sau khi thao tác thành công
      await fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || "Thao tác thất bại");
    } finally {
      setIsModalOpen(false);
      setSelectedDoctor(null);
    }
  };

  /** Chuyển hướng sang trang cập nhật thông tin bác sĩ */
  const handleEdit = (id) => {
    navigate(`/admin/doctors/edit/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: Tiêu đề và Nút thêm bác sĩ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Danh sách bác sĩ</h1>
          <p className="text-slate-500 text-sm mt-1">
            Quản lý thông tin và trạng thái hoạt động của đội ngũ y bác sĩ.
          </p>
        </div>
        <Link
          to="/admin/doctors/add"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/95 transition-all text-sm"
        >
          <span className="material-symbols-outlined text-xl">person_add</span>
          Thêm bác sĩ mới
        </Link>
      </div>

      {/* SECTION 2: Các bộ lọc (Tìm kiếm + Chuyên khoa) */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Tìm kiếm theo tên */}
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên bác sĩ..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-slate-200 bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium"
          />
        </div>
        
        {/* Lọc theo chuyên khoa */}
        <div className="w-full md:w-72 relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            filter_list
          </span>
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-slate-200 bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm appearance-none cursor-pointer font-bold text-slate-700"
          >
            <option value="">Tất cả chuyên khoa</option>
            {specialties.map((s) => (
              <option key={s.id} value={s.id}>
                {s.tenChuyenKhoa}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            unfold_more
          </span>
        </div>
      </div>

      {/* SECTION 3: Bảng chính hiển thị danh sách */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã BS</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Họ tên + Học vị</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Chuyên khoa</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Giá khám</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tùy chọn hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                // Hiển thị loading khi đang gọi API
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <LoadingSpinner size="size-12" />
                  </td>
                </tr>
              ) : doctors.length === 0 ? (
                // Hiển thị khi danh sách trống
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <span className="material-symbols-outlined text-6xl font-light">person_search</span>
                      <p className="text-sm font-medium">Không tìm thấy bác sĩ nào phù hợp.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                // Duyệt qua mảng doctors để hiển thị các dòng dữ liệu
                doctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-5 px-6">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-black font-mono">
                        BS{doc.id}
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      <p className="font-bold text-slate-900 text-sm">
                        {doc.hocViChucDanh ? `${doc.hocViChucDanh} ` : ""}{doc.tenBacSi}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">{doc.taiKhoan?.email}</p>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-primary/40"></span>
                        <span className="text-xs font-bold text-slate-700">
                          {doc.chuyenKhoa?.tenChuyenKhoa || "Chưa phân khoa"}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <p className="text-xs font-black text-primary">
                        {doc.giaKham ? formatPrice(doc.giaKham) : "Miễn phí"}
                      </p>
                    </td>
                    <td className="py-5 px-6 text-center">
                      {/* Trạng thái tài khoản: 0 là Đã khóa, 1 là Đang hoạt động */}
                      {doc.taiKhoan?.trangThaiTaiKhoan === 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-wider border border-rose-100 shadow-sm shadow-rose-100/50">
                          <span className="size-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                          Đã khóa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-emerald-100 shadow-sm shadow-emerald-100/50">
                          <span className="size-1.5 rounded-full bg-emerald-500"></span>
                          Hoạt động
                        </span>
                      )}
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center justify-center gap-2">
                        {/* Nút Chỉnh sửa */}
                        <button
                          onClick={() => handleEdit(doc.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/5 transition-all text-[10px] font-bold border border-transparent hover:border-primary/10"
                          title="Chỉnh sửa"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                          SỬA
                        </button>
                        
                        {/* Nút Khóa / Mở khóa dựa trên trạng thái hiện tại */}
                        {doc.taiKhoan?.trangThaiTaiKhoan === 0 ? (
                          <button
                            onClick={() => openActionModal(doc, 'unlock')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all text-[10px] font-bold shadow-sm shadow-emerald-500/20"
                          >
                            <span className="material-symbols-outlined text-base">lock_open</span>
                            MỞ KHÓA
                          </button>
                        ) : (
                          <button
                            onClick={() => openActionModal(doc, 'lock')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition-all text-[10px] font-bold shadow-sm shadow-slate-800/20"
                          >
                            <span className="material-symbols-outlined text-base">lock</span>
                            KHÓA TK
                          </button>
                        )}

                        {/* Nút Xóa */}
                        <button
                          onClick={() => openActionModal(doc, 'delete')}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                          title="Xóa bác sĩ"
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

        {/* Thanh Phân trang */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
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

      {/* SECTION 4: Các thẻ thống kê nhanh ở Footer */}
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

      {/* MODAL XÁC NHẬN HÀNH ĐỘNG (Dùng thành phần ConfirmModal dùng chung) */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmAction}
        title={
          modalMode === 'delete' 
            ? "Xác nhận xóa bác sĩ" 
            : modalMode === 'lock' 
              ? "Xác nhận khóa tài khoản" 
              : "Xác nhận mở khóa tài khoản"
        }
        message={
          modalMode === 'delete' ? (
            <>
              Bạn có chắc chắn muốn xóa bác sĩ <strong>{selectedDoctor?.tenBacSi}</strong>? 
              Tài khoản liên kết <strong>{selectedDoctor?.taiKhoan?.email}</strong> cũng sẽ bị xóa vĩnh viễn. Thao tác này <strong>không thể hoàn tác</strong>.
            </>
          ) : modalMode === 'lock' ? (
            <>
              Tài khoản của bác sĩ <strong>{selectedDoctor?.tenBacSi}</strong> sẽ bị tạm ngưng. 
              Bác sĩ sẽ không thể đăng nhập hoặc xem lịch hẹn cho đến khi được mở lại.
            </>
          ) : (
            <>Bạn có chắc muốn khôi phục quyền truy cập cho bác sĩ <strong>{selectedDoctor?.tenBacSi}</strong> không?</>
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
