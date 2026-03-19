/**
 * ============================================================
 * TRANG: 404 - Không tìm thấy trang
 * Đường dẫn: * (bất kỳ URL không khớp route nào)
 * ============================================================
 *
 * Chức năng:
 * - Hiển thị thông báo lỗi 404 khi người dùng truy cập URL không tồn tại
 * - Nút "Về trang chủ" để quay lại trang chính
 * ============================================================
 */
import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-300 mb-4">404</h1>
        <p className="text-xl text-slate-600 mb-8">
          Trang bạn tìm không tồn tại.
        </p>
        <Link
          to="/"
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-bold"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
