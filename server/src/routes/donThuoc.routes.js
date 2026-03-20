const express = require("express");
const router = express.Router();
const donThuocController = require("../controllers/donThuoc.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { createDonThuocSchema } = require("../validations/donThuoc.validation");

// GET /api/don-thuoc - Lấy tất cả đơn thuốc (admin, bác sĩ)
router.get("/", authenticate, authorize("admin", "bac_si"), donThuocController.getAll);

// GET /api/don-thuoc/:id - Lấy chi tiết đơn thuốc
router.get("/:id", authenticate, donThuocController.getById);

// POST /api/don-thuoc - Tạo đơn thuốc (bác sĩ)
router.post("/", authenticate, authorize("bac_si"), validate(createDonThuocSchema), donThuocController.create);

// DELETE /api/don-thuoc/:id - Xóa đơn thuốc (admin)
router.delete("/:id", authenticate, authorize("admin"), donThuocController.remove);

module.exports = router;
