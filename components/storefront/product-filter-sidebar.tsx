"use client";

import { useBrands, useCategories } from "@/hooks/use-catalog";
import { cn } from "@/lib/utils";

interface FilterValue {
  categoryId: number | null;
  brandId: number | null;
}

interface FilterSidebarProps {
  value: FilterValue;
  onChange: (next: FilterValue) => void;
}

export function ProductFilterSidebar({
  value,
  onChange,
}: Readonly<FilterSidebarProps>) {
  const cats = useCategories();
  const brs = useBrands();

  return (
    <aside className="space-y-8">
      <FilterGroup
        title="Danh mục"
        items={(cats.data ?? []).map((c) => ({
          id: c.id,
          label: c.name,
        }))}
        selected={value.categoryId}
        onSelect={(id) => onChange({ ...value, categoryId: id })}
      />
      <FilterGroup
        title="Thương hiệu"
        items={(brs.data ?? []).map((b) => ({
          id: b.id,
          label: b.name,
        }))}
        selected={value.brandId}
        onSelect={(id) => onChange({ ...value, brandId: id })}
      />

      {(value.categoryId !== null || value.brandId !== null) && (
        <button
          onClick={() => onChange({ categoryId: null, brandId: null })}
          className="text-primary-700 text-sm font-medium hover:underline"
        >
          Xoá tất cả bộ lọc
        </button>
      )}
    </aside>
  );
}

interface FilterGroupProps {
  title: string;
  items: { id: number; label: string }[];
  selected: number | null;
  onSelect: (id: number | null) => void;
}

function FilterGroup({
  title,
  items,
  selected,
  onSelect,
}: Readonly<FilterGroupProps>) {
  return (
    <div>
      <h3 className="font-display mb-3 text-sm font-bold tracking-wider text-stone-900 uppercase">
        {title}
      </h3>
      <ul className="space-y-1">
        <li>
          <button
            onClick={() => onSelect(null)}
            className={cn(
              "w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors",
              selected == null
                ? "bg-primary-50 text-primary-700 font-medium"
                : "text-stone-600 hover:bg-stone-50",
            )}
          >
            Tất cả
          </button>
        </li>
        {items.map((it) => (
          <li key={it.id}>
            <button
              onClick={() => onSelect(it.id)}
              className={cn(
                "w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                selected === it.id
                  ? "bg-primary-50 text-primary-700 font-medium"
                  : "text-stone-600 hover:bg-stone-50",
              )}
            >
              {it.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
