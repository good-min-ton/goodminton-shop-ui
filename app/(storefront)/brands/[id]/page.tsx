"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { brandsApi } from "@/lib/api/brands";
import { ScopedProductList } from "@/components/storefront/scoped-product-list";
import { Spinner } from "@/components/ui/spinner";

export default function BrandDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ? Number(params.id) : null;

  const brand = useQuery({
    queryKey: ["brands", "detail", id],
    queryFn: () => brandsApi.detail(id as number),
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
        <span className="text-stone-700">
          {brand.data?.name ?? "Thương hiệu"}
        </span>
      </nav>

      <div className="mb-8">
        <p className="font-mono mb-2 text-xs tracking-widest text-stone-400 uppercase">
          Thương hiệu
        </p>
        <h1 className="font-display text-stone-900 text-4xl font-extrabold tracking-tight">
          {brand.isLoading ? <Spinner className="text-primary-700" /> : brand.data?.name}
        </h1>
      </div>

      <ScopedProductList
        predicate={(p) => p.brand.id === id}
        emptyTitle="Chưa có sản phẩm thuộc thương hiệu này"
      />
    </div>
  );
}
