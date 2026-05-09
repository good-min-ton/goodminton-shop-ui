"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroSlider } from "@/components/storefront/hero-slider";
import { ProductGrid } from "@/components/storefront/product-grid";
import { RecentlyViewedSection } from "@/components/storefront/recently-viewed-section";
import { useProductList } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-catalog";

export default function HomePage() {
  const featured = useProductList({
    page: 1,
    size: 8,
    sortBy: "createdAt",
    sortDir: "desc",
  });
  const popular = useProductList({
    page: 1,
    size: 8,
    sortBy: "createdAt",
    sortDir: "asc",
  });
  const categoriesQuery = useCategories();

  const featuredProducts = featured.data?.content ?? [];
  const popularProducts = popular.data?.content ?? [];
  const categories = categoriesQuery.data ?? [];

  return (
    <>
      <HeroSlider />

      {categories.length > 0 && (
        <section className="container-app py-12">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-display text-stone-900 text-3xl font-extrabold tracking-tight">
              Danh mục
            </h2>
            <Link
              href="/categories"
              className="text-primary-700 inline-flex items-center gap-1 text-sm font-medium hover:underline"
            >
              <span>Tất cả</span>
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {categories.slice(0, 4).map((c) => (
              <Link
                key={c.id}
                href={`/categories/${c.id}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-stone-900 p-6 text-white shadow-sm transition-shadow hover:shadow-lg"
              >
                {c.thumbnail?.url ? (
                  <Image
                    src={c.thumbnail.url}
                    alt={c.name}
                    fill
                    sizes="(min-width: 1024px) 23vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="bg-soft-glow-dark absolute inset-0 opacity-60" />
                )}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-tr from-stone-950/85 via-stone-900/55 to-transparent"
                />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="font-mono text-[11px] tracking-widest text-stone-300 uppercase drop-shadow">
                    Danh mục
                  </div>
                  <div>
                    <div className="font-display text-2xl font-extrabold tracking-tight drop-shadow-sm">
                      {c.name}
                    </div>
                    <div className="text-primary-300 mt-1 inline-flex items-center gap-1 text-xs opacity-0 transition-opacity group-hover:opacity-100">
                      <span>Xem ngay</span>
                      <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container-app py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-stone-900 text-3xl font-extrabold tracking-tight">
            Sản phẩm mới
          </h2>
          <Link
            href="/products?sortBy=createdAt&sortDir=desc"
            className="text-primary-700 inline-flex items-center gap-1 text-sm font-medium hover:underline"
          >
            <span>Xem tất cả</span>
            <ArrowRight size={14} />
          </Link>
        </div>
        <ProductGrid
          products={featuredProducts}
          loading={featured.isLoading}
          cols={4}
          emptyTitle="Chưa có sản phẩm mới"
        />
      </section>

      <RecentlyViewedSection className="container-app py-12" />

      {popularProducts.length > 0 && (
        <section className="container-app py-12">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-display text-stone-900 text-3xl font-extrabold tracking-tight">
              Khám phá thêm
            </h2>
            <Link
              href="/products"
              className="text-primary-700 inline-flex items-center gap-1 text-sm font-medium hover:underline"
            >
              <span>Xem tất cả</span>
              <ArrowRight size={14} />
            </Link>
          </div>
          <ProductGrid
            products={popularProducts}
            loading={popular.isLoading}
            cols={4}
          />
        </section>
      )}
    </>
  );
}
