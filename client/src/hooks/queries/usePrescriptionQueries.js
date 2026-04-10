/**
 * usePrescriptionQueries — React Query hooks cho entity Đơn thuốc.
 *
 * Bọc prescriptionService bằng useQuery/useMutation, cung cấp:
 * - Cache tự động theo queryKey
 * - Auto invalidation sau mutation (tạo/cập nhật đơn thuốc → invalidate appointment detail)
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { prescriptionService } from "../../services/prescriptionService";
import { appointmentKeys } from "./useAppointmentQueries";

/** Query keys tập trung */
export const prescriptionKeys = {
  all: ["prescriptions"],
  details: () => [...prescriptionKeys.all, "detail"],
  detail: (id) => [...prescriptionKeys.details(), id],
};

/**
 * Lấy chi tiết 1 đơn thuốc.
 * @param {number|string} id
 */
export const usePrescription = (id) =>
  useQuery({
    queryKey: prescriptionKeys.detail(id),
    queryFn: () => prescriptionService.getById(id),
    enabled: !!id,
  });

/**
 * Tạo đơn thuốc cho lịch hẹn đã khám.
 * Sau khi tạo thành công → invalidate cả appointment detail (vì appointment kèm donThuoc).
 */
export const useCreatePrescription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => prescriptionService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: prescriptionKeys.all });
      // Invalidate appointment queries vì appointment kèm thông tin đơn thuốc
      qc.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};

/** Cập nhật đơn thuốc */
export const useUpdatePrescription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => prescriptionService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: prescriptionKeys.detail(id) });
      qc.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};
