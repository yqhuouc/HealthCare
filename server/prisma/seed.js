/**
 * ============================================================
 * SEED DATA - Dữ liệu mẫu ban đầu
 * ============================================================
 * Chạy: npx prisma db seed
 * Hoặc: node prisma/seed.js
 *
 * Tạo: admin, chuyên khoa, bác sĩ, khung giờ, hình thức thanh toán, FAQ
 * ============================================================
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// BigInt serialize fix
BigInt.prototype.toJSON = function () {
  return Number(this);
};

async function main() {
  console.log("🌱 Bắt đầu làm sạch và seed dữ liệu...\n");

  // ===== 0. XÓA DỮ LIỆU CŨ (Tránh lỗi trùng lặp) =====
  // Lưu ý: Thứ tự xóa quan trọng do ràng buộc khóa ngoại (Foreign Key)
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
  console.log("✅ Tạo tài khoản admin:", admin.email);

  // ===== 2. TẠO CHUYÊN KHOA =====
  const chuyenKhoaData = [
    { tenChuyenKhoa: "Tim mạch", moTaChuyenKhoa: "Khám và điều trị các bệnh về tim, mạch máu" },
    { tenChuyenKhoa: "Thần kinh", moTaChuyenKhoa: "Khám và điều trị các bệnh về não, thần kinh" },
    { tenChuyenKhoa: "Da liễu", moTaChuyenKhoa: "Khám và điều trị các bệnh về da" },
    { tenChuyenKhoa: "Nhi khoa", moTaChuyenKhoa: "Khám và điều trị bệnh cho trẻ em" },
    { tenChuyenKhoa: "Tai Mũi Họng", moTaChuyenKhoa: "Khám và điều trị bệnh tai, mũi, họng" },
    { tenChuyenKhoa: "Mắt", moTaChuyenKhoa: "Khám và điều trị các bệnh về mắt" },
    { tenChuyenKhoa: "Răng Hàm Mặt", moTaChuyenKhoa: "Khám và điều trị nha khoa" },
    { tenChuyenKhoa: "Sản phụ khoa", moTaChuyenKhoa: "Khám thai, phụ khoa, sức khỏe sinh sản" },
  ];

  const chuyenKhoas = [];
  for (const ck of chuyenKhoaData) {
    const created = await prisma.chuyenKhoa.create({ data: ck });
    chuyenKhoas.push(created);
  }
  console.log(`✅ Tạo ${chuyenKhoas.length} chuyên khoa`);

  // ===== 3. TẠO BÁC SĨ (kèm tài khoản) =====
  const bacSiData = [
    { tenBacSi: "Nguyễn Văn An", hocViChucDanh: "PGS.TS", giaKham: 500000, chuyenKhoaIdx: 0 },
    { tenBacSi: "Trần Thị Bình", hocViChucDanh: "ThS.BS", giaKham: 350000, chuyenKhoaIdx: 1 },
    { tenBacSi: "Lê Hoàng Cường", hocViChucDanh: "TS.BS", giaKham: 450000, chuyenKhoaIdx: 2 },
    { tenBacSi: "Phạm Minh Đức", hocViChucDanh: "BS.CKI", giaKham: 300000, chuyenKhoaIdx: 3 },
    { tenBacSi: "Hoàng Thị Em", hocViChucDanh: "BS.CKII", giaKham: 400000, chuyenKhoaIdx: 4 },
    { tenBacSi: "Vũ Đình Phú", hocViChucDanh: "PGS.TS", giaKham: 550000, chuyenKhoaIdx: 0 },
    { tenBacSi: "Đỗ Thị Giang", hocViChucDanh: "ThS.BS", giaKham: 320000, chuyenKhoaIdx: 5 },
    { tenBacSi: "Bùi Văn Hải", hocViChucDanh: "TS.BS", giaKham: 480000, chuyenKhoaIdx: 6 },
  ];

  for (let i = 0; i < bacSiData.length; i++) {
    const bs = bacSiData[i];
    const email = `bacsi${i + 1}@clinic.vn`;
    const hashedPw = await bcrypt.hash("doctor123", 10);

    await prisma.$transaction(async (tx) => {
      const taiKhoan = await tx.taiKhoan.create({
        data: {
          email,
          matKhau: hashedPw,
          vaiTro: "bac_si",
          trangThaiTaiKhoan: 1,
          gioiTinh: i % 2 === 0 ? 1 : 2,
        },
      });

      await tx.bacSi.create({
        data: {
          tenBacSi: bs.tenBacSi,
          hocViChucDanh: bs.hocViChucDanh,
          moTaNgan: `Bác sĩ ${bs.tenBacSi} - chuyên khoa ${chuyenKhoaData[bs.chuyenKhoaIdx].tenChuyenKhoa}`,
          giaKham: bs.giaKham,
          taiKhoanId: taiKhoan.id,
          chuyenKhoaId: chuyenKhoas[bs.chuyenKhoaIdx].id,
        },
      });
    });
  }
  console.log(`✅ Tạo ${bacSiData.length} bác sĩ`);

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
  console.log("✅ Tạo 1 bệnh nhân mẫu");

  // ===== 5. TẠO KHUNG GIỜ =====
  const khungGioData = [
    { gioBatDau: "07:00", gioKetThuc: "08:00" },
    { gioBatDau: "08:00", gioKetThuc: "09:00" },
    { gioBatDau: "09:00", gioKetThuc: "10:00" },
    { gioBatDau: "10:00", gioKetThuc: "11:00" },
    { gioBatDau: "13:00", gioKetThuc: "14:00" },
    { gioBatDau: "14:00", gioKetThuc: "15:00" },
    { gioBatDau: "15:00", gioKetThuc: "16:00" },
    { gioBatDau: "16:00", gioKetThuc: "17:00" },
  ];

  for (const kg of khungGioData) {
    await prisma.khungGio.create({
      data: {
        gioBatDau: new Date(`1970-01-01T${kg.gioBatDau}:00.000Z`),
        gioKetThuc: new Date(`1970-01-01T${kg.gioKetThuc}:00.000Z`),
      },
    });
  }
  console.log(`✅ Tạo ${khungGioData.length} khung giờ`);

  // ===== 6. TẠO HÌNH THỨC THANH TOÁN =====
  const hinhThucData = ["Tiền mặt", "Chuyển khoản ngân hàng", "Ví điện tử"];
  for (const ht of hinhThucData) {
    await prisma.hinhThucThanhToan.create({ data: { tenHinhThuc: ht } });
  }
  console.log(`✅ Tạo ${hinhThucData.length} hình thức thanh toán`);

  // ===== 7. TẠO FAQ =====
  const faqData = [
    { cauHoi: "Làm thế nào để đặt lịch khám?", traLoi: "Bạn đăng nhập vào hệ thống, chọn chuyên khoa → chọn bác sĩ → chọn ngày giờ → xác nhận đặt lịch." },
    { cauHoi: "Tôi có thể hủy lịch khám không?", traLoi: "Bạn có thể hủy lịch khám khi lịch đang ở trạng thái 'Chờ xác nhận'. Vào mục Lịch hẹn → chọn lịch → nhấn Hủy." },
    { cauHoi: "Phí khám bệnh là bao nhiêu?", traLoi: "Phí khám tùy theo bác sĩ và chuyên khoa, dao động từ 200.000đ - 600.000đ. Giá sẽ hiển thị khi bạn chọn bác sĩ." },
    { cauHoi: "Tôi quên mật khẩu phải làm sao?", traLoi: "Vui lòng liên hệ hotline hoặc email hỗ trợ để được reset mật khẩu." },
    { cauHoi: "Phòng khám hoạt động giờ nào?", traLoi: "Phòng khám hoạt động từ 7:00 - 17:00, thứ Hai đến thứ Bảy. Chủ nhật nghỉ." },
  ];

  for (const faq of faqData) {
    await prisma.cauHoiThuongGap.create({
      data: { ...faq, dangHoatDong: 1 },
    });
  }
  console.log(`✅ Tạo ${faqData.length} câu hỏi thường gặp`);

  console.log("\n🎉 Seed dữ liệu hoàn tất!");
  console.log("\n📌 Tài khoản đăng nhập:");
  console.log("   Admin:     admin@clinic.vn / admin123");
  console.log("   Bác sĩ 1:  bacsi1@clinic.vn / doctor123");
  console.log("   Bệnh nhân: benhnhan@gmail.com / patient123\n");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
