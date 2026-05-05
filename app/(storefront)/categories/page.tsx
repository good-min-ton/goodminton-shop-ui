"use client";

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
              className="group relative overflow-hidden rounded-2xl bg-stone-900 p-8 text-white transition-shadow hover:shadow-lg"
            >
              <div className="bg-racket-grid-dark absolute inset-0 opacity-50" />
              <div className="relative">
                <div className="font-mono text-[11px] tracking-widest text-stone-400 uppercase">
                  Danh mục
                </div>
                <h2 className="font-display mt-3 text-3xl font-extrabold tracking-tight">
                  {c.name}
                </h2>
                {c.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-stone-400">
                    {c.description}
                  </p>
                )}
                <div className="text-primary-300 mt-5 inline-flex items-center gap-1 text-sm font-medium">
                  <span>Xem sản phẩm</span>
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
