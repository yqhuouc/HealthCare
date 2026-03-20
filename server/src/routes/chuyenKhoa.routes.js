const express = require("express");
const router = express.Router();
const chuyenKhoaController = require("../controllers/chuyenKhoa.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { chuyenKhoaSchema } = require("../validations/chuyenKhoa.validation");

// GET /api/chuyen-khoa - Lấy tất cả chuyên khoa (public)
router.get("/", chuyenKhoaController.getAll);

// GET /api/chuyen-khoa/:id - Lấy chi tiết (public)
router.get("/:id", chuyenKhoaController.getById);

// POST /api/chuyen-khoa - Tạo mới (admin)
router.post("/", authenticate, authorize("admin"), validate(chuyenKhoaSchema), chuyenKhoaController.create);

// PUT /api/chuyen-khoa/:id - Cập nhật (admin)
router.put("/:id", authenticate, authorize("admin"), validate(chuyenKhoaSchema), chuyenKhoaController.update);

// DELETE /api/chuyen-khoa/:id - Xóa (admin)
router.delete("/:id", authenticate, authorize("admin"), chuyenKhoaController.remove);

module.exports = router;
