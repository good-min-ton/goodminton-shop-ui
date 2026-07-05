"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PAYOS_ORDER_ID_KEY } from "@/lib/api/payos";

export default function PaymentCancelPage() {
  // Pull the bridged orderId once (see checkout page), then clear it so
  // subsequent visits don't get stale state.
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

  useEffect(() => {
    try {
      sessionStorage.removeItem(PAYOS_ORDER_ID_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="bg-soft-glow min-h-[88vh] bg-stone-50">
      <div className="container-app py-20">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-10 text-center shadow-sm">
          <div className="flex justify-center">
            <XCircle size={56} className="text-amber-500" />
          </div>
          <h1 className="font-display mt-5 text-3xl font-extrabold text-stone-900">
            Bạn đã huỷ giao dịch
          </h1>
          <p className="mt-3 text-stone-500">
            Đơn hàng vẫn ở trạng thái chờ thanh toán trong 15 phút. Bạn có thể
            quay lại thanh toán hoặc để đơn tự huỷ.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
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
          </div>
        </div>
      </div>
    </div>
  );
}
