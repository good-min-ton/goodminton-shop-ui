"use client";

import { ShoppingBag } from "lucide-react";
import type { Product } from "@/types/api";
import { ProductCard } from "./product-card";
import { ProductCardSkeleton } from "./product-card-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: Product[] | undefined;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  cols?: 2 | 3 | 4;
  /** Number of skeleton cards to show during initial load. */
  skeletonCount?: number;
  /** Mark the first N cards as priority — eager-load + preload for LCP. */
  priorityCount?: number;
  className?: string;
}

const colsClass: Record<2 | 3 | 4, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
};

export function ProductGrid({
  products,
  loading = false,
  emptyTitle = "Chưa có sản phẩm",
  emptyDescription,
  cols = 4,
  skeletonCount,
  priorityCount = 0,
  className,
}: Readonly<ProductGridProps>) {
  if (loading && (!products || products.length === 0)) {
    const count = skeletonCount ?? cols * 2;
    return (
      <div className={cn("grid gap-4", colsClass[cols], className)}>
        {Array.from({ length: count }).map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag size={56} />}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className={cn("grid gap-4", colsClass[cols], className)}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < priorityCount} />
      ))}
    </div>
  );
}
