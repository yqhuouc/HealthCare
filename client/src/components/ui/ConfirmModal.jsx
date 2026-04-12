import React from 'react';

/**
 * ConfirmModal - Component xác nhận hành động quan trọng (Xóa, Hủy...)
 * Thiết kế sạch sẽ, đứng đắn, phù hợp phong cách đồ án tốt nghiệp.
 * Đã tối ưu Responsive & Glassmorphism.
 */
const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Xác nhận hành động", 
  message = "Bạn có chắc chắn muốn thực hiện hành động này? Không thể hoàn tác.",
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy bỏ",
  type = "danger", // 'danger' | 'warning' | 'primary' | 'success'
  isLoading = false
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: "delete_forever",
      iconColor: "text-rose-600",
      iconBg: "bg-rose-50",
      btnBg: "bg-rose-600 hover:bg-rose-700 shadow-rose-200",
    },
    warning: {
      icon: "warning",
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
      btnBg: "bg-amber-600 hover:bg-amber-700 shadow-amber-200",
    },
    primary: {
      icon: "help",
      iconColor: "text-primary",
      iconBg: "bg-blue-50",
      btnBg: "bg-primary hover:bg-primary/90 shadow-blue-200",
    },
    success: {
       icon: "check_circle",
       iconColor: "text-emerald-600",
       iconBg: "bg-emerald-50",
       btnBg: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200",
    }
  };

  const config = typeConfig[type] || typeConfig.danger;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6 ml-0">
      {/* Backdrop: Glassmorphism effect */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in" 
        onClick={!isLoading ? onClose : undefined}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-[400px] rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            {/* Pulsing Icon Container */}
            <div className={`size-16 rounded-2xl flex items-center justify-center mb-6 ring-8 ${config.iconBg} ring-white shadow-inner animate-pulse-subtle`}>
              <span className={`material-symbols-outlined text-3xl font-bold ${config.iconColor}`}>
                {config.icon}
              </span>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-tight">
              {title}
            </h3>
            <p className="text-sm text-slate-500 mt-3 leading-relaxed font-medium">
              {message}
            </p>
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="bg-slate-50/80 px-6 py-5 flex flex-col sm:flex-row items-center justify-center gap-3 border-t border-slate-100">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-all rounded-xl hover:bg-slate-100 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full sm:w-auto px-8 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 ${config.btnBg}`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang xử lý...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ConfirmModal;
