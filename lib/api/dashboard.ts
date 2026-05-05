import { api, buildQuery } from "@/lib/api";
import type {
  DashboardSummary,
  RevenueByDate,
  RevenueByStore,
} from "@/types/api";

interface DateRange {
  from?: string;
  to?: string;
}

export const dashboardApi = {
  // ===== Super admin =====
  summary(range: DateRange = {}) {
    return api.get<DashboardSummary>(
      `/api/dashboard/summary${buildQuery(range)}`,
    );
  },

  revenueByDate(range: DateRange & { storeId?: number } = {}) {
    return api.get<RevenueByDate[]>(
      `/api/dashboard/revenue-by-date${buildQuery(range)}`,
    );
  },

  revenueByStore(range: DateRange = {}) {
    return api.get<RevenueByStore[]>(
      `/api/dashboard/revenue-by-store${buildQuery(range)}`,
    );
  },

  // ===== Store admin =====
  myStoreSummary(range: DateRange = {}) {
    return api.get<DashboardSummary>(
      `/api/dashboard/my-store/summary${buildQuery(range)}`,
    );
  },

  myStoreRevenueByDate(range: DateRange = {}) {
    return api.get<RevenueByDate[]>(
      `/api/dashboard/my-store/revenue-by-date${buildQuery(range)}`,
    );
  },
};
