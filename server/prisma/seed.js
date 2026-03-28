/**
 * ============================================================
 * SEED DATA - Dữ liệu mẫu ban đầu (Đã đơn giản hóa)
 * ============================================================
 * Chạy: npx prisma db seed
 * Hoặc: npm run setup
 *
 * Tạo: admin, chuyên khoa, bác sĩ, khung giờ (3 ca), lịch mẫu, thanh toán, FAQ
 * ============================================================
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// BigInt serialize fix (cần thiết cho Prisma khi trả về JSON)
BigInt.prototype.toJSON = function () {
  return Number(this);
};

async function main() {
  console.log("🌱 Bắt đầu làm sạch và seed dữ liệu...\n");

  // ===== 0. XÓA DỮ LIỆU CŨ (Tránh lỗi trùng lặp) =====
  await prisma.chiTietDonThuoc.deleteMany({});
  await prisma.donThuoc.deleteMany({});
  await prisma.datLich.deleteMany({});
  await prisma.lichLamViecBacSi.deleteMany({});
  await prisma.khungGio.deleteMany({});
  await prisma.bacSi.deleteMany({});
  await prisma.benhNhan.deleteMany({});
  await prisma.chuyenKhoa.deleteMany({});
  await prisma.cauHoiThuongGap.deleteMany({});
  await prisma.hinhThucThanhToan.deleteMany({});
  
  // Không xóa TaiKhoan Admin, chỉ xóa các TaiKhoan vaiTro khác
  await prisma.taiKhoan.deleteMany({ where: { vaiTro: { not: "admin" } } });

  console.log("🧹 Đã làm sạch dữ liệu cũ.");

  // ===== 1. TẠO TÀI KHOẢN ADMIN =====
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.taiKhoan.upsert({
    where: { email: "admin@clinic.vn" },
    update: {},
    create: {
      email: "admin@clinic.vn",
      matKhau: adminPassword,
      vaiTro: "admin",
      trangThaiTaiKhoan: 1,
      gioiTinh: 1,
    },
  });
  console.log("✅ Tài khoản admin: admin@clinic.vn / admin123");

  // ===== 2. TẠO CHUYÊN KHOA =====
  const chuyenKhoaData = [
    { tenChuyenKhoa: "Tim mạch", thoiLuongKham: 30 },
    { tenChuyenKhoa: "Thần kinh", thoiLuongKham: 30 },
    { tenChuyenKhoa: "Da liễu", thoiLuongKham: 20 },
    { tenChuyenKhoa: "Nhi khoa", thoiLuongKham: 20 },
    { tenChuyenKhoa: "Tai Mũi Họng", thoiLuongKham: 15 },
    { tenChuyenKhoa: "Mắt", thoiLuongKham: 15 },
    { tenChuyenKhoa: "Răng Hàm Mặt", thoiLuongKham: 20 },
    { tenChuyenKhoa: "Sản phụ khoa", thoiLuongKham: 30 },
  ];

  const chuyenKhoas = [];
  for (const ck of chuyenKhoaData) {
    const created = await prisma.chuyenKhoa.create({ data: ck });
    chuyenKhoas.push(created);
  }
  console.log(`✅ Tạo ${chuyenKhoas.length} chuyên khoa`);

  // ===== 3. TẠO BÁC SĨ =====
  const bacSiData = [
    { tenBacSi: "Nguyễn Văn An", hocViChucDanh: "PGS.TS", giaKham: 500000, chuyenKhoaIdx: 0 },
    { tenBacSi: "Trần Thị Bình", hocViChucDanh: "ThS.BS", giaKham: 350000, chuyenKhoaIdx: 1 },
    { tenBacSi: "Lê Hoàng Cường", hocViChucDanh: "TS.BS", giaKham: 450000, chuyenKhoaIdx: 2 },
    { tenBacSi: "Phạm Minh Đức", hocViChucDanh: "BS.CKI", giaKham: 300000, chuyenKhoaIdx: 3 },
  ];

  const doctors = [];
  for (let i = 0; i < bacSiData.length; i++) {
    const bs = bacSiData[i];
    const email = `bacsi${i + 1}@clinic.vn`;
    const hashedPw = await bcrypt.hash("doctor123", 10);

    const taiKhoan = await prisma.taiKhoan.create({
      data: {
        email,
        matKhau: hashedPw,
        vaiTro: "bac_si",
        trangThaiTaiKhoan: 1,
        gioiTinh: i % 2 === 0 ? 1 : 2,
      },
    });

    const createdBs = await prisma.bacSi.create({
      data: {
        tenBacSi: bs.tenBacSi,
        hocViChucDanh: bs.hocViChucDanh,
        moTaNgan: `Bác sĩ ${bs.tenBacSi} - chuyên môn giỏi, tận tâm.`,
        giaKham: bs.giaKham,
        taiKhoanId: taiKhoan.id,
        chuyenKhoaId: chuyenKhoas[bs.chuyenKhoaIdx].id,
      },
    });
    doctors.push(createdBs);
  }
  console.log(`✅ Tạo ${bacSiData.length} bác sĩ (bác sĩ 1 đến 4)`);

  // ===== 4. TẠO BỆNH NHÂN MẪU =====
  const benhNhanPassword = await bcrypt.hash("patient123", 10);
  const bnAccount = await prisma.taiKhoan.create({
    data: {
      email: "benhnhan@gmail.com",
      matKhau: benhNhanPassword,
      vaiTro: "benh_nhan",
      trangThaiTaiKhoan: 1,
      gioiTinh: 1,
      ngaySinh: new Date("1995-05-15"),
      diaChi: "Hà Nội",
    },
  });

  await prisma.benhNhan.create({
    data: {
      hoTen: "Nguyễn Bệnh Nhân",
      soDienThoai: "0912345678",
      emailLienHe: "benhnhan@gmail.com",
      taiKhoanId: bnAccount.id,
    },
  });
  console.log("✅ Tài khoản bệnh nhân: benhnhan@gmail.com / patient123");

  // ===== 5. TẠO KHUNG GIỜ (CA LÀM VIỆC) =====
  // Sử dụng offset +07:00 để lưu đúng giờ Việt Nam (Khi format ra sẽ khớp hoàn toàn)
  const khungGioData = [
    { gioBatDau: "07:00", gioKetThuc: "11:00", label: "Ca Sáng" },
    { gioBatDau: "13:00", gioKetThuc: "17:00", label: "Ca Chiều" },
    { gioBatDau: "18:00", gioKetThuc: "21:00", label: "Ca Tối" },
  ];

  const khungGios = [];
  for (const kg of khungGioData) {
    const created = await prisma.khungGio.create({
      data: {
        gioBatDau: new Date(`2000-01-01T${kg.gioBatDau}:00.000+07:00`),
        gioKetThuc: new Date(`2000-01-01T${kg.gioKetThuc}:00.000+07:00`),
      },
    });
    khungGios.push(created);
  }
  console.log(`✅ Tạo ${khungGios.length} ca làm việc chính (Sáng, Chiều, Tối)`);

  // ===== 6. TẠO LỊCH LÀM VIỆC MẪU (LichLamViecBacSi) =====
  // Lấy thời điểm hiện tại theo múi giờ Việt Nam
  const now = new Date();
  const today = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const lichMau = [
    { bacSiIdx: 0, khungGioIdx: 0, ngay: today },    // BS An - Sáng nay
    { bacSiIdx: 1, khungGioIdx: 1, ngay: today },    // BS Bình - Chiều nay
    { bacSiIdx: 2, khungGioIdx: 2, ngay: today },    // BS Cường - Tối nay
    { bacSiIdx: 3, khungGioIdx: 0, ngay: tomorrow }, // BS Đức - Sáng mai
  ];

  for (const lm of lichMau) {
    if (doctors[lm.bacSiIdx] && khungGios[lm.khungGioIdx]) {
      await prisma.lichLamViecBacSi.create({
        data: {
          bacSiId: doctors[lm.bacSiIdx].id,
          khungGioId: khungGios[lm.khungGioIdx].id,
          ngayLamViec: lm.ngay,
          soBenhNhanToiDa: 10,
          soBenhNhanHienTai: 0,
          sanSang: 1,
        },
      });
    }
  }
  console.log(`✅ Đã tạo ${lichMau.length} lịch làm việc mẫu cho bác sĩ`);
  // ===== 7. TẠO HÌNH THỨC THANH TOÁN & FAQ =====
  const hinhThucData = ["Tiền mặt (tại quầy)", "Chuyển khoản (VNPay/Momo)"];
  for (const ht of hinhThucData) {
    await prisma.hinhThucThanhToan.create({ data: { tenHinhThuc: ht } });
  }

  const faqData = [
    { cauHoi: "Lịch khám bao lâu thì có kết quả?", traLoi: "Thông thường kết quả sẽ có ngay sau khi bác sĩ kết luận và kê đơn." },
    { cauHoi: "Tôi có thể thanh toán bằng thẻ không?", traLoi: "Hiện tại chúng tôi chấp nhận tiền mặt và chuyển khoản qua mã QR." },
  ];
  for (const faq of faqData) {
    await prisma.cauHoiThuongGap.create({ data: { ...faq, dangHoatDong: 1 } });
  }
  console.log("✅ Hoàn tất các thông tin bổ trợ (Thanh toán, FAQ)");

  console.log("\n🎉 SEED DỮ LIỆU THÀNH CÔNG! Hệ thống đã sẵn sàng để test.");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
