const express = require("express");
const router = express.Router();
const cauHoiThuongGapController = require("../controllers/cauHoiThuongGap.controller");
const { cauHoiThuongGapValidator } = require("../validators/cauHoiThuongGap.validator");
const validate = require("../middlewares/validate");
const { authenticate, authorize } = require("../middlewares/auth");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/cau-hoi-thuong-gap - Lấy FAQ đang hoạt động (public)
router.get("/", asyncHandler(cauHoiThuongGapController.getActive));

// GET /api/cau-hoi-thuong-gap/all - Lấy tất cả FAQ kể cả ẩn (admin)
router.get("/all", authenticate, authorize("admin"), asyncHandler(cauHoiThuongGapController.getAll));

// GET /api/cau-hoi-thuong-gap/:id - Lấy chi tiết FAQ
router.get("/:id", asyncHandler(cauHoiThuongGapController.getById));

// POST /api/cau-hoi-thuong-gap - Tạo FAQ mới (admin)
router.post("/", authenticate, authorize("admin"), cauHoiThuongGapValidator, validate, asyncHandler(cauHoiThuongGapController.create));

// PUT /api/cau-hoi-thuong-gap/:id - Cập nhật FAQ (admin)
router.put("/:id", authenticate, authorize("admin"), cauHoiThuongGapValidator, validate, asyncHandler(cauHoiThuongGapController.update));

// DELETE /api/cau-hoi-thuong-gap/:id - Xóa FAQ (admin)
router.delete("/:id", authenticate, authorize("admin"), asyncHandler(cauHoiThuongGapController.remove));

module.exports = router;
