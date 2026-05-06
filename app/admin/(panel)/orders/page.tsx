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
import type { Order, OrderStatus, OrderType } from "@/types/api";

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [type, setType] = useState<OrderType | "">("");

  const list = useQuery({
    queryKey: ["orders", "all", { page, status, type }],
    queryFn: () =>
      ordersApi.list({
        page,
        size: 20,
        sortBy: "orderDate",
        sortDir: "desc",
        status: status || undefined,
        type: type || undefined,
      }),
  });

  return (
    <>
      <AdminPageHeader
        title="Đơn hàng"
        description="Tất cả đơn hàng trong hệ thống."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-admin-text-muted text-xs">Trạng thái:</span>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as OrderStatus | "");
              setPage(1);
            }}
            className="bg-admin-surface text-admin-text border-admin-border rounded-md border px-3 py-1.5 text-sm focus:border-primary-400 focus:outline-none"
          >
            <option value="">Tất cả</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="PREPARING">Đang chuẩn bị</option>
            <option value="SHIPPING">Đang giao</option>
            <option value="DELIVERED">Đã giao</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã huỷ</option>
            <option value="RETURN_REQUESTED">Yêu cầu hoàn</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-admin-text-muted text-xs">Loại:</span>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value as OrderType | "");
              setPage(1);
            }}
            className="bg-admin-surface text-admin-text border-admin-border rounded-md border px-3 py-1.5 text-sm focus:border-primary-400 focus:outline-none"
          >
            <option value="">Tất cả</option>
            <option value="ONLINE">Online</option>
            <option value="IN_STORE">Tại quầy</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={[
          {
            key: "id",
            header: "Đơn",
            width: "80px",
            render: (r: Order) => (
              <span className="font-mono text-admin-text">#{r.orderId}</span>
            ),
          },
          {
            key: "customer",
            header: "Khách hàng",
            render: (r: Order) => (
              <div>
                <div className="text-admin-text font-medium">
                  {r.customerName}
                </div>
                <div className="text-admin-text-muted text-xs">
                  {r.recipientPhone}
                </div>
              </div>
            ),
          },
          {
            key: "store",
            header: "Chi nhánh",
            render: (r: Order) => (
              <span className="text-admin-text-muted text-xs">
                {r.storeName || "—"}
              </span>
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
            header: "Tổng tiền",
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
            header: "Ngày đặt",
            render: (r: Order) => (
              <span className="font-mono text-admin-text-muted text-xs">
                {formatDateTime(r.orderDate)}
              </span>
            ),
          },
          {
            key: "actions",
            header: "",
            align: "right",
            width: "100px",
            render: (r: Order) => (
              <Link
                href={`/admin/orders/${r.orderId}`}
                className="text-primary-300 text-xs hover:underline"
              >
                Chi tiết →
              </Link>
            ),
          },
        ]}
        data={list.data?.content}
        loading={list.isLoading}
        rowKey={(r) => r.orderId}
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
