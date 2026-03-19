/**
 * Doctor Service - Lấy danh sách bác sĩ, chi tiết bác sĩ, lịch trống
 * TODO: Kết nối với API backend thật (GET /api/doctors, /api/doctors/:id)
 */
import { DOCTORS } from "../data/mockDoctors";

export const doctorService = {
  /** Lấy danh sách tất cả bác sĩ, hỗ trợ filter theo chuyên khoa */
  getAll: async (filters = {}) => {
    // TODO: return api.get("/doctors", { params: filters });
    let result = [...DOCTORS];
    if (filters.specialtyId) {
      result = result.filter((d) => d.specialtyId === filters.specialtyId);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((d) => d.name.toLowerCase().includes(q));
    }
    return result;
  },

  /** Lấy chi tiết một bác sĩ theo ID */
  getById: async (id) => {
    // TODO: return api.get(`/doctors/${id}`);
    return DOCTORS.find((d) => d.id === Number(id)) || null;
  },
};
