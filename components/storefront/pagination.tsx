"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: Readonly<PaginationProps>) {
  if (totalPages <= 1) return null;

  const pages = buildRange(page, totalPages);

  return (
    <nav
      className={cn("flex items-center justify-center gap-1", className)}
      aria-label="Phân trang"
    >
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-md p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Trang trước"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, idx) =>
        p === "ellipsis" ? (
          <span
            key={`ellipsis-${idx}`}
            className="px-2 text-sm text-stone-400"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              "min-w-[36px] rounded-md px-2.5 py-1.5 font-mono text-sm transition-colors",
              p === page
                ? "bg-primary-700 text-white"
                : "text-stone-700 hover:bg-stone-100",
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-md p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Trang sau"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

type Token = number | "ellipsis";

function buildRange(current: number, total: number): Token[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const tokens: Token[] = [1];
  if (current > 3) tokens.push("ellipsis");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let p = start; p <= end; p++) tokens.push(p);
  if (current < total - 2) tokens.push("ellipsis");
  tokens.push(total);
  return tokens;
}
