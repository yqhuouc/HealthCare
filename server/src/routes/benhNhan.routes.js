const express = require("express");
const router = express.Router();
const benhNhanController = require("../controllers/benhNhan.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { updateBenhNhanSchema } = require("../validations/benhNhan.validation");

// GET /api/benh-nhan - Lấy danh sách bệnh nhân (admin)
router.get("/", authenticate, authorize("admin"), benhNhanController.getAll);

// GET /api/benh-nhan/:id - Lấy chi tiết bệnh nhân
router.get("/:id", authenticate, benhNhanController.getById);

// PUT /api/benh-nhan/:id - Cập nhật thông tin bệnh nhân
router.put("/:id", authenticate, validate(updateBenhNhanSchema), benhNhanController.update);

// DELETE /api/benh-nhan/:id - Xóa bệnh nhân (admin)
router.delete("/:id", authenticate, authorize("admin"), benhNhanController.remove);

module.exports = router;
