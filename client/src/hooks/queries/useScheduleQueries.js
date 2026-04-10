/**
 * useScheduleQueries — React Query hooks cho Lịch làm việc & Khung giờ.
 *
 * Bọc scheduleService bằng useQuery/useMutation, cung cấp:
 * - Cache tự động theo queryKey
 * - Auto invalidation sau mutation
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { scheduleService } from "../../services/scheduleService";

/** Query keys tập trung */
export const scheduleKeys = {
  all: ["schedules"],
  lists: () => [...scheduleKeys.all, "list"],
  list: (params) => [...scheduleKeys.lists(), params],
  khungGio: () => [...scheduleKeys.all, "khung-gio"],
};

/**
 * Lấy danh sách lịch làm việc (filter theo bacSiId, ngayLamViec...).
 * @param {Object} params - { bacSiId, ngayLamViec, ... }
 */
export const useLichLamViec = (params = {}) =>
  useQuery({
    queryKey: scheduleKeys.list(params),
    queryFn: () => scheduleService.getLichLamViec(params),
  });

/** Lấy tất cả khung giờ master */
export const useKhungGio = () =>
  useQuery({
    queryKey: scheduleKeys.khungGio(),
    queryFn: () => scheduleService.getAllKhungGio(),
  });

/** Tạo ca làm việc mới */
export const useCreateLichLamViec = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => scheduleService.createLichLamViec(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: scheduleKeys.lists() });
    },
  });
};

/** Cập nhật ca làm việc (sanSang, soBenhNhanToiDa) */
export const useUpdateLichLamViec = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => scheduleService.updateLichLamViec(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: scheduleKeys.lists() });
    },
  });
};

/** Xóa ca làm việc */
export const useDeleteLichLamViec = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => scheduleService.deleteLichLamViec(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: scheduleKeys.lists() });
    },
  });
};

/** Tạo khung giờ mới (admin) */
export const useCreateKhungGio = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => scheduleService.createKhungGio(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: scheduleKeys.khungGio() });
    },
  });
};

/** Xóa khung giờ (admin) */
export const useDeleteKhungGio = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => scheduleService.deleteKhungGio(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: scheduleKeys.khungGio() });
    },
  });
};
