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
    for (const v of variants) map.set(v.color.colorId, v.color);
    return Array.from(map.values());
  }, [variants]);

  const selected = variants.find((v) => v.variantId === selectedVariantId);
  const selectedColorId = selected?.color.colorId ?? null;

  const sizesForSelectedColor = useMemo(
    () =>
      variants.filter(
        (v) => selectedColorId == null || v.color.colorId === selectedColorId,
      ),
    [variants, selectedColorId],
  );

  function pickColor(colorId: number) {
    const firstMatch = variants.find((v) => v.color.colorId === colorId);
    if (firstMatch) onSelect(firstMatch.variantId);
  }

  return (
    <div className="space-y-5">
      {distinctColors.length > 0 && (
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-sm font-medium text-stone-700">Màu sắc</span>
            {selected && (
              <span className="text-xs text-stone-500">
                {selected.color.name}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {distinctColors.map((c) => {
              const active = c.colorId === selectedColorId;
              return (
                <button
                  key={c.colorId}
                  onClick={() => pickColor(c.colorId)}
                  title={c.name}
                  className={cn(
                    "h-9 w-9 rounded-full border-2 transition-transform",
                    active
                      ? "border-primary-700 scale-110"
                      : "border-stone-200 hover:border-stone-400",
                  )}
                  style={c.hexCode ? { background: c.hexCode } : undefined}
                  aria-label={c.name}
                  aria-pressed={active}
                >
                  {!c.hexCode && (
                    <span className="font-mono text-[10px] text-stone-700">
                      {c.name.slice(0, 2)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {sizesForSelectedColor.length > 0 && (
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-sm font-medium text-stone-700">Cỡ</span>
            {selected && (
              <span className="text-xs text-stone-500">{selected.size.name}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {sizesForSelectedColor.map((v) => {
              const active = v.variantId === selectedVariantId;
              return (
                <button
                  key={v.variantId}
                  onClick={() => onSelect(v.variantId)}
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
