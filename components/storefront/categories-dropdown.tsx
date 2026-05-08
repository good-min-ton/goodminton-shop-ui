"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Folders, Tag } from "lucide-react";
import { useBrands, useCategories } from "@/hooks/use-catalog";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface CategoriesDropdownProps {
  active?: boolean;
}

const MAX_BRANDS_PREVIEW = 8;

export function CategoriesDropdown({
  active,
}: Readonly<CategoriesDropdownProps>) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const menuId = useId();

  const categories = useCategories();
  const brands = useBrands();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    globalThis.addEventListener("mousedown", onPointer);
    globalThis.addEventListener("touchstart", onPointer);
    globalThis.addEventListener("keydown", onKey);
    return () => {
      globalThis.removeEventListener("mousedown", onPointer);
      globalThis.removeEventListener("touchstart", onPointer);
      globalThis.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function openWithDelay() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setOpen(true);
  }
  function closeWithDelay() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpen(false), 120);
  }

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={openWithDelay}
      onMouseLeave={closeWithDelay}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className={cn(
          "inline-flex items-center gap-1 rounded-lg px-4 py-2 text-[15px] font-medium transition-colors",
          active || open
            ? "bg-stone-100 text-primary-700"
            : "text-stone-700 hover:bg-stone-50 hover:text-primary-700",
        )}
      >
        <span>Sản phẩm</span>
        <ChevronDown
          size={14}
          className={cn(
            "transition-transform",
            open ? "rotate-180" : "rotate-0",
          )}
        />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="animate-fade-in absolute left-0 z-50 mt-2 w-[640px] max-w-[92vw] overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl"
        >
          <div className="grid grid-cols-1 gap-0 sm:grid-cols-[1.2fr_1fr]">
            <CategoriesColumn
              loading={categories.isLoading}
              items={categories.data ?? []}
              onPick={() => setOpen(false)}
            />
            <BrandsColumn
              loading={brands.isLoading}
              items={brands.data ?? []}
              onPick={() => setOpen(false)}
            />
          </div>

          <div className="flex items-center justify-between border-t border-stone-100 bg-stone-50 px-5 py-3 text-sm">
            <span className="text-stone-500">
              Khám phá toàn bộ catalog cầu lông
            </span>
            <Link
              href="/products"
              onClick={() => setOpen(false)}
              className="text-primary-700 inline-flex items-center gap-1 font-medium hover:underline"
            >
              <span>Xem tất cả</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

interface CategoriesColumnProps {
  loading: boolean;
  items: { id: number; name: string; description?: string }[];
  onPick: () => void;
}

function CategoriesColumn({
  loading,
  items,
  onPick,
}: Readonly<CategoriesColumnProps>) {
  return (
    <div className="border-b border-stone-100 px-5 py-5 sm:border-r sm:border-b-0">
      <div className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-stone-400 uppercase">
        <Folders size={12} />
        <span>Danh mục</span>
      </div>

      <ColumnContent
        loading={loading}
        emptyText="Chưa có danh mục nào."
        isEmpty={items.length === 0}
      >
        <ul className="max-h-[320px] space-y-0.5 overflow-y-auto pr-2">
          {items.map((c) => (
            <li key={c.id}>
                <Link
                  href={`/categories/${c.id}`}
                  onClick={onPick}
                  role="menuitem"
                  className="group/item flex items-baseline justify-between gap-3 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-primary-50 hover:text-primary-700"
                >
                  <span className="font-medium text-stone-800 group-hover/item:text-primary-700">
                    {c.name}
                  </span>
                  <ArrowRight
                    size={12}
                    className="flex-shrink-0 -translate-x-1 text-stone-300 opacity-0 transition group-hover/item:translate-x-0 group-hover/item:text-primary-700 group-hover/item:opacity-100"
                  />
                </Link>
              </li>
            ))}
        </ul>
      </ColumnContent>
    </div>
  );
}

interface BrandsColumnProps {
  loading: boolean;
  items: { id: number; name: string }[];
  onPick: () => void;
}

function BrandsColumn({ loading, items, onPick }: Readonly<BrandsColumnProps>) {
  const visible = items.slice(0, MAX_BRANDS_PREVIEW);
  return (
    <div className="bg-stone-50/50 px-5 py-5">
      <div className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-stone-400 uppercase">
        <Tag size={12} />
        <span>Thương hiệu</span>
      </div>

      <ColumnContent
        loading={loading}
        emptyText="Chưa có thương hiệu nào."
        isEmpty={visible.length === 0}
      >
        <ul className="grid grid-cols-2 gap-1.5">
          {visible
            .filter((b) => b.id != null)
            .map((b) => (
              <li key={b.id}>
                <Link
                  href={`/brands/${b.id}`}
                  onClick={onPick}
                  role="menuitem"
                  className="block truncate rounded-md border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                >
                  {b.name}
                </Link>
              </li>
            ))}
        </ul>
      </ColumnContent>
    </div>
  );
}

interface ColumnContentProps {
  loading: boolean;
  isEmpty: boolean;
  emptyText: string;
  children: React.ReactNode;
}

function ColumnContent({
  loading,
  isEmpty,
  emptyText,
  children,
}: Readonly<ColumnContentProps>) {
  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner className="text-primary-700" />
      </div>
    );
  }
  if (isEmpty) {
    return <p className="px-2 py-4 text-xs text-stone-400">{emptyText}</p>;
  }
  return <>{children}</>;
}
