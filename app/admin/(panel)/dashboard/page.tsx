"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminCard } from "@/components/admin/admin-card";
import { StatCard } from "@/components/admin/stat-card";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { Spinner } from "@/components/ui/spinner";
import {
  useAdminRevenueByDate,
  useAdminRevenueByStore,
  useAdminSummary,
} from "@/hooks/use-dashboard";
import { formatVnd } from "@/lib/utils";

function lastNDays(n: number): { from: string; to: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (n - 1));
  return {
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10),
  };
}

export default function AdminDashboardPage() {
  const range = lastNDays(7);
  const summary = useAdminSummary(range);
  const byDate = useAdminRevenueByDate(range);
  const byStore = useAdminRevenueByStore(range);

  const s = summary.data;

  return (
    <>
      <AdminPageHeader
        title="Tổng quan hệ thống"
        description="Số liệu trong 7 ngày gần nhất."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Doanh thu"
          value={formatVnd(s?.totalRevenue ?? 0)}
          hint="7 ngày qua"
          loading={summary.isLoading}
        />
        <StatCard
          label="Đơn hoàn thành"
          value={s?.completedOrders ?? 0}
          loading={summary.isLoading}
        />
        <StatCard
          label="Đơn online"
          value={s?.onlineOrders ?? 0}
          loading={summary.isLoading}
        />
        <StatCard
          label="Đơn tại quầy"
          value={s?.inStoreOrders ?? 0}
          loading={summary.isLoading}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <AdminCard className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-admin-text text-sm font-bold tracking-widest uppercase">
              Doanh thu theo ngày
            </h2>
            <span className="text-admin-text-muted font-mono text-xs">
              {range.from} → {range.to}
            </span>
          </div>
          <RevenueChart data={byDate.data} loading={byDate.isLoading} />
        </AdminCard>

        <AdminCard>
          <h2 className="font-display text-admin-text mb-4 text-sm font-bold tracking-widest uppercase">
            Doanh thu theo chi nhánh
          </h2>
          {byStore.isLoading ? (
            <div className="flex h-[240px] items-center justify-center">
              <Spinner className="text-primary-300" />
            </div>
          ) : !byStore.data || byStore.data.length === 0 ? (
            <div className="text-admin-text-muted flex h-[240px] items-center justify-center text-sm">
              Chưa có dữ liệu
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={byStore.data}
                layout="vertical"
                margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#2d3148"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tickFormatter={(v: number) =>
                    `${(v / 1_000_000).toFixed(0)}M`
                  }
                  tick={{
                    fontFamily: "DM Mono, monospace",
                    fontSize: 11,
                    fill: "#8b90a8",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="storeName"
                  tick={{ fontSize: 11, fill: "#8b90a8" }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    background: "#222536",
                    border: "1px solid #2d3148",
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                  labelStyle={{ color: "#e8eaf0" }}
                  itemStyle={{ color: "#5fa9d3" }}
                  formatter={(v) => [formatVnd(Number(v)), "Doanh thu"]}
                />
                <Bar dataKey="revenue" fill="#5fa9d3" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </AdminCard>
      </div>
    </>
  );
}
