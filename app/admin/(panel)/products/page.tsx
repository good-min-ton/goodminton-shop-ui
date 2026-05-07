"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Pencil, ImageIcon } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable } from "@/components/admin/data-table";
import { Pagination } from "@/components/storefront/pagination";
import { Button } from "@/components/ui/button";
import { useProductList } from "@/hooks/use-products";
import { formatVnd } from "@/lib/utils";
import type { Product } from "@/types/api";

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const list = useProductList(
    {
      page,
      size: 20,
      sortBy: "createdAt",
      sortDir: "desc",
    },
    { refetchOnMount: "always" },
  );

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
                  ? Math.min(
                      ...r.variants.map((v) => v.salePrice ?? v.price),
                    )
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
            render: (r: Product) => (
              <div className="inline-flex items-center gap-3">
                <Link
                  href={`/admin/products/${r.productId}`}
                  className="text-primary-300 text-xs hover:underline"
                >
                  Chi tiết
                </Link>
                <Link
                  href={`/admin/products/${r.productId}/edit`}
                  className="text-admin-text-muted hover:text-admin-text"
                  aria-label="Sửa"
                >
                  <Pencil size={14} />
                </Link>
              </div>
            ),
          },
        ]}
        data={list.data?.content}
        loading={list.isLoading}
        rowKey={(r) => r.productId}
      />

      <Pagination
        page={page}
        totalPages={list.data?.totalPages ?? 1}
        onPageChange={setPage}
        className="mt-6"
      />
    </>
  );
}
