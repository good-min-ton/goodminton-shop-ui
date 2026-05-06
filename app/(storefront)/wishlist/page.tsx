"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ImageOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useWishlistStore } from "@/store/wishlist-store";
import { useAuthStore } from "@/store/auth-store";
import { formatVnd } from "@/lib/utils";

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const remove = useWishlistStore((s) => s.remove);
  const clear = useWishlistStore((s) => s.clear);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  if (!isHydrated) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="container-app py-16">
        <EmptyState
          icon={<Heart size={56} />}
          title="Chưa có sản phẩm yêu thích"
          description="Bấm vào icon trái tim trên sản phẩm để lưu vào đây."
          action={
            <Link href="/products">
              <Button uppercase>Khám phá sản phẩm</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-app py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-stone-900 text-4xl font-extrabold tracking-tight">
            Sản phẩm yêu thích
          </h1>
          <p className="mt-2 text-sm text-stone-500">{items.length} sản phẩm</p>
        </div>
        <button
          onClick={clear}
          className="text-sm text-stone-500 hover:text-red-600"
        >
          Xoá tất cả
        </button>
      </div>

      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <li
            key={item.productId}
            className="group relative flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white transition-shadow hover:shadow-md"
          >
            <Link
              href={`/products/${item.slug}`}
              className="flex flex-1 flex-col"
            >
              <div className="relative aspect-square overflow-hidden bg-stone-100">
                {item.thumbnailUrl ? (
                  <Image
                    src={item.thumbnailUrl}
                    alt={item.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                    className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-stone-300">
                    <ImageOff size={48} />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="text-xs text-stone-400">{item.brandName}</p>
                <h3 className="mt-1 line-clamp-2 text-[15px] font-medium text-stone-900">
                  {item.name}
                </h3>
                <span className="font-mono text-primary-700 mt-auto pt-3 text-[17px] font-medium">
                  {formatVnd(item.displayPrice)}
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => remove(item.productId)}
              className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-stone-500 opacity-0 shadow-sm backdrop-blur-sm transition-opacity hover:bg-white hover:text-red-500 group-hover:opacity-100"
              aria-label="Bỏ khỏi yêu thích"
            >
              <Trash2 size={14} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
