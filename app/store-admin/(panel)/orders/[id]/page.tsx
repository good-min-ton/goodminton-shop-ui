"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Package, Truck, CheckCircle2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminCard } from "@/components/admin/admin-card";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/storefront/order/order-status-badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { ordersApi } from "@/lib/api/orders";
import { ApiException } from "@/lib/api";
import { getErrorMessage } from "@/lib/error-messages";
import { toast } from "@/store/toast-store";
import { formatVnd, formatDateTime } from "@/lib/utils";

export default function StoreAdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ? Number(params.id) : null;
  const qc = useQueryClient();

  const [shippingDialog, setShippingDialog] = useState(false);
  const [shippingCode, setShippingCode] = useState("");

  const order = useQuery({
    queryKey: ["store-order", "detail", id],
    queryFn: () => ordersApi.detail(id as number),
    enabled: id != null,
  });

  function invalidate() {
    qc.invalidateQueries({ queryKey: ["store-order"] });
    qc.invalidateQueries({ queryKey: ["store-orders"] });
  }

  function handleErr(err: unknown, fallback: string) {
    const code = err instanceof ApiException ? err.code : null;
    toast(getErrorMessage(code, fallback), "error");
  }

  const markPreparing = useMutation({
    mutationFn: () => ordersApi.markPreparing(id as number),
    onSuccess: () => {
      invalidate();
      toast("Đã chuyển sang trạng thái đang chuẩn bị", "success");
    },
    onError: (err) => handleErr(err, "Không chuyển được trạng thái"),
  });

  const markShipping = useMutation({
    mutationFn: () => {
      if (!shippingCode.trim()) {
        throw new Error("Mã vận đơn không được trống");
      }
      return ordersApi.markShipping(id as number, shippingCode.trim());
    },
    onSuccess: () => {
      invalidate();
      toast("Đã ghi nhận đơn đang giao", "success");
      setShippingDialog(false);
      setShippingCode("");
    },
    onError: (err) => {
      if (err instanceof ApiException) handleErr(err, "Không cập nhật được");
      else if (err instanceof Error) toast(err.message, "warning");
    },
  });

  const markDelivered = useMutation({
    mutationFn: () => ordersApi.markDelivered(id as number),
    onSuccess: () => {
      invalidate();
      toast("Đã xác nhận giao hàng thành công", "success");
    },
    onError: (err) => handleErr(err, "Không cập nhật được"),
  });

  if (order.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="text-amber-300" size={32} />
      </div>
    );
  }

  if (!order.data) {
    return <EmptyState title="Không tìm thấy đơn hàng" />;
  }

  const o = order.data;

  return (
    <>
      <AdminPageHeader
        title={`Đơn #${o.orderId}`}
        breadcrumbs={[
          { label: "Đơn hàng", href: "/store-admin/orders" },
          { label: `#${o.orderId}` },
        ]}
        actions={<ActionButtons
          status={o.status}
          markPreparing={() => markPreparing.mutate()}
          openShipping={() => setShippingDialog(true)}
          markDelivered={() => markDelivered.mutate()}
          loading={
            markPreparing.isPending ||
            markShipping.isPending ||
            markDelivered.isPending
          }
        />}
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
                  <span className="font-mono text-admin-text">
                    {formatVnd(
                      (it.discountPrice ?? it.unitPrice) * it.quantity,
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </AdminCard>

          <AdminCard>
            <h2 className="font-display text-admin-text-muted mb-4 text-[11px] font-bold tracking-widest uppercase">
              Người nhận
            </h2>
            <div className="flex gap-3 text-sm">
              <MapPin
                size={16}
                className="text-admin-text-muted mt-0.5 flex-shrink-0"
              />
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
                <span className="font-mono text-lg font-medium text-amber-300">
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
                      <span className="font-mono text-admin-text-muted ml-2 text-xs">
                        {formatVnd(p.amount)}
                      </span>
                    </div>
                    <PaymentStatusBadge status={p.status} />
                  </li>
                ))}
              </ul>
            </AdminCard>
          )}

          <AdminCard>
            <h2 className="font-display text-admin-text-muted mb-3 text-[11px] font-bold tracking-widest uppercase">
              Quy trình xử lý
            </h2>
            <FlowSteps current={o.status} />
          </AdminCard>
        </div>
      </div>

      <Modal
        open={shippingDialog}
        onClose={() => {
          setShippingDialog(false);
          setShippingCode("");
        }}
        title="Chuyển sang trạng thái đang giao"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShippingDialog(false)}
              disabled={markShipping.isPending}
            >
              Huỷ
            </Button>
            <Button
              onClick={() => markShipping.mutate()}
              loading={markShipping.isPending}
              disabled={!shippingCode.trim()}
            >
              Xác nhận
            </Button>
          </>
        }
      >
        <p className="mb-4 text-sm text-stone-600">
          Nhập mã vận đơn (đã tạo trên web GHTK/GHN) để bắt đầu giao.
        </p>
        <Input
          label="Mã vận đơn"
          required
          placeholder="VD: GHTK-S1.A1.123456"
          value={shippingCode}
          onChange={(e) => setShippingCode(e.target.value)}
          autoFocus
        />
      </Modal>
    </>
  );
}

interface ActionButtonsProps {
  status: string;
  markPreparing: () => void;
  openShipping: () => void;
  markDelivered: () => void;
  loading: boolean;
}

function ActionButtons({
  status,
  markPreparing,
  openShipping,
  markDelivered,
  loading,
}: Readonly<ActionButtonsProps>) {
  if (status === "CONFIRMED") {
    return (
      <Button onClick={markPreparing} loading={loading}>
        <Package size={16} />
        Bắt đầu chuẩn bị
      </Button>
    );
  }
  if (status === "PREPARING") {
    return (
      <Button onClick={openShipping}>
        <Truck size={16} />
        Chuyển sang đang giao
      </Button>
    );
  }
  if (status === "SHIPPING") {
    return (
      <Button onClick={markDelivered} loading={loading}>
        <CheckCircle2 size={16} />
        Đã giao thành công
      </Button>
    );
  }
  return null;
}

const STEPS = [
  { key: "CONFIRMED", label: "Đã xác nhận" },
  { key: "PREPARING", label: "Đang chuẩn bị" },
  { key: "SHIPPING", label: "Đang giao" },
  { key: "DELIVERED", label: "Đã giao" },
  { key: "COMPLETED", label: "Hoàn thành" },
];

function FlowSteps({ current }: Readonly<{ current: string }>) {
  const currentIdx = STEPS.findIndex((s) => s.key === current);

  return (
    <ol className="space-y-2">
      {STEPS.map((step, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        let circleCls: string;
        let textCls: string;
        if (done) {
          circleCls = "bg-emerald-500/20 text-emerald-400";
          textCls = "text-admin-text-muted";
        } else if (active) {
          circleCls = "bg-amber-400 text-stone-900";
          textCls = "text-admin-text font-medium";
        } else {
          circleCls = "bg-admin-surface-2 text-admin-text-muted";
          textCls = "text-admin-text-muted";
        }
        return (
          <li key={step.key} className="flex items-center gap-3 text-sm">
            <span
              className={`font-mono inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${circleCls}`}
            >
              {done ? "✓" : idx + 1}
            </span>
            <span className={textCls}>{step.label}</span>
          </li>
        );
      })}
    </ol>
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
