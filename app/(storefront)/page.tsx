"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <section className="bg-soft-glow border-b border-stone-200">
        <div className="container-app grid items-center gap-10 py-10 md:grid-cols-[2fr_3fr] md:py-14">
          <div>
            <h1 className="font-display text-stone-900 text-5xl leading-[0.95] font-extrabold tracking-tight md:text-6xl">
              Vợt cầu lông
              <br />
              <span className="text-primary-700">chính hãng.</span>
            </h1>
            <p className="mt-5 max-w-sm text-stone-500">
              Yonex, Victor, Lining và nhiều thương hiệu hàng đầu. Giao hàng toàn
              quốc, đổi trả 7 ngày.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/products">
                <Button uppercase>Mua ngay</Button>
              </Link>
              <Link href="/categories">
                <Button variant="secondary">Xem theo danh mục</Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <ProductGrid
              products={featuredProducts.slice(0, 4)}
              loading={featured.isLoading}
              cols={2}
              emptyTitle="Chưa có sản phẩm nào để hiển thị"
              emptyDescription="Quay lại sau khi cửa hàng đăng sản phẩm đầu tiên."
              className="col-span-2 grid-cols-2 md:grid-cols-2"
            />
          </div>
        </div>
      </section>

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
                className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-stone-900 p-6 text-white transition-shadow hover:shadow-lg"
              >
                <div className="bg-soft-glow-dark absolute inset-0 opacity-50" />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="font-mono text-[11px] tracking-widest text-stone-400 uppercase">
                    Danh mục
                  </div>
                  <div>
                    <div className="font-display text-2xl font-extrabold tracking-tight">
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
