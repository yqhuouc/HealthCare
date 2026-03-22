/**
 * Helper JSON thủ công khi không dùng trực tiếp AppError (hoặc endpoint trả format tùy biến).
 * Thường dự án dùng errorHandler + res.json trong controller; giữ để tái sử dụng.
 */

// res.status + { success: true, message, data }
const sendSuccess = (res, data = null, message = "Thành công", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// res.status + { success: false, message } (+ errors nếu có)
const sendError = (res, message = "Có lỗi xảy ra", statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
  };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendError };
