import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { patientService } from "../../services/patientService";

function AdminEditPatientPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    hoTen: "",
    soDienThoai: "",
    taiKhoan: {
      email: "",
      diaChi: "",
      ngaySinh: "",
      gioiTinh: 1, // 1: Nam, 2: Nữ
    },
  });

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await patientService.getById(id);
        if (res.success) {
          const p = res.data;
          setFormData({
            hoTen: p.hoTen || "",
            soDienThoai: p.soDienThoai || "",
            taiKhoan: {
              email: p.taiKhoan?.email || "",
              diaChi: p.taiKhoan?.diaChi || "",
              ngaySinh: p.taiKhoan?.ngaySinh
                ? p.taiKhoan.ngaySinh.split("T")[0]
                : "",
              gioiTinh: p.taiKhoan?.gioiTinh ?? 1,
            },
          });
        }
      } catch (error) {
        console.error(error);
        toast.error("Không tìm thấy thông tin bệnh nhân");
        navigate("/admin/patients");
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Làm phẳng dữ liệu trước khi gửi lên Backend
      const payload = {
        hoTen: formData.hoTen,
        soDienThoai: formData.soDienThoai,
        emailLienHe: formData.taiKhoan.email,
        diaChi: formData.taiKhoan.diaChi,
        ngaySinh: formData.taiKhoan.ngaySinh,
        gioiTinh: Number(formData.taiKhoan.gioiTinh)
      };

      const res = await patientService.update(id, payload);
      if (res.success) {
        toast.success("Cập nhật thông tin bệnh nhân thành công");
      }
    } catch (error) {
      toast.error(error.message || "Lỗi khi cập nhật");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link
          to="/admin/patients"
          className="hover:text-primary transition-colors"
        >
          Quản lý bệnh nhân
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">
          Chỉnh sửa hồ sơ BN#{id}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900">
            Chi tiết hồ sơ bệnh nhân
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Cập nhật thông tin cá nhân và trạng thái tài khoản.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
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

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
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
                <span className="material-symbols-outlined animate-spin">
                  progress_activity
                </span>
              ) : (
                <span className="material-symbols-outlined">save</span>
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
