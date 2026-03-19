/**
 * ============================================================
 * TRANG: Lịch sử khám bệnh (Bác sĩ)
 * Đường dẫn: /doctor/history
 * ============================================================
 *
 * Chức năng:
 * - Hiển thị lịch sử tất cả lần khám bệnh mà bác sĩ đã thực hiện
 * - Bộ lọc: tìm kiếm theo tên/mã BN, lọc theo khoảng ngày (từ ngày - đến ngày)
 * - Bảng hiển thị: ngày khám, mã BN, tên BN (với avatar initials), chuyên khoa, kết luận
 * - Nút "Xem chi tiết" → chuyển sang trang chi tiết hồ sơ bệnh án
 * - Phân trang (pagination) với 5 trang
 * - Responsive: mobile card view, desktop table view
 *
 * State:
 * - search: chuỗi tìm kiếm tên/mã BN
 * - dateFrom / dateTo: khoảng ngày lọc
 * - currentPage: trang hiện tại (1-5)
 *
 * Dữ liệu: HISTORY_RECORDS (mock cục bộ)
 * ============================================================
 */
import { useState } from "react";
import { Link } from "react-router-dom";

/** Dữ liệu lịch sử khám mẫu — sẽ thay bằng API khi có backend */
const HISTORY_RECORDS = [
  { id: 1, date: "15/10/2023", patientCode: "BN-99281", patientName: "Trần Văn B", initials: "TV", initialsColor: "bg-slate-100 text-slate-500", specialty: "Nội tổng quát", conclusion: "Viêm họng cấp, sốt nhẹ..." },
  { id: 2, date: "14/10/2023", patientCode: "BN-88122", patientName: "Lê Thị C", initials: "LT", initialsColor: "bg-blue-100 text-blue-600", specialty: "Nội tổng quát", conclusion: "Suy nhược cơ thể, thiếu máu..." },
  { id: 3, date: "14/10/2023", patientCode: "BN-77210", patientName: "Phạm Hoàng D", initials: "PH", initialsColor: "bg-green-100 text-green-600", specialty: "Tiêu hóa", conclusion: "Viêm loét dạ dày tá tràng..." },
  { id: 4, date: "12/10/2023", patientCode: "BN-11204", patientName: "Nguyễn Kim E", initials: "NK", initialsColor: "bg-purple-100 text-purple-600", specialty: "Nội tổng quát", conclusion: "Kiểm tra định kỳ, sức khỏe tốt" },
  { id: 5, date: "10/10/2023", patientCode: "BN-44509", patientName: "Võ Minh F", initials: "VM", initialsColor: "bg-orange-100 text-orange-600", specialty: "Tim mạch", conclusion: "Rối loạn nhịp tim nhẹ..." },
];

function DoctorHistoryPage() {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredRecords = HISTORY_RECORDS.filter((record) => {
    const matchesSearch =
      !search ||
      record.patientName.toLowerCase().includes(search.toLowerCase()) ||
      record.patientCode.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm">
        <div className="grid md:grid-cols-12 gap-4">
          <div className="md:col-span-6">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Tìm kiếm bệnh nhân
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                search
              </span>
              <input
                type="text"
                placeholder="Nhập tên bệnh nhân hoặc mã số BN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary text-sm outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Từ ngày
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                calendar_today
              </span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary text-sm outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Đến ngày
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                calendar_today
              </span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary text-sm outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {/* Mobile card view */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <div key={record.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${record.initialsColor}`}>
                      {record.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{record.patientName}</p>
                      <p className="text-xs text-primary font-semibold">{record.patientCode}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>{record.date}</span>
                  <span>{record.specialty}</span>
                </div>
                <p className="text-xs text-slate-500 truncate">{record.conclusion}</p>
                <Link
                  to={`/doctor/history/${record.id}`}
                  className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Xem chi tiết
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center text-slate-400 text-sm">
              Không tìm thấy kết quả phù hợp.
            </div>
          )}
        </div>

        {/* Desktop table view */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày khám</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mã BN</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tên bệnh nhân</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Chuyên khoa</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kết luận</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600">{record.date}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-primary font-semibold">{record.patientCode}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold ${record.initialsColor}`}>
                        {record.initials}
                      </div>
                      <span className="text-sm font-medium text-slate-800">{record.patientName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{record.specialty}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{record.conclusion}</td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/doctor/history/${record.id}`}
                      className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Xem chi tiết
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                    Không tìm thấy kết quả phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-slate-50 border-t px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-xs sm:text-sm text-slate-500">
            Hiển thị 1-{filteredRecords.length} của 128 kết quả
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="size-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`size-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                  currentPage === page
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-500 hover:bg-white hover:text-primary"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(5, p + 1))}
              disabled={currentPage === 5}
              className="size-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorHistoryPage;
