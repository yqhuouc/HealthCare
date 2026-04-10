/**
 * ============================================================
 * TRANG: Thống kê chi tiết hệ thống (Admin)
 * Đường dẫn: /admin/stats
 * ============================================================
 *
 * Chức năng chính:
 * - Theo dõi các chỉ số KPI trọng yếu: Tổng lịch khám, Doanh thu, Bệnh nhân.
 * - Biểu đồ doanh thu 12 tháng phân tách theo phí khám và phí thuốc.
 * - Biểu đồ phân bổ trạng thái lịch khám (Hoàn thành, Xác nhận, Chờ, Hủy).
 * - Theo dõi xu hướng đặt lịch 14 ngày gần nhất.
 * - Bảng vinh danh Top 10 bác sĩ có số lượng đặt lịch cao nhất.
 * - Hỗ trợ lọc dữ liệu theo Năm.
 */
import { useState, useMemo } from "react";
import { useTongQuan, useDoanhThuStats, useLichHenStats } from "../../hooks/queries/useStatsQueries";
import { toDateString, dayjs } from "../../utils/dateUtils";

/**
 * Thành phần StatCard — Card hiển thị một chỉ số KPI tổng quan.
 * @param {string} icon - Tên icon từ Material Symbols.
 * @param {string} iconBg - Class CSS cho màu nền icon.
 * @param {string} label - Nhãn mô tả chỉ số.
 * @param {string|number} value - Giá trị chính của chỉ số.
 * @param {string} subLabel - Thông tin bổ trợ hoặc chi tiết bên dưới.
 */
function StatCard({ icon, iconBg, label, value, subLabel }) {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm hover:border-primary/30 transition-colors">
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
      {subLabel && (
        <p className="text-xs text-slate-400 mt-1">{subLabel}</p>
      )}
    </div>
  );
}

function AdminStatsPage() {
  const currentYear = dayjs().year();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Thiết lập khoảng thời gian 14 ngày cho biểu đồ xu hướng
  const dateRange = useMemo(() => {
    const today = dayjs();
    const pastDate = today.subtract(13, "day");
    return {
      tuNgay: toDateString(pastDate),
      denNgay: toDateString(today),
    };
  }, []);

  // TanStack Query: 3 queries song song (auto-cache)
  const { data: tongQuanRes, isLoading: l1 } = useTongQuan();
  const { data: doanhThuRes, isLoading: l2 } = useDoanhThuStats({ nam: selectedYear });
  const { data: lichHenRes, isLoading: l3 } = useLichHenStats(dateRange);
  const loading = l1 || l2 || l3;

  // Trích xuất dữ liệu từ query responses
  const overview = useMemo(() => tongQuanRes?.data || {
    tongLichHen: 0, tongBacSi: 0, tongBenhNhan: 0, tongChuyenKhoa: 0,
    lichHenTheoTrangThai: [], doanhThuKham: 0, doanhThuThuoc: 0, tongDoanhThu: 0,
  }, [tongQuanRes]);

  const revenueStats = useMemo(() => doanhThuRes?.data?.thongKeThang || [], [doanhThuRes]);
  const topDoctors = useMemo(() => lichHenRes?.data?.lichHenTheoBacSi || [], [lichHenRes]);

  // Xử lý chuẩn hóa dữ liệu 14 ngày cho biểu đồ
  const dailyAppointments = useMemo(() => {
    const rawDays = (lichHenRes?.data?.lichHenTheoNgay || []).map((d) => ({
      ...d, soLuong: Number(d.soLuong || 0),
    }));
    const today = dayjs();
    const pastDate = today.subtract(13, "day");
    const formattedChart = [];
    for (let i = 0; i < 14; i++) {
        const d = pastDate.add(i, "day");
        const dateStr = toDateString(d);
        const dateLabel = d.format("D/M");
        const match = rawDays.find((rd) => {
            const rdDate = toDateString(rd.ngay);
            return rdDate === dateStr;
        });
        formattedChart.push({
            label: dateLabel,
            count: match ? match.soLuong : 0,
            isToday: dateStr === toDateString(today),
        });
    }
    return formattedChart;
  }, [lichHenRes]);

  // ── Logic xử lý dữ liệu ảo hóa cho UI Chart ──────────────────────────────────────────

  /**
   * statusStatsArr: Xử lý mảng trạng thái lịch khám để hiển thị lên Donut Chart.
   * Tính toán tỉ lệ phần trăm cho mỗi trạng thái (Hoàn thành, Chờ, Hủy...).
   */
  const statusStatsArr = useMemo(() => {
    const total = overview.tongLichHen || 1;
    let hoanThanh = 0;
    let xacNhan = 0;
    let choXacNhan = 0;
    let huy = 0;

    overview.lichHenTheoTrangThai.forEach((item) => {
      if (item.trangThai === 0) choXacNhan = item.soLuong;
      if (item.trangThai === 1) xacNhan = item.soLuong;
      if (item.trangThai === 2) hoanThanh = item.soLuong;
      if (item.trangThai === 3) huy = item.soLuong;
    });

    return [
      { status: 2, label: "Đã hoàn thành", count: hoanThanh, percent: Math.round((hoanThanh / total) * 100), color: "bg-emerald-500" },
      { status: 1, label: "Đã xác nhận", count: xacNhan, percent: Math.round((xacNhan / total) * 100), color: "bg-blue-500" },
      { status: 0, label: "Chờ xác nhận", count: choXacNhan, percent: Math.round((choXacNhan / total) * 100), color: "bg-amber-500" },
      { status: 3, label: "Đã hủy", count: huy, percent: Math.round((huy / total) * 100), color: "bg-rose-500" },
    ];
  }, [overview]);

  /** maxDailyCount: Tìm giá trị cao nhất để thiết lập tỷ lệ chiều cao biểu đồ cột. */
  const maxDailyCount = Math.max(
    ...dailyAppointments.map((d) => d.count),
    1
  );

  /** revenueBreakdown: Tỷ lệ so sánh doanh thu từ Phí khám vs Phí thuốc */
  const revenueBreakdown = useMemo(() => {
    const totalRev = overview.tongDoanhThu || 1;
    const khamPercent = Math.round((overview.doanhThuKham / totalRev) * 100);
    const thuocPercent = 100 - khamPercent;
    return { khamPercent, thuocPercent };
  }, [overview]);

  /** Danh sách năm khả dụng để Admin có thể lựa chọn lọc (từ 2024 tới nay) */
  const yearOptions = useMemo(() => {
    const years = [];
    for (let y = 2024; y <= currentYear; y++) {
      years.push(y);
    }
    return years;
  }, [currentYear]);

  // UI khi đang chờ phản hồi từ API
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── HEADER & BỘ LỌC THEO NĂM ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Thống kê hệ thống
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Tổng hợp dữ liệu hoạt động của hệ thống đặt lịch khám bệnh
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400 text-lg">
            calendar_today
          </span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                Năm {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── KPI CARDS: CÁC CHỈ SỐ QUAN TRỌNG NHẤT ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="calendar_month"
          iconBg="bg-primary/10 text-primary"
          label="Tổng lịch khám"
          value={overview.tongLichHen.toLocaleString("vi-VN")}
          subLabel={`${overview.tongBacSi} bác sĩ · ${overview.tongChuyenKhoa} chuyên khoa`}
        />
        <StatCard
          icon="payments"
          iconBg="bg-emerald-500/10 text-emerald-600"
          label="Tổng doanh thu"
          value={`${(overview.tongDoanhThu / 1000000).toFixed(1)} Tr`}
          subLabel={`${overview.tongDoanhThu.toLocaleString("vi-VN")}đ`}
        />
        <StatCard
          icon="vaccines"
          iconBg="bg-blue-500/10 text-blue-600"
          label="Doanh thu thuốc"
          value={`${(overview.doanhThuThuoc / 1000000).toFixed(1)} Tr`}
          subLabel={`${overview.doanhThuThuoc.toLocaleString("vi-VN")}đ`}
        />
        <StatCard
          icon="person_add"
          iconBg="bg-violet-500/10 text-violet-600"
          label="Tổng bệnh nhân"
          value={overview.tongBenhNhan.toLocaleString("vi-VN")}
          subLabel="Bệnh nhân đã đăng ký"
        />
      </div>

      {/* ── BIỂU ĐỒ DOANH THU 12 THÁNG & CƠ CẤU TRẠNG THÁI LỊCH KHÁM ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Biểu đồ doanh thu dạng cột */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-900">
              Doanh thu theo tháng
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              Năm {selectedYear}
            </span>
          </div>
          <div className="flex items-end gap-2 h-44 sm:h-52 px-2 border-b border-slate-100">
            {revenueStats.length > 0 ? (
              revenueStats.map((m) => {
                const revenue = Number(m.tongDoanhThu || 0);
                const thuoc = Number(m.doanhThuThuoc || 0);
                const hasRevenue = revenue > 0;
                const maxRevenueVal = Math.max(...revenueStats.map(s => Number(s.tongDoanhThu || 0)), 1);
                const heightVal = hasRevenue ? Math.max((revenue / maxRevenueVal) * 100, 15) : 2;
                
                return (
                  <div
                    key={m.thang}
                    className="flex-1 flex flex-col items-center justify-end group relative h-full"
                  >
                    {/* Tooltip hiển thị giá trị khi hover */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 whitespace-nowrap">
                      {hasRevenue ? `${revenue.toLocaleString("vi-VN")}đ` : "0đ"}
                    </div>

                    <div
                      className="w-7 sm:w-8 rounded-t-sm transition-all duration-300 relative"
                      style={{ 
                        height: `${heightVal}%`, 
                        backgroundColor: hasRevenue ? '#3b82f6' : '#e2e8f0',
                        minHeight: hasRevenue ? '20px' : '4px'
                      }}
                    >
                      {/* Phân bổ phí thuốc lồng trong cột doanh thu tổng */}
                      {hasRevenue && thuoc > 0 && (
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-emerald-500 rounded-t-sm"
                          style={{ height: `${(thuoc / revenue) * 100}%`, opacity: 0.9 }}
                        />
                      )}
                    </div>
                    <span className={`mt-2 text-[10px] sm:text-xs font-bold ${
                      hasRevenue ? "text-blue-600" : "text-slate-400"
                    }`}>
                      T{m.thang}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex items-center justify-center h-full text-slate-400 italic text-sm">
                Đang tải dữ liệu doanh thu...
              </div>
            )}
          </div>
          {/* Chú giải biểu đồ */}
          <div className="mt-4 flex gap-4 justify-end text-xs text-slate-500">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-400 rounded-sm" /> Phí khám
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-400 rounded-sm" /> Phí thuốc
            </span>
          </div>
        </div>

        {/* Biểu đồ Donut: Trạng thái lịch khám */}
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
                  #3b82f6 ${statusStatsArr[0].percent} ${statusStatsArr[0].percent + statusStatsArr[1].percent}%,
                  #f59e0b ${statusStatsArr[0].percent + statusStatsArr[1].percent}% ${statusStatsArr[0].percent + statusStatsArr[1].percent + statusStatsArr[2].percent}%,
                  #f43f5e ${statusStatsArr[0].percent + statusStatsArr[1].percent + statusStatsArr[2].percent}% 100%
                )`,
              }}
            >
              <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-slate-900">
                  {overview.tongLichHen.toLocaleString("vi-VN")}
                </span>
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
                  <span className="text-sm font-semibold text-slate-900">{s.count.toLocaleString()}</span>
                  <span className="text-xs text-slate-400 w-10 text-right">{s.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── BIỂU ĐỒ BIẾN ĐỘNG LỊCH KHÁM & PHÂN BỔ LOẠI DOANH THU ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Biểu đồ lịch khám 14 ngày qua */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Lịch khám 14 ngày qua
              </h3>
              <p className="text-[11px] text-slate-500">
                Số lượng lịch hẹn được đặt theo ngày
              </p>
            </div>
          </div>
          <div className="p-4 sm:p-6 overflow-x-auto">
            <div className="flex items-end justify-between gap-2 h-40 min-w-[500px] lg:min-w-0">
              {dailyAppointments.length > 0 ? (
                dailyAppointments.map((bar) => {
                  let heightStyle = bar.count > 0 ? Math.max(15, (bar.count / maxDailyCount) * 100) + "%" : "4px";
                  return (
                    <div
                      key={bar.label}
                      className="flex-1 h-full flex flex-col justify-end items-center gap-2 group relative"
                    >
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-medium px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                        {bar.count} lịch hẹn
                      </div>
                      <div
                        className={`w-full max-w-[24px] rounded-t-sm transition-all duration-300 ${
                          bar.count > 0 ? (bar.isToday ? "bg-orange-500" : "bg-primary") : "bg-slate-200"
                        }`}
                        style={{ height: heightStyle }}
                      />
                      <span className={`text-[10px] font-semibold ${bar.isToday ? "text-orange-500" : "text-slate-400"}`}>
                        {bar.label}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="w-full flex items-center justify-center text-slate-400 text-xs py-10">Chưa có dữ liệu</div>
              )}
            </div>
          </div>
        </div>

        {/* Phân bổ doanh thu dạng tỉ lệ phần trăm */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <h3 className="text-base font-bold text-slate-900 mb-5">
            Phân bổ doanh thu
          </h3>
          <div className="flex flex-col items-center gap-5">
            <div
              className="w-36 h-36 rounded-full relative"
              style={{
                background: `conic-gradient(
                  #3b82f6 0% ${revenueBreakdown.khamPercent}%,
                  #10b981 ${revenueBreakdown.khamPercent}% 100%
                )`,
              }}
            >
              <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center">
                <span className="text-base font-bold text-slate-900">
                  {(overview.tongDoanhThu / 1000000).toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Triệu VNĐ</span>
              </div>
            </div>
            <div className="w-full space-y-3">
              {/* Thanh tỉ lệ Phí khám */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-sm text-slate-600">Phí khám</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{revenueBreakdown.khamPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${revenueBreakdown.khamPercent}%` }} />
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{overview.doanhThuKham.toLocaleString("vi-VN")}đ</p>
              </div>
              {/* Thanh tỉ lệ Phí thuốc */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-sm text-slate-600">Phí thuốc</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{revenueBreakdown.thuocPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${revenueBreakdown.thuocPercent}%` }} />
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{overview.doanhThuThuoc.toLocaleString("vi-VN")}đ</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TỔNG HỢP DOANH THU THEO QUÝ ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Quý 1", months: [0, 1, 2] },
          { label: "Quý 2", months: [3, 4, 5] },
          { label: "Quý 3", months: [6, 7, 8] },
          { label: "Quý 4", months: [9, 10, 11] },
        ].map((q) => {
          const total = revenueStats
            .filter((_, idx) => q.months.includes(idx))
            .reduce((sum, m) => sum + (m.tongDoanhThu || 0), 0);
          return (
            <div key={q.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{q.label} / {selectedYear}</p>
              <p className="text-lg font-bold text-slate-900">{(total / 1000000).toFixed(1)} <span className="text-xs font-medium text-slate-400">Tr</span></p>
              <p className="text-[11px] text-slate-400 mt-0.5">{total.toLocaleString("vi-VN")}đ</p>
            </div>
          );
        })}
      </div>

      {/* ── BẢNG XẾP HẠNG TOP BÁC SĨ TẬP TRUNG ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Top bác sĩ được đặt lịch nhiều nhất</h3>
            <p className="text-[11px] text-slate-500">14 ngày gần nhất · Dữ liệu được tính dựa trên số lịch xác nhận/hoàn thành</p>
          </div>
        </div>

        {/* View di động dạng danh sách tóm tắt */}
        <div className="block md:hidden divide-y divide-slate-100">
          {topDoctors.length === 0 ? (
            <p className="text-center p-4 text-sm text-slate-500">Chưa có dữ liệu</p>
          ) : (
            topDoctors.map((doc, idx) => {
              const maxDoc = topDoctors[0]?.soLuong || 1;
              const barPercent = Math.round((doc.soLuong / maxDoc) * 100);
              return (
                <div key={doc.bacSiId} className="p-4 flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${idx === 0 ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"}`}>{idx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{doc.tenBacSi}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${barPercent}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-700 shrink-0">{doc.soLuong}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* View máy tính dạng bảng chi tiết kèm Progress Bar */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 w-12">#</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Bác sĩ</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 w-80">Số lịch khám</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topDoctors.length === 0 ? (
                <tr><td colSpan={3} className="text-center p-4 text-sm text-slate-500">Chưa có dữ liệu</td></tr>
              ) : (
                topDoctors.map((doc, idx) => {
                  const maxDoc = topDoctors[0]?.soLuong || 1;
                  const barPercent = Math.round((doc.soLuong / maxDoc) * 100);
                  return (
                    <tr key={doc.bacSiId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? "bg-amber-100 text-amber-600" : (idx === 1 ? "bg-slate-200 text-slate-600" : "bg-slate-100 text-slate-500")}`}>{idx + 1}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{doc.tenBacSi}</p>
                          <p className="text-xs text-slate-400 font-mono italic">ID: {doc.bacSiId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-slate-100 rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${barPercent}%` }} />
                          </div>
                          <span className="text-sm font-bold text-slate-900 w-8 text-right">{doc.soLuong}</span>
                        </div>
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

export default AdminStatsPage;
