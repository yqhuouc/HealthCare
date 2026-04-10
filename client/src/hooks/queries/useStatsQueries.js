/**
 * useStatsQueries — React Query hooks cho Thống kê Admin Dashboard.
 *
 * Bọc adminStatsService bằng useQuery, cung cấp:
 * - Cache tự động (dữ liệu thống kê hiếm khi thay đổi liên tục)
 * - Tự refetch khi staleTime hết
 */
import { useQuery } from "@tanstack/react-query";
import { adminStatsService } from "../../services/adminStatsService";

/** Query keys tập trung */
export const statsKeys = {
  all: ["stats"],
  tongQuan: () => [...statsKeys.all, "tong-quan"],
  lichHen: (query) => [...statsKeys.all, "lich-hen", query],
  doanhThu: (query) => [...statsKeys.all, "doanh-thu", query],
};

/** Lấy các con số thống kê tổng quan (tổng bác sĩ, bệnh nhân, lịch khám) */
export const useTongQuan = () =>
  useQuery({
    queryKey: statsKeys.tongQuan(),
    queryFn: () => adminStatsService.getTongQuan(),
  });

/**
 * Lấy dữ liệu biểu đồ trạng thái lịch hẹn.
 * @param {Object} query - { tuNgay, denNgay, ... }
 */
export const useLichHenStats = (query = {}) =>
  useQuery({
    queryKey: statsKeys.lichHen(query),
    queryFn: () => adminStatsService.getLichHenStats(query),
  });

/**
 * Lấy dữ liệu biểu đồ doanh thu theo năm.
 * @param {Object} query - { nam, ... }
 */
export const useDoanhThuStats = (query = {}) =>
  useQuery({
    queryKey: statsKeys.doanhThu(query),
    queryFn: () => adminStatsService.getDoanhThuStats(query),
  });
