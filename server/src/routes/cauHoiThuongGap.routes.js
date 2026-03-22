/**
 * Routes /api/cau-hoi-thuong-gap — FAQ public + CRUD admin.
 */
const express = require("express");
const router = express.Router();
const cauHoiThuongGapController = require("../controllers/cauHoiThuongGap.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { cauHoiThuongGapSchema } = require("../validations/cauHoiThuongGap.validation");

// GET /api/cau-hoi-thuong-gap - Lấy FAQ đang hoạt động (public)
router.get("/", cauHoiThuongGapController.getActive);

// GET /api/cau-hoi-thuong-gap/all - Lấy tất cả FAQ (admin)
router.get("/all", authenticate, authorize("admin"), cauHoiThuongGapController.getAll);

// GET /api/cau-hoi-thuong-gap/:id - Lấy chi tiết FAQ
router.get("/:id", cauHoiThuongGapController.getById);

// POST /api/cau-hoi-thuong-gap - Tạo FAQ (admin)
router.post("/", authenticate, authorize("admin"), validate(cauHoiThuongGapSchema), cauHoiThuongGapController.create);

// PUT /api/cau-hoi-thuong-gap/:id - Cập nhật FAQ (admin)
router.put("/:id", authenticate, authorize("admin"), validate(cauHoiThuongGapSchema), cauHoiThuongGapController.update);

// DELETE /api/cau-hoi-thuong-gap/:id - Xóa FAQ (admin)
router.delete("/:id", authenticate, authorize("admin"), cauHoiThuongGapController.remove);

module.exports = router;
