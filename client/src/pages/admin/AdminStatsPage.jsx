/**
 * ============================================================
 * TRANG: Thống kê chi tiết hệ thống (Admin)
 * Đường dẫn: /admin/stats
 * ============================================================
 *
 * Chức năng:
 * - Tabs lọc kỳ: Theo tháng / Theo quý / Theo năm
 * - 4 KPI cards: lịch khám tháng này, tỷ lệ hoàn thành, tỷ lệ hủy, BN mới
 *   (mỗi card có % thay đổi so với tháng trước, mũi tên lên/xuống)
 * - Biểu đồ cột: lượt đặt lịch khám theo 12 tháng (hover hiện tooltip số liệu)
 * - Biểu đồ donut: phân bổ trạng thái lịch khám (hoàn thành, xác nhận, chờ, hủy)
 * - Biểu đồ thanh ngang: lượt khám theo chuyên khoa (progress bar)
 * - Biểu đồ thanh ngang: khung giờ đặt lịch phổ biến (màu theo mức độ)
 * - Biểu đồ cột: bệnh nhân đăng ký mới theo tháng
 * - Bảng Top 5 bác sĩ được đặt lịch nhiều nhất
 *
 * State:
 * - period: kỳ thống kê đang chọn ("month" | "quarter" | "year")
 *
 * Component phụ:
 * - StatCard: card KPI tái sử dụng (icon, label, value, change, changeLabel)
 *
 * Dữ liệu: STATS_OVERVIEW, MONTHLY_APPOINTMENTS, APPOINTMENT_STATUS_STATS,
 *           SPECIALTY_APPOINTMENT_STATS, PEAK_HOURS, PATIENT_GROWTH,
 *           TOP_DOCTORS_STATS, DOCTOR_STATUS_CONFIG từ mockAdminData.js
 * ============================================================
 */
import { useState, useEffect, useMemo } from "react";
import { adminStatsService } from "../../services/adminStatsService";
import { DOCTOR_STATUS_CONFIG } from "../../data/mockAdminData"; // Vẫn giữ config map trạng thái bác sĩ nếu cần
import { getDoctorInitials } from "../../utils/formatters";

/** Cấu hình tabs chọn kỳ thống kê */
const PERIOD_TABS = [
  { id: "month", label: "Theo tháng" },
  { id: "quarter", label: "Theo quý" },
  { id: "year", label: "Theo năm" },
];

function StatCard({ icon, iconBg, label, value, change, changeLabel }) {
  const isPositive = change >= 0;
  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}
        >
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <p className="text-sm text-slate-500 font-medium leading-tight">
          {label}
        </p>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <div className="flex items-center gap-1.5 mt-1">
        <span
          className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
            isPositive ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          <span className="material-symbols-outlined text-sm">
            {isPositive ? "trending_up" : "trending_down"}
          </span>
          {isPositive ? "+" : ""}
          {change}%
        </span>
        <span className="text-xs text-slate-400">{changeLabel}</span>
      </div>
    </div>
  );
}

function AdminStatsPage() {
  const [period, setPeriod] = useState("year");
  const [loading, setLoading] = useState(true);

  // States
  const [overview, setOverview] = useState({
    tongLichHen: 0,
    lichHenTheoTrangThai: [],
    doanhThuKham: 0,
    doanhThuThuoc: 0,
    tongDoanhThu: 0,
    tongBenhNhan: 0
  });
  
  const [revenueStats, setRevenueStats] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [tongQuanRes, doanhThuRes, lichHenRes] = await Promise.all([
          adminStatsService.getTongQuan(),
          adminStatsService.getDoanhThuStats({ nam: new Date().getFullYear() }),
          adminStatsService.getLichHenStats({})
        ]);

        if (tongQuanRes.data) {
          setOverview(tongQuanRes.data);
        }

        if (doanhThuRes.data?.thongKeThang) {
          setRevenueStats(doanhThuRes.data.thongKeThang);
        }

        if (lichHenRes.data?.lichHenTheoBacSi) {
          setTopDoctors(lichHenRes.data.lichHenTheoBacSi);
        }
      } catch (error) {
        console.error("Lỗi khi tải trang stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [period]);



  // Tính toán Tỷ lệ theo trạng thái
  const statusStatsArr = useMemo(() => {
    const total = overview.tongLichHen || 1; 
    let hoanThanh = 0;
    let xacNhan = 0;
    let choXacNhan = 0;
    let huy = 0;

    overview.lichHenTheoTrangThai.forEach(item => {
      if (item.trangThai === 0) choXacNhan = item.soLuong;
      if (item.trangThai === 1) xacNhan = item.soLuong;
      if (item.trangThai === 2) hoanThanh = item.soLuong;
      if (item.trangThai === 3) huy = item.soLuong;
    });

    return [
      { status: 2, label: "Đã hoàn thành", count: hoanThanh, percent: Math.round((hoanThanh/total)*100), color: "bg-emerald-500" },
      { status: 1, label: "Đã xác nhận", count: xacNhan, percent: Math.round((xacNhan/total)*100), color: "bg-blue-500" },
      { status: 0, label: "Chờ xác nhận", count: choXacNhan, percent: Math.round((choXacNhan/total)*100), color: "bg-amber-500" },
      { status: 3, label: "Đã hủy", count: huy, percent: Math.round((huy/total)*100), color: "bg-rose-500" }
    ];
  }, [overview]);

  const maxRevenue = Math.max(...revenueStats.map(s => s.tongDoanhThu || 0), 10000000); // Tránh chia 0

  if (loading) {
    return <div className="flex justify-center py-10"><span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Thống kê hệ thống
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Tổng hợp dữ liệu hoạt động của hệ thống đặt lịch khám bệnh
          </p>
        </div>
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
          {PERIOD_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPeriod(tab.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === tab.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards (API Data) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="calendar_month"
          iconBg="bg-primary/10 text-primary"
          label="Tổng lịch khám"
          value={overview.tongLichHen.toLocaleString("vi-VN")}
          change={0}
          changeLabel="(toàn thời gian)"
        />
        <StatCard
          icon="payments"
          iconBg="bg-emerald-500/10 text-emerald-600"
          label="Tổng doanh thu"
          value={`${(overview.tongDoanhThu / 1000000).toFixed(1)} Tr`}
          change={0}
          changeLabel="(VNĐ)"
        />
        <StatCard
          icon="vaccines"
          iconBg="bg-blue-500/10 text-blue-600"
          label="Doanh thu thuốc"
          value={`${(overview.doanhThuThuoc / 1000000).toFixed(1)} Tr`}
          change={0}
          changeLabel="(Tiền kê đơn)"
        />
        <StatCard
          icon="person_add"
          iconBg="bg-violet-500/10 text-violet-600"
          label="Tổng bệnh nhân"
          value={overview.tongBenhNhan.toLocaleString("vi-VN")}
          change={0}
          changeLabel="(Người)"
        />
      </div>

      {/* Row: Monthly revenue chart + Status breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Monthly revenue bar chart */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <h3 className="text-base font-bold text-slate-900 mb-5">
            Doanh thu theo tháng (VNĐ)
          </h3>
          <div className="flex items-end gap-1 sm:gap-2 h-44 sm:h-52">
            {revenueStats.length > 0 ? revenueStats.map((m) => {
              const heightPercent = maxRevenue > 0 ? (m.tongDoanhThu / maxRevenue) * 100 : 0;
              return (
                <div
                  key={m.thang}
                  className="flex-1 flex flex-col items-center gap-1.5 group relative"
                >
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10 whitespace-nowrap">
                    {m.tongDoanhThu.toLocaleString("vi-VN")}đ
                  </div>
                  <div
                    className="w-full max-w-10 rounded-t-sm transition-all flex flex-col justify-end overflow-hidden bg-slate-100 group-hover:brightness-105"
                    style={{ height: `${Math.max(heightPercent, 8)}%` }}
                  >
                    {/* Phần doanh thu khám (Xanh dương) */}
                    <div style={{ height: `${(m.doanhThuKham / (m.tongDoanhThu || 1)) * 100}%` }} className="bg-linear-to-t from-blue-600 to-blue-400 w-full transition-colors" />
                    {/* Phần doanh thu thuốc (Xanh lá) */}
                    <div style={{ height: `${(m.doanhThuThuoc / (m.tongDoanhThu || 1)) * 100}%` }} className="bg-linear-to-t from-emerald-600 to-emerald-400 w-full transition-colors" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-400 group-hover:text-slate-900">
                    T{m.thang}
                  </span>
                </div>
              );
            }) : <p className="text-slate-400 text-sm">Chưa có dữ liệu</p>}
          </div>
          <div className="mt-4 flex gap-4 justify-end text-xs text-slate-500">
             <span className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-400 rounded-sm"></span> Phí khám</span>
             <span className="flex items-center gap-2"><span className="w-3 h-3 bg-emerald-400 rounded-sm"></span> Phí thuốc</span>
          </div>
        </div>

        {/* Appointment status donut */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <h3 className="text-base font-bold text-slate-900 mb-5">
            Trạng thái lịch khám
          </h3>
          <div className="flex flex-col items-center gap-5">
            <div
              className="w-36 h-36 rounded-full relative"
              style={{
                background: `conic-gradient(
                  #10b981 0% ${statusStatsArr[0].percent}%,
                  #3b82f6 ${statusStatsArr[0].percent}% ${statusStatsArr[0].percent + statusStatsArr[1].percent}%,
                  #f59e0b ${statusStatsArr[0].percent + statusStatsArr[1].percent}% ${statusStatsArr[0].percent + statusStatsArr[1].percent + statusStatsArr[2].percent}%,
                  #f43f5e ${statusStatsArr[0].percent + statusStatsArr[1].percent + statusStatsArr[2].percent}% 100%
                )`,
              }}
            >
              <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-slate-900">{overview.tongLichHen.toLocaleString("vi-VN")}</span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Tổng cộng
                </span>
              </div>
            </div>
            <div className="w-full space-y-2.5">
              {statusStatsArr.map((s) => (
                <div key={s.status} className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.color}`} />
                  <span className="text-sm text-slate-600 flex-1">{s.label}</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {s.count.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 w-10 text-right">
                    {s.percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tính năng phân tích sâu (Chưa có API) */}
      <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-6 text-center shadow-inner">
        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">construction</span>
        <h3 className="text-slate-600 font-semibold mb-1">Tính năng phân tích đang được xây dựng</h3>
        <p className="text-sm text-slate-400">Các biểu đồ phân bổ thời gian và tăng trưởng chi tiết sẽ được cập nhật trong bản sau.</p>
      </div>

      {/* Top doctors table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Top 5 bác sĩ được đặt lịch nhiều nhất
          </h3>
        </div>

        {/* Mobile cards */}
        <div className="block md:hidden divide-y divide-slate-100">
          {topDoctors.length === 0 ? <p className="text-center p-4 text-sm text-slate-500">Chưa có dữ liệu</p> : topDoctors.map((doc, idx) => {
            return (
              <div key={doc.bacSiId} className="p-4 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {doc.tenBacSi}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs">
                    <span className="text-slate-600 font-medium">
                      {doc.soLuong} lượt khám
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop table */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 w-12">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Bác sĩ
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Số lịch khám
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topDoctors.length === 0 ? <tr><td colSpan={6} className="text-center p-4 text-sm text-slate-500">Chưa có dữ liệu</td></tr> : topDoctors.map((doc, idx) => {
                return (
                  <tr
                    key={doc.bacSiId}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                        {idx + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {getDoctorInitials(doc.tenBacSi)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {doc.tenBacSi}
                          </p>
                          <p className="text-xs text-slate-400">ID: {doc.bacSiId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-900">
                        {doc.soLuong}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminStatsPage;
