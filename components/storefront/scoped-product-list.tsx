"use client";

import { useMemo, useState } from "react";
import { ProductGrid } from "./product-grid";
import { Pagination } from "./pagination";
import { useProductList } from "@/hooks/use-products";
import type { Product } from "@/types/api";

interface ScopedProductListProps {
  predicate: (p: Product) => boolean;
  pageSize?: number;
  emptyTitle?: string;
}

export function ScopedProductList({
  predicate,
  pageSize = 12,
  emptyTitle,
}: Readonly<ScopedProductListProps>) {
  const [page, setPage] = useState(1);
  const list = useProductList({
    page: 1,
    size: 200,
    sortBy: "createdAt",
    sortDir: "desc",
  });

  const filtered = useMemo(
    () => (list.data?.content ?? []).filter((p) => p.isVisible && predicate(p)),
    [list.data, predicate],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const items = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <>
      <p className="mb-6 text-sm text-stone-500">
        {list.isLoading ? "Đang tải..." : `${filtered.length} sản phẩm`}
      </p>
      <ProductGrid
        products={items}
        loading={list.isLoading}
        cols={4}
        emptyTitle={emptyTitle}
      />
      <Pagination
        page={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
        className="mt-10"
      />
    </>
  );
}
