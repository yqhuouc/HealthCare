import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { patientService } from "../../services/patientService";
import { appointmentService } from "../../services/appointmentService";
import { APPOINTMENT_STATUS_CONFIG } from "../../data/appointmentConstants";
import { getInitials } from "../../utils/formatters";
import LoadingSpinner from "../../components/common/LoadingSpinner";

/**
 * Bản đồ ánh xạ mã trạng thái số sang chuỗi định danh (để lấy config UI)
 */
const STATUS_MAP = {
  0: "pending",
  1: "confirmed",
  2: "completed",
  3: "cancelled",
};

/**
 * Trang AdminPatientDetailPage - Xem chi tiết hồ sơ bệnh nhân (Admin)
 * Chức năng: Hiển thị thông tin cá nhân đầy đủ, thống kê số lượng lịch khám và lịch sử các lần đặt khám.
 */
function AdminPatientDetailPage() {
  const { id } = useParams(); // Lấy ID bệnh nhân từ URL
  const navigate = useNavigate();
  
  // State lưu trữ thông tin bệnh nhân và danh sách lịch hẹn
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Effect tải đồng thời thông tin bệnh nhân và lịch sử đặt khám
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Sử dụng Promise.all để tối ưu thời gian tải dữ liệu
        const [pRes, aRes] = await Promise.all([
          patientService.getById(id),
          appointmentService.getByBenhNhan(id),
        ]);

        if (pRes.success) setPatient(pRes.data);
        if (aRes.success) setAppointments(aRes.data);
      } catch (error) {
        console.error(error);
        toast.error("Không tìm thấy thông tin bệnh nhân!");
        navigate("/admin/patients"); // Quay về danh sách nếu ID không hợp lệ hoặc có lỗi
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  // Hiển thị vòng xoay chờ khi đang gọi API
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="size-12" />
      </div>
    );
  }

  // Trường hợp không có dữ liệu (đã được handle bởi catch nhưng thêm để an toàn)
  if (!patient) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb dẫn hướng */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/admin/patients" className="hover:text-primary transition-colors italic">Quản lý bệnh nhân</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">Chi tiết hồ sơ #BN{id}</span>
      </div>

      {/* Card Header: Chứa thông tin tổng quan, Avatar và thông tin liên hệ nhanh */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 bg-linear-to-r from-primary to-primary-light text-white">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Ảnh đại diện: Nếu không có ảnh thì hiển thị chữ cái đầu tên */}
            <div className="size-24 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center overflow-hidden">
              {patient.taiKhoan?.anhDaiDien ? (
                <img 
                  src={patient.taiKhoan.anhDaiDien} 
                  alt={patient.hoTen} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold">{getInitials(patient.hoTen)}</span>
              )}
            </div>
            {/* Nội dung text bên cạnh avatar */}
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-bold">{patient.hoTen}</h2>
              <p className="opacity-90 mt-1 uppercase text-xs font-black tracking-widest">
                Mã BN: BN{patient.id} | Tham gia: {new Date(patient.taiKhoan?.ngayTao).toLocaleDateString("vi-VN")}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium border border-white/20">
                  {patient.taiKhoan?.email || patient.emailLienHe}
                </span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium border border-white/20">
                  {patient.soDienThoai}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Thông tin cá nhân chi tiết và Thống kê nhanh */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* CỘT TRÁI: Dữ liệu nhân thân */}
          <div>
            <h3 className="font-bold text-slate-900 border-l-4 border-primary pl-3 mb-4 uppercase text-sm tracking-widest">
              Thông tin cá nhân
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">Giới tính:</span>
                <span className="font-medium text-slate-900">{patient.taiKhoan?.gioiTinh === 1 ? "Nam" : patient.taiKhoan?.gioiTinh === 2 ? "Nữ" : "Chưa cập nhật"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">Ngày sinh:</span>
                <span className="font-medium text-slate-900">{patient.taiKhoan?.ngaySinh ? new Date(patient.taiKhoan.ngaySinh).toLocaleDateString("vi-VN") : "Chưa cập nhật"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">Địa chỉ:</span>
                <span className="font-medium text-slate-900 text-right">{patient.taiKhoan?.diaChi || "Chưa cập nhật"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">Trạng thái tài khoản:</span>
                {patient.taiKhoan?.trangThaiTaiKhoan === 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-wider border border-rose-100 shadow-sm shadow-rose-100/50">
                    <span className="size-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                    Đã khóa tài khoản
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-emerald-100 shadow-sm shadow-emerald-100/50">
                    <span className="size-1.5 rounded-full bg-emerald-500"></span>
                    Đang hoạt động
                  </span>
                )}
              </div>
            </div>
          </div>  

          {/* CỘT PHẢI: Số liệu thống kê lịch khám của bệnh nhân */}
          <div>
            <h3 className="font-bold text-slate-900 border-l-4 border-primary pl-3 mb-4 uppercase text-sm tracking-widest">
              Thống kê lịch khám
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center">
                <span className="text-2xl font-bold text-primary">{appointments.length}</span>
                <span className="text-xs text-slate-500">Tổng lịch hẹn</span>
              </div>
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 flex flex-col items-center">
                <span className="text-2xl font-bold text-emerald-600">{appointments.filter(a => a.trangThai === 2).length}</span>
                <span className="text-xs text-slate-500">Đã hoàn thành</span>
              </div>
              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100 flex flex-col items-center">
                <span className="text-2xl font-bold text-amber-600">{appointments.filter(a => a.trangThai === 0 || a.trangThai === 1).length}</span>
                <span className="text-xs text-slate-500">Sắp tới / Chờ</span>
              </div>
              <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-100 flex flex-col items-center">
                <span className="text-2xl font-bold text-rose-600">{appointments.filter(a => a.trangThai === 3).length}</span>
                <span className="text-xs text-slate-500">Đã hủy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bảng Danh sách Lịch sử khám bệnh của bệnh nhân */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Lịch sử khám bệnh</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 text-slate-600">
                <th className="px-6 py-3 text-left font-semibold">Mã LK</th>
                <th className="px-6 py-3 text-left font-semibold">Bác sĩ</th>
                <th className="px-6 py-3 text-left font-semibold">Ngày khám</th>
                <th className="px-6 py-3 text-left font-semibold">Trạng thái</th>
                <th className="px-6 py-3 text-right font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.length === 0 ? (
                // Hiển thị khi chưa từng đặt lịch
                <tr><td colSpan="5" className="text-center py-6 text-slate-500 italic">Bệnh nhân chưa có lịch hẹn nào.</td></tr>
              ) : appointments.map(apt => {
                // Lấy config hiển thị (label, color) từ mã trạng thái
                const statusStr = STATUS_MAP[apt.trangThai] || "pending";
                const cfg = APPOINTMENT_STATUS_CONFIG[statusStr];
                return (
                  <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">LK{apt.id}</td>
                    <td className="px-6 py-4 text-slate-700">{apt.bacSi?.tenBacSi}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(apt.ngayDat).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4">
                      {cfg && <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${cfg.className}`}>{cfg.label}</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Nút xem chi tiết của lịch hẹn cụ thể */}
                      <Link to={`/admin/appointments/${apt.id}`} className="text-primary hover:underline font-medium">Chi tiết</Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminPatientDetailPage;
