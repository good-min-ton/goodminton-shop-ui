"use client";

import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api/products";
import type { PageQuery, Product } from "@/types/api";

interface UseProductListOptions {
  /** Force refetch on mount — useful for admin lists. Defaults to TanStack defaults. */
  refetchOnMount?: boolean | "always";
}

export function useProductList(
  query: PageQuery = {},
  options: UseProductListOptions = {},
) {
  return useQuery({
    queryKey: ["products", "list", query],
    queryFn: () => productsApi.list(query),
    refetchOnMount: options.refetchOnMount,
  });
}

export function useProduct(productId: number | null) {
  return useQuery({
    queryKey: ["products", "detail", productId],
    queryFn: () => productsApi.detail(productId as number),
    enabled: productId != null,
  });
}

export function useProductRecommendations(productId: number | null) {
  return useQuery({
    queryKey: ["products", "recommendations", productId],
    queryFn: () => productsApi.recommendations(productId as number),
    enabled: productId != null,
    staleTime: 10 * 60 * 1000,
  });
}

export function getDisplayPrice(product: Product): {
  price: number;
  salePrice: number | null;
} {
  if (!product.variants?.length) return { price: 0, salePrice: null };
  const prices = product.variants.map((v) => ({
    price: v.price,
    sale: v.salePrice,
  }));
  const minPrice = Math.min(...prices.map((p) => p.price));
  const minSale = prices
    .map((p) => p.sale ?? Number.POSITIVE_INFINITY)
    .reduce((a, b) => Math.min(a, b), Number.POSITIVE_INFINITY);
  return {
    price: minPrice,
    salePrice: Number.isFinite(minSale) ? minSale : null,
  };
}
