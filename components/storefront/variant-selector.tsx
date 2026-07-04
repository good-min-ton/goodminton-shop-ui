"use client";

import { useMemo } from "react";
import type { Color, ProductVariant } from "@/types/api";
import { cn } from "@/lib/utils";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariantId: number | null;
  onSelect: (variantId: number) => void;
}

/**
 * Color × size picker. Any product may have neither axis, only one axis, or
 * both — variants with missing color/size are handled gracefully instead of
 * rendering DEFAULT/ONE_SIZE placeholders.
 */
export function VariantSelector({
  variants,
  selectedVariantId,
  onSelect,
}: Readonly<VariantSelectorProps>) {
  const distinctColors = useMemo<Color[]>(() => {
    const map = new Map<number, Color>();
    for (const v of variants) {
      if (v.color) map.set(v.color.id, v.color);
    }
    return Array.from(map.values());
  }, [variants]);

  const selected = variants.find((v) => v.id === selectedVariantId);
  const selectedColorId = selected?.color?.id ?? null;

  // Variants matching the currently-picked color. When the product has no
  // color axis at all, this collapses to the full variant list.
  const sizesForSelectedColor = useMemo(() => {
    if (distinctColors.length === 0) return variants;
    return variants.filter(
      (v) => selectedColorId == null || v.color?.id === selectedColorId,
    );
  }, [variants, distinctColors.length, selectedColorId]);

  const hasSizeOptions = variants.some((v) => v.size != null);

  function pickColor(colorId: number) {
    const firstMatch = variants.find((v) => v.color?.id === colorId);
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

      {hasSizeOptions && sizesForSelectedColor.length > 0 && (
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
                  type="button"
                  onClick={() => onSelect(v.id)}
                  className={cn(
                    "font-mono rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary-50 text-primary-700 border-primary-700 border-2"
                      : "border-stone-200 bg-white text-stone-700 hover:border-stone-400",
                  )}
                  aria-pressed={active}
                >
                  {v.size?.name ?? "—"}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
