import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { specialtyService } from "../../services/specialtyService";

// Danh sách các biểu tượng (icon) được hỗ trợ cho chuyên khoa
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
 * Trang AdminAddSpecialtyPage - Thêm mới một chuyên khoa khám bệnh
 * Cho phép nhập tên, icon, mô tả và tải lên ảnh đại diện cho chuyên khoa.
 */
function AdminAddSpecialtyPage() {
  const navigate = useNavigate();
  // Ref để tham chiếu đến thẻ input file ẩn
  const fileInputRef = useRef(null);
  
  // Trạng thái xử lý gửi dữ liệu
  const [loading, setLoading] = useState(false);
  
  // State quản lý thông tin cơ bản của chuyên khoa
  const [form, setForm] = useState({
    name: "",
    icon: "medical_services",
    description: "",
    duration: 20, // Thời gian khám mặc định là 20 phút
  });
  
  // State quản lý tệp tin ảnh và URL xem trước
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  /**
   * Cập nhật state form khi các trường input thay đổi
   * @param {Object} e - Event thay đổi
   */
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /**
   * Xử lý khi người dùng chọn tệp tin ảnh
   * @param {Object} e - Event chọn file
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra dung lượng file (tối đa 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ảnh không được vượt quá 2MB");
        return;
      }
      setSelectedFile(file);
      // Tạo URL tạm thời để hiển thị ảnh xem trước
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  /**
   * Gửi dữ liệu chuyên khoa mới lên server
   */
  const handleSave = async () => {
    // Validate tên chuyên khoa
    if (!form.name.trim()) {
      toast.warn("Vui lòng nhập tên chuyên khoa.");
      return;
    }
    
    setLoading(true);
    try {
      // 1. Tạo record chuyên khoa trong cơ sở dữ liệu
      const createRes = await specialtyService.create({
        tenChuyenKhoa: form.name.trim(),
        icon: form.icon,
        moTaChuyenKhoa: form.description,
        thoiLuongKham: Number(form.duration) || 20,
      });

      // 2. Nếu tạo thành công và có chọn ảnh, tiến hành tải ảnh lên server
      if (selectedFile && createRes.success) {
        const specialtyId = createRes.data.id;
        await specialtyService.uploadAnh(specialtyId, selectedFile);
      }

      toast.success(`Đã thêm chuyên khoa "${form.name}" thành công!`);
      // Quay lại trang danh sách chuyên khoa
      navigate("/admin/specialties");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi thêm chuyên khoa!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      {/* Breadcrumb điều hướng */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link to="/admin/specialties" className="text-slate-500 hover:text-primary transition-colors">
          Quản lý chuyên khoa
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-medium">Thêm chuyên khoa mới</span>
      </div>

      {/* Tiêu đề trang */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Thêm chuyên khoa mới</h2>
        <p className="text-slate-500 text-sm mt-1">Khởi tạo danh mục chuyên khoa mới vào hệ thống quản lý.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: Form nhập thông tin chi tiết */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Tên chuyên khoa */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Tên chuyên khoa <span className="text-rose-500">*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="VD: Nội tổng quát, Răng Hàm Mặt..."
                  className="w-full px-4 py-2.5 rounded-xl border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Thời gian khám */}
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

              {/* Mô tả */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả chuyên khoa</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Nhập thông tin giới thiệu, phạm vi chuyên môn của khoa..."
                  className="w-full px-4 py-2.5 rounded-xl border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải: Chọn Icon và Tải ảnh */}
        <div className="space-y-6">
          {/* Section: Chọn Icon */}
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

              {/* Hiển thị icon xem trước */}
              <div className="flex items-center justify-center p-6 bg-slate-50 border border-slate-100 rounded-2xl border-dashed">
                <div className="flex flex-col items-center gap-2">
                  <div className="size-16 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-100">
                    <span className="material-symbols-outlined text-primary text-4xl">
                      {form.icon}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Xem trước icon</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Khu vực tải ảnh chuyên khoa */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
            <label className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-xl text-primary">image</span>
              Ảnh chuyên khoa
            </label>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-video rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group overflow-hidden flex flex-col items-center justify-center gap-2"
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center uppercase text-[10px] font-bold text-white tracking-widest">
                    Thay đổi ảnh
                  </div>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-3xl text-slate-300 group-hover:text-primary transition-colors">add_photo_alternate</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Click để chọn ảnh</span>
                </>
              )}
            </div>
            {/* Input file ẩn bên dưới để kích hoạt khi click vào khung preview */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <p className="text-[10px] text-slate-400 mt-3 italic font-medium">Hỗ trợ JPG, PNG, WEBP. Dung lượng tối đa 2MB.</p>
          </div>
        </div>
      </div>

      {/* Khu vực nút bấm Hủy và Lưu */}
      <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
        <button
          onClick={() => navigate("/admin/specialties")}
          className="w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all font-sans"
        >
          Hủy bỏ
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className={`w-full sm:w-auto px-10 py-3 rounded-xl text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
            loading ? "bg-slate-300 cursor-not-allowed" : "bg-primary hover:bg-primary/95 shadow-primary/20"
          }`}
        >
          {loading ? (
            <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-sm">check_circle</span>
          )}
          Tạo chuyên khoa
        </button>
      </div>
    </div>
  );
}

export default AdminAddSpecialtyPage;

