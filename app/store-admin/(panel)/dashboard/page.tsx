"use client";

import Link from "next/link";
import { ArrowRight, ShoppingCart, Boxes, Store } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminCard } from "@/components/admin/admin-card";
import { StatCard } from "@/components/admin/stat-card";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { OrderStatusBadge } from "@/components/storefront/order/order-status-badge";
import { Spinner } from "@/components/ui/spinner";
import {
  useMyStoreRevenueByDate,
  useMyStoreSummary,
} from "@/hooks/use-dashboard";
import { ordersApi } from "@/lib/api/orders";
import { inventoriesApi } from "@/lib/api/inventories";
import { formatVnd, formatDateTime } from "@/lib/utils";
import type { Inventory, Order } from "@/types/api";

function lastNDays(n: number): { from: string; to: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (n - 1));
  return {
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10),
  };
}

export default function StoreAdminDashboardPage() {
  const range = lastNDays(7);
  const summary = useMyStoreSummary(range);
  const byDate = useMyStoreRevenueByDate(range);

  const recentOrders = useQuery({
    queryKey: ["store-orders", "recent"],
    queryFn: () =>
      ordersApi.storeOrders({
        page: 1,
        size: 5,
        sortBy: "orderDate",
        sortDir: "desc",
      }),
  });

  const lowStock = useQuery({
    queryKey: ["my-store-inventory", "low"],
    queryFn: () =>
      inventoriesApi.myStore({
        page: 1,
        size: 5,
        sortBy: "quantity",
        sortDir: "asc",
      }),
  });

  const s = summary.data;

  return (
    <>
      <AdminPageHeader
        title="Tổng quan cửa hàng"
        description="Số liệu 7 ngày gần nhất tại chi nhánh của bạn."
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
              Doanh thu 7 ngày
            </h2>
            <span className="text-admin-text-muted font-mono text-xs">
              {range.from} → {range.to}
            </span>
          </div>
          <RevenueChart data={byDate.data} loading={byDate.isLoading} />
        </AdminCard>

        <AdminCard>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-admin-text text-sm font-bold tracking-widest uppercase">
              Tồn kho thấp
            </h2>
            <Link
              href="/store-admin/inventory"
              className="inline-flex items-center gap-1 text-xs text-amber-300 hover:underline"
            >
              <span>Xem tất cả</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <LowStockSection
            loading={lowStock.isLoading}
            items={lowStock.data?.content ?? []}
          />
        </AdminCard>
      </div>

      <AdminCard className="mt-4" padded={false}>
        <div className="border-admin-border flex items-center justify-between border-b px-5 py-3">
          <h2 className="font-display text-admin-text text-sm font-bold tracking-widest uppercase">
            <ShoppingCart size={14} className="mr-1.5 inline" />
            Đơn gần đây
          </h2>
          <Link
            href="/store-admin/orders"
            className="inline-flex items-center gap-1 text-xs text-amber-300 hover:underline"
          >
            <span>Xem tất cả</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <RecentOrdersSection
          loading={recentOrders.isLoading}
          orders={recentOrders.data?.content ?? []}
        />
      </AdminCard>
    </>
  );
}

function LowStockSection({
  loading,
  items,
}: Readonly<{ loading: boolean; items: Inventory[] }>) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="text-amber-300" />
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <p className="text-admin-text-muted text-sm">
        <Boxes size={14} className="mr-1.5 inline" />
        Chưa có dữ liệu tồn kho.
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {items.map((inv) => {
        let qtyClass: string;
        if (inv.quantity <= 2) qtyClass = "text-red-400";
        else if (inv.quantity <= 5) qtyClass = "text-amber-400";
        else qtyClass = "text-emerald-400";
        return (
          <li
            key={inv.inventoryId}
            className="bg-admin-surface-2 flex items-center justify-between rounded-md px-3 py-2 text-xs"
          >
            <div className="min-w-0 flex-1">
              <p className="text-admin-text truncate text-sm">
                {inv.productName}
              </p>
              <p className="text-admin-text-muted text-[11px]">
                {inv.color.name} · {inv.size.name}
              </p>
            </div>
            <span className={`font-mono text-sm font-medium ${qtyClass}`}>
              {inv.quantity}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function RecentOrdersSection({
  loading,
  orders,
}: Readonly<{ loading: boolean; orders: Order[] }>) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="text-amber-300" />
      </div>
    );
  }
  if (orders.length === 0) {
    return (
      <div className="text-admin-text-muted py-8 text-center text-sm">
        <Store size={28} className="mx-auto mb-2 opacity-40" />
        Chưa có đơn nào được assign về cửa hàng.
      </div>
    );
  }
  return (
    <ul className="divide-admin-border divide-y">
      {orders.map((o) => (
        <li key={o.orderId}>
          <Link
            href={`/store-admin/orders/${o.orderId}`}
            className="hover:bg-admin-surface-2 flex items-center gap-4 px-5 py-3 text-sm transition-colors"
          >
            <span className="font-mono text-admin-text w-16">
              #{o.orderId}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-admin-text font-medium">{o.customerName}</p>
              <p className="text-admin-text-muted text-xs">
                {o.items.reduce((sum, i) => sum + i.quantity, 0)} sản phẩm ·{" "}
                {formatDateTime(o.orderDate)}
              </p>
            </div>
            <span className="font-mono text-admin-text">
              {formatVnd(o.totalAmount)}
            </span>
            <OrderStatusBadge status={o.status} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
