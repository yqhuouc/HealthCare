/**
 * useAppointmentQueries — React Query hooks cho entity Lịch hẹn.
 *
 * Bọc appointmentService bằng useQuery/useMutation, cung cấp:
 * - Cache tự động theo queryKey
 * - Auto invalidation sau mutation (tạo/cập nhật/xóa lịch hẹn)
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentService } from "../../services/appointmentService";

/** Query keys tập trung */
export const appointmentKeys = {
  all: ["appointments"],
  lists: () => [...appointmentKeys.all, "list"],
  list: (filters) => [...appointmentKeys.lists(), filters],
  byDoctor: (bacSiId) => [...appointmentKeys.all, "doctor", bacSiId],
  byPatient: (benhNhanId) => [...appointmentKeys.all, "patient", benhNhanId],
  details: () => [...appointmentKeys.all, "detail"],
  detail: (id) => [...appointmentKeys.details(), id],
  slots: (bacSiId, ngayDat) => [...appointmentKeys.all, "slots", bacSiId, ngayDat],
};

/**
 * Lấy tất cả lịch hẹn (admin) với filter + phân trang.
 * @param {Object} filters - { page, limit, trangThai, bacSiId, ... }
 */
export const useAppointments = (filters = {}) =>
  useQuery({
    queryKey: appointmentKeys.list(filters),
    queryFn: () => appointmentService.getAllForAdmin(filters),
  });

/**
 * Lấy lịch hẹn theo bác sĩ (Doctor Portal).
 * @param {number|string} bacSiId
 */
export const useAppointmentsByDoctor = (bacSiId) =>
  useQuery({
    queryKey: appointmentKeys.byDoctor(bacSiId),
    queryFn: () => appointmentService.getByBacSi(bacSiId),
    enabled: !!bacSiId,
  });

/**
 * Lấy lịch sử đặt khám của bệnh nhân.
 * @param {number|string} benhNhanId
 */
export const useAppointmentsByPatient = (benhNhanId) =>
  useQuery({
    queryKey: appointmentKeys.byPatient(benhNhanId),
    queryFn: () => appointmentService.getByBenhNhan(benhNhanId),
    enabled: !!benhNhanId,
  });

/**
 * Lấy chi tiết 1 lịch hẹn.
 * @param {number|string} id
 */
export const useAppointment = (id) =>
  useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => appointmentService.getById(id),
    enabled: !!id,
  });

/**
 * Lấy danh sách slot trống theo bác sĩ + ngày.
 * @param {number|string} bacSiId
 * @param {string} ngayDat - format YYYY-MM-DD
 */
export const useSlotTrong = (bacSiId, ngayDat) =>
  useQuery({
    queryKey: appointmentKeys.slots(bacSiId, ngayDat),
    queryFn: () => appointmentService.getSlotTrong(bacSiId, ngayDat),
    enabled: !!bacSiId && !!ngayDat,
  });

/** Tạo lịch hẹn mới (bệnh nhân đặt khám) */
export const useCreateAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => appointmentService.create(data),
    onSuccess: () => {
      // Invalidate tất cả query liên quan đến appointment
      qc.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};

/**
 * Cập nhật trạng thái lịch hẹn (bác sĩ xác nhận / hoàn thành / hủy).
 * Truyền { id, trangThai } khi gọi mutate.
 */
export const useUpdateAppointmentStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, trangThai }) =>
      appointmentService.updateTrangThai(id, trangThai),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};

/**
 * Cập nhật trạng thái thanh toán (admin).
 * Truyền { id, trangThaiThanhToan } khi gọi mutate.
 */
export const useUpdatePaymentStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, trangThaiThanhToan }) =>
      appointmentService.updateThanhToan(id, trangThaiThanhToan),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};

/** Xóa lịch hẹn */
export const useDeleteAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => appointmentService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};
