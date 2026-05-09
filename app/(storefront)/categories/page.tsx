"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useCategories } from "@/hooks/use-catalog";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();

  return (
    <div className="container-app py-10">
      <div className="mb-8">
        <h1 className="font-display text-stone-900 text-4xl font-extrabold tracking-tight">
          Danh mục sản phẩm
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Chọn danh mục để xem sản phẩm theo nhóm.
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Spinner className="text-primary-700" size={32} />
        </div>
      )}

      {!isLoading && (!categories || categories.length === 0) && (
        <EmptyState title="Chưa có danh mục nào" />
      )}

      {!isLoading && categories && categories.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/categories/${c.id}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-900 p-7 text-white shadow-sm transition-shadow hover:shadow-lg"
            >
              {c.thumbnail?.url ? (
                <Image
                  src={c.thumbnail.url}
                  alt={c.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
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
                  <h2 className="font-display text-3xl font-extrabold tracking-tight drop-shadow-sm">
                    {c.name}
                  </h2>
                  {c.description && (
                    <p className="mt-2 line-clamp-2 max-w-xs text-sm text-stone-200/90">
                      {c.description}
                    </p>
                  )}
                  <div className="text-primary-200 mt-4 inline-flex items-center gap-1 text-sm font-medium">
                    <span>Xem sản phẩm</span>
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
