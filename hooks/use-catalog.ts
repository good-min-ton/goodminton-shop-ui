"use client";

import { useQuery } from "@tanstack/react-query";
import { brandsApi } from "@/lib/api/brands";
import { categoriesApi } from "@/lib/api/categories";
import { colorsApi, sizesApi } from "@/lib/api/colors-sizes";

interface CatalogQueryOptions {
  enabled?: boolean;
}

export function useCategories(options: CatalogQueryOptions = {}) {
  return useQuery({
    queryKey: ["categories", "list"],
    queryFn: () => categoriesApi.list(),
    staleTime: 10 * 60 * 1000,
    enabled: options.enabled,
  });
}

export function useBrands(options: CatalogQueryOptions = {}) {
  return useQuery({
    queryKey: ["brands", "list"],
    queryFn: () => brandsApi.list(),
    staleTime: 10 * 60 * 1000,
    enabled: options.enabled,
  });
}

export function useColors() {
  return useQuery({
    queryKey: ["colors", "list"],
    queryFn: () => colorsApi.list(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useSizes() {
  return useQuery({
    queryKey: ["sizes", "list"],
    queryFn: () => sizesApi.list(),
    staleTime: 10 * 60 * 1000,
  });
}
