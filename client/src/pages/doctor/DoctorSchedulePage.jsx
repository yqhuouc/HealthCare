/**
 * =============================================================================
 * TRANG: QUẢN LÝ LỊCH LÀM VIỆC & CA TRỰC (DÀNH CHO BÁC SĨ)
 * Đường dẫn: /doctor/schedule
 * =============================================================================
 *
 * CHỨC NĂNG CHÍNH:
 * 1. Lịch mini (Mini Calendar): Giúp bác sĩ nhìn tổng quan cả tháng, ngày nào có ca trực
 *    thì sẽ có một dấu chấm xanh đánh dấu.
 * 2. Bộ lọc thông minh:
 *    - Khi bấm vào một ngày bất kỳ, danh sách bên phải sẽ chỉ hiện ca của ngày đó.
 *    - Bấm vào ngày đó lần nữa để bỏ lọc (xem lại toàn bộ ca trong tháng).
 * 3. Quản lý ca trực: Cho phép xem chi tiết giờ giấc, số bệnh nhân và xóa ca trực.
 * 4. Thống kê nhanh: Tổng số ca đã đăng ký và số ca sắp tới.
 *
 * PHÂN CHIA BỐ CỤC (UI Structure):
 * - Cột trái (1/3): Chứa bộ lịch nhỏ để chọn ngày.
 * - Cột phải (2/3): Chứa danh sách chi tiết các ca trực.
 * =============================================================================
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { scheduleService } from "../../services/scheduleService";
import useAuthStore from "../../stores/useAuthStore";
import { toast } from "react-toastify";
import { formatTime } from "../../utils/formatters";

// Mảng định nghĩa tên các thứ trong tuần để hiển thị lên đầu bộ lịch
const DAYS_OF_WEEK = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];



/**
 * HÀM HỖ TRỢ: Tính xem một tháng có bao nhiêu ngày (28, 29, 30 hay 31)
 */
function getDaysInMonth(year, month) {
  // Ngày 0 của tháng kế tiếp chính là ngày cuối cùng của tháng hiện tại
  return new Date(year, month + 1, 0).getDate();
}

/**
 * HÀM HỖ TRỢ: Tìm xem ngày đầu tiên của tháng rơi vào thứ mấy (để xếp lịch cho đúng cột)
 */
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay(); // 0 là Chủ Nhật, 1 là Thứ Hai...
}

function DoctorSchedulePage() {
  // 1. LẤY THÔNG TIN CỦA BÁC SĨ ĐANG ĐĂNG NHẬP
  const { user } = useAuthStore();
  const bacSiId = user?.bacSi?.id;

  // 2. KHỞI TẠO CÁC TRẠNG THÁI (STATE)
  const now = new Date();
  // selectedDate: Ngày bác sĩ bấm chọn trên lịch (null có nghĩa là đang xem cả tháng)
  const [selectedDate, setSelectedDate] = useState(now.getDate());
  // currentMonth & currentYear: Tháng/Năm đang hiển thị trên bộ lịch
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  // schedules: Nơi lưu toàn bộ danh sách ca trực lấy về từ Database
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * LUỒNG XỬ LÝ: Gọi API để lấy danh sách ca trực của bác sĩ ngay khi vào trang
   */
  useEffect(() => {
    if (!bacSiId) return;
    const fetchData = async () => {
      try {
        const res = await scheduleService.getLichLamViec({ bacSiId });
        setSchedules(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Lỗi khi tải lịch:", err);
        toast.error("Không thể tải lịch làm việc");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [bacSiId]);

  /**
   * LOGIC QUAN TRỌNG: Tìm các ngày có ca trực trong tháng hiện tại
   * Mục đích: Để hiển thị các "dấu chấm xanh" báo hiệu ngày có lịch trên Calendar.
   */
  const activeDays = schedules
    .filter((s) => {
      const d = new Date(s.ngayLamViec);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .map((s) => new Date(s.ngayLamViec).getDate());

  /**
   * LOGIC QUAN TRỌNG: Phân loại trạng thái của ca trực (Hoàn thành / Hôm nay / Sắp tới)
   */
  const todayStr = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  });

  const getShiftStatus = (schedule) => {
    const shiftDate = new Date(schedule.ngayLamViec).toLocaleDateString(
      "en-CA",
      { timeZone: "Asia/Ho_Chi_Minh" },
    );
    if (shiftDate < todayStr) return "completed"; // Ngày trong quá khứ
    if (shiftDate === todayStr) return "active"; // Chính là ngày hôm nay
    return "upcoming"; // Các ngày trong tương lai
  };

  /**
   * BẢN ĐỒ MÀU SẮC: Quy định nhãn (Tag) cho từng trạng thái ca trực
   */
  const STATUS_MAP = {
    active: {
      label: "Hôm nay",
      className: "bg-blue-100 text-blue-800 border border-blue-200",
    },
    upcoming: {
      label: "Sắp tới",
      className: "bg-amber-100 text-amber-800 border border-amber-200",
    },
    completed: {
      label: "Hoàn thành",
      className: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    },
  };

  // Các biến phụ trợ để vẽ bộ lịch
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  // CHỨC NĂNG: Chuyển sang tháng trước
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDate(null); // Khi chuyển tháng thì bỏ chọn ngày cũ
  };

  // CHỨC NĂNG: Chuyển sang tháng kế tiếp
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDate(null); // Khi chuyển tháng thì bỏ chọn ngày cũ
  };

  // Tên tháng hiển thị (Ví dụ: "Tháng 4 năm 2024")
  const monthName = new Date(currentYear, currentMonth).toLocaleDateString(
    "vi-VN",
    {
      month: "long",
      year: "numeric",
    },
  );

  /**
   * CHỨC NĂNG: Xóa một ca làm việc (Chỉ dành cho ca chưa diễn ra)
   */
  const handleDelete = async (shiftId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa ca làm việc này?")) return;
    try {
      await scheduleService.deleteLichLamViec(shiftId);
      // Xóa thành công thì cập nhật lại danh sách trên giao diện ngay lập tức
      setSchedules((prev) => prev.filter((s) => s.id !== shiftId));
      toast.success("Đã xóa ca làm việc");
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi xóa ca làm việc");
    }
  };

  /**
   * LOGIC XẾP LỊCH: Tạo mảng các ô cho Calendar (bao gồm cả ô trống ở đầu tháng)
   */
  const calendarCells = [];
  // Thêm các ô trống (null) vào đầu tháng để ngày mùng 1 rơi đúng thứ trong tuần
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  // Thêm các con số ngày từ 1 đến hết tháng
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  // THỐNG KÊ NHANH
  const totalShifts = schedules.length;
  const upcomingShifts = schedules.filter(
    (s) => getShiftStatus(s) === "upcoming",
  ).length;

  /**
   * BỘ LỌC CHÍNH: Quyết định xem ca trực nào sẽ được hiển thị ở bảng bên phải
   */
  const filteredSchedules = schedules.filter((s) => {
    const d = new Date(s.ngayLamViec);
    // 1. Chỉ lấy ca thuộc Tháng/Năm đang xem trên lịch
    if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear)
      return false;
    // 2. Nếu bác sĩ có chọn một ngày cụ thể thì chỉ lấy ca của ngày đó
    if (selectedDate !== null && d.getDate() !== selectedDate) return false;
    return true;
  });

  // HIỂN THỊ KHI ĐANG TẢI DỮ LIỆU
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined text-5xl text-primary animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PHẦN ĐẦU TRANG: Tiêu đề và nút thêm ca trực */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            Lịch trình làm việc
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Theo dõi và quản lý các ca trực tại phòng khám
          </p>
        </div>
        <Link
          to="/doctor/schedule/add"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all text-sm uppercase tracking-wide"
        >
          <span className="material-symbols-outlined text-xl">add_circle</span>
          Đăng ký ca trực
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CỘT TRÁI: BỘ LỊCH NHỎ (Calendar) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-6">
            {/* Điều hướng Tháng/Năm */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-slate-400 hover:text-primary"
              >
                <span className="material-symbols-outlined text-xl">
                  chevron_left
                </span>
              </button>
              <h3 className="font-black text-slate-800 capitalize tracking-tight">
                {monthName}
              </h3>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-slate-400 hover:text-primary"
              >
                <span className="material-symbols-outlined text-xl">
                  chevron_right
                </span>
              </button>
            </div>

            {/* Tên các Thứ */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day}
                  className="text-center text-[10px] font-black text-slate-300 py-1 uppercase"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Lưới các Ngày */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((day, idx) => (
                <div
                  key={idx}
                  className="aspect-square flex items-center justify-center"
                >
                  {day ? (
                    <button
                      onClick={() =>
                        setSelectedDate(day === selectedDate ? null : day)
                      }
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all relative flex items-center justify-center ${
                        day === selectedDate
                          ? "bg-primary text-white shadow-lg shadow-primary/25 scale-110"
                          : "text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100"
                      }`}
                    >
                      {day}
                      {/* Dấu chấm báo hiệu: Ngày này CÓ ca trực */}
                      {activeDays.includes(day) && day !== selectedDate && (
                        <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-primary" />
                      )}
                    </button>
                  ) : (
                    <span className="w-10 h-10" />
                  )}
                </div>
              ))}
            </div>

            {/* Chú giải về trạng thái lọc */}
            <div className="mt-6 pt-6 border-t border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-primary rounded-full" />
                <div>
                  <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">
                    {selectedDate
                      ? `Đang xem: Ngày ${selectedDate}`
                      : `Xem tất cả tháng ${currentMonth + 1}`}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {selectedDate
                      ? "Bấm vào ngày lần nữa để bỏ chọn lọc."
                      : "Chọn một ngày để xem danh sách ca chi tiết."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: DANH SÁCH CHI TIẾT */}
        <div className="lg:col-span-2 space-y-6">
          {/* Container danh sách (có giới hạn chiều cao và thanh cuộn) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[520px] overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-5 border-b border-slate-50 shrink-0">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  event_list
                </span>
                {selectedDate
                  ? `Ca trực ngày ${selectedDate}/${currentMonth + 1}`
                  : "Toàn bộ ca trực trong tháng"}
              </h3>
              {selectedDate !== null && (
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-xs font-black text-primary hover:underline uppercase tracking-wider"
                >
                  Xem toàn bộ tháng
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {filteredSchedules.length === 0 ? (
                <div className="px-5 flex flex-col items-center justify-center h-full min-h-[300px]">
                  <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-4xl text-slate-200">
                      calendar_today
                    </span>
                  </div>
                  <p className="text-slate-400 font-bold italic text-sm">
                    Không tìm thấy ca trực nào phù hợp.
                  </p>
                </div>
              ) : (
                <>
                  {/* GIẢI PHÁP MOBILE: Hiển thị dạng Card khi màn hình nhỏ */}
                  <div className="block md:hidden divide-y divide-slate-50">
                    {filteredSchedules.map((shift) => {
                      const status = getShiftStatus(shift);
                      const statusInfo = STATUS_MAP[status];
                      const shiftDate = new Date(
                        shift.ngayLamViec,
                      ).toLocaleDateString("vi-VN", {
                        timeZone: "Asia/Ho_Chi_Minh",
                      });
                      return (
                        <div key={shift.id} className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-800">
                              {shiftDate}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${statusInfo.className}`}
                            >
                              {statusInfo.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                            <span className="material-symbols-outlined text-primary text-lg font-light">
                              schedule
                            </span>
                            {formatTime(shift.khungGio?.gioBatDau)} —{" "}
                            {formatTime(shift.khungGio?.gioKetThuc)}
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <p className="text-[11px] text-slate-400 font-medium font-mono">
                              BN: {shift.soBenhNhanHienTai} /{" "}
                              {shift.soBenhNhanToiDa} (Slot)
                            </p>
                            {status !== "completed" ? (
                              <button
                                onClick={() => handleDelete(shift.id)}
                                className="px-3 py-1 rounded-lg text-[10px] font-black text-rose-500 bg-rose-50 uppercase border border-rose-100"
                              >
                                Xóa
                              </button>
                            ) : (
                              <span className="text-[10px] text-emerald-500 font-bold italic">
                                Đã xong
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* GIẢI PHÁP DESKTOP: Hiển thị dạng Bảng khi màn hình lớn */}
                  <div className="hidden md:block">
                    <table className="w-full relative">
                      <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm border-b border-slate-100">
                        <tr>
                          <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Ngày trực
                          </th>
                          <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Khung giờ
                          </th>
                          <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Số lượng BN
                          </th>
                          <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Trạng thái
                          </th>
                          <th className="text-center py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Thao tác
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 italic md:not-italic">
                        {filteredSchedules.map((shift) => {
                          const status = getShiftStatus(shift);
                          const statusInfo = STATUS_MAP[status];
                          const shiftDate = new Date(
                            shift.ngayLamViec,
                          ).toLocaleDateString("vi-VN", {
                            timeZone: "Asia/Ho_Chi_Minh",
                          });
                          return (
                            <tr
                              key={shift.id}
                              className="hover:bg-slate-50/50 transition-colors group"
                            >
                              <td className="py-4 px-6 text-sm font-bold text-slate-800">
                                {shiftDate}
                              </td>
                              <td className="py-4 px-6 text-sm text-slate-600 font-medium">
                                <span className="text-primary font-bold">
                                  {formatTime(shift.khungGio?.gioBatDau)}
                                </span>{" "}
                                - {formatTime(shift.khungGio?.gioKetThuc)}
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex flex-col">
                                  {/* Thanh tiến độ số lượng bệnh nhân */}
                                  <div className="flex items-center gap-1.5 h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden mt-1 mb-1">
                                    <div
                                      className="h-full bg-primary"
                                      style={{
                                        width: `${(shift.soBenhNhanHienTai / shift.soBenhNhanToiDa) * 100}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-[10px] font-black text-slate-400">
                                    {shift.soBenhNhanHienTai} /{" "}
                                    {shift.soBenhNhanToiDa} BN
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${statusInfo.className}`}
                                >
                                  {statusInfo.label}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                {status !== "completed" ? (
                                  <button
                                    onClick={() => handleDelete(shift.id)}
                                    className="p-2 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-all"
                                    title="Hủy ca trực"
                                  >
                                    <span className="material-symbols-outlined text-xl">
                                      delete_forever
                                    </span>
                                  </button>
                                ) : (
                                  <span className="material-symbols-outlined text-emerald-300 text-lg">
                                    verified
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* CÁC THÔNG SỐ NHANH Ở DƯỚI CÙNG */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 transition-all hover:scale-[1.02]">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                <span className="material-symbols-outlined text-2xl text-emerald-500">
                  assignment_turned_in
                </span>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Tổng ca đăng ký
                </p>
                <p className="text-2xl font-black text-slate-800">
                  {totalShifts}{" "}
                  <span className="text-xs text-slate-400 font-normal">
                    lượt
                  </span>
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 transition-all hover:scale-[1.02]">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                <span className="material-symbols-outlined text-2xl text-blue-500">
                  pending_actions
                </span>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Ca chưa diễn ra
                </p>
                <p className="text-2xl font-black text-slate-800">
                  {upcomingShifts}{" "}
                  <span className="text-xs text-slate-400 font-normal">ca</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorSchedulePage;
