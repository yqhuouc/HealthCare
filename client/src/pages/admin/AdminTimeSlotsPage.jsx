import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { scheduleService } from "../../services/scheduleService";
import { formatTime } from "../../utils/formatters";

function AdminTimeSlotsPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [newSlot, setNewSlot] = useState({ gioBatDau: "", gioKetThuc: "" });

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      const res = await scheduleService.getAllKhungGio();
      if (res.success) setSlots(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi tải danh sách khung giờ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await scheduleService.createKhungGio(newSlot);
      if (res.success) {
        toast.success("Thêm khung giờ thành công");
        setNewSlot({ gioBatDau: "", gioKetThuc: "" });
        setShowAddModal(false);
        fetchSlots();
      }
    } catch (error) {
      toast.error(error.message || "Lỗi khi tạo khung giờ");
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      const res = await scheduleService.deleteKhungGio(deleteModal.id);
      if (res.success) {
        toast.success("Xóa thành công");
        setDeleteModal({ open: false, id: null });
        fetchSlots();
      }
    } catch (error) {
       toast.error(error.message || "Lỗi khi xóa khung giờ (Có thể đang có lịch liên kết)");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý khung giờ</h2>
          <p className="text-slate-500">Thiết lập các ca khám bệnh trong ngày</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-xl">more_time</span>
          Thêm khung giờ
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">ID</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Thời gian</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="3" className="py-20 text-center"><span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span></td></tr>
            ) : slots.length === 0 ? (
              <tr><td colSpan="3" className="py-20 text-center text-slate-400 italic">Chưa có khung giờ nào</td></tr>
            ) : slots.map((slot) => (
              <tr key={slot.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4 text-slate-500 font-medium font-mono text-sm">#{slot.id}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                     <span className="px-3 py-1 bg-primary/10 text-primary font-bold rounded-lg text-sm">
                       {formatTime(slot.gioBatDau)} - {formatTime(slot.gioKetThuc)}
                     </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setDeleteModal({ open: true, id: slot.id })}
                    className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Thêm khung giờ mới</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Giờ bắt đầu</label>
                  <input
                    type="time"
                    required
                    value={newSlot.gioBatDau}
                    onChange={(e) => setNewSlot({ ...newSlot, gioBatDau: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Giờ kết thúc</label>
                  <input
                    type="time"
                    required
                    value={newSlot.gioKetThuc}
                    onChange={(e) => setNewSlot({ ...newSlot, gioKetThuc: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500 italic">* Lưu ý: Khung giờ sẽ được áp dụng cho tất cả bác sĩ khi tạo lịch.</p>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                  Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <span className="material-symbols-outlined text-rose-500 text-3xl">delete_forever</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Xác nhận xóa?</h3>
            <p className="text-sm text-slate-500 mb-6 px-4">
              Bạn có chắc chắn muốn xóa khung giờ này? Hành động không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteModal({ open: false, id: null })} 
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
              >
                Xóa khung giờ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminTimeSlotsPage;
