"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/storefront/product-grid";
import { ProductFilterSidebar } from "@/components/storefront/product-filter-sidebar";
import { Pagination } from "@/components/storefront/pagination";
import { Spinner } from "@/components/ui/spinner";
import { useProductList } from "@/hooks/use-products";

const PAGE_SIZE_FETCH = 100;
const PAGE_SIZE_DISPLAY = 12;

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Mới nhất" },
  { value: "createdAt:asc", label: "Cũ nhất" },
  { value: "name:asc", label: "Tên A → Z" },
  { value: "name:desc", label: "Tên Z → A" },
];

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="container-app flex items-center justify-center py-24">
          <Spinner className="text-primary-700" size={32} />
        </div>
      }
    >
      <ProductsListing />
    </Suspense>
  );
}

function ProductsListing() {
  const router = useRouter();
  const sp = useSearchParams();

  const categoryId = numeric(sp.get("categoryId"));
  const brandId = numeric(sp.get("brandId"));
  const sortKey = sp.get("sort") ?? "createdAt:desc";

  const [displayPage, setDisplayPage] = useState(1);

  const [sortBy, sortDir] = sortKey.split(":") as [string, "asc" | "desc"];

  const list = useProductList({
    page: 1,
    size: PAGE_SIZE_FETCH,
    sortBy,
    sortDir,
  });

  const allProducts = list.data?.content ?? [];

  const filtered = useMemo(() => {
    return allProducts.filter((p) => {
      if (categoryId != null && p.category.id !== categoryId) return false;
      if (brandId != null && p.brand.id !== brandId) return false;
      if (!p.isVisible) return false;
      return true;
    });
  }, [allProducts, categoryId, brandId]);

  const totalDisplayPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE_DISPLAY),
  );
  const safePage = Math.min(displayPage, totalDisplayPages);
  const pageItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE_DISPLAY,
    safePage * PAGE_SIZE_DISPLAY,
  );

  function updateQuery(updates: Record<string, string | null>) {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v == null) next.delete(k);
      else next.set(k, v);
    }
    router.replace(`/products?${next.toString()}`);
    setDisplayPage(1);
  }

  return (
    <div className="container-app py-10">
      <div className="mb-8">
        <h1 className="font-display text-stone-900 text-4xl font-extrabold tracking-tight">
          Tất cả sản phẩm
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          {list.isLoading
            ? "Đang tải..."
            : `${filtered.length} sản phẩm`}
        </p>
      </div>

      <div className="grid gap-10 md:grid-cols-[220px_1fr]">
        <div className="hidden md:block">
          <ProductFilterSidebar
            value={{ categoryId, brandId }}
            onChange={(next) =>
              updateQuery({
                categoryId: next.categoryId?.toString() ?? null,
                brandId: next.brandId?.toString() ?? null,
              })
            }
          />
        </div>

        <div>
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-sm text-stone-500">
              Trang {safePage} / {totalDisplayPages}
            </p>
            <select
              value={sortKey}
              onChange={(e) => updateQuery({ sort: e.target.value })}
              className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-primary-700 focus:outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Sắp xếp: {opt.label}
                </option>
              ))}
            </select>
          </div>

          <ProductGrid
            products={pageItems}
            loading={list.isLoading}
            cols={3}
            emptyTitle="Không có sản phẩm nào phù hợp"
            emptyDescription="Thử bỏ bớt bộ lọc để xem thêm sản phẩm khác."
          />

          <Pagination
            page={safePage}
            totalPages={totalDisplayPages}
            onPageChange={setDisplayPage}
            className="mt-10"
          />
        </div>
      </div>
    </div>
  );
}

function numeric(v: string | null): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
