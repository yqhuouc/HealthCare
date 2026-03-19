/**
 * Mock data - Danh sách bác sĩ
 * TODO: Thay thế bằng API thật khi kết nối backend
 */
export const SPECIALTIES = [
  {
    id: 1,
    name: "Nội tổng quát",
    icon: "stethoscope",
    description:
      "Khám và điều trị các bệnh lý nội khoa thường gặp, quản lý sức khỏe định kỳ cho người trưởng thành.",
    doctorCount: 15,
    image:
      "/images/specialty-bg.jpg",
    detailDescription:
      "Khoa Nội tổng quát tại HealthCare là nơi tiếp nhận thăm khám, chẩn đoán và điều trị các bệnh lý nội khoa phổ biến. Chúng tôi tập trung vào việc quản lý sức khỏe toàn diện, từ các bệnh lý cấp tính đến các bệnh mãn tính như tiểu đường, cao huyết áp, và các vấn đề về tiêu hóa.",
    equipment: [
      { name: "Máy MRI 3.0 Tesla", icon: "radiology", desc: "Chẩn đoán hình ảnh chính xác đến từng milimet." },
      { name: "Xét nghiệm Robot", icon: "heart_check", desc: "Tự động hóa hoàn toàn, kết quả nhanh chóng." },
    ],
  },
  {
    id: 2,
    name: "Nhi khoa",
    icon: "child_care",
    description:
      "Chăm sóc sức khỏe toàn diện cho trẻ em từ sơ sinh đến vị thành niên với sự tận tâm tuyệt đối.",
    doctorCount: 12,
    image:
      "/images/specialty-bg.jpg",
    detailDescription:
      "Khoa Nhi tại HealthCare chuyên chẩn đoán và điều trị các bệnh lý ở trẻ em, từ sơ sinh đến vị thành niên. Đội ngũ bác sĩ giàu kinh nghiệm, tận tâm cùng trang thiết bị hiện đại giúp con bạn luôn khỏe mạnh.",
    equipment: [
      { name: "Máy thở trẻ em CPAP", icon: "pulmonology", desc: "Hỗ trợ hô hấp cho trẻ sinh non." },
      { name: "Monitor theo dõi đa thông số", icon: "monitor_heart", desc: "Theo dõi sinh hiệu liên tục 24/7." },
    ],
  },
  {
    id: 3,
    name: "Sản phụ khoa",
    icon: "pregnant_woman",
    description:
      "Dịch vụ chăm sóc thai sản trọn gói và điều trị các bệnh lý phụ khoa bằng công nghệ tiên tiến.",
    doctorCount: 10,
    image:
      "/images/specialty-bg.jpg",
    detailDescription:
      "Khoa Sản phụ khoa cung cấp dịch vụ chăm sóc thai sản trọn gói, từ khám thai định kỳ, siêu âm 4D đến hỗ trợ sinh sản. Phòng sinh hiện đại, đạt chuẩn quốc tế.",
    equipment: [
      { name: "Siêu âm 4D", icon: "radiology", desc: "Hình ảnh thai nhi sắc nét, rõ ràng." },
      { name: "Hệ thống sinh đẻ không đau", icon: "health_and_safety", desc: "An toàn, giảm đau hiệu quả." },
    ],
  },
  {
    id: 4,
    name: "Da liễu",
    icon: "face",
    description:
      "Điều trị chuyên sâu các bệnh lý da liễu, thẩm mỹ da và chăm sóc da chuyên nghiệp.",
    doctorCount: 8,
    image:
      "/images/specialty-bg.jpg",
    detailDescription:
      "Chuyên khoa Da liễu tại HealthCare áp dụng các công nghệ tiên tiến nhất trong điều trị mụn, nám, tàn nhang, viêm da và các bệnh lý da liễu phức tạp.",
    equipment: [
      { name: "Laser CO2 Fractional", icon: "radiology", desc: "Trị sẹo và trẻ hóa da hiệu quả." },
      { name: "Đèn sinh học PDT", icon: "lightbulb", desc: "Điều trị mụn, kháng viêm chuyên sâu." },
    ],
  },
  {
    id: 5,
    name: "Tai Mũi Họng",
    icon: "hearing",
    description:
      "Chẩn đoán và điều trị chuyên sâu các bệnh về tai, mũi, họng và cấu trúc liên quan ở đầu mặt cổ.",
    doctorCount: 8,
    image:
      "/images/specialty-bg.jpg",
    detailDescription:
      "Khoa TMH chuyên nội soi, phẫu thuật tai mũi họng và điều trị viêm xoang mãn tính với đội ngũ PGS, TS giàu kinh nghiệm.",
    equipment: [
      { name: "Nội soi TMH Karl Storz", icon: "radiology", desc: "Hình ảnh Full HD, chẩn đoán chính xác." },
      { name: "Máy đo thính lực", icon: "hearing", desc: "Đánh giá khả năng nghe toàn diện." },
    ],
  },
  {
    id: 6,
    name: "Răng Hàm Mặt",
    icon: "dentistry",
    description:
      "Dịch vụ nha khoa thẩm mỹ, niềng răng và phẫu thuật hàm mặt với tiêu chuẩn quốc tế.",
    doctorCount: 9,
    image:
      "/images/specialty-bg.jpg",
    detailDescription:
      "Khoa RHM cung cấp dịch vụ nha khoa tổng hợp: niềng răng, trồng implant, bọc sứ thẩm mỹ và phẫu thuật hàm mặt với trang thiết bị hiện đại.",
    equipment: [
      { name: "Máy chụp CT Cone Beam", icon: "radiology", desc: "Hình ảnh 3D toàn hàm chỉ trong 14 giây." },
      { name: "Ghế nha Sirona", icon: "dentistry", desc: "Thoải mái, tích hợp công nghệ số." },
    ],
  },
];

export const DOCTORS = [
  {
    id: 1,
    name: "BS. Nguyễn Văn A",
    specialty: "Nội khoa",
    specialtyId: 1,
    experience: 15,
    rating: 4.8,
    totalReviews: 124,
    price: 300000,
    description:
      "Bác sĩ chuyên khoa Nội với 15 năm kinh nghiệm, từng công tác tại Bệnh viện Bạch Mai. Chuyên điều trị các bệnh lý tim mạch, tiêu hóa và hô hấp.",
    education: "Tiến sĩ Y khoa - Đại học Y Hà Nội",
    image:
      "/images/doctor-1.jpg",
  },
  {
    id: 2,
    name: "BS. Trần Thị B",
    specialty: "Sản phụ khoa",
    specialtyId: 3,
    experience: 10,
    rating: 4.9,
    totalReviews: 89,
    price: 350000,
    description:
      "Bác sĩ chuyên khoa Sản với 10 năm kinh nghiệm. Chuyên tư vấn sức khỏe sinh sản, theo dõi thai kỳ và điều trị vô sinh hiếm muộn.",
    education: "Thạc sĩ Y khoa - Đại học Y Dược TP.HCM",
    image:
      "/images/doctor-2.jpg",
  },
  {
    id: 3,
    name: "BS. Lê Hoàng C",
    specialty: "Nhi khoa",
    specialtyId: 2,
    experience: 12,
    rating: 4.7,
    totalReviews: 156,
    price: 280000,
    description:
      "Bác sĩ Nhi khoa giàu kinh nghiệm, chuyên khám và điều trị bệnh lý trẻ em, tư vấn dinh dưỡng và tiêm chủng.",
    education: "Tiến sĩ Y khoa - Đại học Y Hà Nội",
    image:
      "/images/doctor-3.jpg",
  },
  {
    id: 4,
    name: "BS. Phạm Minh D",
    specialty: "Da liễu",
    specialtyId: 4,
    experience: 8,
    rating: 4.6,
    totalReviews: 78,
    price: 320000,
    description:
      "Bác sĩ Da liễu với chuyên môn cao trong điều trị mụn, nám, tàn nhang và các bệnh lý da liễu phức tạp.",
    education: "Thạc sĩ Y khoa - Đại học Y Hà Nội",
    image:
      "/images/doctor-4.jpg",
  },
  {
    id: 5,
    name: "BS. Hoàng Thị E",
    specialty: "Tai Mũi Họng",
    specialtyId: 5,
    experience: 14,
    rating: 4.8,
    totalReviews: 102,
    price: 300000,
    description:
      "Bác sĩ TMH với 14 năm kinh nghiệm. Chuyên nội soi, phẫu thuật tai mũi họng và điều trị viêm xoang mãn tính.",
    education: "Phó Giáo sư, Tiến sĩ - Học viện Quân Y",
    image:
      "/images/doctor-2.jpg",
  },
  {
    id: 6,
    name: "BS. Vũ Đức F",
    specialty: "Răng Hàm Mặt",
    specialtyId: 6,
    experience: 9,
    rating: 4.5,
    totalReviews: 67,
    price: 250000,
    description:
      "Bác sĩ Răng Hàm Mặt với chuyên môn trong niềng răng, trồng implant và phục hình thẩm mỹ nha khoa.",
    education: "Thạc sĩ RHM - Đại học Y Dược Hà Nội",
    image:
      "/images/doctor-3.jpg",
  },
];

/** Các khung giờ khám mẫu */
export const TIME_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
];
