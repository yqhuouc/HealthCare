const express = require("express");
const router = express.Router();
const hinhThucThanhToanController = require("../controllers/hinhThucThanhToan.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { hinhThucThanhToanSchema } = require("../validations/hinhThucThanhToan.validation");

// GET /api/hinh-thuc-thanh-toan - Lấy danh sách (public)
router.get("/", hinhThucThanhToanController.getAll);

// POST /api/hinh-thuc-thanh-toan - Tạo mới (admin)
router.post("/", authenticate, authorize("admin"), validate(hinhThucThanhToanSchema), hinhThucThanhToanController.create);

// DELETE /api/hinh-thuc-thanh-toan/:id - Xóa (admin)
router.delete("/:id", authenticate, authorize("admin"), hinhThucThanhToanController.remove);

module.exports = router;
