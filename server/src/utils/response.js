/**
 * Helper tạo response JSON chuẩn cho toàn bộ API.
 * Format: { success, message, data }
 */

const sendSuccess = (res, data = null, message = "Thành công", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, message = "Có lỗi xảy ra", statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
  };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendError };
