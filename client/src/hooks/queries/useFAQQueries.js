/**
 * useFAQQueries — React Query hooks cho entity Câu hỏi thường gặp (FAQ).
 *
 * Bọc faqService bằng useQuery/useMutation, cung cấp:
 * - Cache tự động theo queryKey
 * - Auto invalidation sau mutation
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { faqService } from "../../services/faqService";

/** Query keys tập trung */
export const faqKeys = {
  all: ["faqs"],
  public: () => [...faqKeys.all, "public"],
  admin: () => [...faqKeys.all, "admin"],
  adminList: (filters) => [...faqKeys.admin(), filters],
  details: () => [...faqKeys.all, "detail"],
  detail: (id) => [...faqKeys.details(), id],
};

/** Lấy danh sách FAQ đang hoạt động (public — bệnh nhân) */
export const useFAQs = () =>
  useQuery({
    queryKey: faqKeys.public(),
    queryFn: () => faqService.getAll(),
  });

/**
 * Lấy tất cả FAQ bao gồm cả bị ẩn (admin).
 * @param {Object} filters - optional filters
 */
export const useFAQsAdmin = (filters = {}) =>
  useQuery({
    queryKey: faqKeys.adminList(filters),
    queryFn: () => faqService.getAllAdmin(filters),
  });

/**
 * Lấy chi tiết 1 FAQ.
 * @param {number|string} id
 */
export const useFAQ = (id) =>
  useQuery({
    queryKey: faqKeys.detail(id),
    queryFn: () => faqService.getById(id),
    enabled: !!id,
  });

/** Tạo FAQ mới (admin) */
export const useCreateFAQ = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => faqService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: faqKeys.all });
    },
  });
};

/** Cập nhật FAQ (admin) */
export const useUpdateFAQ = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => faqService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: faqKeys.all });
      qc.invalidateQueries({ queryKey: faqKeys.detail(id) });
    },
  });
};

/** Xóa FAQ (admin) */
export const useDeleteFAQ = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => faqService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: faqKeys.all });
    },
  });
};
