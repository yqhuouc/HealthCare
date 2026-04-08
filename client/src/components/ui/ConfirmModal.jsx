import React from 'react';

/**
 * ConfirmModal - Component xác nhận hành động quan trọng (Xóa, Hủy...)
 * Thiết kế sạch sẽ, đứng đắn, phù hợp phong cách đồ án tốt nghiệp.
 */
const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Xác nhận hành động", 
  message = "Bạn có chắc chắn muốn thực hiện hành động này? Không thể hoàn tác.",
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy bỏ",
  type = "danger" // 'danger' | 'warning' | 'primary'
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
    }
  };

  const config = typeConfig[type] || typeConfig.danger;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${config.iconBg}`}>
              <span className={`material-symbols-outlined text-2xl ${config.iconColor}`}>
                {config.icon}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                {title}
              </h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50/50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2 text-sm font-bold text-white rounded-xl transition-all shadow-lg ${config.btnBg}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
