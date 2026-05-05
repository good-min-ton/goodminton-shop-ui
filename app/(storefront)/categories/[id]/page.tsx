"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { categoriesApi } from "@/lib/api/categories";
import { ScopedProductList } from "@/components/storefront/scoped-product-list";
import { Spinner } from "@/components/ui/spinner";

export default function CategoryDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ? Number(params.id) : null;

  const category = useQuery({
    queryKey: ["categories", "detail", id],
    queryFn: () => categoriesApi.detail(id as number),
    enabled: id != null,
  });

  if (id == null) return null;

  return (
    <div className="container-app py-10">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-1 text-xs text-stone-500"
      >
        <Link href="/" className="hover:text-stone-900">
          Trang chủ
        </Link>
        <ChevronRight size={12} />
        <Link href="/categories" className="hover:text-stone-900">
          Danh mục
        </Link>
        <ChevronRight size={12} />
        <span className="text-stone-700">
          {category.data?.name ?? "..."}
        </span>
      </nav>

      <div className="mb-8">
        <h1 className="font-display text-stone-900 text-4xl font-extrabold tracking-tight">
          {category.isLoading ? <Spinner className="text-primary-700" /> : category.data?.name}
        </h1>
        {category.data?.description && (
          <p className="mt-2 max-w-2xl text-sm text-stone-500">
            {category.data.description}
          </p>
        )}
      </div>

      <ScopedProductList
        predicate={(p) => p.category.id === id}
        emptyTitle="Chưa có sản phẩm trong danh mục này"
      />
    </div>
  );
}
