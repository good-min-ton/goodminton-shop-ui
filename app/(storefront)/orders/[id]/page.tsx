"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { ChevronRight, MapPin, Package, ShoppingBag, Star } from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/storefront/order/order-status-badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import {
  useCancelMyOrder,
  useConfirmReceived,
  useMyOrder,
} from "@/hooks/use-orders";
import { formatVnd, formatDateTime } from "@/lib/utils";

export default function OrderDetailPage() {
  return (
    <RequireAuth roles={["CUSTOMER"]}>
      <OrderDetailContent />
    </RequireAuth>
  );
}

function OrderDetailContent() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id ? Number(params.id) : null;
  const { data: order, isLoading } = useMyOrder(orderId);

  const cancel = useCancelMyOrder(orderId ?? 0);
  const confirm = useConfirmReceived(orderId ?? 0);
  const [showCancelModal, setShowCancelModal] = useState(false);

  if (isLoading) {
    return (
      <div className="container-app flex justify-center py-16">
        <Spinner className="text-primary-700" size={32} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-app py-12">
        <EmptyState
          icon={<Package size={56} />}
          title="Không tìm thấy đơn hàng"
          description="Đơn hàng có thể đã bị xoá hoặc bạn không có quyền xem."
          action={
            <Link href="/orders">
              <Button variant="secondary">Quay lại danh sách</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const canCancel = order.status === "PENDING";
  const canConfirmReceived = order.status === "DELIVERED";
  const canReview = order.status === "COMPLETED";

  return (
    <div className="container-app py-10">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-1 text-xs text-stone-500"
      >
        <Link href="/" className="hover:text-stone-900">
          Trang chủ
        </Link>
        <ChevronRight size={12} />
        <Link href="/orders" className="hover:text-stone-900">
          Đơn hàng
        </Link>
        <ChevronRight size={12} />
        <span className="font-mono text-stone-700">#{order.orderId}</span>
      </nav>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-stone-900 text-3xl font-extrabold tracking-tight">
            Đơn hàng #{order.orderId}
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Đặt lúc {formatDateTime(order.orderDate)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} className="text-sm" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-stone-200 bg-white">
            <h2 className="font-display border-b border-stone-100 px-5 py-3 text-sm font-bold tracking-wider text-stone-900 uppercase">
              Sản phẩm
            </h2>
            <ul className="divide-y divide-stone-100">
              {order.items.map((it) => {
                const reviewHref = `/orders/${order.orderId}/review/${it.orderItemId}`;
                return (
                  <li key={it.orderItemId} className="flex gap-4 p-5">
                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-300">
                      <ShoppingBag size={28} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-stone-900">
                        {it.productName}
                      </p>
                      <p className="mt-0.5 text-sm text-stone-500">
                        {it.color.name} · {it.size.name} · ×{it.quantity}
                      </p>
                      <p className="font-mono mt-0.5 text-xs text-stone-400">
                        SKU: {it.skuCode}
                      </p>
                      {canReview && (
                        <Link
                          href={reviewHref}
                          className="text-primary-700 mt-2 inline-flex items-center gap-1 text-xs font-medium hover:underline"
                        >
                          <Star size={12} />
                          <span>Viết đánh giá</span>
                        </Link>
                      )}
                    </div>
                    <div className="text-right">
                      {it.discountPrice != null &&
                      it.discountPrice < it.unitPrice ? (
                        <>
                          <p className="font-mono text-sm font-medium text-stone-900">
                            {formatVnd(it.discountPrice)}
                          </p>
                          <p className="font-mono text-xs text-stone-400 line-through">
                            {formatVnd(it.unitPrice)}
                          </p>
                        </>
                      ) : (
                        <p className="font-mono text-sm font-medium text-stone-900">
                          {formatVnd(it.unitPrice)}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="rounded-xl border border-stone-200 bg-white p-5">
            <h2 className="font-display mb-4 text-sm font-bold tracking-wider text-stone-900 uppercase">
              Thông tin nhận hàng
            </h2>
            <div className="flex gap-3 text-sm">
              <MapPin size={18} className="mt-0.5 flex-shrink-0 text-stone-400" />
              <div className="space-y-1">
                <p className="font-medium text-stone-900">
                  {order.recipientName}{" "}
                  <span className="text-stone-500">· {order.recipientPhone}</span>
                </p>
                <p className="text-stone-600">{order.recipientAddress}</p>
                {order.recipientEmail && (
                  <p className="text-stone-500">{order.recipientEmail}</p>
                )}
                {order.note && (
                  <p className="text-stone-500">
                    <span className="text-stone-400">Ghi chú:</span> {order.note}
                  </p>
                )}
              </div>
            </div>
          </section>

          {order.payments.length > 0 && (
            <section className="rounded-xl border border-stone-200 bg-white p-5">
              <h2 className="font-display mb-4 text-sm font-bold tracking-wider text-stone-900 uppercase">
                Thanh toán
              </h2>
              <ul className="space-y-3">
                {order.payments.map((p) => (
                  <li
                    key={p.paymentId}
                    className="flex items-center justify-between rounded-lg bg-stone-50 px-4 py-3 text-sm"
                  >
                    <div>
                      <span className="font-medium text-stone-900">
                        {p.method}
                      </span>
                      <span className="font-mono ml-2 text-xs text-stone-500">
                        {formatVnd(p.amount)}
                      </span>
                      {p.vnpayTxnRef && (
                        <p className="font-mono mt-0.5 text-xs text-stone-400">
                          Ref: {p.vnpayTxnRef}
                        </p>
                      )}
                    </div>
                    <PaymentStatusBadge status={p.status} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="self-start space-y-4 lg:sticky lg:top-[88px]">
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <h2 className="font-display mb-4 text-sm font-bold tracking-wider text-stone-900 uppercase">
              Tóm tắt
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-stone-600">Tổng sản phẩm</dt>
                <dd className="font-mono">
                  {order.items.reduce((sum, i) => sum + i.quantity, 0)}
                </dd>
              </div>
              <div className="my-1 h-px bg-stone-200" />
              <div className="flex items-center justify-between font-medium">
                <dt className="text-stone-900">Tổng tiền</dt>
                <dd className="font-mono text-primary-700 text-lg">
                  {formatVnd(order.totalAmount)}
                </dd>
              </div>
            </dl>

            {order.shippingCode && (
              <div className="mt-4 rounded-lg bg-blue-50 px-3 py-2 text-xs">
                <span className="text-blue-700">Mã vận đơn: </span>
                <span className="font-mono font-medium text-blue-900">
                  {order.shippingCode}
                </span>
              </div>
            )}
          </div>

          {(canCancel || canConfirmReceived) && (
            <div className="space-y-2">
              {canConfirmReceived && (
                <Button
                  uppercase
                  className="w-full"
                  onClick={() => confirm.mutate()}
                  loading={confirm.isPending}
                >
                  Đã nhận hàng
                </Button>
              )}
              {canCancel && (
                <Button
                  variant="danger"
                  className="w-full"
                  onClick={() => setShowCancelModal(true)}
                >
                  Huỷ đơn hàng
                </Button>
              )}
            </div>
          )}
        </aside>
      </div>

      <Modal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Huỷ đơn hàng?"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowCancelModal(false)}
              disabled={cancel.isPending}
            >
              Không
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                cancel.mutate(undefined, {
                  onSuccess: () => setShowCancelModal(false),
                });
              }}
              loading={cancel.isPending}
            >
              Xác nhận huỷ
            </Button>
          </>
        }
      >
        <p className="text-sm text-stone-600">
          Bạn có chắc muốn huỷ đơn hàng <strong>#{order.orderId}</strong>? Số
          lượng tồn kho sẽ được hoàn lại tự động.
        </p>
      </Modal>
    </div>
  );
}
