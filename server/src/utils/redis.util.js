/**
 * ============================================================
 * Redis Utility — Kết nối và các hàm tiện ích cache.
 *
 * Sử dụng ioredis để kết nối Redis (Upstash hoặc local).
 * Export 3 hàm chính:
 *   - getCache(key)            → Lấy dữ liệu từ cache (trả về object/null)
 *   - setCache(key, data, ttl) → Lưu dữ liệu vào cache với thời gian sống (giây)
 *   - delCache(pattern)        → Xóa cache theo key hoặc pattern (dùng wildcard *)
 * ============================================================
 */
const Redis = require("ioredis");
const config = require("../config");

// --------------- Khởi tạo Redis Client ---------------

let redis = null;

if (config.redisUrl) {
  redis = new Redis(config.redisUrl, {
    maxRetriesPerRequest: 3,        // Tối đa 3 lần thử lại khi mất kết nối
    retryStrategy: (times) => {
      if (times > 3) return null;   // Dừng retry sau 3 lần
      return Math.min(times * 200, 2000); // Đợi 200ms, 400ms, 600ms...
    },
  });

  redis.on("connect", () => {
    console.log("✅ Redis đã kết nối thành công!");
  });

  redis.on("error", (err) => {
    console.error("❌ Redis lỗi kết nối:", err.message);
  });
} else {
  console.warn("⚠️  REDIS_URL chưa được cấu hình → Cache bị tắt, mọi request sẽ đi thẳng vào Database.");
}

// --------------- Hàm tiện ích ---------------

/**
 * Lấy dữ liệu từ Redis cache.
 * @param {string} key - Cache key (ví dụ: "cache:chuyenkhoa:all")
 * @returns {object|null} - Dữ liệu đã parse hoặc null nếu không có/cache tắt
 */
const getCache = async (key) => {
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error(`❌ Redis GET lỗi [${key}]:`, err.message);
    return null; // Lỗi cache thì bỏ qua, để DB xử lý
  }
};

/**
 * Lưu dữ liệu vào Redis cache với TTL (Time To Live).
 * @param {string} key  - Cache key
 * @param {any}    data - Dữ liệu cần lưu (sẽ được JSON.stringify)
 * @param {number} ttl  - Thời gian sống tính bằng giây (mặc định 3600 = 1 giờ)
 */
const setCache = async (key, data, ttl = 3600) => {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(data), "EX", ttl);
  } catch (err) {
    console.error(`❌ Redis SET lỗi [${key}]:`, err.message);
  }
};

/**
 * Xóa cache theo key hoặc pattern (hỗ trợ wildcard *).
 * Ví dụ:
 *   - delCache("cache:chuyenkhoa:all")     → Xóa đúng 1 key
 *   - delCache("cache:bacsi:*")            → Xóa tất cả key bắt đầu bằng "cache:bacsi:"
 *
 * @param {string} pattern - Key hoặc pattern cần xóa
 */
const delCache = async (pattern) => {
  if (!redis) return;
  try {
    if (pattern.includes("*")) {
      // Dùng SCAN để tìm tất cả key khớp pattern, rồi xóa hàng loạt
      const keys = [];
      let cursor = "0";
      do {
        const [newCursor, foundKeys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
        cursor = newCursor;
        keys.push(...foundKeys);
      } while (cursor !== "0");

      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } else {
      await redis.del(pattern);
    }
  } catch (err) {
    console.error(`❌ Redis DEL lỗi [${pattern}]:`, err.message);
  }
};

module.exports = { redis, getCache, setCache, delCache };
