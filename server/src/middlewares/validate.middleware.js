/**
 * Middleware validate request body với Zod schema.
 * Sử dụng: router.post("/", validate(schema), controller)
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
