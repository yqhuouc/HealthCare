/**
 * Factory validate(schema): chạy Zod parse(req.body), gán lại req.body đã chuẩn hóa.
 * Lỗi Zod → AppError 400 với message ghép từ từng field.
 */
const { AppError } = require("./error.middleware");

const validate = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error.errors) {
        const message = error.errors.map((err) => err.message).join(", ");
        return next(new AppError(message, 400));
      }
      next(error);
    }
  };
};

module.exports = { validate };
