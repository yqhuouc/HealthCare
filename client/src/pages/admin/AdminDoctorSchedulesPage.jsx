import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { scheduleService } from "../../services/scheduleService";
import { doctorService } from "../../services/doctorService";

function AdminDoctorSchedulesPage() {
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    bacSiId: "all",
    ngayLamViec: new Date().toISOString().split("T")[0]
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    bacSiId: "",
    ngayBatDau: "",
    ngayKetThuc: "",
    khungGioIds: [] // Array of selected slot IDs
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dRes, sRes, schRes] = await Promise.all([
        doctorService.getAll(),
        scheduleService.getAllKhungGio(),
        scheduleService.getLichLamViec({ 
          bacSiId: filters.bacSiId !== "all" ? filters.bacSiId : "",
          ngayLamViec: filters.ngayLamViec
        })
      ]);

      if (dRes.success) setDoctors(dRes.data);
      if (sRes.success) setSlots(sRes.data);
      if (schRes.success) setSchedules(schRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newSchedule.bacSiId || !newSchedule.ngayBatDau || newSchedule.khungGioIds.length === 0) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    // Logic created for bulk dates: from Start to End
    const start = new Date(newSchedule.ngayBatDau);
    const end = new Date(newSchedule.ngayKetThuc || newSchedule.ngayBatDau);
    const dates = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split("T")[0]);
    }

    let successCount = 0;
    let failCount = 0;

    toast.info("Đang xử lý tạo lịch...");

    for (const date of dates) {
      for (const slotId of newSchedule.khungGioIds) {
        try {
          await scheduleService.createLichLamViec({
            bacSiId: newSchedule.bacSiId,
            ngayLamViec: date,
            khungGioId: slotId
          });
          successCount++;
        } catch (err) {
          console.error(err);
          failCount++;
        }
      }
    }

    if (successCount > 0) {
      toast.success(`Đã tạo thành công ${successCount} ca làm việc.`);
      setShowAddModal(false);
      setNewSchedule({ bacSiId: "", ngayBatDau: "", ngayKetThuc: "", khungGioIds: [] });
      fetchData();
    }
    if (failCount > 0) {
      toast.warning(`${failCount} ca bị trùng hoặc lỗi.`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa ca làm việc này?")) return;
    try {
      await scheduleService.deleteLichLamViec(id);
      toast.success("Đã xóa ca làm việc");
      fetchData();
    } catch (error) {
       toast.error(error.message || "Lỗi khi xóa");
    }
  };

  const toggleSlotSelection = (id) => {
    setNewSchedule(prev => ({
      ...prev,
      khungGioIds: prev.khungGioIds.includes(id) 
        ? prev.khungGioIds.filter(i => i !== id)
        : [...prev.khungGioIds, id]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý lịch làm việc</h2>
          <p className="text-slate-500">Xem và phân lịch cho đội ngũ bác sĩ</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-xl">event_available</span>
          Tạo lịch hộ bác sĩ
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="space-y-1.5 flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-slate-500 uppercase ml-1">Bác sĩ</label>
          <select
            value={filters.bacSiId}
            onChange={(e) => setFilters({ ...filters, bacSiId: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value="all">Tất cả bác sĩ</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.tenBacSi}</option>)}
          </select>
        </div>
        <div className="space-y-1.5 flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-slate-500 uppercase ml-1">Ngày làm việc</label>
          <input
            type="date"
            value={filters.ngayLamViec}
            onChange={(e) => setFilters({ ...filters, ngayLamViec: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Bác sĩ</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Khung giờ</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Tải trọng (Bệnh nhân)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="py-20 text-center text-primary animate-spin"><span className="material-symbols-outlined text-4xl">progress_activity</span></td></tr>
              ) : schedules.length === 0 ? (
                <tr><td colSpan="5" className="py-20 text-center text-slate-400 italic">Ngày này chưa có lịch làm việc nào được phân công.</td></tr>
              ) : schedules.map((sch) => (
                <tr key={sch.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-900">{sch.bacSi?.tenBacSi}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-primary/10 text-primary font-bold rounded-lg text-xs">
                      {sch.khungGio?.gioBatDau} - {sch.khungGio?.gioKetThuc}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">
                    {sch.soBenhNhanHienTai} / {sch.soBenhNhanToiDa} BN
                  </td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${sch.sanSang === 1 ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                       {sch.sanSang === 1 ? "Đang mở" : "Tạm khóa"}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(sch.id)}
                      className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-900">Tạo lịch hộ bác sĩ</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Chọn bác sĩ</label>
                <select
                  required
                  value={newSchedule.bacSiId}
                  onChange={(e) => setNewSchedule({ ...newSchedule, bacSiId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="">-- Chọn bác sĩ --</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.tenBacSi} ({d.chuyenKhoa?.tenChuyenKhoa})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Từ ngày</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={newSchedule.ngayBatDau}
                    onChange={(e) => setNewSchedule({ ...newSchedule, ngayBatDau: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Đến ngày (Tùy chọn)</label>
                  <input
                    type="date"
                    min={newSchedule.ngayBatDau}
                    value={newSchedule.ngayKetThuc}
                    onChange={(e) => setNewSchedule({ ...newSchedule, ngayKetThuc: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700">Chọn các khung giờ (Có thể chọn nhiều)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {slots.map(slot => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => toggleSlotSelection(slot.id)}
                      className={`
                        p-3 rounded-xl border text-sm font-bold transition-all
                        ${newSchedule.khungGioIds.includes(slot.id)
                          ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:border-primary/50"}
                      `}
                    >
                      {slot.gioBatDau} - {slot.gioKetThuc}
                    </button>
                  ))}
                </div>
                {newSchedule.khungGioIds.length === 0 && <p className="text-xs text-rose-500 italic">Vui lòng chọn ít nhất một khung giờ.</p>}
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 items-start">
                <span className="material-symbols-outlined text-amber-600">info</span>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Hệ thống sẽ tự động tính số lượng bệnh nhân tối đa dựa trên thời lượng khám của Chuyên khoa bác sĩ đó. 
                  Nếu đã có lịch trùng, hệ thống sẽ bỏ qua ca đó.
                </p>
              </div>

              <div className="flex gap-4 pt-4 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                >
                   <span className="material-symbols-outlined text-xl">send</span>
                   Xác nhận tạo lịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDoctorSchedulesPage;
