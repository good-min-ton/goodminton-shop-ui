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

/**
 * VNPay response-code map. `00` = success; every other code is a specific
 * failure reason we surface to the user. Codes we don't know fall back to
 * a generic message.
 */
const VNPAY_MESSAGES: Record<string, string> = {
  "00": "Giao dịch thành công.",
  "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ gian lận — vui lòng liên hệ ngân hàng.",
  "09": "Thẻ chưa đăng ký dịch vụ InternetBanking.",
  "10": "Xác thực thông tin sai quá 3 lần.",
  "11": "Đã hết hạn chờ thanh toán.",
  "12": "Thẻ / tài khoản đã bị khoá.",
  "13": "Nhập sai mật khẩu OTP.",
  "24": "Bạn đã huỷ giao dịch.",
  "51": "Tài khoản không đủ số dư.",
  "65": "Tài khoản vượt hạn mức giao dịch trong ngày.",
  "75": "Ngân hàng thanh toán đang bảo trì.",
  "79": "Nhập sai mật khẩu thanh toán quá số lần quy định.",
  "99": "Có lỗi xảy ra trong quá trình thanh toán.",
};

type State =
  | { kind: "polling"; attempt: number }
  | { kind: "success"; order: Order }
  | { kind: "pending-after-poll"; order: Order }
  | { kind: "failed"; reason: string; orderId?: number };

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
  // VNPay redirects to us with vnp_* params. Backend has already verified the
  // signature via the IPN channel — we only need to read the response code +
  // txnRef to know what to show.
  const responseCode = sp.get("vnp_ResponseCode");
  const txStatus = sp.get("vnp_TransactionStatus");
  const txnRef = sp.get("vnp_TxnRef");

  const parsedOrderId = txnRef ? Number(txnRef.split("-")[0]) : Number.NaN;
  const orderId = Number.isFinite(parsedOrderId) ? parsedOrderId : null;

  const [state, setState] = useState<State>(() => {
    if (!responseCode) {
      return {
        kind: "failed",
        reason:
          "Không có thông tin từ VNPay. Vui lòng vào 'Đơn hàng của tôi' để kiểm tra.",
      };
    }
    if (responseCode !== "00" || txStatus !== "00") {
      return {
        kind: "failed",
        reason: VNPAY_MESSAGES[responseCode] ?? "Giao dịch không thành công.",
        orderId: orderId ?? undefined,
      };
    }
    if (!orderId) {
      return { kind: "failed", reason: "Không đọc được mã đơn hàng." };
    }
    return { kind: "polling", attempt: 0 };
  });

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
            orderId: orderId ?? undefined,
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
        description={`VNPay đã ghi nhận. Đang chờ hệ thống cập nhật đơn hàng (${state.attempt + 1}/${MAX_ATTEMPTS}).`}
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

  if (state.kind === "pending-after-poll") {
    return (
      <ResultCard
        icon={<Clock size={56} className="text-amber-600" />}
        title="Đang xử lý"
        description="Ngân hàng đã trừ tiền nhưng hệ thống chưa nhận được xác nhận từ VNPay. Đơn hàng sẽ tự cập nhật trong ít phút — bạn có thể refresh trang đơn hàng để kiểm tra lại."
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
          {state.orderId == null ? (
            <Link href="/orders">
              <Button uppercase>Đơn hàng của tôi</Button>
            </Link>
          ) : (
            <Link href={`/orders/${state.orderId}`}>
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
