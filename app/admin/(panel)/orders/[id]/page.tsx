"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, MapPin } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminCard } from "@/components/admin/admin-card";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/storefront/order/order-status-badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { ordersApi } from "@/lib/api/orders";
import { ApiException } from "@/lib/api";
import { getErrorMessage } from "@/lib/error-messages";
import { toast } from "@/store/toast-store";
import { formatVnd, formatDateTime } from "@/lib/utils";

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ? Number(params.id) : null;
  const qc = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const order = useQuery({
    queryKey: ["orders", "admin-detail", id],
    queryFn: () => ordersApi.detail(id as number),
    enabled: id != null,
  });

  const confirmOrder = useMutation({
    mutationFn: () => ordersApi.confirm(id as number),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast("Đã xác nhận đơn hàng", "success");
      setConfirmOpen(false);
    },
    onError: (err) => {
      const code = err instanceof ApiException ? err.code : null;
      toast(getErrorMessage(code), "error");
    },
  });

  if (order.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="text-primary-300" size={32} />
      </div>
    );
  }

  if (!order.data) {
    return <EmptyState title="Không tìm thấy đơn hàng" />;
  }

  const o = order.data;
  const canConfirm = o.status === "PENDING";

  return (
    <>
      <AdminPageHeader
        title={`Đơn #${o.orderId}`}
        breadcrumbs={[
          { label: "Đơn hàng", href: "/admin/orders" },
          { label: `#${o.orderId}` },
        ]}
        actions={
          canConfirm && (
            <Button
              variant="admin-primary"
              onClick={() => setConfirmOpen(true)}
            >
              <CheckCircle2 size={16} />
              Xác nhận đơn
            </Button>
          )
        }
      />

      <div className="mb-6 flex items-center gap-3">
        <OrderStatusBadge status={o.status} className="text-sm" />
        <span className="bg-admin-surface-2 text-admin-text-muted inline-flex rounded-md px-2 py-0.5 text-[10px]">
          {o.orderType === "ONLINE" ? "Online" : "Tại quầy"}
        </span>
        <span className="text-admin-text-muted font-mono text-xs">
          {formatDateTime(o.orderDate)}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <AdminCard padded={false}>
            <h2 className="font-display text-admin-text-muted border-admin-border border-b px-5 py-3 text-[11px] font-bold tracking-widest uppercase">
              Sản phẩm ({o.items.length})
            </h2>
            <ul className="divide-admin-border divide-y">
              {o.items.map((it) => (
                <li
                  key={it.orderItemId}
                  className="flex items-start justify-between gap-4 px-5 py-4 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-admin-text font-medium">
                      {it.productName}
                    </p>
                    <p className="text-admin-text-muted mt-0.5 text-xs">
                      {it.color.name} · {it.size.name} · ×{it.quantity}
                    </p>
                    <p className="font-mono text-admin-text-muted mt-0.5 text-[11px]">
                      {it.skuCode}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-admin-text">
                      {formatVnd(
                        (it.discountPrice ?? it.unitPrice) * it.quantity,
                      )}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </AdminCard>

          <AdminCard>
            <h2 className="font-display text-admin-text-muted mb-4 text-[11px] font-bold tracking-widest uppercase">
              Người nhận
            </h2>
            <div className="flex gap-3 text-sm">
              <MapPin size={16} className="text-admin-text-muted mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-admin-text font-medium">
                  {o.recipientName}{" "}
                  <span className="text-admin-text-muted">
                    · {o.recipientPhone}
                  </span>
                </p>
                <p className="text-admin-text-muted">{o.recipientAddress}</p>
                {o.recipientEmail && (
                  <p className="text-admin-text-muted">{o.recipientEmail}</p>
                )}
                {o.note && (
                  <p className="text-admin-text-muted italic">
                    Ghi chú: {o.note}
                  </p>
                )}
              </div>
            </div>
          </AdminCard>
        </div>

        <div className="space-y-4">
          <AdminCard>
            <h2 className="font-display text-admin-text-muted mb-4 text-[11px] font-bold tracking-widest uppercase">
              Tóm tắt
            </h2>
            <dl className="space-y-2 text-sm">
              <Row label="Khách hàng">{o.customerName}</Row>
              <Row label="Chi nhánh">{o.storeName || "—"}</Row>
              <Row label="Mã vận đơn">
                {o.shippingCode ? (
                  <span className="font-mono text-xs">{o.shippingCode}</span>
                ) : (
                  <span className="text-admin-text-muted text-xs italic">
                    chưa có
                  </span>
                )}
              </Row>
              <div className="border-admin-border my-2 border-t" />
              <Row label="Tổng tiền">
                <span className="font-mono text-primary-300 text-lg font-medium">
                  {formatVnd(o.totalAmount)}
                </span>
              </Row>
            </dl>
          </AdminCard>

          {o.payments.length > 0 && (
            <AdminCard>
              <h2 className="font-display text-admin-text-muted mb-4 text-[11px] font-bold tracking-widest uppercase">
                Thanh toán
              </h2>
              <ul className="space-y-2">
                {o.payments.map((p) => (
                  <li
                    key={p.paymentId}
                    className="bg-admin-surface-2 flex items-center justify-between rounded-lg px-3 py-2 text-sm"
                  >
                    <div>
                      <span className="text-admin-text font-medium">
                        {p.method}
                      </span>
                      <span className="font-mono ml-2 text-xs text-admin-text-muted">
                        {formatVnd(p.amount)}
                      </span>
                    </div>
                    <PaymentStatusBadge status={p.status} />
                  </li>
                ))}
              </ul>
            </AdminCard>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Xác nhận đơn hàng?"
        description={`Đơn #${o.orderId} sẽ chuyển sang trạng thái CONFIRMED. Hệ thống sẽ tự assign về kho trung tâm.`}
        confirmLabel="Xác nhận"
        loading={confirmOrder.isPending}
        onConfirm={() => confirmOrder.mutate()}
      />
    </>
  );
}

interface RowProps {
  label: string;
  children: React.ReactNode;
}

function Row({ label, children }: Readonly<RowProps>) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-admin-text-muted text-xs">{label}</dt>
      <dd className="text-admin-text">{children}</dd>
    </div>
  );
}
