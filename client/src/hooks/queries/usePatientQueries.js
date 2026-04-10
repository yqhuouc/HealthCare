/**
 * usePatientQueries — React Query hooks cho entity Bệnh nhân.
 *
 * Bọc patientService bằng useQuery/useMutation, cung cấp:
 * - Cache tự động theo queryKey
 * - Auto invalidation sau mutation
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientService } from "../../services/patientService";

/** Query keys tập trung */
export const patientKeys = {
  all: ["patients"],
  lists: () => [...patientKeys.all, "list"],
  list: (filters) => [...patientKeys.lists(), filters],
  details: () => [...patientKeys.all, "detail"],
  detail: (id) => [...patientKeys.details(), id],
};

/**
 * Lấy danh sách bệnh nhân (admin) với filter + phân trang.
 * @param {Object} filters - { page, limit, search }
 */
export const usePatients = (filters = {}) =>
  useQuery({
    queryKey: patientKeys.list(filters),
    queryFn: () => patientService.getAll(filters),
  });

/**
 * Lấy chi tiết 1 bệnh nhân.
 * @param {number|string} id
 */
export const usePatient = (id) =>
  useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => patientService.getById(id),
    enabled: !!id,
  });

/** Cập nhật thông tin bệnh nhân */
export const useUpdatePatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => patientService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: patientKeys.lists() });
      qc.invalidateQueries({ queryKey: patientKeys.detail(id) });
    },
  });
};

/** Xóa bệnh nhân (admin) */
export const useDeletePatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => patientService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: patientKeys.lists() });
    },
  });
};
