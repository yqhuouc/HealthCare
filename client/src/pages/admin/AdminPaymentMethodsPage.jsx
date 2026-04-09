import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { paymentService } from "../../services/paymentService";

/**
 * Trang AdminPaymentMethodsPage - Quản lý các hình thức thanh toán (Admin)
 * Chức năng: 
 * - Hiển thị danh sách các phương thức thanh toán đang hoạt động.
 * - Cho phép thêm mới hình thức thanh toán.
 * - Cho phép xóa các hình thức thanh toán không còn sử dụng.
 */
function AdminPaymentMethodsPage() {
  // State quản lý dữ liệu danh sách và trạng thái ứng dụng
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // State cho form thêm phương thức mới
  const [newMethod, setNewMethod] = useState({ tenHinhThuc: "", moTa: "" });

  /**
   * Hàm lấy danh sách hình thức thanh toán từ Server
   * Sử dụng useCallback để định nghĩa hàm ổn định cho useEffect
   */
  const fetchMethods = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentService.getAll();
      if (res.success) setMethods(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi tải danh sách hình thức thanh toán");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Tự động tải dữ liệu khi component được mount lần đầu
   */
  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  /**
   * Xử lý gửi Form tạo mới hình thức thanh toán
   */
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await paymentService.create(newMethod);
      if (res.success) {
        toast.success("Thêm hình thức thanh toán thành công");
        setNewMethod({ tenHinhThuc: "", moTa: "" }); // Reset form
        setShowAddModal(false); // Đóng modal
        fetchMethods(); // Tải lại danh sách cập nhật
      }
    } catch (error) {
      toast.error(error.message || "Lỗi khi tạo hình thức thanh toán");
    }
  };

  /**
   * Xử lý xóa hình thức thanh toán theo ID
   * Có yêu cầu xác nhận từ phái người dùng
   */
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa hình thức thanh toán này?")) return;
    try {
      const res = await paymentService.remove(id);
      if (res.success) {
        toast.success("Xóa thành công");
        fetchMethods(); // Tải lại danh sách sau khi xóa
      }
    } catch (error) {
       toast.error(error.message || "Lỗi khi xóa hình thức thanh toán");
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER: Tiêu đề và Nút hành động */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Hình thức thanh toán</h2>
          <p className="text-slate-500">Quản lý các phương thức thanh toán khả dụng cho bệnh nhân</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-xl">payments</span>
          Thêm hình thức
        </button>
      </div>

      {/* GRID: Hiển thị danh sách các card hình thức thanh toán */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Hiển thị icon xoay khi đang tải
          <div className="col-span-full py-20 text-center text-primary animate-spin">
            <span className="material-symbols-outlined text-5xl">progress_activity</span>
          </div>
        ) : methods.length === 0 ? (
          // Hiển thị khi danh sách trống
          <div className="col-span-full py-20 text-center text-slate-400 italic">Chưa có hình thức thanh toán nào</div>
        ) : methods.map((method) => (
          <div key={method.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all group">
            <div className="flex justify-between items-start mb-4">
              {/* Icon đại diện cho hình thức */}
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
              </div>
              {/* Nút Xóa bản ghi */}
              <button
                onClick={() => handleDelete(method.id)}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
              >
                <span className="material-symbols-outlined text-xl">delete</span>
              </button>
            </div>
            {/* Tên và Mô tả hình thức */}
            <h3 className="text-lg font-bold text-slate-900 mb-2">{method.tenHinhThuc}</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2" title={method.moTa}>
              {method.moTa || "Không có mô tả chi tiết."}
            </p>
            {/* Trạng thái mặc định là Hoạt động */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đang hoạt động</span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Form nhập thông tin thêm mới hình thức thanh toán */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Tiêu đề Modal */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Thêm hình thức mới</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {/* Form nhập liệu */}
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Tên hình thức</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Chuyển khoản, VNPay..."
                  value={newMethod.tenHinhThuc}
                  onChange={(e) => setNewMethod({ ...newMethod, tenHinhThuc: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Mô tả</label>
                <textarea
                  placeholder="Mô tả ngắn gọn về phương thức này"
                  rows="3"
                  value={newMethod.moTa}
                  onChange={(e) => setNewMethod({ ...newMethod, moTa: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                />
              </div>
              {/* Nút điều hướng trong Modal */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                  Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPaymentMethodsPage;
