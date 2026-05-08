"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useProductList, getDisplayPrice } from "@/hooks/use-products";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { Spinner } from "@/components/ui/spinner";
import { cn, formatVnd } from "@/lib/utils";
import type { Product } from "@/types/api";

const FETCH_SIZE = 200;
const RESULT_LIMIT = 6;

export function HeaderSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 200);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const list = useProductList({
    page: 1,
    size: FETCH_SIZE,
    sortBy: "createdAt",
    sortDir: "desc",
  });

  const results = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) return [];
    return (list.data?.content ?? [])
      .filter((p) => p.isVisible && p.name.toLowerCase().includes(q))
      .slice(0, RESULT_LIMIT);
  }, [debounced, list.data]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
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

  function openSearch() {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function submit(e: React.SyntheticEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    setQuery("");
    router.push(`/products?q=${encodeURIComponent(q)}`);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={openSearch}
        className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 hover:text-stone-900"
        aria-label="Tìm kiếm"
      >
        <Search size={20} />
      </button>

      {open && (
        <div className="animate-fade-in fixed top-[72px] right-0 left-0 z-50 border-t border-stone-200 bg-white shadow-lg md:absolute md:top-12 md:left-auto md:w-[420px] md:rounded-xl md:border md:shadow-xl">
          <form
            onSubmit={submit}
            className="flex items-center gap-2 border-b border-stone-100 px-4 py-3"
          >
            <Search size={18} className="text-stone-400" />
            <input
              ref={inputRef}
              type="search"
              placeholder="Tìm vợt, giày, phụ kiện..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-stone-400"
            />
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setQuery("");
              }}
              className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              aria-label="Đóng"
            >
              <X size={16} />
            </button>
          </form>

          <SearchResults
            query={debounced.trim()}
            loading={list.isLoading}
            results={results}
            onPick={() => {
              setOpen(false);
              setQuery("");
            }}
          />
        </div>
      )}
    </div>
  );
}

interface SearchResultsProps {
  query: string;
  loading: boolean;
  results: Product[];
  onPick: () => void;
}

function SearchResults({
  query,
  loading,
  results,
  onPick,
}: Readonly<SearchResultsProps>) {
  if (!query) {
    return (
      <p className="px-4 py-6 text-center text-xs text-stone-400">
        Gõ tên sản phẩm để bắt đầu tìm kiếm.
      </p>
    );
  }
  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner className="text-primary-700" />
      </div>
    );
  }
  if (results.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-xs text-stone-500">
        Không tìm thấy sản phẩm khớp với "{query}".
      </p>
    );
  }
  return (
    <ul className="max-h-[60vh] divide-y divide-stone-100 overflow-y-auto">
      {results.map((p) => {
        const { price, salePrice } = getDisplayPrice(p);
        const display = salePrice ?? price;
        return (
          <li key={p.id}>
            <Link
              href={`/products/${p.slug}`}
              onClick={onPick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                "hover:bg-stone-50",
              )}
            >
              <div className="bg-stone-100 flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-md">
                {p.thumbnail?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.thumbnail.url}
                    alt={p.name}
                    className="h-full w-full object-contain p-1"
                    loading="lazy"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 font-medium text-stone-900">
                  {p.name}
                </p>
                <p className="text-xs text-stone-500">{p.brand.name}</p>
              </div>
              <span className="font-mono text-primary-700 flex-shrink-0 text-sm">
                {formatVnd(display)}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
