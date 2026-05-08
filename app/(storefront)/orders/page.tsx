"use client";

import Link from "next/link";
import { useState } from "react";
import { Package, ShoppingBag } from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";
import { Pagination } from "@/components/storefront/pagination";
import { OrderStatusBadge } from "@/components/storefront/order/order-status-badge";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { useMyOrders } from "@/hooks/use-orders";
import { formatVnd, formatDateTime } from "@/lib/utils";

export default function OrdersPage() {
  return (
    <RequireAuth roles={["CUSTOMER"]}>
      <OrdersContent />
    </RequireAuth>
  );
}

function OrdersContent() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyOrders({
    page,
    size: 10,
    sortBy: "orderDate",
    sortDir: "desc",
  });

  const orders = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="container-app py-10">
      <div className="mb-8">
        <h1 className="font-display text-stone-900 text-4xl font-extrabold tracking-tight">
          Đơn hàng của tôi
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          {data?.totalElements != null
            ? `Tổng cộng ${data.totalElements} đơn`
            : "Lịch sử các đơn hàng đã đặt"}
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Spinner className="text-primary-700" size={32} />
        </div>
      )}

      {!isLoading && orders.length === 0 && (
        <EmptyState
          icon={<Package size={56} />}
          title="Bạn chưa có đơn hàng nào"
          description="Khám phá sản phẩm và đặt đơn đầu tiên."
          action={
            <Link href="/products">
              <Button uppercase>Mua sắm ngay</Button>
            </Link>
          }
        />
      )}

      {!isLoading && orders.length > 0 && (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li
              key={order.id}
              className="overflow-hidden rounded-xl border border-stone-200 bg-white"
            >
              <Link
                href={`/orders/${order.id}`}
                className="block transition-colors hover:bg-stone-50"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 px-5 py-3">
                  <div>
                    <div className="font-mono text-sm font-medium text-stone-900">
                      #{order.id}
                    </div>
                    <div className="text-xs text-stone-500">
                      {formatDateTime(order.orderDate)}
                    </div>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                  <ul className="space-y-2">
                    {order.items.slice(0, 3).map((it) => (
                      <li
                        key={it.id}
                        className="flex items-center gap-3 text-sm"
                      >
                        <ShoppingBag size={14} className="text-stone-400" />
                        <span className="line-clamp-1 flex-1 text-stone-700">
                          {it.productName}{" "}
                          <span className="text-stone-400">
                            · {it.color.name} · {it.size.name} ×{it.quantity}
                          </span>
                        </span>
                      </li>
                    ))}
                    {order.items.length > 3 && (
                      <li className="text-xs text-stone-500">
                        +{order.items.length - 3} sản phẩm khác
                      </li>
                    )}
                  </ul>

                  <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
                    <span className="text-xs text-stone-500">Tổng tiền</span>
                    <span className="font-mono text-primary-700 text-lg font-medium">
                      {formatVnd(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        className="mt-10"
      />
    </div>
  );
}
