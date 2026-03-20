const { asyncHandler } = require("../middlewares/error.middleware");
const thongKeService = require("../services/thongKe.service");

const tongQuan = asyncHandler(async (req, res) => {
  const data = await thongKeService.tongQuan();
  res.json({ success: true, data });
});

const thongKeLichHen = asyncHandler(async (req, res) => {
  const data = await thongKeService.thongKeLichHen(req.query);
  res.json({ success: true, data });
});

module.exports = { tongQuan, thongKeLichHen };
