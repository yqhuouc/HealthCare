/**
 * Wrap async controller để tự động bắt lỗi, không cần try-catch ở mỗi hàm.
 * Dùng: router.get("/path", asyncHandler(controller.method))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
