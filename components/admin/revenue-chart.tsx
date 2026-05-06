"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Spinner } from "@/components/ui/spinner";
import { formatVnd } from "@/lib/utils";
import type { RevenueByDate } from "@/types/api";

interface RevenueChartProps {
  data: RevenueByDate[] | undefined;
  loading?: boolean;
  height?: number;
}

export function RevenueChart({
  data,
  loading,
  height = 240,
}: Readonly<RevenueChartProps>) {
  if (loading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height }}
        aria-label="Loading"
      >
        <Spinner className="text-primary-300" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        className="text-admin-text-muted flex items-center justify-center text-sm"
        style={{ height }}
      >
        Chưa có dữ liệu doanh thu
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={data}
        margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5fa9d3" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#5fa9d3" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#2d3148"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fontFamily: "DM Mono, monospace", fontSize: 11, fill: "#8b90a8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(0)}M`}
          tick={{ fontFamily: "DM Mono, monospace", fontSize: 11, fill: "#8b90a8" }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip
          contentStyle={{
            background: "#222536",
            border: "1px solid #2d3148",
            borderRadius: 8,
            fontFamily: "DM Sans, sans-serif",
            fontSize: 13,
          }}
          labelStyle={{ color: "#e8eaf0" }}
          itemStyle={{ color: "#5fa9d3" }}
          formatter={(v) => [formatVnd(Number(v)), "Doanh thu"]}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#5fa9d3"
          strokeWidth={2}
          fill="url(#revenueGrad)"
          dot={false}
          activeDot={{ r: 5, fill: "#5fa9d3", strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
