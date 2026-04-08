import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { specialtyService } from "../../services/specialtyService";

const ICON_OPTIONS = [
  { value: "ecg", label: "Tim mạch (ecg)" },
  { value: "child_care", label: "Nhi khoa (child_care)" },
  { value: "female", label: "Sản phụ khoa (female)" },
  { value: "hearing", label: "Tai Mũi Họng (hearing)" },
  { value: "psychology", label: "Tâm thần (psychology)" },
  { value: "visibility", label: "Mắt (visibility)" },
  { value: "dentistry", label: "Nha khoa (dentistry)" },
  { value: "orthopedics", label: "Chấn thương (orthopedics)" },
  { value: "dermatology", label: "Da liễu (dermatology)" },
  { value: "neurology", label: "Thần kinh (neurology)" },
];

function AdminEditSpecialtyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    icon: "",
    description: "",
  });

  useEffect(() => {
    const fetchSpecialty = async () => {
      try {
        const res = await specialtyService.getById(id);
        if (res.success) {
          const item = res.data;
          setForm({
            name: item.tenChuyenKhoa || "",
            icon: item.anhChuyenKhoa || "",
            description: item.moTaChuyenKhoa || "",
          });
        }
      } catch (error) {
        console.error(error);
        toast.error("Không tìm thấy chuyên khoa!");
        navigate("/admin/specialties");
      } finally {
        setLoading(false);
      }
    };
    fetchSpecialty();
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.warn("Vui lòng nhập tên chuyên khoa.");
      return;
    }

    setSaving(true);
    try {
      await specialtyService.update(id, {
        tenChuyenKhoa: form.name.trim(),
        anhChuyenKhoa: form.icon,
        moTaChuyenKhoa: form.description,
      });
      toast.success(`Cập nhật chuyên khoa "${form.name}" thành công!`);
      navigate("/admin/specialties");
    } catch (error) {
      console.error(error);
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
          to="/admin/specialties"
          className="text-slate-500 hover:text-primary transition-colors"
        >
          Quản lý chuyên khoa
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-medium">Chỉnh sửa chuyên khoa</span>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">
          Chỉnh sửa chuyên khoa
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Cập nhật thông tin chuyên khoa ID #{id}.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Tên chuyên khoa <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="VD: Nội tổng quát"
                className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Biểu tượng (Icon)
              </label>
              <select
                name="icon"
                value={form.icon}
                onChange={handleChange}
                className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
              >
                <option value="">-- Chọn icon --</option>
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {form.icon && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">
                  {form.icon}
                </span>
              </div>
              <span className="text-sm text-slate-600">Xem trước icon</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Mô tả chuyên khoa
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Mô tả chi tiết về chuyên khoa này..."
              className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        <div className="bg-slate-50 px-6 sm:px-8 py-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-200">
          <button
            onClick={() => navigate("/admin/specialties")}
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

export default AdminEditSpecialtyPage;
