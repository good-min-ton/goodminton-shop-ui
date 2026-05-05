"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Star, ChevronRight } from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { useMyOrder } from "@/hooks/use-orders";
import { productsApi } from "@/lib/api/products";
import { ApiException } from "@/lib/api";
import { getErrorMessage } from "@/lib/error-messages";
import { toast } from "@/store/toast-store";
import { cn } from "@/lib/utils";

export default function WriteReviewPage() {
  return (
    <RequireAuth roles={["CUSTOMER"]}>
      <WriteReviewContent />
    </RequireAuth>
  );
}

function WriteReviewContent() {
  const params = useParams<{ id: string; itemId: string }>();
  const orderId = params?.id ? Number(params.id) : null;
  const itemId = params?.itemId ? Number(params.itemId) : null;
  const router = useRouter();

  const { data: order, isLoading } = useMyOrder(orderId);
  const item = order?.items.find((it) => it.orderItemId === itemId);

  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  const submit = useMutation({
    mutationFn: () => {
      if (!item) throw new Error("Item not found");
      return productsApi.createReview(item.productId, {
        orderItemId: item.orderItemId,
        rating,
        comment: comment.trim(),
      });
    },
    onSuccess: () => {
      toast("Cảm ơn bạn đã đánh giá!", "success");
      router.replace(`/orders/${orderId}`);
    },
    onError: (err) => {
      const code = err instanceof ApiException ? err.code : null;
      toast(getErrorMessage(code, "Không gửi được đánh giá"), "error");
    },
  });

  if (isLoading) {
    return (
      <div className="container-app flex justify-center py-16">
        <Spinner className="text-primary-700" size={32} />
      </div>
    );
  }

  if (!order || !item) {
    return (
      <div className="container-app py-12">
        <EmptyState
          title="Không tìm thấy sản phẩm cần đánh giá"
          action={
            <Link href="/orders">
              <Button variant="secondary">Quay lại đơn hàng</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (order.status !== "COMPLETED") {
    return (
      <div className="container-app py-12">
        <EmptyState
          title="Chưa thể đánh giá"
          description="Bạn chỉ có thể đánh giá khi đơn hàng đã hoàn tất."
          action={
            <Link href={`/orders/${orderId}`}>
              <Button variant="secondary">Quay lại đơn hàng</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const visualRating = hover ?? rating;

  return (
    <div className="container-app max-w-2xl py-10">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-1 text-xs text-stone-500"
      >
        <Link href="/orders" className="hover:text-stone-900">
          Đơn hàng
        </Link>
        <ChevronRight size={12} />
        <Link href={`/orders/${orderId}`} className="hover:text-stone-900">
          #{orderId}
        </Link>
        <ChevronRight size={12} />
        <span className="text-stone-700">Đánh giá</span>
      </nav>

      <h1 className="font-display mb-2 text-3xl font-extrabold tracking-tight text-stone-900">
        Đánh giá sản phẩm
      </h1>
      <p className="mb-8 text-sm text-stone-500">
        Chia sẻ trải nghiệm của bạn về <strong>{item.productName}</strong>.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit.mutate();
        }}
        className="space-y-6 rounded-xl border border-stone-200 bg-white p-6"
      >
        <div>
          <p className="mb-3 text-sm font-medium text-stone-700">Đánh giá sao</p>
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
                  size={32}
                  className={cn(
                    n <= visualRating
                      ? "fill-amber-400 text-amber-400"
                      : "text-stone-300",
                  )}
                />
              </button>
            ))}
            <span className="font-mono ml-3 text-sm text-stone-500">
              {visualRating}/5
            </span>
          </div>
        </div>

        <Textarea
          label="Nhận xét"
          required
          rows={5}
          placeholder="Sản phẩm có như mong đợi không? Chất lượng, đóng gói, giao hàng?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          hint={`${comment.length}/500`}
          maxLength={500}
        />

        <div className="flex justify-end gap-2">
          <Link href={`/orders/${orderId}`}>
            <Button type="button" variant="secondary">
              Huỷ
            </Button>
          </Link>
          <Button
            type="submit"
            uppercase
            loading={submit.isPending}
            disabled={comment.trim().length < 5}
          >
            Gửi đánh giá
          </Button>
        </div>
      </form>
    </div>
  );
}
