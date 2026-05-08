"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ordersApi } from "@/lib/api/orders";
import type { Order } from "@/types/api";

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 10;

type State =
  | { kind: "polling"; attempt: number }
  | { kind: "success"; order: Order }
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
  const success = sp.get("success") === "true";
  const validSignature = sp.get("validSignature") === "true";
  const orderId = sp.get("orderId");
  const responseCode = sp.get("responseCode");

  const [state, setState] = useState<State>(() => {
    if (!success || !validSignature) {
      return {
        kind: "failed",
        reason: responseCode
          ? `VNPay từ chối thanh toán (mã ${responseCode}).`
          : "Chữ ký VNPay không hợp lệ.",
      };
    }
    if (!orderId) {
      return { kind: "failed", reason: "Thiếu thông tin đơn hàng." };
    }
    return { kind: "polling", attempt: 0 };
  });

  useEffect(() => {
    if (state.kind !== "polling" || !orderId) return;
    let cancelled = false;

    const tick = async () => {
      try {
        const order = await ordersApi.myOrderDetail(Number(orderId));
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
        description={`Vui lòng chờ trong giây lát. Lần kiểm tra ${state.attempt + 1}/${MAX_ATTEMPTS}.`}
      />
    );
  }

  if (state.kind === "success") {
    return (
      <ResultCard
        icon={<CheckCircle2 size={56} className="text-emerald-600" />}
        title="Thanh toán thành công"
        description={`Đơn hàng #${state.order.id} đã được ghi nhận và sẽ sớm được xử lý.`}
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

  if (state.kind === "pending-after-poll") {
    return (
      <ResultCard
        icon={<Clock size={56} className="text-amber-600" />}
        title="Đang xử lý"
        description="Hệ thống chưa nhận được xác nhận thanh toán. Đơn hàng đã tạo, bạn có thể kiểm tra lại sau ít phút."
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
      title="Thanh toán thất bại"
      description={state.reason}
      actions={
        <>
          <Link href="/orders">
            <Button uppercase>Xem đơn hàng của tôi</Button>
          </Link>
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
