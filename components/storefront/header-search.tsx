"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { searchApi } from "@/lib/api/search";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { Spinner } from "@/components/ui/spinner";
import { cldThumb, cn, formatVnd } from "@/lib/utils";
import type { ProductListItem } from "@/types/api";

export function HeaderSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query.trim(), 250);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggest = useQuery({
    queryKey: ["search", "products", "suggest", debounced],
    queryFn: () => searchApi.productsSuggest(debounced),
    enabled: debounced.length >= 2,
    staleTime: 30 * 1000,
  });

  const results = debounced.length >= 2 ? (suggest.data ?? []) : [];

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
    if (q.length < 2) return;
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
            query={debounced}
            loading={suggest.isFetching && debounced.length >= 2}
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
  results: ProductListItem[];
  onPick: () => void;
}

function SearchResults({
  query,
  loading,
  results,
  onPick,
}: Readonly<SearchResultsProps>) {
  if (query.length < 2) {
    return (
      <p className="px-4 py-6 text-center text-xs text-stone-400">
        Gõ tối thiểu 2 ký tự để bắt đầu tìm kiếm.
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
        const display = p.minSalePrice ?? p.minPrice;
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
                {p.thumbnailUrl && (
                  // Small Cloudinary-optimized thumb (~5KB vs ~200KB raw).
                  // Eager because popover is in viewport the moment it opens —
                  // lazy would force the user to wait for the intersection
                  // observer to fire even though they're already looking at it.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cldThumb(p.thumbnailUrl, 96, { fit: "contain" }) ?? ""}
                    alt={p.name}
                    width={48}
                    height={48}
                    className="h-full w-full object-contain"
                    loading="eager"
                    decoding="async"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 font-medium text-stone-900">
                  {p.name}
                </p>
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
