/**
 * Routes /api/benh-nhan — admin xem danh sách; cập nhật hồ sơ có kiểm tra quyền.
 */
const express = require("express");
const router = express.Router();
const benhNhanController = require("../controllers/benhNhan.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { updateBenhNhanSchema, createBenhNhanSchema } = require("../validations/benhNhan.validation");

// GET /api/benh-nhan - Lấy danh sách bệnh nhân (admin)
router.get("/", authenticate, authorize("admin"), benhNhanController.getAll);

// POST /api/benh-nhan - Tạo bệnh nhân mới (admin)
router.post("/", authenticate, authorize("admin"), validate(createBenhNhanSchema), benhNhanController.create);

// GET /api/benh-nhan/:id - Lấy chi tiết bệnh nhân
router.get("/:id", authenticate, authorize("admin", "benh_nhan"), benhNhanController.getById);

// PUT /api/benh-nhan/:id - Cập nhật thông tin bệnh nhân
router.put("/:id", authenticate, authorize("admin", "benh_nhan"), validate(updateBenhNhanSchema), benhNhanController.update);

// DELETE /api/benh-nhan/:id - Xóa bệnh nhân (admin)
router.delete("/:id", authenticate, authorize("admin"), benhNhanController.remove);

module.exports = router;
