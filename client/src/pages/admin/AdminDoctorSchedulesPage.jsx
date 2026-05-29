import { useState } from "react";
import { toast } from "react-toastify";
import {
  useLichLamViec,
  useKhungGio,
  useDeleteLichLamViec,
  useUpdateLichLamViec,
} from "../../hooks/queries/useScheduleQueries";
import { useSpecialties } from "../../hooks/queries/useSpecialtyQueries";
import { useDoctors } from "../../hooks/queries/useDoctorQueries";
import { scheduleService } from "../../services/scheduleService"; // Giữ lại cho bulk create
import { formatTime, toDateString, dayjs } from "../../utils/dateUtils";
import { useQueryClient } from "@tanstack/react-query";
import { scheduleKeys } from "../../hooks/queries/useScheduleQueries";

/**
 * Trang AdminDoctorSchedulesPage - Quản lý lịch làm việc của Bác sĩ (Admin)
 * Cho phép xem danh sách lịch, tạo lịch hộ bác sĩ, điều chỉnh số lượng bệnh nhân tối đa và xóa lịch.
 */
function AdminDoctorSchedulesPage() {
  const queryClient = useQueryClient();

  // State quản lý các bộ lọc ở đầu trang
  const [filters, setFilters] = useState({
    chuyenKhoaId: "all",
    bacSiId: "all",
    ngayLamViec: toDateString(dayjs()),
  });

  // TanStack Query: Lấy dữ liệu danh mục (auto-cache)
  const { data: spRes } = useSpecialties();
  const { data: dRes } = useDoctors({ limit: 1000 });
  const { data: sRes } = useKhungGio();
  const specialties = spRes?.data || [];
  const doctors = dRes?.data || [];
  const slots = sRes?.data || [];

  // TanStack Query: Lấy lịch làm việc theo bộ lọc
  const schParams = {
    bacSiId: filters.bacSiId !== "all" ? filters.bacSiId : "",
    ngayLamViec: filters.ngayLamViec,
  };
  const { data: schRes, isLoading: loading } = useLichLamViec(schParams);

  // Lọc client-side theo chuyên khoa nếu cần
  const schedules = (() => {
    let data = schRes?.data || [];
    if (filters.chuyenKhoaId !== "all" && filters.bacSiId === "all") {
      data = data.filter((sch) => sch.bacSi?.chuyenKhoaId === Number(filters.chuyenKhoaId));
    }
    return data;
  })();

  // TanStack Query: Mutations
  const deleteMutation = useDeleteLichLamViec();
  const updateMutation = useUpdateLichLamViec();

  // State quản lý Modal thêm mới lịch làm việc
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalChuyenKhoa, setAddModalChuyenKhoa] = useState("all");
  const [newSchedule, setNewSchedule] = useState({
    bacSiId: "",
    ngayBatDau: "",
    ngayKetThuc: "",
    khungGioIds: [],
  });

  // State quản lý Modal chỉnh sửa tải trọng và Modal xóa
  const [editModal, setEditModal] = useState({
    open: false,
    schedule: null,
    newLimit: 0,
  });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  /**
   * Xử lý tạo lịch làm việc hàng loạt theo khoảng ngày và nhiều khung giờ
   * @param {Event} e - Sự kiện submit form
   */
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newSchedule.bacSiId || !newSchedule.ngayBatDau || newSchedule.khungGioIds.length === 0) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const start = dayjs(newSchedule.ngayBatDau).startOf("day");
    const end = dayjs(newSchedule.ngayKetThuc || newSchedule.ngayBatDau).startOf("day");
    const dates = [];
    for (let d = start; !d.isAfter(end); d = d.add(1, "day")) {
      dates.push(toDateString(d));
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
            khungGioId: slotId,
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
      setNewSchedule({
        bacSiId: "",
        ngayBatDau: "",
        ngayKetThuc: "",
        khungGioIds: [],
      });
      // Invalidate queries thay vì fetchData()
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
    }
    if (failCount > 0) {
      toast.warning(`${failCount} ca bị trùng hoặc lỗi.`);
    }
  };

  /**
   * Thực hiện xóa ca làm việc sau khi đã xác nhận
   */
  const confirmDelete = () => {
    if (!deleteModal.id) return;
    deleteMutation.mutate(deleteModal.id, {
      onSuccess: () => {
        toast.success("Đã xóa ca làm việc");
        setDeleteModal({ open: false, id: null });
      },
      onError: (error) => toast.error(error.message || "Lỗi khi xóa"),
    });
  };

  /**
   * Cập nhật số lượng bệnh nhân tối đa cho một ca làm việc cụ thể
   */
  const submitEditCapacity = (e) => {
    e.preventDefault();
    if (!editModal.schedule) return;
    updateMutation.mutate(
      {
        id: editModal.schedule.id,
        data: { soBenhNhanToiDa: editModal.newLimit },
      },
      {
        onSuccess: () => {
          toast.success("Đã điều chỉnh tải trọng thành công!");
          setEditModal({ open: false, schedule: null, newLimit: 0 });
        },
        onError: (error) => toast.error(error.message || "Lỗi khi cập nhật"),
      },
    );
  };

  /**
   * Duyệt hoặc Khóa lịch làm việc
   */
  const toggleSanSang = (sch) => {
    updateMutation.mutate(
      {
        id: sch.id,
        data: { sanSang: sch.sanSang === 1 ? 0 : 1 },
      },
      {
        onSuccess: () => toast.success(`Đã ${sch.sanSang === 1 ? "tạm khóa" : "duyệt mở"} lịch làm việc!`),
        onError: (error) => toast.error(error.message || "Lỗi cập nhật"),
      }
    );
  };

  /**
   * Chọn/Bỏ chọn một khung giờ trong Modal tạo lịch
   * @param {number} id - ID của khung giờ
   */
  const toggleSlotSelection = (id) => {
    setNewSchedule((prev) => ({
      ...prev,
      khungGioIds: prev.khungGioIds.includes(id) ? prev.khungGioIds.filter((i) => i !== id) : [...prev.khungGioIds, id],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang và Nút mở modal thêm mới */}
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

      {/* THANH BỘ LỌC (Chuyên khoa, Bác sĩ, Ngày) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="space-y-1.5 flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-slate-500 uppercase ml-1">Chuyên khoa</label>
          <select
            value={filters.chuyenKhoaId}
            onChange={(e) =>
              setFilters({
                ...filters,
                chuyenKhoaId: e.target.value,
                bacSiId: "all",
              })
            }
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value="all">Tất cả chuyên khoa</option>
            {specialties.map((sp) => (
              <option key={sp.id} value={sp.id}>
                {sp.tenChuyenKhoa}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5 flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-slate-500 uppercase ml-1">Bác sĩ</label>
          <select
            value={filters.bacSiId}
            onChange={(e) => setFilters({ ...filters, bacSiId: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value="all">Tất cả Bác sĩ</option>
            {doctors
              .filter((d) => filters.chuyenKhoaId === "all" || d.chuyenKhoaId === Number(filters.chuyenKhoaId))
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.tenBacSi}
                </option>
              ))}
          </select>
        </div>
        <div className="space-y-1.5 flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-slate-500 uppercase ml-1">Ngày làm việc</label>
          <input
            type="date"
            value={filters.ngayLamViec}
            onChange={(e) => setFilters({ ...filters, ngayLamViec: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* BẢNG HIỂN THỊ DANH SÁCH LỊCH LÀM VIỆC */}
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
                <tr>
                  <td colSpan="5" className="py-20 text-center text-primary animate-spin">
                    <span className="material-symbols-outlined text-4xl">progress_activity</span>
                  </td>
                </tr>
              ) : schedules.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-slate-400 italic">
                    Ngày này chưa có lịch làm việc nào được phân công.
                  </td>
                </tr>
              ) : (
                schedules.map((sch) => (
                  <tr key={sch.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div className="flex flex-col">
                        <span>{sch.bacSi?.tenBacSi}</span>
                        <span className="text-[10px] font-bold text-slate-400 capitalize">
                          {sch.bacSi?.chuyenKhoa?.tenChuyenKhoa}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-primary/10 text-primary font-black tracking-widest rounded-lg text-xs">
                        {formatTime(sch.khungGio?.gioBatDau)} - {formatTime(sch.khungGio?.gioKetThuc)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="text-emerald-600">{sch.soBenhNhanHienTai}</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-700">{sch.soBenhNhanToiDa} BN</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${sch.sanSang === 1 ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"}`}
                      >
                        {sch.sanSang === 1 ? "Đang mở" : "Chờ duyệt / Khóa"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        {/* Nút duyệt / khóa lịch */}
                        <button
                          onClick={() => toggleSanSang(sch)}
                          className={`aspect-square size-8 flex justify-center items-center rounded-lg transition-all ${
                            sch.sanSang === 1
                              ? "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                              : "text-emerald-500 hover:bg-emerald-50 bg-emerald-50/50"
                          }`}
                          title={sch.sanSang === 1 ? "Tạm khóa lịch" : "Duyệt lịch (Mở cửa)"}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {sch.sanSang === 1 ? "lock" : "check_circle"}
                          </span>
                        </button>
                        {/* Nút mở modal chỉnh sửa tải trọng */}
                        <button
                          onClick={() =>
                            setEditModal({
                              open: true,
                              schedule: sch,
                              newLimit: sch.soBenhNhanToiDa,
                            })
                          }
                          className="aspect-square size-8 flex justify-center items-center text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                          title="Điều chỉnh tải trọng"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        {/* Nút mở modal xác nhận xóa */}
                        <button
                          onClick={() => setDeleteModal({ open: true, id: sch.id })}
                          className="aspect-square size-8 flex justify-center items-center text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                          title="Xóa lịch làm việc"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TẠO LỊCH HỘ BÁC SĨ (Hỗ trợ chọn nhiều ngày và nhiều ca) */}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Lọc theo chuyên khoa</label>
                  <select
                    value={addModalChuyenKhoa}
                    onChange={(e) => {
                      setAddModalChuyenKhoa(e.target.value);
                      setNewSchedule({ ...newSchedule, bacSiId: "" });
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="all">Tất cả chuyên khoa</option>
                    {specialties.map((sp) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.tenChuyenKhoa}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-rose-600">Chọn bác sĩ (*)</label>
                  <select
                    required
                    value={newSchedule.bacSiId}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        bacSiId: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="">-- Chọn bác sĩ --</option>
                    {doctors
                      .filter((d) => addModalChuyenKhoa === "all" || d.chuyenKhoaId === Number(addModalChuyenKhoa))
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.tenBacSi} ({d.chuyenKhoa?.tenChuyenKhoa})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Từ ngày</label>
                  <input
                    type="date"
                    required
                    min={toDateString(dayjs())}
                    value={newSchedule.ngayBatDau}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        ngayBatDau: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Đến ngày (Tùy chọn)</label>
                  <input
                    type="date"
                    min={newSchedule.ngayBatDau}
                    value={newSchedule.ngayKetThuc}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        ngayKetThuc: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700">Chọn các khung giờ (Có thể chọn nhiều)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {slots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => toggleSlotSelection(slot.id)}
                      className={`
                        p-3 rounded-xl border text-sm font-bold transition-all
                        ${
                          newSchedule.khungGioIds.includes(slot.id)
                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:border-primary/50"
                        }
                      `}
                    >
                      {formatTime(slot.gioBatDau)} - {formatTime(slot.gioKetThuc)}
                    </button>
                  ))}
                </div>
                {newSchedule.khungGioIds.length === 0 && (
                  <p className="text-xs text-rose-500 italic">Vui lòng chọn ít nhất một khung giờ.</p>
                )}
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

      {/* MODAL ĐIỀU CHỈNH TẢI TRỌNG (SỐ BỆNH NHÂN TỐI ĐA) */}
      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-lg">Điều chỉnh tải trọng</h3>
            </div>
            <form onSubmit={submitEditCapacity} className="p-5 space-y-5">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm">
                <p>
                  <span className="text-slate-500">Bác sĩ:</span>{" "}
                  <strong className="text-slate-800">{editModal.schedule?.bacSi?.tenBacSi}</strong>
                </p>
                <p>
                  <span className="text-slate-500">Ca:</span>{" "}
                  <strong className="text-primary">
                    {formatTime(editModal.schedule?.khungGio?.gioBatDau)} -{" "}
                    {formatTime(editModal.schedule?.khungGio?.gioKetThuc)}
                  </strong>
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Số ca khám tối đa</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={50}
                  value={editModal.newLimit}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      newLimit: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-primary/20 outline-none font-bold text-slate-900"
                />
                <p className="text-xs italic text-slate-400">
                  Tăng số lượng bệnh nhân để nới lỏng thêm ca khám cho bác sĩ.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModal({ open: false, schedule: null, newLimit: 0 })}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA CA LÀM VIỆC */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <span className="material-symbols-outlined text-rose-500 text-3xl">delete_forever</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Bạn chắc chắn muốn xóa?</h3>
            <p className="text-sm text-slate-500 mb-6 px-4">
              Xóa lịch làm việc này đồng nghĩa bác sĩ sẽ không khám vào khung giờ này nữa. Hành động không thể hoàn tác.
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
                Xác nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDoctorSchedulesPage;
