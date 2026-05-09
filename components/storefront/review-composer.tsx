"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogIn, Star } from "lucide-react";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ordersApi } from "@/lib/api/orders";
import { reviewsApi } from "@/lib/api/reviews";
import { useAuthStore } from "@/store/auth-store";
import { getErrorMessage } from "@/lib/error-messages";
import { toast } from "@/store/toast-store";
import { cn } from "@/lib/utils";

interface ReviewComposerProps {
  productId: number;
  productName: string;
  /** orderItem ids already reviewed by this user — used to skip them. */
  reviewedOrderItemIds: Set<number>;
}

export function ReviewComposer({
  productId,
  productName,
  reviewedOrderItemIds,
}: Readonly<ReviewComposerProps>) {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const user = useAuthStore((s) => s.user);
  const isCustomer = user?.role === "CUSTOMER";

  if (!isHydrated) return null;

  if (!user) {
    return <GuestPrompt />;
  }

  if (!isCustomer) return null;

  return (
    <CustomerComposer
      productId={productId}
      productName={productName}
      reviewedOrderItemIds={reviewedOrderItemIds}
    />
  );
}

function GuestPrompt() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm">
      <span className="text-stone-600">
        Đăng nhập với tài khoản đã mua sản phẩm để gửi đánh giá.
      </span>
      <Link href="/login">
        <Button size="sm" variant="secondary">
          <LogIn size={14} />
          Đăng nhập
        </Button>
      </Link>
    </div>
  );
}

interface CustomerComposerProps extends ReviewComposerProps {}

function CustomerComposer({
  productId,
  productName,
  reviewedOrderItemIds,
}: Readonly<CustomerComposerProps>) {
  const qc = useQueryClient();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  // Customer's recent orders — pull a generous slice; backend caps page size.
  const orders = useQuery({
    queryKey: ["orders", "my", { page: 1, size: 50, sortBy: "orderDate", sortDir: "desc" }],
    queryFn: () =>
      ordersApi.myOrders({
        page: 1,
        size: 50,
        sortBy: "orderDate",
        sortDir: "desc",
      }),
    staleTime: 60 * 1000,
  });

  // Walk completed orders to find: (1) any purchased orderItem of this product
  // and (2) the first one that hasn't been reviewed yet.
  const { eligibleItem, hasPurchased } = useMemo(() => {
    const list = orders.data?.content ?? [];
    let purchased = false;
    let eligible: { order: typeof list[number]; item: typeof list[number]["items"][number] } | null = null;
    for (const o of list) {
      if (o.status !== "COMPLETED") continue;
      for (const it of o.items) {
        if (it.productId !== productId) continue;
        purchased = true;
        if (!eligible && !reviewedOrderItemIds.has(it.id)) {
          eligible = { order: o, item: it };
        }
      }
    }
    return { eligibleItem: eligible, hasPurchased: purchased };
  }, [orders.data, productId, reviewedOrderItemIds]);

  const submit = useMutation({
    mutationFn: () => {
      if (!eligibleItem) throw new Error("Không có đơn hàng phù hợp để đánh giá");
      return reviewsApi.create(productId, {
        orderItemId: eligibleItem.item.id,
        rating,
        comment: comment.trim(),
      });
    },
    onSuccess: () => {
      toast("Cảm ơn bạn đã đánh giá!", "success");
      qc.invalidateQueries({ queryKey: ["reviews"] });
      setComment("");
      setRating(5);
    },
    onError: (err) => {
      toast(getErrorMessage(err, "Không gửi được đánh giá"), "error");
    },
  });

  if (orders.isLoading) return null;

  if (!eligibleItem) {
    return (
      <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
        {hasPurchased
          ? "Cảm ơn bạn đã đánh giá sản phẩm này."
          : "Chỉ khách đã mua và nhận được sản phẩm mới có thể đánh giá. Đặt hàng và xác nhận đã nhận để mở khoá."}
      </div>
    );
  }

  const visualRating = hover ?? rating;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit.mutate();
      }}
      className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5"
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-stone-700">
          Đánh giá <span className="text-stone-900">{productName}</span>
        </p>
        <span className="text-xs text-stone-400">
          Đơn #{eligibleItem.order.id}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(null)}
            onClick={() => setRating(n)}
            className="rounded p-1 transition-transform hover:scale-110"
            aria-label={`${n} sao`}
          >
            <Star
              size={26}
              strokeWidth={1.5}
              className={cn(
                n <= visualRating
                  ? "fill-amber-400 text-amber-400"
                  : "text-stone-300",
              )}
            />
          </button>
        ))}
        <span className="font-mono ml-2 text-xs text-stone-500">
          {visualRating}/5
        </span>
      </div>

      <Textarea
        rows={3}
        placeholder="Sản phẩm có đúng mong đợi không? Chất lượng, đóng gói, giao hàng..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        hint={`${comment.length}/500`}
        maxLength={500}
        required
      />

      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          loading={submit.isPending}
          disabled={comment.trim().length < 5}
        >
          Gửi đánh giá
        </Button>
      </div>
    </form>
  );
}
