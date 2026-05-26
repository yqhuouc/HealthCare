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

  // ===== 2. TẠO CHUYÊN KHOA (7 CHUYÊN KHOA PHÒNG KHÁM TƯ NHÂN) =====
  const chuyenKhoaData = [
    { 
      tenChuyenKhoa: "Nội tổng quát", 
      thoiLuongKham: 30, 
      icon: "vaccines", 
      moTaChuyenKhoa: "Khám lâm sàng, chẩn đoán và điều trị không phẫu thuật các bệnh lý nội khoa người lớn như tim mạch, huyết áp, tiểu đường, hô hấp, tiêu hóa..." 
    },
    { 
      tenChuyenKhoa: "Nhi khoa", 
      thoiLuongKham: 20, 
      icon: "child_care", 
      moTaChuyenKhoa: "Chăm sóc sức khỏe y tế toàn diện cho trẻ em từ sơ sinh đến tuổi vị thành niên, khám bệnh lý cấp tính, tư vấn dinh dưỡng và tiêm chủng." 
    },
    { 
      tenChuyenKhoa: "Tai Mũi Họng", 
      thoiLuongKham: 15, 
      icon: "hearing", 
      moTaChuyenKhoa: "Khám và điều trị các bệnh lý phổ biến tai, mũi, họng ở trẻ em và người lớn như viêm xoang, viêm tai giữa, viêm họng mãn tính, VA..." 
    },
    { 
      tenChuyenKhoa: "Da liễu", 
      thoiLuongKham: 20, 
      icon: "healing", 
      moTaChuyenKhoa: "Chẩn đoán và điều trị các bệnh về da, tóc, móng, dị ứng, chàm, nấm da, trứng cá và thực hiện các quy trình chăm sóc thẩm mỹ da liễu an toàn." 
    },
    { 
      tenChuyenKhoa: "Mắt", 
      thoiLuongKham: 15, 
      icon: "visibility", 
      moTaChuyenKhoa: "Khám mắt định kỳ, đo thị lực, chẩn đoán và điều trị các bệnh lý về mắt như cận thị, viễn thị, đục thủy tinh thể, viêm kết mạc..." 
    },
    { 
      tenChuyenKhoa: "Răng Hàm Mặt", 
      thoiLuongKham: 20, 
      icon: "face", 
      moTaChuyenKhoa: "Chăm sóc sức khỏe răng miệng toàn diện, nhổ răng, hàn răng, điều trị tủy, lấy cao răng và thẩm mỹ răng hàm mặt." 
    },
    { 
      tenChuyenKhoa: "Sản phụ khoa", 
      thoiLuongKham: 30, 
      icon: "pregnant_woman", 
      moTaChuyenKhoa: "Khám thai định kỳ, tư vấn chăm sóc sức khỏe thai sản, siêu âm phụ khoa và điều trị các bệnh lý phụ khoa thường gặp." 
    },
  ];

  const chuyenKhoas = [];
  for (const ck of chuyenKhoaData) {
    const created = await prisma.chuyenKhoa.create({ data: ck });
    chuyenKhoas.push(created);
  }
  console.log(`✅ Tạo ${chuyenKhoas.length} chuyên khoa thông dụng`);

  // ===== 3. TẠO BÁC SĨ (MỖI CHUYÊN KHOA 5 BÁC SĨ - TỔNG 20 BÁC SĨ) =====
  const hoNguoiViet = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô"];
  const tenDemNam = ["Văn", "Minh", "Anh", "Đức", "Hoàng", "Duy", "Thanh", "Quốc", "Xuân", "Mạnh", "Hữu", "Khánh", "Ngọc"];
  const tenDemNu = ["Thị", "Hồng", "Kim", "Ngọc", "Thu", "Xuân", "Thanh", "Mỹ", "Phương", "Lan", "Quỳnh", "Minh"];
  const tenNam = ["An", "Bình", "Cường", "Đức", "Hùng", "Huy", "Khoa", "Lâm", "Mạnh", "Nam", "Phong", "Sơn", "Vinh", "Tuấn", "Minh"];
  const tenNu = ["Hương", "Oanh", "Quỳnh", "Thảo", "Trang", "Yến", "Mai", "Lan", "Phượng", "Hà", "Linh", "Hoa", "Nga", "Chi"];
  
  const hocVis = ["ThS.BS", "TS.BS", "BS.CKI", "PGS.TS.BS", "BS.CKII"];

  const doctors = [];
  let doctorCount = 0;

  for (let s = 0; s < chuyenKhoas.length; s++) {
    const ck = chuyenKhoas[s];
    for (let d = 0; d < 5; d++) {
      doctorCount++;
      const isMale = (doctorCount % 2 === 1);
      const ho = hoNguoiViet[(s * 5 + d) % hoNguoiViet.length];
      const dem = isMale 
        ? tenDemNam[(s * 5 + d) % tenDemNam.length] 
        : tenDemNu[(s * 5 + d) % tenDemNu.length];
      const ten = isMale 
        ? tenNam[(s * 5 + d) % tenNam.length] 
        : tenNu[(s * 5 + d) % tenNu.length];
      
      const tenBacSi = `${ho} ${dem} ${ten}`;
      const hocViChucDanh = hocVis[(s * 5 + d) % hocVis.length];
      const giaKham = 150000 + ((s * 5 + d) % 5) * 50000; // 150k - 350k phù hợp phòng khám tư

      const email = `bacsi${doctorCount}@clinic.vn`;
      const hashedPw = await bcrypt.hash("doctor123", 10);

      const taiKhoan = await prisma.taiKhoan.create({
        data: {
          email,
          matKhau: hashedPw,
          vaiTro: "bac_si",
          trangThaiTaiKhoan: 1,
          gioiTinh: isMale ? 1 : 2,
        },
      });

      const moTaChiTiet = `### Giới thiệu bác sĩ
Bác sĩ **${tenBacSi}** là chuyên gia ưu tú thuộc chuyên khoa **${ck.tenChuyenKhoa}** với hơn 10 năm kinh nghiệm công tác trong ngành y tế. Bác sĩ luôn đặt y đức làm tôn chỉ hoạt động, thấu hiểu tâm lý người bệnh và không ngừng cập nhật các phương pháp chẩn đoán tiên tiến nhất.

### Quá trình học tập & Đào tạo chuyên môn
*   Tốt nghiệp Bác sĩ Đa khoa tại Trường Đại học Y Hà Nội.
*   Nhận học vị **${hocViChucDanh}** chuyên ngành **${ck.tenChuyenKhoa}**.
*   Hoàn thành nhiều khóa đào tạo ngắn hạn về kỹ năng lâm sàng nâng cao và chăm sóc y tế hiện đại.

### Thế mạnh chuyên môn
*   Chẩn đoán chính xác và thiết lập phác đồ điều trị an toàn cho các bệnh lý thuộc khoa **${ck.tenChuyenKhoa}**.
*   Tư vấn toàn diện về lối sống, dinh dưỡng phục hồi và các biện pháp chăm sóc sức khỏe chủ động để hạn chế dùng thuốc kháng sinh nếu không cần thiết.
*   Theo dõi và quản lý bệnh lý mãn tính tận tình, chu đáo cho bệnh nhân ngoại trú.`;

      const createdBs = await prisma.bacSi.create({
        data: {
          tenBacSi,
          hocViChucDanh,
          moTaNgan: `Bác sĩ ${hocViChucDanh} ${tenBacSi} - Chuyên gia chuyên khoa ${ck.tenChuyenKhoa}, giàu kinh nghiệm và tận tụy với người bệnh.`,
          moTaChiTiet,
          giaKham,
          taiKhoanId: taiKhoan.id,
          chuyenKhoaId: ck.id,
        },
      });
      doctors.push(createdBs);
    }
  }
  console.log(`✅ Đã tạo ${doctors.length} bác sĩ (mỗi chuyên khoa 5 bác sĩ)`);

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

  const nextDay = new Date(today);
  nextDay.setDate(today.getDate() + 2);

  let scheduleCount = 0;
  for (let i = 0; i < doctors.length; i++) {
    const doc = doctors[i];
    
    // Ca Sáng hôm nay
    await prisma.lichLamViecBacSi.create({
      data: {
        bacSiId: doc.id,
        khungGioId: khungGios[0].id,
        ngayLamViec: today,
        soBenhNhanToiDa: 10,
        soBenhNhanHienTai: 0,
        sanSang: 1,
      },
    });

    // Ca Chiều ngày mai
    await prisma.lichLamViecBacSi.create({
      data: {
        bacSiId: doc.id,
        khungGioId: khungGios[1].id,
        ngayLamViec: tomorrow,
        soBenhNhanToiDa: 10,
        soBenhNhanHienTai: 0,
        sanSang: 1,
      },
    });

    // Ca Tối ngày kia (chỉ gán cho bác sĩ chẵn để phân tán dữ liệu)
    if (i % 2 === 0) {
      await prisma.lichLamViecBacSi.create({
        data: {
          bacSiId: doc.id,
          khungGioId: khungGios[2].id,
          ngayLamViec: nextDay,
          soBenhNhanToiDa: 8,
          soBenhNhanHienTai: 0,
          sanSang: 1,
        },
      });
      scheduleCount += 3;
    } else {
      scheduleCount += 2;
    }
  }
  console.log(`✅ Đã tạo ${scheduleCount} lịch làm việc mẫu cho toàn bộ ${doctors.length} bác sĩ`);
  // ===== 7. TẠO HÌNH THỨC THANH TOÁN & FAQ =====
  const hinhThucData = [
    { tenHinhThuc: "Thanh toán tại quầy", maLoai: "OFFLINE" },
    { tenHinhThuc: "Chuyển khoản online (VNPay)", maLoai: "VNPAY" },
  ];
  for (const ht of hinhThucData) {
    await prisma.hinhThucThanhToan.create({ data: ht });
  }

  const faqData = [
    { cauHoi: "Lịch khám sau bao lâu thì có kết quả?", traLoi: "Thông thường kết quả khám và đơn thuốc sẽ được cập nhật trực tuyến trên hệ thống ngay sau khi bác sĩ kết luận và kết thúc ca khám." },
    { cauHoi: "Tôi có thể thanh toán phí khám trực tuyến bằng hình thức nào?", traLoi: "Phòng khám hỗ trợ thanh toán online an toàn qua cổng VNPay (ATM nội địa, thẻ quốc tế hoặc quét mã QR ứng dụng ngân hàng) hoặc thanh toán trực tiếp bằng tiền mặt/quẹt thẻ tại quầy lễ tân." },
    { cauHoi: "Tôi có thể hủy lịch hoặc thay đổi giờ khám đã đặt không?", traLoi: "Bạn hoàn toàn có thể chủ động hủy lịch hẹn hoặc chọn giờ khám mới trong mục Lịch sử lịch hẹn trước giờ khám dự kiến ít nhất 2 tiếng mà không mất phí." },
    { cauHoi: "Tôi cần mang theo những giấy tờ gì khi đến khám bệnh?", traLoi: "Bệnh nhân vui lòng mang theo Căn cước công dân (hoặc thẻ BHYT nếu có) và mở ứng dụng HealthCare hiển thị mã đặt lịch khám cho lễ tân để được hỗ trợ check-in nhanh nhất." },
    { cauHoi: "Nếu tôi đến muộn so với giờ hẹn trên lịch khám thì sao?", traLoi: "Lịch khám được đặt trước để tối ưu thời gian chờ. Nếu bạn đến muộn quá 15 phút, hệ thống sẽ tự động xếp bạn vào lượt khám dự phòng của ca trực để tránh ảnh hưởng đến các bệnh nhân đặt lịch đúng giờ." },
    { cauHoi: "Hồ sơ bệnh án và đơn thuốc của tôi được bảo mật thế nào?", traLoi: "Toàn bộ thông tin bệnh án và lịch sử khám bệnh của bạn được mã hóa an toàn và chỉ có bác sĩ trực tiếp khám cùng với tài khoản cá nhân của bạn mới có quyền truy cập." },
    { cauHoi: "Phòng khám có làm việc ngoài giờ hành chính hoặc cuối tuần không?", traLoi: "Có, phòng khám có ca trực tối ngoài giờ từ 18:00 - 21:00 từ Thứ 2 đến Thứ 7, phục vụ cho những người đi làm bận rộn." },
    { cauHoi: "Làm thế nào để tôi liên hệ trực tiếp với bác sĩ sau khi khám?", traLoi: "Sau khi hoàn thành ca khám, đơn thuốc sẽ được đính kèm số điện thoại liên hệ khẩn cấp của bác sĩ điều trị để bạn tiện trao đổi nếu có phản ứng phụ của thuốc." }
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
