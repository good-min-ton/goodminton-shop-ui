"use client";

import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api/products";
import type { Product } from "@/types/api";

const SLUG_RESOLVER_KEY = ["products", "all-for-slug-resolve"] as const;

/**
 * Resolve slug → full product detail.
 *
 * The LIST endpoint may strip variant images to keep list payload light, so we
 * use it only to map slug → id and then fetch the DETAIL endpoint for the full
 * product (with variant images, full specs, etc).
 */
export function useProductBySlug(slug: string | null) {
  return useQuery({
    queryKey: ["products", "by-slug", slug],
    queryFn: async () => {
      const list = await productsApi.list({ page: 1, size: 200 });
      const found = list.content.find((p: Product) => p.slug === slug);
      if (!found) return null;
      return productsApi.detail(found.id);
    },
    enabled: !!slug,
  });
}

export { SLUG_RESOLVER_KEY };
