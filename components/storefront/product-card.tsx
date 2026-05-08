"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import type { Product } from "@/types/api";
import { cn, formatVnd } from "@/lib/utils";
import { getDisplayPrice } from "@/hooks/use-products";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { toast } from "@/store/toast-store";

interface ProductCardProps {
  product: Product;
  /** Eager-load the thumbnail for above-the-fold cards (helps LCP). */
  priority?: boolean;
}

export function ProductCard({
  product,
  priority = false,
}: Readonly<ProductCardProps>) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.open);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isWished = useWishlistStore((s) => s.has(product.id));
  const { price, salePrice } = getDisplayPrice(product);
  const onSale = salePrice != null && salePrice < price;
  const display = onSale && salePrice != null ? salePrice : price;
  const href = `/products/${product.slug}`;

  const distinctColors = Array.from(
    new Map(
      product.variants
        .filter((v) => !!v.color)
        .map((v) => [v.color.id, v.color]),
    ).values(),
  );

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const v = product.variants[0];
    if (!v) {
      toast("Sản phẩm chưa có phiên bản nào", "warning");
      return;
    }
    addItem({
      variantId: v.id,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      thumbnailUrl: product.thumbnail?.url ?? null,
      colorName: v.color.name,
      sizeName: v.size.name,
      skuCode: v.skuCode,
      unitPrice: v.price,
      salePrice: v.salePrice,
      quantity: 1,
    });
    openCart();
    toast("Đã thêm vào giỏ hàng", "success");
  }

  function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brandName: product.brand.name,
      thumbnailUrl: product.thumbnail?.url ?? null,
      displayPrice: display,
    });
    toast(
      isWished ? "Đã bỏ khỏi danh sách yêu thích" : "Đã lưu vào yêu thích",
      "success",
    );
  }

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white transition-shadow hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        {product.thumbnail?.url ? (
          <Image
            src={product.thumbnail.url}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            priority={priority}
            className="object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-stone-300">
            <ShoppingBag size={56} />
          </div>
        )}

        {onSale && (
          <span className="font-display absolute top-3 left-3 rounded bg-accent px-2 py-0.5 text-[11px] font-bold tracking-wider text-white uppercase">
            Sale
          </span>
        )}

        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={isWished ? "Bỏ yêu thích" : "Lưu yêu thích"}
          aria-pressed={isWished}
          className={cn(
            "absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-colors",
            isWished
              ? "text-red-500 hover:bg-white"
              : "text-stone-400 hover:text-red-500 hover:bg-white",
          )}
        >
          <Heart size={16} fill={isWished ? "currentColor" : "none"} />
        </button>

        <button
          type="button"
          onClick={handleQuickAdd}
          className="font-display absolute right-3 bottom-3 left-3 translate-y-2 rounded-lg bg-stone-900 py-2.5 text-[13px] font-bold tracking-wider text-white uppercase opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
        >
          Thêm vào giỏ
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-stone-400">{product.brand.name}</p>
        <h3 className="mt-1 line-clamp-2 text-[15px] font-medium text-stone-900">
          {product.name}
        </h3>

        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[17px] font-medium text-primary-700">
              {formatVnd(display)}
            </span>
            {onSale && (
              <span className="font-mono text-[13px] text-stone-400 line-through">
                {formatVnd(price)}
              </span>
            )}
          </div>

          {distinctColors.length > 0 && (
            <div className="mt-2.5 flex items-center gap-1.5">
              {distinctColors.slice(0, 5).map((c) => (
                <span
                  key={c.id}
                  title={c.name}
                  className="h-3.5 w-3.5 rounded-full border border-black/10 bg-stone-200"
                  style={c.hexCode ? { background: c.hexCode } : undefined}
                />
              ))}
              {distinctColors.length > 5 && (
                <span className="font-mono text-[11px] text-stone-400">
                  +{distinctColors.length - 5}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
