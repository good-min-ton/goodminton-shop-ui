"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ReviewComposer } from "@/components/storefront/review-composer";
import { reviewsApi } from "@/lib/api/reviews";
import { formatDateTime, cn } from "@/lib/utils";
import type { Review } from "@/types/api";

interface ProductReviewsSectionProps {
  productId: number;
  productName: string;
}

const PAGE_SIZE = 5;
/** Fetch ceiling — backend doesn't expose an aggregate endpoint, so we pull a
 * generous slice and compute summary client-side. Adequate for typical product
 * review counts. */
const FETCH_LIMIT = 500;

export function ProductReviewsSection({
  productId,
  productName,
}: Readonly<ProductReviewsSectionProps>) {
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ["reviews", "all", productId],
    queryFn: () =>
      reviewsApi.list(productId, {
        page: 1,
        size: FETCH_LIMIT,
        sortBy: "createdAt",
        sortDir: "desc",
      }),
    enabled: productId > 0,
    staleTime: 60 * 1000,
  });

  const all = query.data?.content ?? [];
  const total = all.length;

  const reviewedOrderItemIds = useMemo(
    () => new Set(all.map((r) => r.orderItemId)),
    [all],
  );

  const composer = (
    <ReviewComposer
      productId={productId}
      productName={productName}
      reviewedOrderItemIds={reviewedOrderItemIds}
    />
  );

  if (query.isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner className="text-primary-700" size={28} />
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="space-y-4">
        {composer}
        <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 px-6 py-12 text-center">
          <Star
            size={36}
            className="mx-auto text-stone-300"
            strokeWidth={1.5}
          />
          <p className="mt-3 text-sm text-stone-500">
            Sản phẩm chưa có đánh giá nào.
          </p>
          <p className="text-xs text-stone-400">
            Hãy là người đầu tiên chia sẻ trải nghiệm sau khi mua hàng.
          </p>
        </div>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = all.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="grid gap-8 md:grid-cols-[260px_1fr]">
      <ReviewsSummary reviews={all} />

      <div className="flex flex-col gap-4">
        {composer}

        <ul className="space-y-4">
          {visible.map((r) => (
            <ReviewItem key={r.id} review={r} />
          ))}
        </ul>

        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 pt-2">
            <span className="text-xs text-stone-500">
              Trang {safePage} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={safePage <= 1}
                onClick={() => setPage(safePage - 1)}
              >
                Trước
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={safePage >= totalPages}
                onClick={() => setPage(safePage + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function computeStats(reviews: Review[]) {
  const buckets: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  let sum = 0;
  for (const r of reviews) {
    sum += r.rating;
    const n = Math.max(1, Math.min(5, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    buckets[n] += 1;
  }
  return {
    avg: reviews.length === 0 ? 0 : sum / reviews.length,
    distribution: buckets,
  };
}

function ReviewsSummary({ reviews }: Readonly<{ reviews: Review[] }>) {
  const { avg, distribution } = computeStats(reviews);
  const denominator = reviews.length || 1;

  return (
    <aside className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-5">
      <div>
        <div className="font-display text-4xl font-extrabold text-stone-900">
          {avg.toFixed(1)}
          <span className="ml-1 font-mono text-base font-normal text-stone-400">
            /5
          </span>
        </div>
        <RatingStars rating={avg} size={16} />
        <p className="mt-1.5 text-xs text-stone-500">
          {reviews.length} đánh giá
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        {([5, 4, 3, 2, 1] as const).map((n) => {
          const count = distribution[n];
          const pct = (count / denominator) * 100;
          return (
            <div
              key={n}
              className="grid grid-cols-[24px_1fr_28px] items-center gap-2 text-xs"
            >
              <span className="font-mono text-stone-500">{n}★</span>
              <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full bg-amber-400"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-right font-mono text-stone-500">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function ReviewItem({ review }: Readonly<{ review: Review }>) {
  return (
    <li className="rounded-xl border border-stone-200 bg-white p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-stone-900">
            {review.customer.fullName}
          </p>
          <RatingStars rating={review.rating} size={14} className="mt-1" />
        </div>
        <span className="font-mono flex-shrink-0 text-[11px] text-stone-400">
          {formatDateTime(review.createdAt)}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-stone-700">
        {review.comment}
      </p>
    </li>
  );
}

interface RatingStarsProps {
  rating: number;
  size?: number;
  className?: string;
}

/**
 * Star row that renders fractional ratings via a clipped overlay — fills the
 * bottom layer with grey stars and overlays only the filled portion in amber.
 */
export function RatingStars({
  rating,
  size = 14,
  className,
}: Readonly<RatingStarsProps>) {
  const clamped = Math.max(0, Math.min(5, rating));
  const pct = (clamped / 5) * 100;

  return (
    <span
      className={cn("relative inline-flex", className)}
      aria-label={`${clamped.toFixed(1)} / 5 sao`}
    >
      <span aria-hidden className="inline-flex text-stone-300">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={size} strokeWidth={1.5} />
        ))}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 inline-flex overflow-hidden text-amber-400"
        style={{ width: `${pct}%` }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            size={size}
            strokeWidth={1.5}
            className="fill-amber-400 flex-shrink-0"
          />
        ))}
      </span>
    </span>
  );
}
