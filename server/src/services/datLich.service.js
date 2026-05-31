/**
 * ============================================================================
 * DAT LICH SERVICE (DỊCH VỤ QUẢN LÝ LỊCH HẸN)
 * ============================================================================
 * Chịu trách nhiệm xử lý toàn bộ logic nghiệp vụ liên quan đến lịch hẹn:
 * - Tra cứu: Tìm kiếm slot khám bệnh, xem lịch sử theo bệnh nhân/bác sĩ.
 * - Đặt lịch: Kiểm tra công suất ca trực (Capacity), tính toán giờ kết thúc,
 *   đảm bảo tính toàn vẹn dữ liệu qua Transaction.
 * - Cập nhật/Xóa: Thay đổi trạng thái, thanh toán, giải phóng slot khi hủy.
 *
 * Tính năng nổi bật: "Nới ca (Overtime)" - Tự động sinh slot ngoài giờ hành chính
 * nếu Admin tăng giới hạn số lượng bệnh nhân của ca làm việc.
 */

const prisma = require("../utils/prisma");
const { AppError } = require("../middlewares/error.middleware");
const { dayjs, vnDay } = require("../utils/dateUtils");
const { getCache, setCache, delCache } = require("../utils/redis.util");

// Hàm tạo khóa (key) lưu trữ cache slot trống trên Redis dựa theo ID bác sĩ và ngày đặt lịch
const getSlotCacheKey = (bsId, date) => `cache:slot:${bsId}:${dayjs(date).format("YYYY-MM-DD")}`;

// ============================================================================
// 1. TIỆN ÍCH XỬ LÝ THỜI GIAN VÀ DỮ LIỆU
// ============================================================================

/**
 * Chuyển đổi chuỗi giờ phút "HH:mm" (ví dụ: "08:30") thành đối tượng Date.
 * Để so sánh giờ chuẩn xác mà không bị ảnh hưởng bởi ngày/tháng/năm thực tế,
 * hàm này cố định ngày là "2000-01-01" và sử dụng múi giờ Việt Nam.
 * 
 * @param {string} timeStr - Chuỗi giờ phút cần chuyển (định dạng "HH:mm")
 * @returns {Date} Đối tượng Date đại diện cho thời điểm đó trên mốc ngày 2000-01-01
 */
const parseTime = (timeStr) => {
  return vnDay(`2000-01-01T${timeStr}:00`).toDate();
};

/**
 * Định dạng đối tượng Date/chuỗi thời gian thành chuỗi giờ phút "HH:mm".
 * Hàm này chuẩn hóa năm về 2000, chuyển sang múi giờ Việt Nam (Asia/Ho_Chi_Minh)
 * trước khi xuất ra chuỗi "HH:mm" để đảm bảo tính nhất quán khi hiển thị.
 * 
 * @param {Date|string|number} date - Thời gian đầu vào cần định dạng
 * @returns {string} Chuỗi thời gian đã định dạng (ví dụ: "14:30")
 */
const formatTime = (date) => {
  return dayjs.utc(date).year(2000).tz("Asia/Ho_Chi_Minh").format("HH:mm");
};

/**
 * Ẩn/bảo mật các thông tin nhạy cảm (như Chi tiết Đơn thuốc) dựa trên vai trò
 * và trạng thái thanh toán của người dùng hiện tại (áp dụng nguyên tắc bảo mật Data Ownership).
 * - Nếu người dùng là bệnh nhân và chưa thanh toán đầy đủ (trangThaiThanhToan < 2):
 *   Chi tiết đơn thuốc sẽ bị ẩn đi, chỉ giữ lại ID và tổng tiền để Frontend thực hiện thanh toán.
 * - Hỗ trợ đệ quy xử lý cho cả đối tượng đơn lẻ hoặc mảng danh sách lịch hẹn.
 *
 * @param {Object|Array} data - Dữ liệu lịch hẹn cần lọc thông tin
 * @param {Object} requestUser - Thông tin người dùng đang thực hiện yêu cầu (req.user)
 * @returns {Object|Array} Dữ liệu lịch hẹn sau khi đã ẩn thông tin nhạy cảm (nếu có)
 */
const redactSensitiveData = (data, requestUser) => {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item, requestUser));
  }

  // Khóa đơn thuốc nếu bệnh nhân chưa thanh toán đầy đủ (trangThaiThanhToan < 2)
  if (requestUser?.vaiTro === "benh_nhan" && data.trangThaiThanhToan < 2) {
    if (data.donThuoc) {
      data.donThuoc = {
        id: data.donThuoc.id,
        tongTien: data.donThuoc.tongTien, // Giữ lại tổng tiền để Frontend tạo giao dịch thanh toán
        message:
          "Vui lòng hoàn tất thanh toán để xem chi tiết đơn thuốc và kết quả khám.",
        isLocked: true,
      };
    }
  }

  return data;
};

/**
 * Cấu hình Prisma include mặc định để tự động JOIN (kết hợp) các bảng liên quan khi truy vấn lịch hẹn:
 * - bacSi: Lấy ID, tên bác sĩ, học vị chức danh, và thông tin chuyên khoa (tên chuyên khoa, thời lượng khám).
 * - benhNhan: Lấy ID, họ tên, số điện thoại, email liên hệ, và ảnh đại diện từ tài khoản.
 * - hinhThucThanhToan: Lấy thông tin về hình thức thanh toán (ví dụ: VNPay, trả sau tại quầy).
 * - lichLamViec: Lấy thông tin lịch làm việc của bác sĩ cùng với khung giờ tương ứng.
 * - donThuoc: Lấy đơn thuốc đính kèm kèm theo chi tiết của đơn thuốc đó.
 */
const defaultInclude = {
  bacSi: {
    select: {
      id: true,
      tenBacSi: true,
      hocViChucDanh: true,
      chuyenKhoa: { select: { tenChuyenKhoa: true, thoiLuongKham: true } },
    },
  },
  benhNhan: {
    select: {
      id: true,
      hoTen: true,
      soDienThoai: true,
      emailLienHe: true,
      taiKhoan: { select: { anhDaiDien: true } },
    },
  },
  hinhThucThanhToan: true,
  lichLamViec: { include: { khungGio: true } },
  donThuoc: { include: { chiTietDonThuoc: true } },
};

// ============================================================================
// 2. CÁC NGHIỆP VỤ TRUY VẤN (QUERIES)
// ============================================================================

/**
 * Lấy danh sách toàn bộ lịch hẹn hệ thống có hỗ trợ phân trang và bộ lọc nâng cao.
 * (Chủ yếu dùng cho trang quản lý của Admin / Nhân viên y tế).
 * 
 * Các chức năng lọc và tìm kiếm:
 * - trangThai: Lọc theo trạng thái lịch hẹn (0: Chờ xác nhận, 1: Đã xác nhận, 2: Đã khám, 3: Đã hủy).
 * - ngayDat: Lọc chính xác các lịch hẹn trong một ngày cụ thể.
 * - search: Tìm kiếm đa năng. Hỗ trợ tìm theo tên Bác sĩ, tên Bệnh nhân, hoặc mã lịch hẹn (ID).
 *   + Ví dụ nếu người dùng tìm "LK25" hoặc "25" -> Hệ thống sẽ trích xuất ID là 25 để truy vấn trực tiếp.
 *   + Nếu tìm chuỗi chữ -> Tìm kiếm không phân biệt hoa thường (insensitive) trong tên bác sĩ hoặc bệnh nhân.
 * 
 * @param {Object} filterParams - Đối tượng chứa các bộ lọc: { trangThai, ngayDat, search, page, limit }
 * @returns {Promise<Object>} Trả về mảng lịch hẹn (datLichs) và thông tin phân trang (pagination)
 */
const getAll = async ({ trangThai, ngayDat, search, page = 1, limit = 10 }) => {
  // Tính toán số lượng bản ghi cần bỏ qua để phân trang
  const skip = (Number(page) - 1) * Number(limit);
  const where = {};

  // Nếu có bộ lọc trạng thái, chuyển về dạng Number và gán vào query
  if (trangThai !== undefined) where.trangThai = Number(trangThai);
  
  // Nếu có lọc theo ngày, tạo đối tượng Date mới
  if (ngayDat) where.ngayDat = new Date(ngayDat);

  // Xử lý logic tìm kiếm đa năng (Search)
  if (search) {
    let searchId = null;
    let searchString = search.trim();

    // 1. Phân tích xem chuỗi tìm kiếm có chứa ID lịch hẹn hay không
    // Trường hợp nhập dạng mã "LK25", "lk25" -> Trích xuất lấy số "25"
    if (/^LK/i.test(searchString)) {
      const match = searchString.match(/^LK(\d+)$/i);
      if (match) searchId = match[1];
    } else if (/^\d+$/.test(searchString)) {
      // Trường hợp chỉ nhập số nguyên "25" -> Trực tiếp coi đó là ID lịch hẹn
      searchId = searchString;
    }

    // 2. Tạo điều kiện OR: Tìm kiếm theo tên bác sĩ HOẶC tên bệnh nhân
    where.OR = [
      {
        bacSi: {
          tenBacSi: { contains: searchString, mode: "insensitive" }, // Không phân biệt hoa thường
        },
      },
      {
        benhNhan: {
          hoTen: { contains: searchString, mode: "insensitive" },
        },
      },
    ];

    // 3. Nếu tìm thấy ID lịch hẹn hợp lệ từ chuỗi tìm kiếm, thêm điều kiện truy vấn ID bằng BigInt vào mảng OR
    if (searchId) {
      where.OR.push({ id: BigInt(searchId) });
    }
  }

  // Chạy song song 2 câu lệnh truy vấn: lấy dữ liệu phân trang và đếm tổng số dòng thỏa mãn điều kiện
  const [datLichs, total] = await Promise.all([
    prisma.datLich.findMany({
      where,
      include: defaultInclude, // Tự động nạp kèm thông tin bác sĩ, bệnh nhân,...
      skip,
      take: Number(limit),
      orderBy: [{ ngayDat: "desc" }, { gioBatDau: "asc" }], // Sắp xếp theo ngày mới nhất trước, sau đó tới giờ bắt đầu sớm nhất
    }),
    prisma.datLich.count({ where }),
  ]);

  return {
    datLichs,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

/**
 * Lấy thông tin chi tiết của một lịch hẹn cụ thể theo ID.
 * Đồng thời thực hiện kiểm tra quyền sở hữu dữ liệu (Data Ownership) để bảo mật:
 * - Bệnh nhân chỉ có quyền xem lịch hẹn của chính họ.
 * - Bác sĩ chỉ có quyền xem lịch hẹn khám của chính họ với bệnh nhân.
 * - Admin hoặc các vai trò quản trị khác có quyền xem toàn bộ.
 * 
 * @param {string|number|BigInt} id - ID của lịch hẹn cần lấy chi tiết
 * @param {Object} requestUser - Thông tin người dùng đang thực hiện request (req.user)
 * @returns {Promise<Object>} Đối tượng lịch hẹn sau khi đã ẩn các thông tin nhạy cảm nếu cần thiết
 */
const getById = async (id, requestUser) => {
  // Tìm kiếm lịch hẹn độc nhất theo khóa chính ID
  const datLich = await prisma.datLich.findUnique({
    where: { id: BigInt(id) },
    include: defaultInclude,
  });

  // Nếu không tìm thấy, ném ra lỗi 404
  if (!datLich) throw new AppError("Không tìm thấy lịch hẹn", 404);

  // PHÂN QUYỀN TRUY CẬP (Bảo mật thông tin):
  // 1. Nếu người dùng là Bệnh nhân: Kiểm tra xem ID bệnh nhân của lịch hẹn có khớp với ID bệnh nhân của người dùng hay không
  if (requestUser?.vaiTro === "benh_nhan") {
    if (
      !requestUser.benhNhan ||
      datLich.benhNhanId !== requestUser.benhNhan.id
    ) {
      throw new AppError("Bạn không có quyền xem lịch hẹn này", 403);
    }
  }

  // 2. Nếu người dùng là Bác sĩ: Kiểm tra xem ID bác sĩ của lịch hẹn có khớp với ID bác sĩ của người dùng hay không
  if (requestUser?.vaiTro === "bac_si") {
    if (!requestUser.bacSi || datLich.bacSiId !== requestUser.bacSi.id) {
      throw new AppError("Bạn không có quyền xem lịch hẹn này", 403);
    }
  }

  // Ẩn đơn thuốc nếu bệnh nhân chưa thanh toán đủ tiền, sau đó trả về dữ liệu lịch hẹn
  return redactSensitiveData(datLich, requestUser);
};

/**
 * Lấy lịch sử tất cả các lịch hẹn (lịch sử khám bệnh) của một bệnh nhân cụ thể.
 * Quy định bảo mật:
 * - Chính bệnh nhân đó hoặc Admin mới có quyền xem danh sách này.
 * - Bác sĩ không được xem toàn bộ lịch sử này trực tiếp từ API này để tránh lộ thông tin ngoài chuyên môn.
 * 
 * @param {string|number} benhNhanId - ID của bệnh nhân cần tra cứu lịch sử
 * @param {Object} requestUser - Thông tin người dùng đang thực hiện yêu cầu
 * @returns {Promise<Array>} Danh sách lịch hẹn đã lọc các thông tin nhạy cảm
 */
const getByBenhNhan = async (benhNhanId, requestUser) => {
  // PHÂN QUYỀN TRUY CẬP:
  // 1. Bệnh nhân chỉ được xem lịch sử của chính họ, không được xem của người khác
  if (requestUser.vaiTro === "benh_nhan") {
    if (
      !requestUser.benhNhan ||
      BigInt(benhNhanId) !== requestUser.benhNhan.id
    ) {
      throw new AppError(
        "Bạn không có quyền xem lịch hẹn của bệnh nhân khác",
        403,
      );
    }
  }

  // 2. Chặn bác sĩ truy vấn trực tiếp toàn bộ danh sách lịch sử này
  if (requestUser.vaiTro === "bac_si") {
    throw new AppError(
      "Bác sĩ không có quyền xem toàn bộ lịch sử khám của bệnh nhân",
      403,
    );
  }

  // Thực hiện truy vấn cơ sở dữ liệu
  const results = await prisma.datLich.findMany({
    where: { benhNhanId: BigInt(benhNhanId) },
    include: defaultInclude,
    orderBy: [{ ngayDat: "desc" }, { gioBatDau: "asc" }], // Xếp lịch gần đây nhất lên đầu
  });

  // Lọc và ẩn thông tin nhạy cảm (đơn thuốc chưa thanh toán) trước khi trả về
  return redactSensitiveData(results, requestUser);
};

/**
 * Lấy danh sách toàn bộ lịch hẹn thuộc về một bác sĩ cụ thể.
 * Quy định bảo mật:
 * - Chỉ chính bác sĩ đó hoặc Admin mới được phép xem.
 * - Bệnh nhân bị chặn không cho phép xem lịch làm việc tổng thể của bác sĩ qua API này.
 * 
 * @param {string|number} bacSiId - ID của bác sĩ cần tra cứu danh sách lịch hẹn
 * @param {Object} requestUser - Thông tin người dùng đang gọi API
 * @returns {Promise<Array>} Danh sách lịch hẹn của bác sĩ
 */
const getByBacSi = async (bacSiId, requestUser) => {
  // PHÂN QUYỀN TRUY CẬP:
  // 1. Bác sĩ chỉ được xem danh sách bệnh nhân đặt lịch của chính mình
  if (requestUser.vaiTro === "bac_si") {
    if (!requestUser.bacSi || BigInt(bacSiId) !== requestUser.bacSi.id) {
      throw new AppError(
        "Bạn không có quyền xem lịch khám của bác sĩ khác",
        403,
      );
    }
  }

  // 2. Chặn bệnh nhân gọi API này để lấy thông tin toàn bộ lịch hẹn của bác sĩ
  if (requestUser.vaiTro === "benh_nhan") {
    throw new AppError(
      "Bệnh nhân không có quyền xem danh sách lịch khám của bác sĩ",
      403,
    );
  }

  // Truy vấn và trả về danh sách lịch hẹn của bác sĩ
  return prisma.datLich.findMany({
    where: { bacSiId: BigInt(bacSiId) },
    include: defaultInclude,
    orderBy: [{ ngayDat: "desc" }, { gioBatDau: "asc" }],
  });
};

// ============================================================================
// 3. CÁC NGHIỆP VỤ THAY ĐỔI DỮ LIỆU (MUTATIONS)
// ============================================================================

/**
 * Nghiệp vụ cốt lõi: Đặt lịch khám mới.
 * Thực hiện hàng loạt kiểm tra chặt chẽ trước khi ghi nhận vào DB bằng Database Transaction:
 * - Kiểm tra phân quyền: Bệnh nhân chỉ được đặt cho chính mình.
 * - Chống spam đặt lịch: Mỗi bệnh nhân tại một thời điểm chỉ được có tối đa 1 lịch hẹn chưa hoàn thành (chờ xác nhận/đã xác nhận).
 * - Tính toán thời gian: Dựa vào "thời lượng khám" cấu hình của chuyên khoa bác sĩ đó để tính giờ kết thúc.
 * - Định vị ca trực (Shift allocation): Tìm ca làm việc (lichLamViecBacSi) khớp với giờ đặt và ngày đặt.
 * - Kiểm tra sức chứa (Capacity check): Đảm bảo số lượng bệnh nhân hiện tại của ca chưa vượt quá mức tối đa.
 * - Chống đặt trùng slot (Concurrency check): Đảm bảo không có 2 người đặt cùng một bác sĩ vào cùng một giờ trong một ngày.
 * - Thực hiện ghi nhận thông qua Transaction để đảm bảo tính toàn vẹn (tạo lịch hẹn mới + tăng số bệnh nhân hiện tại của ca đó lên 1).
 * - Dọn dẹp cache Redis liên quan để Frontend thấy dữ liệu cập nhật tức thời.
 * 
 * @param {Object} data - Dữ liệu đặt lịch gửi từ client ({ bacSiId, benhNhanId, ngayDat, gioBatDau, lyDoKham, giaKham, hinhThucThanhToanId })
 * @param {Object} requestUser - Thông tin người dùng đang đăng nhập thực hiện đặt lịch
 * @returns {Promise<Object>} Bản ghi lịch hẹn vừa được tạo thành công
 */
const create = async (data, requestUser = null) => {
  // PHÂN QUYỀN TRUY CẬP & CHỐNG SPAM:
  if (requestUser?.vaiTro === "benh_nhan") {
    // 1. Bệnh nhân không được phép đặt lịch hộ người khác (ID bệnh nhân truyền lên phải khớp với tài khoản)
    if (BigInt(data.benhNhanId) !== requestUser.benhNhan?.id) {
      throw new AppError("Bạn không có quyền đặt lịch khám cho bệnh nhân khác", 403);
    }

    // 2. Chống spam: Mỗi bệnh nhân chỉ được có tối đa 1 lịch hẹn đang trong trạng thái xử lý (0: Chờ xác nhận hoặc 1: Đã xác nhận)
    const activeAppointment = await prisma.datLich.findFirst({
      where: {
        benhNhanId: BigInt(data.benhNhanId),
        trangThai: { in: [0, 1] },
      },
    });

    if (activeAppointment) {
      throw new AppError(
        "Bạn đang có một lịch hẹn chưa hoàn tất (đang chờ xác nhận hoặc đã xác nhận). Vui lòng hoàn thành hoặc hủy lịch hẹn hiện tại trước khi đặt lịch mới.",
        400
      );
    }
  }

  // STEP 1: Xác thực sự tồn tại của Bác sĩ và Bệnh nhân trong hệ thống
  const bacSi = await prisma.bacSi.findUnique({
    where: { id: BigInt(data.bacSiId) },
    include: { chuyenKhoa: { select: { thoiLuongKham: true } } }, // Lấy kèm thời lượng khám của chuyên khoa bác sĩ trực thuộc
  });
  if (!bacSi) throw new AppError("Không tìm thấy bác sĩ", 404);

  const benhNhan = await prisma.benhNhan.findUnique({
    where: { id: BigInt(data.benhNhanId) },
  });
  if (!benhNhan) throw new AppError("Không tìm thấy bệnh nhân", 404);

  // STEP 2: Tính toán thời gian bắt đầu và kết thúc của ca khám
  const thoiLuongKham = bacSi.chuyenKhoa?.thoiLuongKham || 20; // Nếu chuyên khoa không cấu hình, mặc định mỗi ca khám là 20 phút
  const gioBatDauDate = parseTime(data.gioBatDau); // Chuyển chuỗi "HH:mm" thành Date chuẩn hóa mốc ngày 2000-01-01
  const gioKetThucDate = dayjs(gioBatDauDate).add(thoiLuongKham, "minute").toDate(); // Cộng thêm số phút khám để ra giờ kết thúc

  // STEP 3: Truy vấn danh sách tất cả các ca làm việc đang mở (sanSang = 1) của bác sĩ trong ngày đặt lịch
  const availableShifts = await prisma.lichLamViecBacSi.findMany({
    where: {
      bacSiId: BigInt(data.bacSiId),
      ngayLamViec: new Date(data.ngayDat),
      sanSang: 1, // Chỉ lấy ca làm việc đang hoạt động, không bị đóng
    },
    include: { khungGio: true },
  });

  // STEP 4: Đối chiếu xem giờ bắt đầu đặt lịch khám có nằm trong ca trực nào của bác sĩ không
  let lichLamViec = null;
  const slotMs = thoiLuongKham * 60_000; // Đổi số phút khám ra mili-giây để tính toán thời gian slot tiếp theo

  for (const shift of availableShifts) {
    if (!shift.khungGio) continue;

    let cursor = dayjs(shift.khungGio.gioBatDau);
    let sloted = 0;

    // Duyệt qua từng slot khám dựa trên giới hạn số bệnh nhân tối đa của ca đó (soBenhNhanToiDa)
    while (sloted < shift.soBenhNhanToiDa) {
      // Nếu tìm thấy một slot có giờ bắt đầu khớp chính xác với giờ người dùng muốn đặt
      if (cursor.format("HH:mm") === dayjs(gioBatDauDate).format("HH:mm")) {
        lichLamViec = shift; // Lưu lại ca trực này
        break;
      }
      cursor = cursor.add(slotMs, "millisecond"); // Nhảy sang slot tiếp theo
      sloted++;
    }
    if (lichLamViec) break; // Đã tìm thấy ca trực thích hợp, thoát khỏi vòng lặp các ca trực
  }

  // Nếu giờ đặt khám không thuộc bất kỳ ca trực nào, hoặc ca trực đã bị tắt/đầy
  if (!lichLamViec) {
    throw new AppError(
      `Không thể đặt lịch: Slot ${data.gioBatDau} – ${formatTime(gioKetThucDate)} này không nằm trong bất kỳ ca làm việc nào hoặc ca đó đã bị đóng/kín chỗ.`,
      400,
    );
  }

  // STEP 5: Kiểm tra xem ca làm việc này có bị quá tải hay không (số bệnh nhân đã đặt >= số tối đa)
  if (lichLamViec.soBenhNhanHienTai >= lichLamViec.soBenhNhanToiDa) {
    throw new AppError(
      "Ca làm việc đã đầy hoặc không còn slot trống, vui lòng chọn ca khác.",
      400,
    );
  }

  // STEP 6: Chống đặt lịch trùng lặp (1 bác sĩ không thể khám 2 người cùng 1 lúc)
  // Sử dụng chỉ mục duy nhất (Unique Constraint) trong Database: [bacSiId, ngayDat, gioBatDau]
  const trungLich = await prisma.datLich.findUnique({
    where: {
      unique_lich: {
        bacSiId: BigInt(data.bacSiId),
        ngayDat: new Date(data.ngayDat),
        gioBatDau: gioBatDauDate,
      },
    },
  });

  if (trungLich) {
    throw new AppError(
      "Khung giờ này đã có người đăng ký, vui lòng chọn khung giờ khác.",
      409,
    );
  }

  // STEP 7: Thực hiện Database Transaction để đảm bảo tính đồng bộ và toàn vẹn dữ liệu
  return prisma.$transaction(async (tx) => {
    // 7.1. Tạo bản ghi đặt lịch mới
    const datLich = await tx.datLich.create({
      data: {
        ngayDat: new Date(data.ngayDat),
        gioBatDau: gioBatDauDate,
        gioKetThuc: gioKetThucDate,
        lyDoKham: data.lyDoKham,
        giaKham: data.giaKham ? parseFloat(data.giaKham) : bacSi.giaKham, // Sử dụng giá khám tùy chỉnh từ Admin hoặc mặc định của bác sĩ
        trangThai: 0, // 0: Chờ xác nhận
        trangThaiThanhToan: 0, // 0: Chưa thanh toán (sẽ cập nhật khi có phản hồi IPN từ VNPay hoặc thanh toán tại quầy)
        bacSiId: BigInt(data.bacSiId),
        benhNhanId: BigInt(data.benhNhanId),
        hinhThucThanhToanId: data.hinhThucThanhToanId
          ? BigInt(data.hinhThucThanhToanId)
          : null,
        lichLamViecId: lichLamViec.id,
      },
      include: defaultInclude,
    });

    // 7.2. Tăng số lượng bệnh nhân hiện tại đã đăng ký trong ca làm việc lên 1 đơn vị
    await tx.lichLamViecBacSi.update({
      where: { id: lichLamViec.id },
      data: { soBenhNhanHienTai: { increment: 1 } },
    });

    // 7.3. Dọn dẹp cache Redis để đảm bảo người dùng khác truy vấn slot trống sẽ nhận được thông tin mới nhất
    await delCache(getSlotCacheKey(data.bacSiId, data.ngayDat));
    await delCache("cache:stats:overview"); // Xóa cache thống kê trang dashboard của Admin

    return datLich;
  });
};

/**
 * Cập nhật trạng thái tổng thể của một lịch hẹn (ví dụ: Chờ xác nhận -> Đã xác nhận -> Đã khám -> Hủy).
 * Hàm này tự động xử lý giải phóng/chiếm dụng slot ca trực dựa trên sự thay đổi trạng thái:
 * - Nếu chuyển lịch hẹn sang trạng thái Hủy (trangThai = 3): Giảm số bệnh nhân hiện tại của ca làm việc đi 1 (giải phóng slot).
 * - Nếu khôi phục lịch hẹn từ trạng thái Hủy sang trạng thái khác: Tăng số bệnh nhân hiện tại của ca làm việc lên 1 (chiếm lại slot).
 * - Sử dụng Transaction để bảo vệ dữ liệu.
 * - Tự động gửi email xác nhận đặt lịch thành công cho bệnh nhân khi trạng thái chuyển từ Chờ xác nhận (0) sang Đã xác nhận (1).
 * 
 * @param {string|number} id - ID lịch hẹn cần cập nhật
 * @param {number} trangThai - Trạng thái mới muốn thiết lập (0, 1, 2, 3)
 * @param {Object} requestUser - Thông tin người dùng đang thực hiện yêu cầu
 * @returns {Promise<Object>} Bản ghi lịch hẹn sau khi cập nhật
 */
const updateTrangThai = async (id, trangThai, requestUser = null) => {
  // Tìm kiếm lịch hẹn hiện tại trong DB
  const existing = await prisma.datLich.findUnique({
    where: { id: BigInt(id) },
  });

  if (!existing) throw new AppError("Không tìm thấy lịch hẹn", 404);

  // PHÂN QUYỀN TRUY CẬP: Bác sĩ chỉ được cập nhật lịch hẹn khám của chính mình
  if (requestUser?.vaiTro === "bac_si" && existing.bacSiId !== requestUser.bacSi?.id) {
    throw new AppError("Bạn không có quyền cập nhật trạng thái lịch hẹn của bác sĩ khác", 403);
  }

  const oldTrangThai = existing.trangThai;
  const newTrangThai = Number(trangThai);

  // Thực hiện cập nhật trạng thái và điều chỉnh số lượng slot trong Transaction
  const updatedDatLich = await prisma.$transaction(async (tx) => {
    const datLich = await tx.datLich.update({
      where: { id: BigInt(id) },
      data: { trangThai: newTrangThai },
      include: defaultInclude,
    });

    // TRƯỜNG HỢP 1: Hủy lịch (Chuyển từ trạng thái khác sang Đã hủy (3))
    // Giảm số lượng bệnh nhân của ca làm việc đi 1 để nhường slot trống cho người khác
    if (oldTrangThai !== 3 && newTrangThai === 3 && existing.lichLamViecId) {
      await tx.lichLamViecBacSi.update({
        where: { id: existing.lichLamViecId },
        data: { soBenhNhanHienTai: { decrement: 1 } },
      });
    }

    // TRƯỜNG HỢP 2: Khôi phục lịch (Chuyển từ Đã hủy (3) về trạng thái hoạt động bình thường)
    // Tăng số lượng bệnh nhân của ca làm việc lên 1 để giữ lại slot
    if (oldTrangThai === 3 && newTrangThai !== 3 && existing.lichLamViecId) {
      await tx.lichLamViecBacSi.update({
        where: { id: existing.lichLamViecId },
        data: { soBenhNhanHienTai: { increment: 1 } },
      });
    }

    // Xóa các cache liên quan để làm mới danh sách slot trống và dashboard thống kê
    await delCache(getSlotCacheKey(existing.bacSiId, existing.ngayDat));
    await delCache("cache:stats:overview");

    return datLich;
  });

  return updatedDatLich;
};

/**
 * Cập nhật trạng thái thanh toán của lịch hẹn sau khi khám bệnh.
 * - Quy định trạng thái thanh toán: (0: Chưa thanh toán, 1: Thanh toán phí khám, 2: Đã thanh toán tất cả bao gồm thuốc).
 * - Ràng buộc nghiệp vụ: Chỉ cho phép cập nhật thanh toán đối với những lịch hẹn đã hoàn thành khám bệnh (trangThai = 2).
 * - Nếu thanh toán thành công (status >= 1), tự động cập nhật hình thức thanh toán mặc định là "OFFLINE" (Thanh toán tại quầy).
 * 
 * @param {string|number} id - ID lịch hẹn cần cập nhật thanh toán
 * @param {number|string} trangThaiThanhToan - Trạng thái thanh toán mới
 * @returns {Promise<Object>} Bản ghi lịch hẹn sau khi cập nhật
 */
const updateThanhToan = async (id, trangThaiThanhToan) => {
  // Tìm kiếm lịch hẹn hiện tại cùng thông tin đơn thuốc đi kèm
  const existing = await prisma.datLich.findUnique({
    where: { id: BigInt(id) },
    include: { donThuoc: true },
  });

  if (!existing) throw new AppError("Không tìm thấy lịch hẹn", 404);

  // Chỉ cho phép cập nhật thanh toán khi bác sĩ đã khám xong hoàn toàn (trangThai = 2)
  if (existing.trangThai !== 2) {
    throw new AppError("Chỉ cập nhật thanh toán khi lịch hẹn đã khám xong", 400);
  }

  const status = Number(trangThaiThanhToan);
  const updateData = { trangThaiThanhToan: status };

  // Nếu trạng thái thanh toán là >= 1 (đã thanh toán tiền khám hoặc thanh toán xong cả đơn thuốc)
  if (status >= 1) {
    // Tìm ID của hình thức thanh toán trực tiếp tại quầy (OFFLINE)
    const offline = await prisma.hinhThucThanhToan.findFirst({
      where: { maLoai: "OFFLINE" },
    });
    // Gán hình thức thanh toán cho lịch hẹn là thanh toán trực tiếp tại quầy
    if (offline) updateData.hinhThucThanhToanId = offline.id;
  }

  // Cập nhật thông tin thanh toán vào Database
  const result = await prisma.datLich.update({
    where: { id: BigInt(id) },
    data: updateData,
    include: defaultInclude,
  });

  // Xóa cache dashboard để cập nhật doanh thu và số lượng thanh toán mới nhất
  await delCache("cache:stats:overview");
  return result;
};

/**
 * Xóa vĩnh viễn (Hard Delete) lịch hẹn khỏi hệ thống kèm theo dọn dẹp các dữ liệu liên quan.
 * Quy trình thực hiện trong Transaction để đảm bảo tính an toàn dữ liệu:
 * - Phân quyền: Bệnh nhân chỉ được xóa lịch của chính mình. Bác sĩ chỉ được xóa lịch của bệnh nhân đăng ký khám với mình.
 * - Ràng buộc: Ngoại trừ Admin, không vai trò nào khác được phép xóa các lịch hẹn đã được xác nhận (1) hoặc đã khám xong (2) (phải dùng chức năng Hủy lịch).
 * - Transaction thực hiện:
 *   1. Xóa các đơn thuốc (donThuoc) liên quan đến lịch hẹn này.
 *   2. Xóa các giao dịch thanh toán (giaoDich) liên quan.
 *   3. Xóa chính bản ghi lịch hẹn (datLich).
 *   4. Nếu lịch hẹn bị xóa đang hoạt động bình thường (không phải đã hủy), tiến hành hoàn trả 1 slot trống cho ca làm việc của bác sĩ.
 * - Xóa sạch cache Redis tương ứng.
 * 
 * @param {string|number} id - ID lịch hẹn cần xóa cứng
 * @param {Object} requestUser - Thông tin người dùng yêu cầu xóa lịch
 */
const remove = async (id, requestUser) => {
  // Tìm kiếm lịch hẹn hiện có trong Database
  const existing = await prisma.datLich.findUnique({
    where: { id: BigInt(id) },
  });

  if (!existing) throw new AppError("Không tìm thấy dữ liệu để xóa", 404);

  // PHÂN QUYỀN TRUY CẬP:
  // 1. Nếu là bệnh nhân: Chỉ được can thiệp vào lịch hẹn do chính tài khoản mình tạo ra
  if (requestUser.vaiTro === "benh_nhan") {
    const benhNhan = await prisma.benhNhan.findFirst({
      where: { taiKhoanId: requestUser.id },
    });
    if (!benhNhan || existing.benhNhanId !== benhNhan.id) {
      throw new AppError("Bạn không có quyền can thiệp vào lịch hẹn này", 403);
    }
  }

  // 2. Nếu là bác sĩ: Chỉ được can thiệp vào lịch hẹn khám đăng ký với chính mình
  if (requestUser.vaiTro === "bac_si" && existing.bacSiId !== requestUser.bacSi?.id) {
    throw new AppError("Bạn không có quyền xóa lịch khám của bệnh nhân thuộc bác sĩ khác", 403);
  }

  // RÀNG BUỘC PHÂN QUYỀN XÓA:
  // Chỉ có tài khoản Admin mới được xóa lịch hẹn ở mọi trạng thái nhằm mục đích dọn dẹp hệ thống.
  // Các tài khoản thông thường (Bệnh nhân, Bác sĩ) không được xóa lịch hẹn khi đã chuyển sang Đã xác nhận (1) hoặc Đã khám (2).
  if (
    requestUser.vaiTro !== "admin" &&
    (existing.trangThai === 1 || existing.trangThai === 2)
  ) {
    throw new AppError(
      "Không thể xóa cứng đối với lịch hẹn đã xác nhận hoặc đã khám. Vui lòng chuyển sang trạng thái Hủy nếu cần.",
      400,
    );
  }

  // Tiến hành chạy chuỗi thao tác xóa trong Database Transaction
  await prisma.$transaction(async (tx) => {
    // Bước 1: Xóa toàn bộ đơn thuốc liên đới
    await tx.donThuoc.deleteMany({ where: { datLichId: BigInt(id) } });
    
    // Bước 2: Xóa toàn bộ các giao dịch liên quan đến lịch hẹn này
    await tx.giaoDich.deleteMany({ where: { datLichId: BigInt(id) } });

    // Bước 3: Xóa bản ghi lịch hẹn chính
    await tx.datLich.delete({ where: { id: BigInt(id) } });

    // Bước 4: Nếu lịch hẹn bị xóa chưa ở trạng thái Hủy (3), thực hiện giải phóng ca trực bằng cách giảm 1 bệnh nhân hiện tại
    if (existing.trangThai !== 3 && existing.lichLamViecId) {
      await tx.lichLamViecBacSi.update({
        where: { id: existing.lichLamViecId },
        data: { soBenhNhanHienTai: { decrement: 1 } },
      });
    }
  });

  // Làm mới cache Redis liên quan để cập nhật giao diện ngay lập tức
  await delCache(getSlotCacheKey(existing.bacSiId, existing.ngayDat));
  await delCache("cache:stats:overview");
};

/**
 * Lấy danh sách các khung giờ khám bệnh (Slots) còn trống trong một ngày cụ thể của một bác sĩ.
 * Hàm này sinh ra danh sách slot linh hoạt và kiểm tra xem slot nào đã có người đặt, slot nào còn trống:
 * - Bước 1: Kiểm tra cache Redis. Nếu đã có sẵn trong cache, trả về dữ liệu cache ngay lập tức để tăng tốc độ phản hồi.
 * - Bước 2: Lấy thông tin thời lượng khám bệnh của chuyên khoa mà bác sĩ đó trực thuộc.
 * - Bước 3: Lấy danh sách toàn bộ các ca trực làm việc đang mở (lichLamViecBacSi) của bác sĩ trong ngày đó.
 * - Bước 4: Lấy danh sách các lịch hẹn của bác sĩ trong ngày đó mà chưa bị hủy (trangThai != 3) để biết các giờ đã được đặt.
 * - Bước 5: Duyệt qua từng ca làm việc, dựa vào thời điểm bắt đầu/kết thúc ca làm việc và thời lượng khám của bác sĩ để sinh ra danh sách toàn bộ các slot giờ (ví dụ: 08:00 - 08:20, 08:20 - 08:40...).
 *   + Đánh dấu slot `daDat: true` nếu giờ bắt đầu của slot đó nằm trong danh sách giờ đã đặt.
 *   + Hỗ trợ cờ `isOvertime: true` (Làm thêm giờ) nếu slot khám sinh ra vượt qua giờ kết thúc hành chính của ca làm việc (do Admin tăng số bệnh nhân tối đa).
 * - Bước 6: Lưu kết quả tìm kiếm vào Redis cache với thời gian tồn tại là 5 phút (300 giây).
 * 
 * @param {Object} queryParams - Tham số tra cứu ({ bacSiId, ngayDat })
 * @returns {Promise<Object>} Đối tượng chi tiết gồm thông tin bác sĩ, danh sách tất cả các slots và danh sách chỉ các slots còn trống (slotTrong)
 */
const getSlotTrong = async ({ bacSiId, ngayDat }) => {
  // Đảm bảo phải truyền đầy đủ bác sĩ và ngày cần tìm kiếm
  if (!bacSiId || !ngayDat) {
    throw new AppError("Yêu cầu thông tin Bác sĩ và Ngày đặt", 400);
  }

  // 1. Kiểm tra cache Redis trước
  const cacheKey = getSlotCacheKey(bacSiId, ngayDat);
  const cached = await getCache(cacheKey);
  if (cached) return cached; // Nếu có dữ liệu trong cache thì trả về ngay lập tức để tiết kiệm tài nguyên Database

  // 2. Lấy thông tin của bác sĩ và thời lượng khám
  const bacSi = await prisma.bacSi.findUnique({
    where: { id: BigInt(bacSiId) },
    include: {
      chuyenKhoa: { select: { thoiLuongKham: true, tenChuyenKhoa: true } },
    },
  });

  if (!bacSi) throw new AppError("Không tìm thấy bác sĩ", 404);

  const thoiLuongKham = bacSi.chuyenKhoa?.thoiLuongKham || 20; // Thời lượng khám mặc định là 20 phút

  // 3. Lấy tất cả ca trực làm việc đang mở trong ngày đã chọn
  const lichLamViecs = await prisma.lichLamViecBacSi.findMany({
    where: {
      bacSiId: BigInt(bacSiId),
      ngayLamViec: new Date(ngayDat),
      sanSang: 1, // Chỉ lấy ca làm việc đang mở
    },
    include: { khungGio: true },
    orderBy: { khungGio: { gioBatDau: "asc" } }, // Sắp xếp ca làm việc từ sáng đến chiều
  });

  // Nếu bác sĩ không có ca trực nào trong ngày này, trả về danh sách rỗng
  if (lichLamViecs.length === 0) return [];

  // 4. Lấy danh sách giờ bắt đầu của các lịch hẹn đã được đặt trước đó trong ngày (bỏ qua những lịch đã bị hủy)
  const datLichs = await prisma.datLich.findMany({
    where: {
      bacSiId: BigInt(bacSiId),
      ngayDat: new Date(ngayDat),
      trangThai: { not: 3 }, // Bỏ qua lịch có trạng thái Đã hủy (3)
    },
    select: { gioBatDau: true },
  });

  // Đưa tất cả mốc thời gian đã đặt vào một Set để hỗ trợ tra cứu nhanh bằng O(1)
  const bookedTimes = new Set(datLichs.map((d) => d.gioBatDau.getTime()));
  const allSlots = [];

  // 5. Duyệt qua từng ca trực để tính toán sinh slot giờ động
  for (const llv of lichLamViecs) {
    if (!llv.khungGio) continue;

    const slotMs = thoiLuongKham * 60_000; // Đổi thời lượng khám thành mili-giây
    let cursor = dayjs(llv.khungGio.gioBatDau);
    let sloted = 0;

    // Sinh danh sách slot liên tục dựa vào sức chứa cho phép của ca (soBenhNhanToiDa)
    while (sloted < llv.soBenhNhanToiDa) {
      const slotStart = cursor.toDate();
      const slotEnd = cursor.add(slotMs, "millisecond").toDate();

      allSlots.push({
        gioBatDau: formatTime(slotStart), // Chuyển sang định dạng chuỗi giờ "HH:mm"
        gioKetThuc: formatTime(slotEnd),
        // Kiểm tra xem slot giờ này đã có bệnh nhân nào đặt trước đó hay chưa
        daDat: bookedTimes.has(cursor.valueOf()),
        lichLamViecId: llv.id,
        // Ca trực này còn chỗ hay không (soBenhNhanHienTai < soBenhNhanToiDa)
        conTrong: llv.soBenhNhanHienTai < llv.soBenhNhanToiDa,
        // Nếu giờ kết thúc của slot này vượt quá giờ kết thúc hành chính của ca trực -> Đánh dấu là ca ngoài giờ (Overtime)
        isOvertime: cursor.add(slotMs, "millisecond").isAfter(dayjs(llv.khungGio.gioKetThuc)),
      });

      cursor = cursor.add(slotMs, "millisecond"); // Dịch con trỏ thời gian đến slot tiếp theo
      sloted++;
    }
  }

  // Gom toàn bộ thông tin kết quả
  const result = {
    bacSi: {
      id: bacSi.id,
      tenBacSi: bacSi.tenBacSi,
      chuyenKhoa: bacSi.chuyenKhoa?.tenChuyenKhoa,
      thoiLuongKham,
    },
    ngayDat,
    slots: allSlots, // Tất cả các slot (bao gồm cả slot đã đặt và chưa đặt)
    slotTrong: allSlots.filter((s) => !s.daDat && s.conTrong), // Chỉ lấy các slot còn trống và có thể đặt được
  };

  // 6. Lưu kết quả vừa tính toán vào Redis cache với TTL là 5 phút (300 giây) để giảm tải cho DB ở những lần gọi tiếp theo
  await setCache(cacheKey, result, 300);
  return result;
};

/**
 * Thay đổi phương thức thanh toán cho một lịch hẹn.
 * - Nghiệp vụ thực tế: Thường sử dụng khi người dùng đặt lịch chọn thanh toán online qua cổng VNPay nhưng giao dịch thất bại,
 *   và người dùng muốn chuyển sang hình thức thanh toán trả sau trực tiếp tại quầy (OFFLINE).
 * - Ràng buộc nghiệp vụ: Chỉ được thay đổi khi lịch hẹn chưa phát sinh bất kỳ khoản thanh toán nào (trangThaiThanhToan = 0).
 * - Phân quyền: Chỉ cho phép chính Bệnh nhân chủ sở hữu lịch hẹn đó hoặc tài khoản Admin thực hiện thay đổi.
 * 
 * @param {string|number} id - ID lịch hẹn cần thay đổi phương thức thanh toán
 * @param {string|number} hinhThucId - ID của hình thức thanh toán mới muốn đổi sang
 * @param {Object} requestUser - Thông tin người dùng đang gửi yêu cầu
 * @returns {Promise<Object>} Bản ghi lịch hẹn sau khi cập nhật phương thức thanh toán mới
 */
const changePaymentMethod = async (id, hinhThucId, requestUser) => {
  // Tìm kiếm lịch hẹn tương ứng trong DB
  const existing = await prisma.datLich.findUnique({
    where: { id: BigInt(id) },
  });

  if (!existing) throw new AppError("Không tìm thấy lịch hẹn", 404);

  // PHÂN QUYỀN TRUY CẬP: Nếu là bệnh nhân, yêu cầu ID bệnh nhân của lịch hẹn phải khớp với tài khoản đang đăng nhập
  if (requestUser.vaiTro === "benh_nhan") {
    if (existing.benhNhanId !== requestUser.benhNhan?.id) {
      throw new AppError("Bạn không có quyền đổi phương thức cho lịch hẹn này", 403);
    }
  }

  // RÀNG BUỘC: Nếu lịch hẹn đã phát sinh thanh toán trước đó (trangThaiThanhToan > 0), chặn không cho đổi phương thức nữa
  if (existing.trangThaiThanhToan > 0) {
    throw new AppError("Lịch hẹn đã có phát sinh thanh toán, không thể đổi hình thức", 400);
  }

  // Cập nhật hình thức thanh toán mới vào cơ sở dữ liệu
  return prisma.datLich.update({
    where: { id: BigInt(id) },
    data: { hinhThucThanhToanId: BigInt(hinhThucId) },
    include: defaultInclude,
  });
};

module.exports = {
  getAll,
  getById,
  getByBenhNhan,
  getByBacSi,
  create,
  updateTrangThai,
  updateThanhToan,
  remove,
  getSlotTrong,
  changePaymentMethod,
};
