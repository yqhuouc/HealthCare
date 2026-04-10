import { useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useSpecialty, useUpdateSpecialty } from "../../hooks/queries/useSpecialtyQueries";
import { specialtyService } from "../../services/specialtyService"; // Giữ lại cho uploadAnh

// Danh sách các icon Google Material Symbols gợi ý cho chuyên khoa
const ICON_OPTIONS = [
  { value: "medical_services", label: "Dịch vụ y tế (Mặc định)" },
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
  { value: "vaccines", label: "Tiêm chủng (vaccines)" },
  { value: "radiology", label: "Chẩn đoán hình ảnh (radiology)" },
  { value: "emergency", label: "Cấp cứu (emergency)" },
];

/**
 * Trang AdminEditSpecialtyPage - Chỉnh sửa thông tin Chuyên khoa (Admin)
 * Kiến trúc: Wrapper (fetch + loading) → Child Form (để tránh setState trong useEffect)
 */
function AdminEditSpecialtyPage() {
  const { id } = useParams();
  const { data: specRes, isLoading: loading } = useSpecialty(id);

  if (loading) {
    return (
      <div className="flex justify-center py-40">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  return <EditSpecialtyForm specialtyData={specRes?.data} specialtyId={id} />;
}

function EditSpecialtyForm({ specialtyData, specialtyId }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const updateMutation = useUpdateSpecialty();
  const saving = updateMutation.isPending;
  
  // Khởi tạo form state trực tiếp từ props
  const item = specialtyData || {};
  const [form, setForm] = useState({
    name: item.tenChuyenKhoa || "",
    icon: item.icon || "medical_services",
    description: item.moTaChuyenKhoa || "",
    duration: item.thoiLuongKham || 20,
  });

  // State quản lý tệp tin ảnh và preview
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [currentImageUrl] = useState(item.anhChuyenKhoa || null);

  /**
   * Cập nhật state khi người dùng nhập liệu vào form
   */
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /**
   * Xử lý khi người dùng chọn một tệp ảnh mới
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra kích thước file (Giới hạn 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ảnh không được vượt quá 2MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Tạo URL tạm thời để hiển thị preview
    }
  };

  /**
   * Thực hiện lưu các thay đổi lên server
   */
  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.warn("Vui lòng nhập tên chuyên khoa.");
      return;
    }

    try {
      // BƯỚC 1: Cập nhật thông tin mô tả văn bản qua mutation
      await updateMutation.mutateAsync({
        id: specialtyId,
        data: {
          tenChuyenKhoa: form.name.trim(),
          icon: form.icon,
          moTaChuyenKhoa: form.description,
          thoiLuongKham: Number(form.duration) || 20,
        },
      });

      // BƯỚC 2: Nếu người dùng có chọn ảnh mới, thực hiện upload ảnh
      if (selectedFile) {
        await specialtyService.uploadAnh(specialtyId, selectedFile);
      }

      toast.success(`Cập nhật chuyên khoa "${form.name}" thành công!`);
      navigate("/admin/specialties");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật!");
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      {/* Breadcrumb dẫn hướng */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link to="/admin/specialties" className="text-slate-500 hover:text-primary transition-colors">
          Quản lý chuyên khoa
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-medium">Chỉnh sửa chuyên khoa</span>
      </div>

      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Chỉnh sửa chuyên khoa</h2>
          <p className="text-slate-500 text-sm mt-1">Cập nhật thông tin chi tiết cho chuyên khoa ID #{specialtyId}.</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest border border-slate-200">
          Chế độ chỉnh sửa
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CỘT TRÁI: Nhập liệu tên, thời lượng và mô tả */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Tên chuyên khoa <span className="text-rose-500">*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="VD: Nội tổng quát..."
                  className="w-full px-4 py-2.5 rounded-xl border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Thời lượng khám trung bình (Phút)
                </label>
                <input
                  name="duration"
                  type="number"
                  value={form.duration}
                  onChange={handleChange}
                  min={5}
                  max={120}
                  placeholder="VD: 20"
                  className="w-full px-4 py-2.5 rounded-xl border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả chuyên khoa</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={8}
                  placeholder="Nhập thông tin giới thiệu chuyên khoa..."
                  className="w-full px-4 py-2.5 rounded-xl border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: Media (Icon và Ảnh đại diện) */}
        <div className="space-y-6">
          {/* SECTION: Lựa chọn Icon Material Symbols */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
            <label className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-xl text-primary">category</span>
              Biểu tượng (Icon)
            </label>
            
            <div className="space-y-4">
              <select
                name="icon"
                value={form.icon}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Preview icon hiện tại đang chọn */}
              <div className="flex items-center justify-center p-6 bg-slate-50 border border-slate-100 rounded-2xl border-dashed">
                <div className="flex flex-col items-center gap-2">
                  <div className="size-16 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-100">
                    <span className="material-symbols-outlined text-primary text-4xl">
                      {form.icon}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: Ảnh minh họa chuyên khoa */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
            <label className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-xl text-primary">image</span>
              Ảnh chuyên khoa
            </label>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-video rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group overflow-hidden flex flex-col items-center justify-center gap-2"
            >
              {/* Thứ tự ưu tiên hiển thị: Ảnh mới chọn > Ảnh cũ trên server > Placeholder */}
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : currentImageUrl ? (
                <img src={currentImageUrl} alt="Current" className="w-full h-full object-cover" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-3xl text-slate-300 group-hover:text-primary transition-colors">add_photo_alternate</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Click tải ảnh mới</span>
                </>
              )}
              {/* Lớp overlay khi hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center uppercase text-[10px] font-bold text-white tracking-widest">
                Thay đổi ảnh
              </div>
            </div>
            {/* Input file ẩn */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Nhóm các nút điều hướng tác vụ */}
      <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3 font-sans">
        <button
          onClick={() => navigate("/admin/specialties")}
          className="w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all"
        >
          Hủy bỏ
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full sm:w-auto px-10 py-3 rounded-xl text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
            saving ? "bg-slate-300" : "bg-primary hover:bg-primary/95 shadow-primary/20"
          }`}
        >
          {saving ? (
            <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-sm">save</span>
          )}
          Cập nhật chuyên khoa
        </button>
      </div>
    </div>
  );
}

export default AdminEditSpecialtyPage;

