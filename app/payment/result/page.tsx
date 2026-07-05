"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ordersApi } from "@/lib/api/orders";
import { PAYOS_ORDER_ID_KEY } from "@/lib/api/payos";
import type { Order } from "@/types/api";

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 10;

type State =
  | { kind: "polling"; attempt: number }
  | { kind: "success"; order: Order }
  | { kind: "success-no-order" }
  | { kind: "pending-after-poll"; order: Order }
  | { kind: "failed"; reason: string };

export default function PaymentResultPage() {
  return (
    <div className="bg-soft-glow min-h-[88vh] bg-stone-50">
      <div className="container-app py-20">
        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <Spinner className="text-primary-700" size={32} />
            </div>
          }
        >
          <PaymentResultContent />
        </Suspense>
      </div>
    </div>
  );
}

function PaymentResultContent() {
  const sp = useSearchParams();
  // PayOS redirect params. `code=00` + `status=PAID` = success.
  // `cancel=true` should have already been routed to /payment/cancel by
  // PayOS, but we defensively handle it here too.
  const code = sp.get("code");
  const status = sp.get("status");
  const cancel = sp.get("cancel") === "true";
  const orderCode = sp.get("orderCode");

  // Our internal orderId was stashed by checkout before the PayOS redirect.
  // PayOS's `orderCode` is a separate number and we have no resolver yet, so
  // sessionStorage is the only reliable link.
  const [orderId] = useState<number | null>(() => {
    if (globalThis.window === undefined) return null;
    try {
      const raw = sessionStorage.getItem(PAYOS_ORDER_ID_KEY);
      const n = raw ? Number(raw) : Number.NaN;
      return Number.isFinite(n) && n > 0 ? n : null;
    } catch {
      return null;
    }
  });

  const [state, setState] = useState<State>(() => {
    if (!code && !status && !orderCode) {
      return {
        kind: "failed",
        reason:
          "Không có thông tin từ PayOS. Vui lòng vào 'Đơn hàng của tôi' để kiểm tra.",
      };
    }
    if (cancel || (code && code !== "00") || (status && status !== "PAID")) {
      return {
        kind: "failed",
        reason:
          cancel || status === "CANCELLED"
            ? "Bạn đã huỷ giao dịch. Đơn hàng vẫn ở trạng thái chờ thanh toán."
            : "Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức khác.",
      };
    }
    if (!orderId) return { kind: "success-no-order" };
    return { kind: "polling", attempt: 0 };
  });

  // Clear the bridge key once we've read it — avoids stale reads on later
  // /payment/result visits.
  useEffect(() => {
    try {
      sessionStorage.removeItem(PAYOS_ORDER_ID_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (state.kind !== "polling" || !orderId) return;
    let cancelled = false;

    const tick = async () => {
      try {
        const order = await ordersApi.myOrderDetail(orderId);
        if (cancelled) return;
        const paid = order.payments.some((p) => p.status === "PAID");
        if (paid) {
          setState({ kind: "success", order });
          return;
        }
        if (state.attempt + 1 >= MAX_ATTEMPTS) {
          setState({ kind: "pending-after-poll", order });
          return;
        }
        setState({ kind: "polling", attempt: state.attempt + 1 });
      } catch {
        if (cancelled) return;
        if (state.attempt + 1 >= MAX_ATTEMPTS) {
          setState({
            kind: "failed",
            reason: "Không kiểm tra được trạng thái đơn hàng.",
          });
          return;
        }
        setState({ kind: "polling", attempt: state.attempt + 1 });
      }
    };

    const t = setTimeout(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [state, orderId]);

  if (state.kind === "polling") {
    return (
      <ResultCard
        icon={<Spinner className="text-primary-700" size={48} />}
        title="Đang xác nhận thanh toán..."
        description={`PayOS đã ghi nhận. Đang chờ hệ thống cập nhật đơn hàng (${state.attempt + 1}/${MAX_ATTEMPTS}).`}
      />
    );
  }

  if (state.kind === "success") {
    return (
      <ResultCard
        icon={<CheckCircle2 size={56} className="text-emerald-600" />}
        title="Thanh toán thành công"
        description={`Đơn hàng #${state.order.id} đã được thanh toán và sẽ sớm được xử lý.`}
        actions={
          <>
            <Link href={`/orders/${state.order.id}`}>
              <Button uppercase>Xem đơn hàng</Button>
            </Link>
            <Link href="/products">
              <Button variant="secondary">Tiếp tục mua sắm</Button>
            </Link>
          </>
        }
      />
    );
  }

  if (state.kind === "success-no-order") {
    // We lost the sessionStorage bridge (private tab, storage cleared, direct
    // link from email…) but PayOS says success. Show a positive message and
    // point the user at their order list.
    return (
      <ResultCard
        icon={<CheckCircle2 size={56} className="text-emerald-600" />}
        title="Thanh toán thành công"
        description="PayOS đã ghi nhận giao dịch. Kiểm tra trạng thái đơn hàng trong mục Đơn hàng của tôi."
        actions={
          <>
            <Link href="/orders">
              <Button uppercase>Đơn hàng của tôi</Button>
            </Link>
            <Link href="/products">
              <Button variant="secondary">Tiếp tục mua sắm</Button>
            </Link>
          </>
        }
      />
    );
  }

  if (state.kind === "pending-after-poll") {
    return (
      <ResultCard
        icon={<Clock size={56} className="text-amber-600" />}
        title="Đang xử lý"
        description="Ngân hàng đã trừ tiền nhưng hệ thống chưa nhận được xác nhận từ PayOS. Đơn hàng sẽ tự cập nhật trong ít phút — bạn có thể refresh trang đơn hàng để kiểm tra lại."
        actions={
          <Link href={`/orders/${state.order.id}`}>
            <Button uppercase>Xem đơn hàng</Button>
          </Link>
        }
      />
    );
  }

  return (
    <ResultCard
      icon={<XCircle size={56} className="text-red-600" />}
      title="Thanh toán không thành công"
      description={state.reason}
      actions={
        <>
          {orderId == null ? (
            <Link href="/orders">
              <Button uppercase>Đơn hàng của tôi</Button>
            </Link>
          ) : (
            <Link href={`/orders/${orderId}`}>
              <Button uppercase>Xem đơn hàng</Button>
            </Link>
          )}
          <Link href="/products">
            <Button variant="secondary">Tiếp tục mua sắm</Button>
          </Link>
        </>
      }
    />
  );
}

interface ResultCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actions?: React.ReactNode;
}

function ResultCard({
  icon,
  title,
  description,
  actions,
}: Readonly<ResultCardProps>) {
  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-10 text-center shadow-sm">
      <div className="flex justify-center">{icon}</div>
      <h1 className="font-display mt-5 text-3xl font-extrabold text-stone-900">
        {title}
      </h1>
      <p className="mt-3 text-stone-500">{description}</p>
      {actions && (
        <div className="mt-7 flex flex-wrap justify-center gap-3">{actions}</div>
      )}
    </div>
  );
}
