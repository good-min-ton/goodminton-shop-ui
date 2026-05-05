"use client";

import { ShoppingBag } from "lucide-react";
import type { Product } from "@/types/api";
import { ProductCard } from "./product-card";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: Product[] | undefined;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  cols?: 2 | 3 | 4;
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
  className,
}: Readonly<ProductGridProps>) {
  if (loading && (!products || products.length === 0)) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="text-primary-700" size={32} />
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
      {products.map((p) => (
        <ProductCard key={p.productId} product={p} />
      ))}
    </div>
  );
}
