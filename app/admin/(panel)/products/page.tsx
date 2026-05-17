"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Pencil, ImageIcon } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminSearchBar } from "@/components/admin/admin-search-bar";
import { DataTable } from "@/components/admin/data-table";
import { Pagination } from "@/components/storefront/pagination";
import { Button } from "@/components/ui/button";
import { useProductList } from "@/hooks/use-products";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { searchApi } from "@/lib/api/search";
import { formatVnd } from "@/lib/utils";
import type { Product, ProductListItem } from "@/types/api";

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const debouncedQ = useDebouncedValue(query.trim(), 300);
  const useSearch = debouncedQ.length >= 2;

  const list = useProductList(
    { page, size: 20, sortBy: "createdAt", sortDir: "desc" },
    { refetchOnMount: "always" },
  );

  const search = useQuery({
    queryKey: ["search", "products-admin", debouncedQ, page],
    queryFn: () => searchApi.products({ q: debouncedQ, page, size: 20 }),
    enabled: useSearch,
    placeholderData: (prev) => prev,
    staleTime: 30 * 1000,
  });

  const active = useSearch ? search : list;
  const totalPages = active.data?.page.totalPages ?? 1;

  function onSearchChange(v: string) {
    setQuery(v);
    setPage(1);
  }

  return (
    <>
      <AdminPageHeader
        title="Sản phẩm"
        description="Tất cả sản phẩm trong catalog."
        actions={
          <Link href="/admin/products/create">
            <Button variant="admin-primary">
              <Plus size={16} />
              Tạo sản phẩm
            </Button>
          </Link>
        }
      />

      <AdminSearchBar
        value={query}
        onChange={onSearchChange}
        placeholder="Tìm sản phẩm theo tên, mô tả..."
        className="mb-4"
      />

      {useSearch ? (
        <SearchResultsTable
          loading={search.isLoading}
          items={search.data?.content ?? []}
        />
      ) : (
        <ListTable
          loading={list.isLoading}
          items={list.data?.content ?? []}
        />
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        admin
        className="mt-6"
      />
    </>
  );
}

function ListTable({
  loading,
  items,
}: Readonly<{ loading: boolean; items: Product[] }>) {
  return (
    <DataTable
      columns={[
        {
          key: "thumb",
          header: "",
          width: "60px",
          render: (r: Product) => (
            <div className="bg-admin-surface-2 flex h-10 w-10 items-center justify-center overflow-hidden rounded-md">
              {r.thumbnail?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.thumbnail.url}
                  alt={r.name}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              ) : (
                <ImageIcon size={16} className="text-admin-text-muted" />
              )}
            </div>
          ),
        },
        {
          key: "name",
          header: "Tên",
          render: (r: Product) => (
            <div>
              <div className="text-admin-text font-medium">{r.name}</div>
              <div className="font-mono text-admin-text-muted text-xs">
                {r.slug}
              </div>
            </div>
          ),
        },
        {
          key: "category",
          header: "Danh mục",
          render: (r: Product) => (
            <span className="text-admin-text-muted text-xs">
              {r.category.name}
            </span>
          ),
        },
        {
          key: "brand",
          header: "Brand",
          render: (r: Product) => (
            <span className="text-admin-text-muted text-xs">
              {r.brand.name}
            </span>
          ),
        },
        {
          key: "variants",
          header: "Variants",
          align: "center",
          render: (r: Product) => (
            <span className="font-mono">{r.variants.length}</span>
          ),
        },
        {
          key: "price",
          header: "Giá",
          align: "right",
          render: (r: Product) => {
            const min =
              r.variants.length > 0
                ? Math.min(...r.variants.map((v) => v.salePrice ?? v.price))
                : 0;
            return (
              <span className="font-mono text-admin-text">
                {formatVnd(min)}
              </span>
            );
          },
        },
        {
          key: "visible",
          header: "Hiển thị",
          render: (r: Product) =>
            r.isVisible ? (
              <span className="inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
                Visible
              </span>
            ) : (
              <span className="inline-flex rounded-full bg-stone-500/10 px-2 py-0.5 text-[10px] text-stone-400">
                Hidden
              </span>
            ),
        },
        {
          key: "actions",
          header: "",
          width: "120px",
          align: "right",
          render: (r: Product) => <RowActions id={r.id} />,
        },
      ]}
      data={items}
      loading={loading}
      rowKey={(r) => r.id}
    />
  );
}

function SearchResultsTable({
  loading,
  items,
}: Readonly<{ loading: boolean; items: ProductListItem[] }>) {
  return (
    <DataTable
      columns={[
        {
          key: "thumb",
          header: "",
          width: "60px",
          render: (r: ProductListItem) => (
            <div className="bg-admin-surface-2 flex h-10 w-10 items-center justify-center overflow-hidden rounded-md">
              {r.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.thumbnailUrl}
                  alt={r.name}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              ) : (
                <ImageIcon size={16} className="text-admin-text-muted" />
              )}
            </div>
          ),
        },
        {
          key: "name",
          header: "Tên",
          render: (r: ProductListItem) => (
            <div>
              <div className="text-admin-text font-medium">{r.name}</div>
              <div className="font-mono text-admin-text-muted text-xs">
                {r.slug}
              </div>
            </div>
          ),
        },
        {
          key: "price",
          header: "Giá",
          align: "right",
          render: (r: ProductListItem) => (
            <span className="font-mono text-admin-text">
              {formatVnd(r.minSalePrice ?? r.minPrice)}
            </span>
          ),
        },
        {
          key: "actions",
          header: "",
          width: "120px",
          align: "right",
          render: (r: ProductListItem) => <RowActions id={r.id} />,
        },
      ]}
      data={items}
      loading={loading}
      rowKey={(r) => r.id}
      emptyText="Không tìm thấy sản phẩm phù hợp"
    />
  );
}

function RowActions({ id }: Readonly<{ id: number }>) {
  return (
    <div className="inline-flex items-center gap-3">
      <Link
        href={`/admin/products/${id}`}
        className="text-primary-300 text-xs hover:underline"
      >
        Chi tiết
      </Link>
      <Link
        href={`/admin/products/${id}/edit`}
        className="text-admin-text-muted hover:text-admin-text"
        aria-label="Sửa"
      >
        <Pencil size={14} />
      </Link>
    </div>
  );
}
