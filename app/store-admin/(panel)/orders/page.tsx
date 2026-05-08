"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable } from "@/components/admin/data-table";
import { Pagination } from "@/components/storefront/pagination";
import { OrderStatusBadge } from "@/components/storefront/order/order-status-badge";
import { ordersApi } from "@/lib/api/orders";
import { formatVnd, formatDateTime } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/api";

export default function StoreAdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");

  const list = useQuery({
    queryKey: ["store-orders", "list", page],
    queryFn: () =>
      ordersApi.storeOrders({
        page,
        size: 20,
        sortBy: "orderDate",
        sortDir: "desc",
      }),
  });

  const filtered = (list.data?.content ?? []).filter((o) => {
    if (!statusFilter) return true;
    return o.status === statusFilter;
  });

  return (
    <>
      <AdminPageHeader
        title="Đơn hàng"
        description="Đơn được assign về cửa hàng của bạn để fulfill."
      />

      <div className="mb-4 flex items-center gap-2">
        <span className="text-admin-text-muted text-xs">Lọc trạng thái:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "")}
          className="bg-admin-surface text-admin-text border-admin-border rounded-md border px-3 py-1.5 text-sm focus:border-amber-400 focus:outline-none"
        >
          <option value="">Tất cả</option>
          <option value="CONFIRMED">Đã xác nhận</option>
          <option value="PREPARING">Đang chuẩn bị</option>
          <option value="SHIPPING">Đang giao</option>
          <option value="DELIVERED">Đã giao</option>
          <option value="COMPLETED">Hoàn thành</option>
          <option value="CANCELLED">Đã huỷ</option>
        </select>
      </div>

      <DataTable
        columns={[
          {
            key: "customer",
            header: "Khách hàng",
            render: (r: Order) => (
              <div>
                <p className="font-medium">{r.customerName}</p>
                <p className="text-admin-text-muted text-xs">
                  {r.recipientPhone}
                </p>
              </div>
            ),
          },
          {
            key: "items",
            header: "SP",
            align: "center",
            render: (r: Order) => (
              <span className="font-mono">
                {r.items.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            ),
          },
          {
            key: "type",
            header: "Loại",
            render: (r: Order) => (
              <span className="bg-admin-surface-2 text-admin-text-muted inline-flex rounded-md px-2 py-0.5 text-[10px]">
                {r.orderType === "ONLINE" ? "Online" : "Tại quầy"}
              </span>
            ),
          },
          {
            key: "total",
            header: "Tổng",
            align: "right",
            render: (r: Order) => (
              <span className="font-mono text-admin-text font-medium">
                {formatVnd(r.totalAmount)}
              </span>
            ),
          },
          {
            key: "status",
            header: "Trạng thái",
            render: (r: Order) => <OrderStatusBadge status={r.status} />,
          },
          {
            key: "date",
            header: "Ngày",
            render: (r: Order) => (
              <span className="font-mono text-admin-text-muted text-xs">
                {formatDateTime(r.orderDate)}
              </span>
            ),
          },
          {
            key: "actions",
            header: "",
            width: "100px",
            align: "right",
            render: (r: Order) => (
              <Link
                href={`/store-admin/orders/${r.id}`}
                className="text-xs text-amber-300 hover:underline"
              >
                Xử lý →
              </Link>
            ),
          },
        ]}
        data={filtered}
        loading={list.isLoading}
        rowKey={(r) => r.id}
      />

      <Pagination
        page={page}
        totalPages={list.data?.totalPages ?? 1}
        onPageChange={setPage}
        className="mt-6"
      />
    </>
  );
}
