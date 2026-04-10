/**
 * usePaymentQueries — React Query hooks cho Hình thức thanh toán.
 *
 * Bọc paymentService bằng useQuery/useMutation, cung cấp:
 * - Cache tự động theo queryKey
 * - Auto invalidation sau mutation
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentService } from "../../services/paymentService";

/** Query keys tập trung */
export const paymentKeys = {
  all: ["payments"],
  lists: () => [...paymentKeys.all, "list"],
};

/** Lấy tất cả hình thức thanh toán */
export const usePaymentMethods = () =>
  useQuery({
    queryKey: paymentKeys.lists(),
    queryFn: () => paymentService.getAll(),
  });

/** Tạo hình thức thanh toán mới (admin) */
export const useCreatePaymentMethod = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => paymentService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: paymentKeys.lists() });
    },
  });
};

/** Xóa hình thức thanh toán (admin) */
export const useDeletePaymentMethod = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => paymentService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: paymentKeys.lists() });
    },
  });
};
