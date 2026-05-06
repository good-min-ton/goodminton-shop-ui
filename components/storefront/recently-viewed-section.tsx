"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { useRecentlyViewedStore } from "@/store/recently-viewed-store";
import { formatVnd } from "@/lib/utils";

interface RecentlyViewedSectionProps {
  /** Hide a specific product (e.g. exclude the one currently being viewed). */
  excludeProductId?: number;
  /** Optional title — defaults to "Đã xem gần đây". */
  title?: string;
  className?: string;
}

export function RecentlyViewedSection({
  excludeProductId,
  title = "Đã xem gần đây",
  className,
}: Readonly<RecentlyViewedSectionProps>) {
  const items = useRecentlyViewedStore((s) => s.items);
  const visible =
    excludeProductId != null
      ? items.filter((i) => i.productId !== excludeProductId)
      : items;

  if (visible.length === 0) return null;

  return (
    <section className={className}>
      <div className="mb-5 flex items-center gap-2">
        <Clock size={16} className="text-stone-400" />
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-stone-900">
          {title}
        </h2>
      </div>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {visible.slice(0, 4).map((item) => (
          <li key={item.productId}>
            <Link
              href={`/products/${item.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-square overflow-hidden bg-stone-100">
                {item.thumbnailUrl ? (
                  <Image
                    src={item.thumbnailUrl}
                    alt={item.name}
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                  />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col p-3">
                <p className="text-[11px] text-stone-400">{item.brandName}</p>
                <p className="mt-1 line-clamp-2 text-sm font-medium text-stone-900">
                  {item.name}
                </p>
                <span className="font-mono text-primary-700 mt-auto pt-2 text-sm font-medium">
                  {formatVnd(item.displayPrice)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
