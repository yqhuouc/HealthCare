import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { usePatient, useUpdatePatient } from "../../hooks/queries/usePatientQueries";
import LoadingSpinner from "../../components/common/LoadingSpinner";

/**
 * Trang AdminEditPatientPage - Chỉnh sửa thông tin Bệnh nhân (Admin)
 * Kiến trúc: Wrapper (fetch + loading) → Child Form (khởi tạo state từ props)
 * Để tránh React 19 warning về setState trong useEffect.
 */
function AdminEditPatientPage() {
  const { id } = useParams();
  const { data: patientRes, isLoading: loading } = usePatient(id);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="size-12" />
      </div>
    );
  }

  return <EditPatientForm patientData={patientRes?.data} patientId={id} />;
}

function EditPatientForm({ patientData, patientId }) {
  const navigate = useNavigate();
  const updateMutation = useUpdatePatient();
  const submitting = updateMutation.isPending;
  
  // Khởi tạo form state trực tiếp từ props — KHÔNG cần useEffect
  const p = patientData || {};
  const [formData, setFormData] = useState({
    hoTen: p.hoTen || "",
    soDienThoai: p.soDienThoai || "",
    taiKhoan: {
      email: p.taiKhoan?.email || "",
      diaChi: p.taiKhoan?.diaChi || "",
      ngaySinh: p.taiKhoan?.ngaySinh ? p.taiKhoan.ngaySinh.split("T")[0] : "",
      gioiTinh: p.taiKhoan?.gioiTinh ?? 1,
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      hoTen: formData.hoTen,
      soDienThoai: formData.soDienThoai,
      emailLienHe: formData.taiKhoan.email,
      diaChi: formData.taiKhoan.diaChi,
      ngaySinh: formData.taiKhoan.ngaySinh,
      gioiTinh: Number(formData.taiKhoan.gioiTinh)
    };

    updateMutation.mutate(
      { id: patientId, data: payload },
      {
        onSuccess: () => toast.success("Cập nhật thông tin bệnh nhân thành công"),
        onError: (err) => toast.error(err.message || "Lỗi khi cập nhật"),
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Breadcrumb dẫn hướng */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link
          to="/admin/patients"
          className="hover:text-primary transition-colors"
        >
          Quản lý bệnh nhân
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">
          Chỉnh sửa hồ sơ BN#{patientId}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Header Section */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900">
            Chi tiết hồ sơ bệnh nhân
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Cập nhật thông tin cá nhân và trạng thái tài khoản.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          {/* Section 1: Thông tin liên hệ cơ bản */}
          <section className="space-y-6">
            <h3 className="font-bold text-slate-900 border-l-4 border-primary pl-3 uppercase text-xs tracking-widest">
              Thông tin liên hệ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Họ và tên
                </label>
                <input
                  type="text"
                  required
                  value={formData.hoTen}
                  onChange={(e) =>
                    setFormData({ ...formData, hoTen: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  required
                  value={formData.soDienThoai}
                  onChange={(e) =>
                    setFormData({ ...formData, soDienThoai: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Email (ID hồ sơ)
                </label>
                <input
                  type="email"
                  disabled
                  value={formData.taiKhoan.email}
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-400 italic">
                  * Email không thể thay đổi để đảm bảo danh tính tài khoản.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={formData.taiKhoan.diaChi}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      taiKhoan: {
                        ...formData.taiKhoan,
                        diaChi: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Thông tin cá nhân/nhân khẩu */}
          <section className="space-y-6">
            <h3 className="font-bold text-slate-900 border-l-4 border-primary pl-3 uppercase text-xs tracking-widest">
              Thông tin nhân khẩu
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Ngày sinh
                </label>
                <input
                  type="date"
                  value={formData.taiKhoan.ngaySinh}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      taiKhoan: {
                        ...formData.taiKhoan,
                        ngaySinh: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Giới tính
                </label>
                <div className="flex gap-4">
                  {[1, 2].map((val) => (
                    <label
                      key={val}
                      className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-white transition-all peer-checked:bg-primary/5 peer-checked:border-primary"
                    >
                      <input
                        type="radio"
                        name="gioiTinh"
                        className="peer hidden"
                        checked={formData.taiKhoan.gioiTinh === val}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            taiKhoan: { ...formData.taiKhoan, gioiTinh: val },
                          })
                        }
                      />
                      <span
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.taiKhoan.gioiTinh === val ? "border-primary" : "border-slate-300"}`}
                      >
                        {formData.taiKhoan.gioiTinh === val && (
                          <span className="w-2 h-2 bg-primary rounded-full transition-all" />
                        )}
                      </span>
                      <span
                        className={`text-sm font-medium ${formData.taiKhoan.gioiTinh === val ? "text-primary" : "text-slate-600"}`}
                      >
                        {val === 1 ? "Nam" : "Nữ"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Nhóm các nút tác vụ (Hủy và Lưu) */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate(-1)} // Quay lại trang trước đó
              className="px-8 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <LoadingSpinner size="size-5" color="text-white" />
              ) : (
                <span className="material-symbols-outlined text-sm">save</span>
              )}
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminEditPatientPage;
