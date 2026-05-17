"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ProductGrid } from "@/components/storefront/product-grid";
import { ProductFilterSidebar } from "@/components/storefront/product-filter-sidebar";
import { Pagination } from "@/components/storefront/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { useProductList } from "@/hooks/use-products";
import { searchApi } from "@/lib/api/search";
import { formatVnd } from "@/lib/utils";
import type { ProductListItem } from "@/types/api";

const LIST_FETCH_SIZE = 100;
const LIST_DISPLAY_SIZE = 12;
const SEARCH_PAGE_SIZE = 20;

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
  const q = (sp.get("q") ?? "").trim();
  const useSearch = q.length >= 2;

  function updateQuery(updates: Record<string, string | null>) {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v == null) next.delete(k);
      else next.set(k, v);
    }
    router.replace(`/products?${next.toString()}`);
  }

  return (
    <div className="container-app py-10">
      {useSearch ? (
        <SearchResults q={q} onClear={() => updateQuery({ q: null })} />
      ) : (
        <ListingWithFilters
          categoryId={categoryId}
          brandId={brandId}
          sortKey={sortKey}
          updateQuery={updateQuery}
        />
      )}
    </div>
  );
}

interface ListingProps {
  categoryId: number | null;
  brandId: number | null;
  sortKey: string;
  updateQuery: (updates: Record<string, string | null>) => void;
}

function ListingWithFilters({
  categoryId,
  brandId,
  sortKey,
  updateQuery,
}: Readonly<ListingProps>) {
  const [displayPage, setDisplayPage] = useState(1);
  const [sortBy, sortDir] = sortKey.split(":") as [string, "asc" | "desc"];

  const list = useProductList({
    page: 1,
    size: LIST_FETCH_SIZE,
    sortBy,
    sortDir,
  });

  const allProducts = list.data?.content ?? [];

  const filtered = useMemo(() => {
    return allProducts.filter((p) => {
      if (!p.isVisible) return false;
      if (categoryId != null && p.category.id !== categoryId) return false;
      if (brandId != null && p.brand.id !== brandId) return false;
      return true;
    });
  }, [allProducts, categoryId, brandId]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / LIST_DISPLAY_SIZE),
  );
  const safePage = Math.min(displayPage, totalPages);
  const pageItems = filtered.slice(
    (safePage - 1) * LIST_DISPLAY_SIZE,
    safePage * LIST_DISPLAY_SIZE,
  );

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-stone-900 text-4xl font-extrabold tracking-tight">
          Tất cả sản phẩm
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          {list.isLoading ? "Đang tải..." : `${filtered.length} sản phẩm`}
        </p>
      </div>

      <div className="grid gap-10 md:grid-cols-[220px_1fr]">
        <div className="hidden md:block">
          <ProductFilterSidebar
            value={{ categoryId, brandId }}
            onChange={(next) => {
              updateQuery({
                categoryId: next.categoryId?.toString() ?? null,
                brandId: next.brandId?.toString() ?? null,
              });
              setDisplayPage(1);
            }}
          />
        </div>

        <div>
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-sm text-stone-500">
              Trang {safePage} / {totalPages}
            </p>
            <select
              value={sortKey}
              onChange={(e) => {
                updateQuery({ sort: e.target.value });
                setDisplayPage(1);
              }}
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
            totalPages={totalPages}
            onPageChange={setDisplayPage}
            className="mt-10"
          />
        </div>
      </div>
    </>
  );
}

interface SearchResultsProps {
  q: string;
  onClear: () => void;
}

function SearchResults({ q, onClear }: Readonly<SearchResultsProps>) {
  const [page, setPage] = useState(1);

  const search = useQuery({
    queryKey: ["search", "products", q, page],
    queryFn: () =>
      searchApi.products({ q, page, size: SEARCH_PAGE_SIZE }),
    placeholderData: (prev) => prev,
    staleTime: 30 * 1000,
  });

  const items = search.data?.content ?? [];
  const totalPages = search.data?.page.totalPages ?? 1;
  const total = search.data?.page.totalElements ?? 0;

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-stone-900 text-4xl font-extrabold tracking-tight">
            Kết quả cho &ldquo;{q}&rdquo;
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            {search.isLoading ? "Đang tìm..." : `${total} sản phẩm`}
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-primary-700 text-sm font-medium hover:underline"
        >
          Xoá tìm kiếm
        </button>
      </div>

      <SearchBody
        loading={search.isLoading}
        items={items}
        q={q}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        className="mt-10"
      />
    </>
  );
}

interface SearchBodyProps {
  loading: boolean;
  items: ProductListItem[];
  q: string;
}

function SearchBody({ loading, items, q }: Readonly<SearchBodyProps>) {
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="text-primary-700" size={32} />
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <EmptyState
        title="Không tìm thấy sản phẩm phù hợp"
        description={`Không có sản phẩm nào khớp với "${q}". Thử từ khoá khác.`}
      />
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((p) => (
        <SearchResultCard key={p.id} product={p} />
      ))}
    </div>
  );
}

function SearchResultCard({
  product,
}: Readonly<{ product: ProductListItem }>) {
  const display = product.minSalePrice ?? product.minPrice;
  const onSale =
    product.minSalePrice != null && product.minSalePrice < product.minPrice;
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white transition-shadow hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        {product.thumbnailUrl ? (
          <Image
            src={product.thumbnailUrl}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-[15px] font-medium text-stone-900">
          {product.name}
        </h3>
        <div className="mt-auto pt-3 flex items-baseline gap-2">
          <span className="font-mono text-[17px] font-medium text-primary-700">
            {formatVnd(display)}
          </span>
          {onSale && (
            <span className="font-mono text-[13px] text-stone-400 line-through">
              {formatVnd(product.minPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function numeric(v: string | null): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
