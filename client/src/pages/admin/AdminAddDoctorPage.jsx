import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { doctorService } from "../../services/doctorService";
import { specialtyService } from "../../services/specialtyService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

function AdminAddDoctorPage() {
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    tenBacSi: "",
    email: "",
    matKhau: "",
    chuyenKhoaId: "",
    hocViChucDanh: "",
    giaKham: "",
    moTaNgan: "",
    moTaChiTiet: "",
  });

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await specialtyService.getAll();
        if (res.success) {
          setSpecialties(res.data);
        }
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải danh sách chuyên khoa!");
      }
    };
    fetchSpecialties();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.tenBacSi.trim() || !form.chuyenKhoaId || !form.email || !form.matKhau) {
      toast.warn("Vui lòng nhập đầy đủ: Họ tên, Chuyên khoa, Email, Mật khẩu.");
      return;
    }
    
    setLoading(true);
    try {
      await doctorService.create({
        ...form,
        giaKham: form.giaKham ? Number(form.giaKham) : null,
      });
      toast.success(`Đã thêm bác sĩ "${form.tenBacSi}" thành công!`);
      navigate("/admin/doctors");
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi thêm bác sĩ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10 font-sans">
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link to="/admin/doctors" className="text-slate-500 hover:text-primary transition-colors font-medium">
          Quản lý bác sĩ
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-bold tracking-tight">Thêm bác sĩ mới</span>
      </div>

      <div className="mb-10 text-center sm:text-left">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Thêm bác sĩ mới</h2>
        <p className="text-slate-500 text-sm mt-2">Khởi tạo tài khoản và hồ sơ bác sĩ vào hệ thống chuyên môn.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 sm:p-12 space-y-10">
          
          {/* Section: Thông tin cơ bản */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary ring-4 ring-primary/10"></span>
              Thông tin cơ bản
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Họ tên bác sĩ <span className="text-rose-500">*</span></label>
                <input
                  name="tenBacSi"
                  value={form.tenBacSi}
                  onChange={handleChange}
                  placeholder="VD: PGS. TS. Nguyễn Văn A"
                  className="w-full px-5 py-3.5 rounded-2xl border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Chuyên khoa <span className="text-rose-500">*</span></label>
                <select
                  name="chuyenKhoaId"
                  value={form.chuyenKhoaId}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 rounded-2xl border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-primary/10 transition-all font-medium appearance-none cursor-pointer"
                >
                  <option value="">-- Chọn chuyên khoa --</option>
                  {specialties.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.tenChuyenKhoa}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section: Tài khoản */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="size-2 rounded-full bg-amber-500 ring-4 ring-amber-100"></span>
              Tài khoản đăng nhập
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Email công tác <span className="text-rose-500">*</span></label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="doctor@example.com"
                  className="w-full px-5 py-3.5 rounded-2xl border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Mật khẩu khởi tạo <span className="text-rose-500">*</span></label>
                <input
                  name="matKhau"
                  type="password"
                  value={form.matKhau}
                  onChange={handleChange}
                  placeholder="Bảo mật tối thiểu 6 ký tự"
                  className="w-full px-5 py-3.5 rounded-2xl border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section: Chuyên môn & Chi phí */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="size-2 rounded-full bg-green-500 ring-4 ring-green-100"></span>
              Chuyên môn & Chi phí
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Học vị / Chức danh</label>
                <input
                  name="hocViChucDanh"
                  value={form.hocViChucDanh}
                  onChange={handleChange}
                  placeholder="VD: Bác sĩ chuyên khoa II, ThS..."
                  className="w-full px-5 py-3.5 rounded-2xl border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Giá khám bệnh (VNĐ)</label>
                <input
                  name="giaKham"
                  type="number"
                  value={form.giaKham}
                  onChange={handleChange}
                  placeholder="VD: 500000"
                  className="w-full px-5 py-3.5 rounded-2xl border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-primary/10 transition-all font-bold text-primary"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Mô tả ngắn gọn chuyên môn</label>
              <input
                name="moTaNgan"
                value={form.moTaNgan}
                onChange={handleChange}
                placeholder="VD: Chuyên gia hàng đầu về tim mạch can thiệp với hơn 20 năm kinh nghiệm."
                className="w-full px-5 py-4 rounded-2xl border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-primary/10 transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Giới thiệu chi tiết</label>
              <textarea
                name="moTaChiTiet"
                value={form.moTaChiTiet}
                onChange={handleChange}
                rows={10}
                placeholder="Nhập quá trình công tác, đào tạo và các thành tựu của bác sĩ..."
                className="w-full px-5 py-4 rounded-2xl border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-primary/10 transition-all font-medium resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="bg-slate-50/80 px-8 sm:px-12 py-6 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100">
          <button
            onClick={() => navigate("/admin/doctors")}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className={`w-full sm:w-auto px-12 py-3.5 rounded-2xl text-white text-sm font-black transition-all flex items-center justify-center gap-2 shadow-xl ${
              loading ? "bg-slate-300" : "bg-primary hover:bg-primary/90 shadow-primary/20"
            }`}
          >
            {loading ? (
              <LoadingSpinner size="size-5" color="text-white" />
            ) : (
              <span className="material-symbols-outlined text-sm">how_to_reg</span>
            )}
            Xác nhận thêm bác sĩ
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminAddDoctorPage;
