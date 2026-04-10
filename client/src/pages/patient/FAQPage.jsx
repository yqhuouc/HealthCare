/**
 * ============================================================
 * TRANG: Câu hỏi thường gặp - FAQ (Bệnh nhân)
 * Đường dẫn: /faqs
 * ============================================================
 *
 * Chức năng:
 * - Hiển thị danh sách FAQ dạng accordion (mở/đóng từng câu)
 * - Chỉ cho phép mở 1 câu hỏi cùng lúc (single-open accordion)
 * - Phần liên hệ hỗ trợ ở cuối trang với hotline và email
 *
 * Dữ liệu: API /api/cau-hoi-thuong-gap
 * ============================================================
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useFAQs } from "../../hooks/queries/useFAQQueries";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);
  const { data: faqRes, isLoading: loading } = useFAQs();
  const faqList = faqRes?.data || [];

  /** Toggle mở/đóng câu hỏi: click cùng index → đóng, click khác → mở cái mới */
  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (loading) {
    return (
      <section className="max-w-4xl mx-auto py-20 text-center">
        <span className="material-symbols-outlined text-5xl text-primary animate-spin">
          progress_activity
        </span>
        <p className="mt-4 text-slate-500">Đang tải câu hỏi thường gặp...</p>
      </section>
    );
  }

  return (
    <section className="max-w-4xl mx-auto py-12 px-4">
      {/* Tiêu đề trang */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-800">
          Câu hỏi thường gặp
        </h1>
        <div className="h-1.5 w-20 bg-primary rounded-full mt-3" />
        <p className="text-slate-500 mt-4">
          Tìm câu trả lời cho những thắc mắc phổ biến về dịch vụ của chúng tôi.
        </p>
      </div>

      {/* Danh sách câu hỏi dạng accordion */}
      {faqList.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-slate-300 block mb-4">
            quiz
          </span>
          <p className="text-slate-500 text-lg">
            Chưa có câu hỏi thường gặp nào.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {faqList.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={item.id || index}
                className="bg-white rounded-lg border border-slate-100 overflow-hidden"
              >
                {/* Câu hỏi */}
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50/50 transition"
                >
                  <span className="font-semibold text-slate-800 pr-4">
                    {item.cauHoi}
                  </span>
                  <span className="material-symbols-outlined text-slate-400 shrink-0 transition-transform duration-200"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  >
                    expand_more
                  </span>
                </button>

                {/* Câu trả lời — chỉ hiển thị khi mục đang mở */}
                {isOpen && (
                  <div className="px-6 pb-6 text-slate-600 text-sm leading-relaxed">
                    {item.traLoi}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Khối liên hệ hỗ trợ */}
      <div className="bg-primary/5 border border-primary/10 rounded-lg p-8 text-center mt-12">
        <h3 className="text-xl font-bold text-slate-800 mb-3">
          Vẫn còn thắc mắc?
        </h3>
        <p className="text-slate-600 text-sm mb-6">
          Liên hệ với chúng tôi qua hotline{" "}
          <span className="font-semibold text-slate-800">1900 1234</span> hoặc
          email{" "}
          <span className="font-semibold text-slate-800">
            contact@healthcare.vn
          </span>
        </p>
        <Link
          to="/contact"
          className="inline-block px-6 py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 transition"
        >
          Liên hệ hỗ trợ
        </Link>
      </div>
    </section>
  );
}
