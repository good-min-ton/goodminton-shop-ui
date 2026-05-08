"use client";

import { useMemo } from "react";
import type { ProductVariant } from "@/types/api";
import { cn } from "@/lib/utils";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariantId: number | null;
  onSelect: (variantId: number) => void;
}

export function VariantSelector({
  variants,
  selectedVariantId,
  onSelect,
}: Readonly<VariantSelectorProps>) {
  const distinctColors = useMemo(() => {
    const map = new Map<number, ProductVariant["color"]>();
    for (const v of variants) map.set(v.color.id, v.color);
    return Array.from(map.values());
  }, [variants]);

  const selected = variants.find((v) => v.id === selectedVariantId);
  const selectedColorId = selected?.color.id ?? null;

  const sizesForSelectedColor = useMemo(
    () =>
      variants.filter(
        (v) => selectedColorId == null || v.color.id === selectedColorId,
      ),
    [variants, selectedColorId],
  );

  function pickColor(colorId: number) {
    const firstMatch = variants.find((v) => v.color.id === colorId);
    if (firstMatch) onSelect(firstMatch.id);
  }

  return (
    <div className="space-y-5">
      {distinctColors.length > 0 && (
        <div>
          <span className="mb-2 block text-sm font-medium text-stone-700">
            Màu sắc
          </span>
          <div className="flex flex-wrap gap-2">
            {distinctColors.map((c) => {
              const active = c.id === selectedColorId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => pickColor(c.id)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border-[1.5px] px-3 py-1.5 text-sm font-medium transition-all",
                    active
                      ? "border-primary-700 bg-primary-50 text-primary-700"
                      : "border-stone-200 bg-white text-stone-700 hover:border-stone-400",
                  )}
                >
                  <span
                    aria-hidden
                    className="h-3.5 w-3.5 flex-shrink-0 rounded-full border border-black/10 shadow-sm"
                    style={{ background: c.hexCode ?? "#d6d3d1" }}
                  />
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {sizesForSelectedColor.length > 0 && (
        <div>
          <span className="mb-2 block text-sm font-medium text-stone-700">
            Cỡ
          </span>
          <div className="flex flex-wrap gap-2">
            {sizesForSelectedColor.map((v) => {
              const active = v.id === selectedVariantId;
              return (
                <button
                  key={v.id}
                  onClick={() => onSelect(v.id)}
                  className={cn(
                    "font-mono rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary-50 text-primary-700 border-primary-700 border-2"
                      : "border-stone-200 bg-white text-stone-700 hover:border-stone-400",
                  )}
                  aria-pressed={active}
                >
                  {v.size.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
