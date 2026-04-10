/**
 * useDoctorQueries — React Query hooks cho entity Bác sĩ.
 *
 * Bọc doctorService bằng useQuery/useMutation, cung cấp:
 * - Cache tự động (data được cache theo queryKey)
 * - Auto invalidation sau mutation (create/update/delete → list tự cập nhật)
 * - Loading/error states có sẵn (không cần useState thủ công)
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doctorService } from "../../services/doctorService";

/** Query keys tập trung — đảm bảo invalidation chính xác */
export const doctorKeys = {
  all: ["doctors"],
  lists: () => [...doctorKeys.all, "list"],
  list: (filters) => [...doctorKeys.lists(), filters],
  details: () => [...doctorKeys.all, "detail"],
  detail: (id) => [...doctorKeys.details(), id],
};

/**
 * Lấy danh sách bác sĩ (có filter + phân trang).
 * @param {Object} filters - { page, limit, search, chuyenKhoaId }
 */
export const useDoctors = (filters = {}) =>
  useQuery({
    queryKey: doctorKeys.list(filters),
    queryFn: () => doctorService.getAll(filters),
  });

/**
 * Lấy chi tiết 1 bác sĩ.
 * @param {number|string} id - ID bác sĩ
 */
export const useDoctor = (id) =>
  useQuery({
    queryKey: doctorKeys.detail(id),
    queryFn: () => doctorService.getById(id),
    enabled: !!id,
  });

/** Tạo bác sĩ mới (admin) — auto invalidate list sau khi thành công */
export const useCreateDoctor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => doctorService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: doctorKeys.lists() });
    },
  });
};

/** Cập nhật bác sĩ — auto invalidate list + detail */
export const useUpdateDoctor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => doctorService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: doctorKeys.lists() });
      qc.invalidateQueries({ queryKey: doctorKeys.detail(id) });
    },
  });
};

/** Xóa bác sĩ — auto invalidate list */
export const useDeleteDoctor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => doctorService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: doctorKeys.lists() });
    },
  });
};
