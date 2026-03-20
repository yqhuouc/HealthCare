const express = require("express");
const router = express.Router();
const bacSiController = require("../controllers/bacSi.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { createBacSiSchema, updateBacSiSchema } = require("../validations/bacSi.validation");

// GET /api/bac-si - Lấy danh sách bác sĩ (public)
router.get("/", bacSiController.getAll);

// GET /api/bac-si/:id - Lấy chi tiết bác sĩ (public)
router.get("/:id", bacSiController.getById);

// POST /api/bac-si - Tạo bác sĩ (admin)
router.post("/", authenticate, authorize("admin"), validate(createBacSiSchema), bacSiController.create);

// PUT /api/bac-si/:id - Cập nhật bác sĩ (admin)
router.put("/:id", authenticate, authorize("admin"), validate(updateBacSiSchema), bacSiController.update);

// DELETE /api/bac-si/:id - Xóa bác sĩ (admin)
router.delete("/:id", authenticate, authorize("admin"), bacSiController.remove);

module.exports = router;
