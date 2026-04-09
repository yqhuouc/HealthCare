/**
 * ============================================================
 * TRANG: Dashboard quản trị (Admin)
 * Đường dẫn: /admin/dashboard
 * ============================================================
 *
 * Chức năng:
 * - 4 card thống kê tổng quan: tổng BS, tổng BN, tổng lịch khám, tổng chuyên khoa
 * - Biểu đồ cột: thống kê hoạt động đặt lịch trong 14 ngày gần nhất
 * - Hoạt động gần đây: Danh sách 5 lịch hẹn khám mới nhất
 * - Responsive: Hỗ trợ hiển thị tốt trên cả máy tính và điện thoại
 *
 * State:
 * - stats: Dữ liệu tổng quan (số lượng BN, BS, Lịch hẹn, Chuyên khoa)
 * - chartData: Dữ liệu được xử lý để hiển thị lên biểu đồ cột
 * - recentAppointments: Danh sách các lịch hẹn mới nhất
 *
 * Dữ liệu: Lấy từ adminStatsService và appointmentService
 * ============================================================
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminStatsService } from "../../services/adminStatsService";
import { appointmentService } from "../../services/appointmentService";
import { APPOINTMENT_STATUS_CONFIG } from "../../data/mockAdminData"; // Cấu hình màu sắc trạng thái

function AdminDashboardPage() {
  
  // State lưu trữ dữ liệu thống kê tổng quan
  const [stats, setStats] = useState({
    tongBenhNhan: 0,
    tongBacSi: 0,
    tongLichHen: 0,
    tongChuyenKhoa: 0,
  });
  
  // State lưu trữ dữ liệu biểu đồ 14 ngày
  const [chartData, setChartData] = useState([]);
  // State lưu trữ danh sách lịch hẹn gần đây
  const [recentAppointments, setRecentAppointments] = useState([]);
  // Trạng thái đang tải dữ liệu
  const [loading, setLoading] = useState(true);

  // Effect lấy toàn bộ dữ liệu cần thiết cho Dashboard khi component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Xác định khoảng thời gian 14 ngày gần nhất cho biểu đồ
        const today = new Date();
        const pastDate = new Date();
        pastDate.setDate(today.getDate() - 13); // Lấy từ 13 ngày trước đến nay

        const tuNgay = pastDate.toISOString().split("T")[0];
        const denNgay = today.toISOString().split("T")[0];

        // Gọi đồng thời các API để tối ưu tốc độ tải trang
        const [tongQuanRes, lichHenRes, appointmentsRes] = await Promise.all([
          adminStatsService.getTongQuan(),
          adminStatsService.getLichHenStats({ tuNgay, denNgay }),
          appointmentService.getAllForAdmin({ page: 1, limit: 5 })
        ]);

        // Cập nhật thống kê tổng quan
        if (tongQuanRes.data) setStats(tongQuanRes.data);
        
        // XỬ LÝ DỮ LIỆU BIỂU ĐỒ (Hoạt động 14 ngày qua)
        if (lichHenRes.data && lichHenRes.data.lichHenTheoNgay) {
          const rawDays = lichHenRes.data.lichHenTheoNgay;
          
          // Chuyển đổi dữ liệu số lượng sang Number để đảm bảo tính toán chính xác
          const cleanDays = rawDays.map(d => ({
            ...d,
            soLuong: Number(d.soLuong || 0)
          }));

          // Chuẩn bị mảng 14 ngày liên tục (điền giá trị 0 cho những ngày không có dữ liệu từ API)
          const formattedChart = [];
          const maxCount = Math.max(...cleanDays.map(d => d.soLuong), 1);

          for (let i = 0; i < 14; i++) {
            const d = new Date(pastDate);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split("T")[0];
            const dateLabel = `${d.getDate()}/${d.getMonth() + 1}`;
            
            // Tìm dữ liệu tương ứng trong kết quả API
            const match = cleanDays.find(rd => {
              const rdDate = new Date(rd.ngay).toISOString().split("T")[0];
              return rdDate === dateStr;
            });

            const count = match ? match.soLuong : 0;
            
            // Tính toán chiều cao tương đối của cột biểu đồ (%)
            let heightPercent = "0px";
            if (count > 0) {
              // Nếu có bệnh nhân: Cao tối thiểu 15% để tránh cột quá lùn
              heightPercent = Math.max(15, (count / maxCount) * 100) + "%";
            } else {
              // Nếu không có: Hiển thị một vạch nhỏ 4px đánh dấu
              heightPercent = "4px";
            }

            formattedChart.push({
              label: dateLabel,
              height: heightPercent,
              count: count,
              isToday: dateStr === today.toISOString().split("T")[0]
            });
          }
          setChartData(formattedChart);
        }

        // Cập nhật danh sách hoạt động gần đây
        if (appointmentsRes.data) {
          setRecentAppointments(appointmentsRes.data || []);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /** Cấu hình hiển thị cho 4 thẻ thống kê trên cùng */
  const dynamicStatsCards = [
    {
      label: "Tổng số bác sĩ",
      value: stats.tongBacSi,
      icon: "stethoscope",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Tổng số bệnh nhân",
      value: stats.tongBenhNhan.toLocaleString("vi-VN"),
      icon: "groups",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "Tổng số lịch khám",
      value: stats.tongLichHen.toLocaleString("vi-VN"),
      icon: "book_online",
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      label: "Tổng chuyên khoa",
      value: stats.tongChuyenKhoa,
      icon: "domain",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
  ];

  // Hiển thị trạng thái Loading
  if (loading) {
    return <div className="flex justify-center py-10"><span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span></div>;
  }

  return (
    <div className="space-y-6">
      {/* KHỐI 1: 4 Cards thống kê nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {dynamicStatsCards.map((card) => (
          <div
            key={card.label}
            className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:border-primary/30 transition-colors relative"
          >
            <div className="flex flex-col h-full">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${card.iconBg}`}
              >
                <span className={`material-symbols-outlined text-2xl ${card.iconColor}`}>
                   {card.icon}
                </span>
              </div>
              
              <div className="mt-4">
                <p className="text-2xl font-bold text-slate-900 tracking-tight">
                  {card.value}
                </p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                  {card.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* KHỐI 2: Biểu đồ cột thể hiện hoạt động đặt lịch 14 ngày gần đây */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/30">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Hoạt động đặt lịch 14 ngày qua
            </h2>
            <p className="text-[11px] text-slate-500">Thống kê số lượng bệnh nhân đặt lịch theo ngày</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest sm:hidden">
            <span className="material-symbols-outlined text-sm">swipe_left</span>
            Vuốt để xem
          </div>
        </div>
        <div className="p-6 overflow-x-auto custom-scrollbar-horizontal">
          <div className="flex items-end justify-between gap-3 h-52 min-w-[600px] lg:min-w-0">
            {chartData.length > 0 ? chartData.map((bar) => (
              <div
                key={bar.label}
                className="flex-1 h-full flex flex-col justify-end items-center gap-2 group relative"
              >
                {/* Tooltip hiển thị khi di chuột vào cột */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-medium px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                  {bar.count} bệnh nhân
                </div>
                
                <div
                  className={`w-full max-w-[28px] rounded-t-sm transition-all duration-300 relative ${
                    bar.count > 0 
                      ? (bar.isToday ? "bg-orange-500" : "bg-primary")
                      : "bg-slate-200"
                  }`}
                  style={{ height: bar.height }}
                />
                
                <span className={`text-[10px] font-semibold ${
                  bar.isToday ? "text-orange-500" : "text-slate-400"
                }`}>
                  {bar.label}
                </span>
              </div>
            )) : (
              <div className="w-full flex items-center justify-center text-slate-400 text-xs py-10">
                Đang tải dữ liệu biểu đồ...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KHỐI 3: Danh sách các hoạt động gần đây (Lịch hẹn mới) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Hoạt động gần đây
            </h2>
            <p className="text-[11px] text-slate-500">Các sự kiện mới nhất trong hệ thống</p>
          </div>
          <Link
            to="/admin/appointments"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Xem tất cả
          </Link>
        </div>

        <div className="p-6">
          {recentAppointments.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-slate-400">
              <span className="material-symbols-outlined text-3xl mb-1">history</span>
              <p className="text-xs">Chưa có hoạt động nào</p>
            </div>
          ) : (
            // Hiển thị dưới dạng Timeline
            <div className="space-y-0 relative before:absolute before:inset-y-0 before:left-5 before:w-[1px] before:bg-slate-200">
              {recentAppointments.map((apt) => {
                const pName = apt.benhNhan?.hoTen || "Ẩn danh";
                const dName = apt.bacSi?.tenBacSi || "Không rõ";
                const aptDate = new Date(apt.ngayDat).toLocaleDateString("vi-VN");
                
                // Cấu hình Icon và Màu sắc dựa trên trạng thái lịch hẹn
                const statusIcons = {
                  0: { icon: "pending_actions", color: "text-amber-500", bg: "bg-amber-50" },
                  1: { icon: "check_circle", color: "text-blue-500", bg: "bg-blue-50" },
                  2: { icon: "task_alt", color: "text-emerald-500", bg: "bg-emerald-50" },
                  3: { icon: "cancel", color: "text-rose-500", bg: "bg-rose-50" },
                };
                const config = statusIcons[apt.trangThai] || statusIcons[0];

                return (
                  <div key={apt.id} className="relative pl-12 pb-6 last:pb-0 group">
                    <div className={`absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center z-10 border-2 border-white shadow-sm ${config.bg}`}>
                      <span className={`material-symbols-outlined text-lg ${config.color}`}>
                        {config.icon}
                      </span>
                    </div>

                    <div className="p-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <p className="text-sm text-slate-700">
                            Bệnh nhân <span className="font-bold text-slate-900 text-[13px]">{pName}</span> đã đặt lịch khám
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">medical_services</span>
                            Bác sĩ: <span className="font-medium text-slate-600">{dName}</span>
                          </p>
                        </div>
                        <time className="text-[11px] font-medium text-slate-400 sm:self-center">
                          {aptDate}
                        </time>
                      </div>
                      
                      <Link 
                        to={`/admin/appointments/${apt.id}`}
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-blue-700 transition-colors"
                      >
                        Chi tiết lịch khám
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
