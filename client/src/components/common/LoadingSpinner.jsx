import React from "react";

/**
 * LoadingSpinner — Thành phần vòng xoay tải dữ liệu cao cấp bằng SVG.
 * @param {string} size - Kích thước của spinner (mặc định: 'size-10')
 * @param {string} color - Màu sắc của spinner (mặc định: 'text-primary')
 * @param {string} className - Các class tailwind bổ sung (nếu có)
 */
function LoadingSpinner({ size = "size-10", color = "text-primary", className = "" }) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg
        className={`animate-spin ${size} ${color}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
}

export default LoadingSpinner;
