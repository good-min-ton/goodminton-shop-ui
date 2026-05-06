"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";

interface DateRange {
  from?: string;
  to?: string;
}

export function useAdminSummary(range: DateRange = {}) {
  return useQuery({
    queryKey: ["dashboard", "admin", "summary", range],
    queryFn: () => dashboardApi.summary(range),
  });
}

export function useAdminRevenueByDate(
  range: DateRange & { storeId?: number } = {},
) {
  return useQuery({
    queryKey: ["dashboard", "admin", "revenue-by-date", range],
    queryFn: () => dashboardApi.revenueByDate(range),
  });
}

export function useAdminRevenueByStore(range: DateRange = {}) {
  return useQuery({
    queryKey: ["dashboard", "admin", "revenue-by-store", range],
    queryFn: () => dashboardApi.revenueByStore(range),
  });
}

export function useMyStoreSummary(range: DateRange = {}) {
  return useQuery({
    queryKey: ["dashboard", "my-store", "summary", range],
    queryFn: () => dashboardApi.myStoreSummary(range),
  });
}

export function useMyStoreRevenueByDate(range: DateRange = {}) {
  return useQuery({
    queryKey: ["dashboard", "my-store", "revenue-by-date", range],
    queryFn: () => dashboardApi.myStoreRevenueByDate(range),
  });
}
