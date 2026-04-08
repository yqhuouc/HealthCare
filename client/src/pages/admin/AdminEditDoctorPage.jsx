import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { doctorService } from "../../services/doctorService";
import { specialtyService } from "../../services/specialtyService";

function AdminEditDoctorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tenBacSi: "",
    chuyenKhoaId: "",
    hocViChucDanh: "",
    giaKham: "",
    moTaNgan: "",
    moTaChiTiet: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [docRes, specRes] = await Promise.all([
          doctorService.getById(id),
          specialtyService.getAll(),
        ]);

        if (docRes.success) {
          const doc = docRes.data;
          setForm({
            tenBacSi: doc.tenBacSi || "",
            chuyenKhoaId: doc.chuyenKhoaId?.toString() || "",
            hocViChucDanh: doc.hocViChucDanh || "",
            giaKham: doc.giaKham || "",
            moTaNgan: doc.moTaNgan || "",
            moTaChiTiet: doc.moTaChiTiet || "",
          });
        }

        if (specRes.success) {
          setSpecialties(specRes.data);
        }
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải thông tin bác sĩ!");
        navigate("/admin/doctors");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.tenBacSi.trim() || !form.chuyenKhoaId) {
      toast.warn("Vui lòng nhập đầy đủ: Họ tên và Chuyên khoa.");
      return;
    }

    setSaving(true);
    try {
      await doctorService.update(id, {
        ...form,
        giaKham: form.giaKham ? Number(form.giaKham) : null,
      });
      toast.success(`Cập nhật bác sĩ "${form.tenBacSi}" thành công!`);
      navigate("/admin/doctors");
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi cập nhật!");
    } finally {
      setSaving(false);
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
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link
          to="/admin/doctors"
          className="text-slate-500 hover:text-primary transition-colors"
        >
          Quản lý bác sĩ
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-medium">Chỉnh sửa bác sĩ</span>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Chỉnh sửa bác sĩ</h2>
        <p className="text-slate-500 text-sm mt-1">
          Cập nhật thông tin chi tiết cho bác sĩ ID #{id}.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Họ tên bác sĩ <span className="text-red-500">*</span>
              </label>
              <input
                name="tenBacSi"
                value={form.tenBacSi}
                onChange={handleChange}
                placeholder="VD: Nguyễn Văn A"
                className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Chuyên khoa <span className="text-red-500">*</span>
              </label>
              <select
                name="chuyenKhoaId"
                value={form.chuyenKhoaId}
                onChange={handleChange}
                className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Chức danh / Học vị
              </label>
              <input
                name="hocViChucDanh"
                value={form.hocViChucDanh}
                onChange={handleChange}
                placeholder="VD: ThS. BS."
                className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Giá khám (VNĐ)
              </label>
              <input
                name="giaKham"
                type="number"
                value={form.giaKham}
                onChange={handleChange}
                placeholder="VD: 300000"
                className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Mô tả ngắn
            </label>
            <input
              name="moTaNgan"
              value={form.moTaNgan}
              onChange={handleChange}
              placeholder="VD: Bác sĩ chuyên khoa nội uy tín..."
              className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary mb-5"
            />

            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Mô tả chi tiết
            </label>
            <textarea
              name="moTaChiTiet"
              value={form.moTaChiTiet}
              onChange={handleChange}
              rows={4}
              placeholder="Thông tin giới thiệu về bác sĩ..."
              className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        <div className="bg-slate-50 px-6 sm:px-8 py-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-200">
          <button
            onClick={() => navigate("/admin/doctors")}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
              saving
                ? "bg-slate-300"
                : "bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
            }`}
          >
            {saving ? (
              <span className="material-symbols-outlined animate-spin text-sm">
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined text-sm">save</span>
            )}
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminEditDoctorPage;
