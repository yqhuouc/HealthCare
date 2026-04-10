/**
 * useSpecialtyQueries — React Query hooks cho entity Chuyên khoa.
 *
 * Bọc specialtyService bằng useQuery/useMutation, cung cấp:
 * - Cache tự động theo queryKey
 * - Auto invalidation sau mutation
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { specialtyService } from "../../services/specialtyService";

/** Query keys tập trung */
export const specialtyKeys = {
  all: ["specialties"],
  lists: () => [...specialtyKeys.all, "list"],
  list: (filters) => [...specialtyKeys.lists(), filters],
  details: () => [...specialtyKeys.all, "detail"],
  detail: (id) => [...specialtyKeys.details(), id],
};

/** Lấy tất cả chuyên khoa (kèm _count.bacSiList) */
export const useSpecialties = () =>
  useQuery({
    queryKey: specialtyKeys.lists(),
    queryFn: () => specialtyService.getAll(),
  });

/**
 * Lấy chi tiết 1 chuyên khoa (kèm danh sách bác sĩ).
 * @param {number|string} id
 */
export const useSpecialty = (id) =>
  useQuery({
    queryKey: specialtyKeys.detail(id),
    queryFn: () => specialtyService.getById(id),
    enabled: !!id,
  });

/** Tạo chuyên khoa mới (admin) */
export const useCreateSpecialty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => specialtyService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: specialtyKeys.lists() });
    },
  });
};

/** Cập nhật chuyên khoa (admin) */
export const useUpdateSpecialty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => specialtyService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: specialtyKeys.lists() });
      qc.invalidateQueries({ queryKey: specialtyKeys.detail(id) });
    },
  });
};

/** Xóa chuyên khoa (admin) */
export const useDeleteSpecialty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => specialtyService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: specialtyKeys.lists() });
    },
  });
};

/** Upload ảnh chuyên khoa (admin) */
export const useUploadSpecialtyImage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }) => specialtyService.uploadAnh(id, file),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: specialtyKeys.lists() });
      qc.invalidateQueries({ queryKey: specialtyKeys.detail(id) });
    },
  });
};
