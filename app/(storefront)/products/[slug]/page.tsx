"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import { useProductBySlug } from "@/hooks/use-product-by-slug";
import {
  getDisplayPrice,
  useProductRecommendations,
} from "@/hooks/use-products";
import {
  ProductReviewsSection,
  RatingStars,
} from "@/components/storefront/product-reviews-section";
import { useQuery } from "@tanstack/react-query";
import { reviewsApi } from "@/lib/api/reviews";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { HtmlContent } from "@/components/ui/html-content";
import { VariantSelector } from "@/components/storefront/variant-selector";
import { RecentlyViewedSection } from "@/components/storefront/recently-viewed-section";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { useRecentlyViewedStore } from "@/store/recently-viewed-store";
import { toast } from "@/store/toast-store";
import { cn, formatVnd, clamp } from "@/lib/utils";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? null;
  const router = useRouter();

  const productQuery = useProductBySlug(slug);
  const product = productQuery.data;

  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    null,
  );
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<"specs" | "reviews">("specs");

  const effectiveVariantId =
    selectedVariantId ?? product?.variants[0]?.id ?? null;
  const variant = product?.variants.find((v) => v.id === effectiveVariantId);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const list: { id: number; url: string }[] = [];
    if (product.thumbnail) {
      list.push({ id: product.thumbnail.id, url: product.thumbnail.url });
    }
    if (variant?.images?.length) {
      for (const img of variant.images) list.push({ id: img.id, url: img.url });
    }
    return list;
  }, [product, variant]);

  const reviewSummary = useQuery({
    queryKey: ["reviews", "all", product?.id ?? 0],
    queryFn: () =>
      reviewsApi.list(product!.id, {
        page: 1,
        size: 500,
        sortBy: "createdAt",
        sortDir: "desc",
      }),
    enabled: product != null,
    staleTime: 60 * 1000,
  });
  const recs = useProductRecommendations(product?.id ?? null);

  const reviewStats = (() => {
    const list = reviewSummary.data?.content ?? [];
    if (list.length === 0) return { count: 0, avg: 0 };
    const sum = list.reduce((s, r) => s + r.rating, 0);
    return { count: list.length, avg: sum / list.length };
  })();

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.open);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isWished = useWishlistStore((s) =>
    product ? s.has(product.id) : false,
  );
  const trackView = useRecentlyViewedStore((s) => s.track);

  useEffect(() => {
    if (!product) return;
    const { price, salePrice } = getDisplayPrice(product);
    trackView({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brandName: product.brand.name,
      thumbnailUrl: product.thumbnail?.url ?? null,
      displayPrice: salePrice ?? price,
    });
  }, [product, trackView]);

  function handleToggleWishlist() {
    if (!product) return;
    const { price, salePrice } = getDisplayPrice(product);
    toggleWishlist({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brandName: product.brand.name,
      thumbnailUrl: product.thumbnail?.url ?? null,
      displayPrice: salePrice ?? price,
    });
    toast(
      isWished ? "Đã bỏ khỏi yêu thích" : "Đã lưu vào yêu thích",
      "success",
    );
  }

  function handleAddToCart() {
    if (!product || !variant) return;
    addItem({
      variantId: variant.id,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      thumbnailUrl: product.thumbnail?.url ?? null,
      colorName: variant.color.name,
      sizeName: variant.size.name,
      skuCode: variant.skuCode,
      unitPrice: variant.price,
      salePrice: variant.salePrice,
      quantity,
    });
    openCart();
    toast(`Đã thêm ${quantity} sản phẩm vào giỏ`, "success");
  }

  function handleBuyNow() {
    handleAddToCart();
    router.push("/cart");
  }

  if (productQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size={32} className="text-primary-700" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-app py-16">
        <EmptyState
          title="Không tìm thấy sản phẩm"
          description="Sản phẩm có thể đã ngừng kinh doanh hoặc đường dẫn không đúng."
          action={
            <Link href="/products">
              <Button variant="secondary">Quay lại danh sách sản phẩm</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const onSale =
    variant?.salePrice != null && variant.salePrice < variant.price;
  const displayPrice = onSale ? variant!.salePrice! : (variant?.price ?? 0);

  return (
    <div className="container-app py-8">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-1 text-xs text-stone-500"
      >
        <Link href="/" className="hover:text-stone-900">
          Trang chủ
        </Link>
        <ChevronRight size={12} />
        <Link href="/products" className="hover:text-stone-900">
          Sản phẩm
        </Link>
        <ChevronRight size={12} />
        <Link
          href={`/categories/${product.category.id}`}
          className="hover:text-stone-900"
        >
          {product.category.name}
        </Link>
        <ChevronRight size={12} />
        <span className="truncate text-stone-700">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={galleryImages} alt={product.name} />

        <div>
          <p className="text-sm font-medium tracking-wide text-stone-400 uppercase">
            {product.brand.name}
          </p>
          <h1 className="font-display mt-2 text-4xl leading-tight font-extrabold tracking-tight text-stone-900">
            {product.name}
          </h1>

          {reviewStats.count > 0 && (
            <button
              type="button"
              onClick={() => setTab("reviews")}
              className="mt-3 inline-flex items-center gap-2 text-xs text-stone-500 hover:text-stone-900"
            >
              <RatingStars rating={reviewStats.avg} size={14} />
              <span>
                <span className="font-mono text-stone-700">
                  {reviewStats.avg.toFixed(1)}
                </span>{" "}
                · {reviewStats.count} đánh giá
              </span>
            </button>
          )}

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-mono text-3xl font-medium text-primary-700">
              {formatVnd(displayPrice)}
            </span>
            {onSale && variant && (
              <span className="font-mono text-lg text-stone-400 line-through">
                {formatVnd(variant.price)}
              </span>
            )}
          </div>
          {variant && (
            <p className="font-mono mt-1 text-xs text-stone-400">
              SKU: {variant.skuCode}
            </p>
          )}

          <div className="my-7 h-px bg-stone-200" />

          {product.variants.length > 0 && (
            <VariantSelector
              variants={product.variants}
              selectedVariantId={effectiveVariantId}
              onSelect={(id) => {
                setSelectedVariantId(id);
                setQuantity(1);
              }}
            />
          )}

          <div className="mt-7">
            <p className="mb-2 text-sm font-medium text-stone-700">Số lượng</p>
            <div className="inline-flex items-center overflow-hidden rounded-lg border border-stone-200">
              <button
                onClick={() => setQuantity((q) => clamp(q - 1, 1, 99))}
                className="p-2.5 text-stone-600 hover:bg-stone-50"
                aria-label="Giảm"
              >
                <Minus size={14} />
              </button>
              <span className="font-mono w-10 text-center text-sm">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => clamp(q + 1, 1, 99))}
                className="p-2.5 text-stone-600 hover:bg-stone-50"
                aria-label="Tăng"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-stretch gap-3">
            <Button
              size="lg"
              uppercase
              onClick={handleAddToCart}
              disabled={!variant}
              className="flex-1"
            >
              Thêm vào giỏ
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={handleBuyNow}
              disabled={!variant}
              className="flex-1"
            >
              Mua ngay
            </Button>
            <button
              type="button"
              onClick={handleToggleWishlist}
              aria-label={isWished ? "Bỏ yêu thích" : "Lưu yêu thích"}
              aria-pressed={isWished}
              className={cn(
                "inline-flex items-center justify-center rounded-lg border-[1.5px] px-4 transition-colors",
                isWished
                  ? "border-red-200 bg-red-50 text-red-500"
                  : "border-stone-200 text-stone-600 hover:border-red-200 hover:bg-red-50 hover:text-red-500",
              )}
            >
              <Heart size={18} fill={isWished ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4 text-center text-xs text-stone-600">
            <div className="space-y-1.5">
              <Truck size={18} className="mx-auto text-stone-500" />
              <span className="block">Miễn phí ship cho đơn ≥ 1tr</span>
            </div>
            <div className="space-y-1.5">
              <RotateCcw size={18} className="mx-auto text-stone-500" />
              <span className="block">Đổi trả 7 ngày</span>
            </div>
            <div className="space-y-1.5">
              <ShieldCheck size={18} className="mx-auto text-stone-500" />
              <span className="block">Hàng chính hãng</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <div className="flex border-b border-stone-200">
          <TabButton active={tab === "specs"} onClick={() => setTab("specs")}>
            Thông số kỹ thuật
          </TabButton>
          <TabButton
            active={tab === "reviews"}
            onClick={() => setTab("reviews")}
          >
            Đánh giá ({reviewStats.count})
          </TabButton>
        </div>

        <div className="py-7">
          {tab === "specs" && (
            <div className="space-y-10">
              {product.description && (
                <HtmlContent
                  html={product.description}
                  className="text-stone-700"
                />
              )}
              {product.specifications.length > 0 && (
                <section className="mx-auto max-w-3xl">
                  <h3 className="font-display mb-4 text-center text-sm font-bold tracking-wider text-stone-900 uppercase">
                    Thông số kỹ thuật
                  </h3>
                  <dl className="overflow-hidden rounded-xl border border-stone-200 bg-white">
                    {product.specifications.map((s, idx) => (
                      <div
                        key={s.id}
                        className={cn(
                          "grid grid-cols-[minmax(140px,1fr)_2fr] divide-x divide-stone-200 text-sm",
                          idx > 0 && "border-t border-stone-200",
                        )}
                      >
                        <dt className="bg-stone-50 px-5 py-3 font-medium text-stone-600">
                          {s.name}
                        </dt>
                        <dd className="px-5 py-3 text-stone-900">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}
            </div>
          )}

          {tab === "reviews" && (
            <ProductReviewsSection
              productId={product.id}
              productName={product.name}
            />
          )}
        </div>
      </div>

      {recs.data && recs.data.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display mb-6 text-2xl font-extrabold tracking-tight text-stone-900">
            Có thể bạn sẽ thích
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {recs.data.map((r) => (
              <Link
                key={r.id}
                href={`/products/${r.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white transition-shadow hover:shadow-md"
              >
                <div className="aspect-square overflow-hidden bg-stone-100">
                  {r.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.thumbnailUrl}
                      alt={r.name}
                      className="h-full w-full object-contain transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="line-clamp-2 text-sm font-medium text-stone-900">
                    {r.name}
                  </h3>
                  <span className="font-mono text-primary-700 mt-auto pt-2 text-sm font-medium">
                    {formatVnd(r.minSalePrice ?? r.minPrice)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <RecentlyViewedSection excludeProductId={product.id} className="mt-16" />
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabButton({ active, onClick, children }: Readonly<TabButtonProps>) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? "font-display border-b-2 border-primary-700 px-5 py-3 text-sm font-bold tracking-wider text-primary-700 uppercase"
          : "font-display border-b-2 border-transparent px-5 py-3 text-sm font-bold tracking-wider text-stone-500 uppercase hover:text-stone-900"
      }
    >
      {children}
    </button>
  );
}
