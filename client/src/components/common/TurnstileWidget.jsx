import { Turnstile } from "@marsidev/react-turnstile";

/**
 * TurnstileWidget - Component dùng chung để hiển thị Cloudflare Turnstile
 * 
 * @param {Function} onVerify - Callback trả về token sau khi xác thực thành công
 * @param {Function} onError - Callback khi có lỗi xảy ra
 * @param {Function} onExpire - Callback khi token hết hạn
 * @param {string} theme - 'light' | 'dark' | 'auto'
 */
const TurnstileWidget = ({ 
  onVerify, 
  onError, 
  onExpire, 
  theme = "light" 
}) => {
  // Ưu tiên dùng Site Key từ .env, fallback về mã Testing ổn định cho local dev
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || "3x00000000000000000000FF";

  return (
    <div className="flex justify-center py-2 min-h-[65px] transition-all duration-300">
      <Turnstile
        siteKey={siteKey}
        onSuccess={(token) => onVerify?.(token)}
        onError={(err) => {
          onVerify?.(""); // Reset token
          onError?.(err);
        }}
        onExpire={() => {
          onVerify?.(""); // Reset token
          onExpire?.();
        }}
        options={{ theme }}
      />
    </div>
  );
};

export default TurnstileWidget;
