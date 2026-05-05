"use client";

import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api/products";
import type { Product } from "@/types/api";

const SLUG_RESOLVER_KEY = ["products", "all-for-slug-resolve"] as const;

export function useProductBySlug(slug: string | null) {
  return useQuery({
    queryKey: ["products", "by-slug", slug],
    queryFn: async () => {
      const list = await productsApi.list({ page: 1, size: 200 });
      const found = list.content.find((p: Product) => p.slug === slug);
      if (!found) return null;
      return found;
    },
    enabled: !!slug,
  });
}

export { SLUG_RESOLVER_KEY };
