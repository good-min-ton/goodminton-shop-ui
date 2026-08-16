"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQueries } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { productsApi } from "@/lib/api/products";
import { ordersApi } from "@/lib/api/orders";
import { ApiException } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "@/store/toast-store";
import { getErrorMessage } from "@/lib/error-messages";
import { cn, formatPrice } from "@/lib/utils";
import type { Product } from "@/types/api";
import type { OrderDraft } from "./types";

interface OrderConfirmCardProps {
  draft: OrderDraft;
  placedOrderId?: number;
  onPlaced: (id: number) => void;
}

export function OrderConfirmCard({
  draft,
  placedOrderId,
  onPlaced,
}: Readonly<OrderConfirmCardProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Prefill name/phone once the auth store hydrates the user. The `|| v` keeps
  // any edit the user already made from being clobbered by a late hydrate.
  useEffect(() => {
    if (user) {
      setRecipientName((v) => v || user.fullName);
      setRecipientPhone((v) => v || user.phone || "");
    }
  }, [user]);

  // Thumbnails — failure-tolerant, NEVER gate ordering. Same useQueries pattern
  // as ProductSourceCards; on error/loading we simply show a placeholder.
  const productIds = Array.from(
    new Set(draft.items.map((l) => Number(l.product_id))),
  ).filter((n) => Number.isInteger(n) && n > 0);
  const thumbResults = useQueries({
    queries: productIds.map((id) => ({
      queryKey: ["product", id],
      queryFn: () => productsApi.detail(id),
      staleTime: 10 * 60 * 1000,
    })),
  });
  const thumbById = new Map<number, string | null>();
  for (const r of thumbResults) {
    const p = r.data as Product | undefined;
    if (p) thumbById.set(p.id, p.thumbnail?.url ?? null);
  }

  const redirectToLogin = () => {
    toast("Vui lòng đăng nhập để đặt hàng.", "info");
    router.push(`/login?next=${encodeURIComponent(pathname || "/")}`);
  };

  const placeOrder = useMutation({
    mutationFn: () =>
      ordersApi.create({
        items: draft.items.map((l) => ({
          variantId: Number(l.variant_id),
          quantity: l.quantity,
        })),
        recipientName,
        recipientPhone,
        recipientAddress,
        recipientEmail: user?.email || undefined,
        note: note || undefined,
        paymentMethod: "COD",
      }),
    onSuccess: (order) => {
      toast("Đặt hàng thành công!", "success");
      onPlaced(order.id);
      router.replace(`/orders/${order.id}`);
    },
    onError: (err) => {
      // 401 typically means the token expired between form render and submit
      // (or the user was logged out in another tab). Swap the raw error for
      // the friendly login prompt required by BE-update.md §3.
      if (err instanceof ApiException && err.status === 401) {
        redirectToLogin();
        return;
      }
      setErrorMsg(getErrorMessage(err, "Đặt hàng thất bại"));
    },
  });

  // Placed state — durable, survives reload. No form, no button.
  if (placedOrderId != null) {
    return (
      <Link
        href={`/orders/${placedOrderId}`}
        className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
      >
        <CheckCircle2 size={15} />
        Đã đặt hàng #{placedOrderId}
      </Link>
    );
  }

  // Avoid a login-flash before the auth store hydrates.
  if (!isHydrated) return null;

  const disabled =
    placeOrder.isPending ||
    placeOrder.isSuccess ||
    draft.warnings.length > 0 ||
    draft.items.length === 0 ||
    !recipientName ||
    !recipientPhone ||
    !recipientAddress;

  return (
    <div className="w-full max-w-[85%] space-y-2 rounded-2xl rounded-bl-md border border-stone-200 bg-white p-3 shadow-sm">
      <ul className="space-y-2">
        {draft.items.map((l, idx) => {
          const thumb = thumbById.get(Number(l.product_id)) ?? null;
          const variant = [l.size, l.color].filter(Boolean).join(" · ");
          return (
            <li
              key={`${l.variant_id}-${idx}`}
              className={cn("flex gap-2", !l.in_stock && "opacity-50")}
            >
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-stone-100">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumb}
                    alt={l.product_name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[9px] text-stone-400">
                    Ảnh
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[13px] font-medium text-stone-800">
                  {l.product_name}
                </p>
                {variant && (
                  <p className="text-primary-700 text-xs font-semibold">
                    {variant}
                  </p>
                )}
                <p className="text-[11px] text-stone-500">
                  × {l.quantity} · {formatPrice(l.unit_price)}đ
                  {!l.in_stock && (
                    <span className="ml-1 rounded bg-red-100 px-1 text-red-600">
                      hết hàng
                    </span>
                  )}
                </p>
              </div>
              <span className="flex-shrink-0 text-[13px] font-semibold text-stone-800">
                {formatPrice(l.line_total)}đ
              </span>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between border-t border-stone-100 pt-2 text-sm font-bold text-stone-900">
        <span>Tổng cộng</span>
        <span className="text-primary-700">{formatPrice(draft.total)}đ</span>
      </div>

      {draft.warnings.length > 0 && (
        <div className="space-y-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {draft.warnings.map((w, i) => (
            <p key={`${i}-${w}`} className="flex gap-1.5">
              <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />
              <span>{w}</span>
            </p>
          ))}
        </div>
      )}

      {accessToken ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setErrorMsg(null);
            placeOrder.mutate();
          }}
          className="space-y-2"
        >
          <input
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Họ và tên"
            className="focus:border-primary-500 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none"
          />
          <input
            value={recipientPhone}
            onChange={(e) => setRecipientPhone(e.target.value)}
            placeholder="Số điện thoại"
            className="focus:border-primary-500 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none"
          />
          <textarea
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="Địa chỉ giao hàng"
            rows={2}
            className="focus:border-primary-500 w-full resize-none rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none"
          />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ghi chú (không bắt buộc)"
            rows={1}
            className="focus:border-primary-500 w-full resize-none rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none"
          />
          {errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {errorMsg}
            </div>
          )}
          <button
            type="submit"
            disabled={disabled}
            className="bg-primary-700 hover:bg-primary-800 w-full rounded-lg py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            {placeOrder.isPending ? "Đang đặt hàng..." : "Đặt hàng (COD)"}
          </button>
        </form>
      ) : (
        <div className="space-y-1.5">
          <p className="text-center text-xs text-stone-500">
            Vui lòng đăng nhập để đặt hàng.
          </p>
          <button
            type="button"
            onClick={redirectToLogin}
            className="bg-primary-700 hover:bg-primary-800 w-full rounded-lg py-2 text-sm font-medium text-white transition-colors"
          >
            Bấm xác nhận
          </button>
        </div>
      )}
    </div>
  );
}
