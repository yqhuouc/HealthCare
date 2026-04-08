/**
 * ============================================================
 * TRANG: Dashboard quản trị (Admin)
 * Đường dẫn: /admin/dashboard
 * ============================================================
 *
 * Chức năng:
 * - 4 card thống kê tổng quan: tổng BS, tổng BN, tổng lịch khám, lịch khám hôm nay
 *   (mỗi card có badge % tăng/giảm so với kỳ trước)
 * - Biểu đồ cột: thống kê lịch khám theo tháng (CSS bar chart)
 *   + Dropdown chọn năm (2023-2026)
 * - Bảng 5 lịch khám gần nhất: BN, BS, ngày, trạng thái
 *   + Link "Xem tất cả" → /admin/appointments
 * - Responsive: mobile card view, desktop table view
 *
 * State:
 * - year: năm đang hiển thị trên biểu đồ (mặc định năm hiện tại)
 *
 * Dữ liệu: ADMIN_STATS, RECENT_APPOINTMENTS, APPOINTMENT_STATUS_CONFIG,
 *           CHART_DATA từ mockAdminData.js
 * ============================================================
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminStatsService } from "../../services/adminStatsService";
import { appointmentService } from "../../services/appointmentService";
import { APPOINTMENT_STATUS_CONFIG } from "../../data/mockAdminData"; // Vẫn giữ config màu sắc
import { getInitials } from "../../utils/formatters";

function AdminDashboardPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  
  // States cho dữ liệu API
  const [stats, setStats] = useState({
    tongBenhNhan: 0,
    tongBacSi: 0,
    tongLichHen: 0,
    tongChuyenKhoa: 0,
    tongDoanhThu: 0
  });
  const [chartData, setChartData] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tongQuanRes, doanhThuRes, appointmentsRes] = await Promise.all([
          adminStatsService.getTongQuan(),
          adminStatsService.getDoanhThuStats({ nam: year }),
          appointmentService.getAllForAdmin({ page: 1, limit: 5 })
        ]);

        if (tongQuanRes.data) setStats(tongQuanRes.data);
        
        // API trả về mảng thống kê doanh thu theo 12 tháng
        if (doanhThuRes.data && doanhThuRes.data.thongKeThang) {
          // Format data cho biểu đồ
          const formattedChart = doanhThuRes.data.thongKeThang.map(item => {
            // Logic chiều cao thanh: Giả định 10 triệu = 100% (minHeight: 24px)
            const heightPercent = item.tongDoanhThu > 0 
                ? Math.min(100, Math.max(10, (item.tongDoanhThu / 10000000) * 100)) + "%"
                : "24px";
            return {
              month: `T${item.thang}`,
              height: heightPercent,
              rawTong: item.tongDoanhThu
            };
          });
          setChartData(formattedChart);
        }

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
  }, [year]);

  /** Cấu hình 4 card thống kê tổng quan hiển thị trên đầu trang */
  const dynamicStatsCards = [
    {
      label: "Tổng số bác sĩ",
      value: stats.tongBacSi,
      icon: "stethoscope",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      badge: "+2%", badgeGreen: true,
    },
    {
      label: "Tổng số bệnh nhân",
      value: stats.tongBenhNhan.toLocaleString("vi-VN"),
      icon: "groups",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      badge: "+5%", badgeGreen: true,
    },
    {
      label: "Tổng số lịch khám",
      value: stats.tongLichHen.toLocaleString("vi-VN"),
      icon: "book_online",
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
      badge: "-1%", badgeGreen: false,
    },
    {
      label: "Tổng chuyên khoa",
      value: stats.tongChuyenKhoa,
      icon: "domain",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      badge: "Hoạt động", badgeGreen: true,
    },
  ];

  if (loading) {
    return <div className="flex justify-center py-10"><span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span></div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {dynamicStatsCards.map((card) => (
          <div
            key={card.label}
            className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-slate-200"
          >
            <div className="flex items-start justify-between gap-2">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 ${card.iconBg}`}
              >
                <span
                  className={`material-symbols-outlined text-xl sm:text-2xl ${card.iconColor}`}
                >
                  {card.icon}
                </span>
              </div>
              <span
                className={`text-xs font-semibold shrink-0 ${
                  card.badgeGreen ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {card.badge}
              </span>
            </div>
            <p className="mt-3 text-xl sm:text-2xl font-bold text-slate-900">
              {card.value}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Doanh thu & Toàn hệ thống
            </h2>
            <p className="text-xs text-slate-500">Thống kê doanh thu kết hợp (Phí khám + Tiền thuốc) theo tháng</p>
          </div>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
          >
            {[2023, 2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                Năm {y}
              </option>
            ))}
          </select>
        </div>
        <div className="p-6">
          <div className="flex items-end justify-between gap-2 sm:gap-4 h-56">
            {chartData.length > 0 ? chartData.map((bar) => (
              <div
                key={bar.month}
                className="flex-1 flex flex-col items-center gap-3 group relative"
              >
                {/* Custom Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10 whitespace-nowrap">
                  {Number(bar.rawTong).toLocaleString("vi-VN")}đ
                </div>
                
                <div
                  className="w-full max-w-[40px] bg-linear-to-t from-primary to-primary-light rounded-t-sm transition-all duration-300 group-hover:scale-x-110 group-hover:brightness-110 relative"
                  style={{ height: bar.height, minHeight: "24px" }}
                >
                   {/* Glass effect on top of bar */}
                   <div className="absolute top-0 left-0 right-0 h-1/4 bg-white/20 rounded-t-sm" />
                </div>
                
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 group-hover:text-primary transition-colors">
                  {bar.month}
                </span>
              </div>
            )) : (
              <div className="w-full flex items-center justify-center text-slate-400 text-sm">
                Đang tải dữ liệu biểu đồ...
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Danh sách 5 lịch khám gần nhất
          </h2>
          <Link
            to="/admin/appointments"
            className="text-sm text-primary font-semibold hover:underline"
          >
            Xem tất cả
          </Link>
        </div>

        <div className="block md:hidden divide-y divide-slate-100">
          {recentAppointments.length === 0 ? (
            <p className="p-4 text-sm text-slate-500 text-center">Không có lịch khám nào.</p>
          ) : (
            recentAppointments.map((apt) => {
              const statusConfig = APPOINTMENT_STATUS_CONFIG[apt.trangThai];
              const pName = apt.benhNhan?.hoTen || "Ẩn danh";
              const dName = apt.bacSi?.tenBacSi || "Không rõ";
              const aptDate = new Date(apt.ngayDat).toLocaleDateString("vi-VN");
              const initials = getInitials(pName);

              return (
                <div key={apt.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold bg-primary/10 text-primary">
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{pName}</p>
                        <p className="text-xs text-slate-500">{dName}</p>
                      </div>
                    </div>
                    {statusConfig && (
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${statusConfig.className}`}>
                        {statusConfig.label}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{aptDate}</p>
                  <div className="flex justify-end">
                    <Link to={`/admin/appointments/${apt.id}`} className="p-2 text-slate-400 hover:text-primary rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-xl">more_vert</span>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="overflow-x-auto hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-3 text-left text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                  Bệnh nhân
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                  Bác sĩ
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                  Ngày khám
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentAppointments.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-6 text-sm text-slate-500">Không có dữ liệu</td></tr>
              ) : (
                recentAppointments.map((apt) => {
                  const statusConfig = APPOINTMENT_STATUS_CONFIG[apt.trangThai];
                  const pName = apt.benhNhan?.hoTen || "Ẩn danh";
                  const dName = apt.bacSi?.tenBacSi || "Không rõ";
                  const aptDate = new Date(apt.ngayDat).toLocaleDateString("vi-VN");
                  const initials = getInitials(pName);

                  return (
                    <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold bg-primary/10 text-primary">
                            {initials}
                          </div>
                          <span className="text-sm font-semibold text-slate-900">{pName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{dName}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{aptDate}</td>
                      <td className="px-6 py-4">
                        {statusConfig && (
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${statusConfig.className}`}>
                            {statusConfig.label}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/admin/appointments/${apt.id}`} className="p-2 text-slate-400 hover:text-primary rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-xl">more_vert</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
