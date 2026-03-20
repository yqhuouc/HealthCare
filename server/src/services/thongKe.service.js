/**
 * ThongKe Service - Dashboard & Thống kê cho Admin
 */
const prisma = require("../utils/prisma");

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

  // Tính tổng doanh thu (lịch đã khám)
  const doanhThu = await prisma.datLich.aggregate({
    where: { trangThai: 2 },
    _sum: { giaKham: true },
  });

  return {
    tongBenhNhan,
    tongBacSi,
    tongLichHen,
    tongChuyenKhoa,
    doanhThu: doanhThu._sum.giaKham || 0,
    lichHenTheoTrangThai: lichHenTheoTrangThai.map((item) => ({
      trangThai: item.trangThai,
      soLuong: item._count.id,
    })),
  };
};

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

  // Lấy tên bác sĩ
  const bacSiIds = lichHenTheoBacSi.map((item) => item.bacSiId).filter(Boolean);
  const bacSis = await prisma.bacSi.findMany({
    where: { id: { in: bacSiIds } },
    select: { id: true, tenBacSi: true },
  });

  const bacSiMap = new Map(bacSis.map((bs) => [Number(bs.id), bs.tenBacSi]));

  return {
    lichHenTheoNgay: lichHenTheoNgay.map((item) => ({
      ngay: item.ngayDat,
      soLuong: item._count.id,
    })),
    lichHenTheoBacSi: lichHenTheoBacSi.map((item) => ({
      bacSiId: item.bacSiId,
      tenBacSi: bacSiMap.get(Number(item.bacSiId)) || "Unknown",
      soLuong: item._count.id,
    })),
  };
};

module.exports = { tongQuan, thongKeLichHen };
