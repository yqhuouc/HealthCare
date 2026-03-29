/**
 * Gom số liệu dashboard: count entity, doanh thu kép (phí khám & phí thuốc), biểu đồ theo thời gian.
 */
const prisma = require("../utils/prisma");

// 1. GET /api/thong-ke/tong-quan
const tongQuan = async () => {
  const [tongBenhNhan, tongBacSi, tongLichHen, tongChuyenKhoa, lichHenTheoTrangThai] = await Promise.all([
    prisma.benhNhan.count(),
    prisma.bacSi.count(),
    prisma.datLich.count(),
    prisma.chuyenKhoa.count(),
    prisma.datLich.groupBy({
      by: ["trangThai"],
      _count: { id: true },
    }),
  ]);

  // Doanh thu khám: Những lịch hẹn đã thành toán phí (trangThaiThanhToan >= 1)
  const doanhThuKhamAgg = await prisma.datLich.aggregate({
    where: { trangThaiThanhToan: { gte: 1 } },
    _sum: { giaKham: true },
  });
  const doanhThuKham = Number(doanhThuKhamAgg._sum.giaKham || 0);

  // Doanh thu thuốc: Lấy từ Đơn Thuốc của những lịch đã thanh toán toàn bộ (trangThaiThanhToan == 2)
  const datLichThanhToanThuoc = await prisma.datLich.findMany({
    where: { trangThaiThanhToan: 2 },
    select: { id: true }
  });
  const datLichIds = datLichThanhToanThuoc.map(dl => dl.id);
  
  let doanhThuThuoc = 0;
  if (datLichIds.length > 0) {
    const aggThuoc = await prisma.donThuoc.aggregate({
      where: { datLichId: { in: datLichIds } },
      _sum: { tongTien: true }
    });
    doanhThuThuoc = Number(aggThuoc._sum.tongTien || 0);
  }

  return {
    tongBenhNhan,
    tongBacSi,
    tongLichHen,
    tongChuyenKhoa,
    doanhThuKham,
    doanhThuThuoc,
    tongDoanhThu: doanhThuKham + doanhThuThuoc,
    lichHenTheoTrangThai: lichHenTheoTrangThai.map((item) => ({
      trangThai: item.trangThai,
      soLuong: item._count.id,
    })),
  };
};

// 2. GET /api/thong-ke/lich-hen
const thongKeLichHen = async ({ tuNgay, denNgay }) => {
  const where = {};
  if (tuNgay && denNgay) {
    where.ngayDat = {
      gte: new Date(tuNgay),
      lte: new Date(denNgay),
    };
  }

  const lichHenTheoNgay = await prisma.datLich.groupBy({
    by: ["ngayDat"],
    where,
    _count: { id: true },
    orderBy: { ngayDat: "asc" },
  });

  const lichHenTheoBacSi = await prisma.datLich.groupBy({
    by: ["bacSiId"],
    where,
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  });

  const bacSiIds = lichHenTheoBacSi.map((item) => item.bacSiId).filter(Boolean);
  const bacSiList = await prisma.bacSi.findMany({
    where: { id: { in: bacSiIds } },
    select: { id: true, tenBacSi: true },
  });

  const bacSiMap = new Map(bacSiList.map((bs) => [Number(bs.id), bs.tenBacSi]));

  return {
    lichHenTheoNgay: lichHenTheoNgay.map((item) => ({
      ngay: item.ngayDat,
      soLuong: item._count.id,
    })),
    lichHenTheoBacSi: lichHenTheoBacSi.map((item) => ({
      bacSiId: item.bacSiId,
      tenBacSi: bacSiMap.get(Number(item.bacSiId)) || "Không xác định",
      soLuong: item._count.id,
    })),
  };
};

// 3. GET /api/thong-ke/doanh-thu (Theo tháng trong năm)
const thongKeDoanhThuTheoThang = async (nam) => {
  const year = Number(nam) || new Date().getFullYear();
  const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
  const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

  // Lấy toàn bộ lịch hẹn có thanh toán trong năm nay để gom nhóm
  const datLichs = await prisma.datLich.findMany({
    where: {
      ngayDat: { gte: startDate, lte: endDate },
      trangThaiThanhToan: { gte: 1 },
    },
    include: {
      donThuoc: { select: { tongTien: true } }
    }
  });

  // Khởi tạo mảng 12 tháng
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    thang: i + 1,
    doanhThuKham: 0,
    doanhThuThuoc: 0,
    tongDoanhThu: 0,
  }));

  datLichs.forEach(dl => {
    const month = dl.ngayDat.getMonth(); // 0-based
    
    // Cộng doanh thu khám
    const giaKham = Number(dl.giaKham || 0);
    monthlyData[month].doanhThuKham += giaKham;

    // Cộng doanh thu thuốc nếu đã thanh toán đơn (trangThaiThanhToan == 2)
    if (dl.trangThaiThanhToan === 2 && dl.donThuoc) {
      const tienThuoc = Number(dl.donThuoc.tongTien || 0);
      monthlyData[month].doanhThuThuoc += tienThuoc;
    }

    // Tính tổng
    monthlyData[month].tongDoanhThu = monthlyData[month].doanhThuKham + monthlyData[month].doanhThuThuoc;
  });

  return {
    nam: year,
    thongKeThang: monthlyData
  };
};

module.exports = { tongQuan, thongKeLichHen, thongKeDoanhThuTheoThang };
