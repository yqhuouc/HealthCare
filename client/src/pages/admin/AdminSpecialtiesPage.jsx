import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { specialtyService } from "../../services/specialtyService";
import ConfirmModal from "../../components/ui/ConfirmModal";

const ITEMS_PER_PAGE = 7;

function AdminSpecialtiesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State cho Modal xác nhận xóa
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);

  const fetchSpecialties = async () => {
    setLoading(true);
    try {
      const res = await specialtyService.getAll();
      if (res.success) {
        setSpecialties(res.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi tải danh sách chuyên khoa");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const totalPages = Math.ceil(specialties.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = specialties.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const requestDelete = (specialty) => {
    const doctorCount = specialty._count?.bacSiList || 0;
    if (doctorCount > 0) {
      toast.error(`Không thể xóa vì chuyên khoa "${specialty.tenChuyenKhoa}" đang có ${doctorCount} bác sĩ!`);
      return;
    }
    setSelectedSpecialty(specialty);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedSpecialty) return;
    try {
      await specialtyService.remove(selectedSpecialty.id);
      toast.success(`Đã xóa chuyên khoa "${selectedSpecialty.tenChuyenKhoa}"`);
      fetchSpecialties();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi xóa");
    }
  };

  return (
    <div className="space-y-6">
      {/* Modal xác nhận xóa */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Xóa chuyên khoa"
        message={`Bạn có chắc chắn muốn xóa chuyên khoa "${selectedSpecialty?.tenChuyenKhoa}"? Dữ liệu này sẽ không thể phục hồi.`}
        confirmLabel="Xóa ngay"
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý chuyên khoa</h1>
          <p className="text-sm text-slate-500 mt-1">Danh mục các chuyên khoa khám chữa bệnh trong hệ thống</p>
        </div>
        <Link
          to="/admin/specialties/add"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 shrink-0"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Thêm chuyên khoa mới
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 uppercase tracking-widest">
                <th className="text-left px-6 py-4 font-bold text-slate-500 text-[11px]">Chuyên khoa</th>
                <th className="text-left px-6 py-4 font-bold text-slate-500 text-[11px]">Mô tả bộ phận</th>
                <th className="px-6 py-4 font-bold text-slate-500 text-[11px] text-center">Bác sĩ</th>
                <th className="text-right px-6 py-4 font-bold text-slate-500 text-[11px]">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-20">
                    <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-20 text-slate-400 font-medium">
                    <span className="material-symbols-outlined text-4xl mb-2 block">inventory_2</span>
                    Chưa có chuyên khoa nào được tạo
                  </td>
                </tr>
              ) : paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {/* Thumbnail Image */}
                      <div className="size-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {item.anhChuyenKhoa ? (
                          <img src={item.anhChuyenKhoa} alt={item.tenChuyenKhoa} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-slate-400">image</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          {/* Display saved icon */}
                          {item.icon && (
                            <span className="material-symbols-outlined text-primary text-xl">
                              {item.icon}
                            </span>
                          )}
                          {item.tenChuyenKhoa}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">ID: #{item.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-600 line-clamp-2 max-w-xs text-xs leading-relaxed">
                      {item.moTaChuyenKhoa || "Không có mô tả"}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold">
                      <span className="material-symbols-outlined text-sm">groups</span>
                      {item._count?.bacSiList || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        to={`/admin/specialties/edit/${item.id}`} 
                        className="size-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-primary transition-all"
                        title="Chỉnh sửa"
                      >
                        <span className="material-symbols-outlined text-xl">edit</span>
                      </Link>
                      <button 
                        onClick={() => requestDelete(item)} 
                        className="size-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all"
                        title="Xóa chuyên khoa"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="block md:hidden divide-y divide-slate-100">
          {paginatedData.map((item) => (
            <div key={item.id} className="p-5 space-y-4">
              <div className="flex items-start gap-4">
                <div className="size-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                  {item.anhChuyenKhoa ? (
                    <img src={item.anhChuyenKhoa} alt={item.tenChuyenKhoa} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-400">medical_services</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    {item.icon && <span className="material-symbols-outlined text-primary text-base">{item.icon}</span>}
                    {item.tenChuyenKhoa}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {item.moTaChuyenKhoa}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">groups</span>
                  {item._count?.bacSiList || 0} bác sĩ
                </span>
                <div className="flex items-center gap-2">
                  <Link to={`/admin/specialties/edit/${item.id}`} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold">
                    Sửa
                  </Link>
                  <button onClick={() => requestDelete(item)} className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold">
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Trang {currentPage} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex items-start gap-3">
        <span className="material-symbols-outlined text-slate-400 text-xl">info</span>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">
          Hệ thống yêu cầu các chuyên khoa phải trống người (không có bác sĩ đang liên kết) mới có thể thực hiện thao tác xóa để đảm bảo toàn vẹn dữ liệu. Đối với các chuyên khoa quan trọng, hãy cân nhắc sửa tên thay vì xóa.
        </p>
      </div>
    </div>
  );
}


export default AdminSpecialtiesPage;
