import type { MetadataRoute } from "next";
import { brandsApi } from "@/lib/api/brands";
import { categoriesApi } from "@/lib/api/categories";
import { productsApi } from "@/lib/api/products";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/products`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/categories`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/login`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/register`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const dynamicEntries = await fetchDynamicEntries();
  return [...staticEntries, ...dynamicEntries];
}

async function fetchDynamicEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const [products, categories, brands] = await Promise.all([
      productsApi.list({
        page: 1,
        size: 200,
        sortBy: "createdAt",
        sortDir: "desc",
      }),
      categoriesApi.list(),
      brandsApi.list(),
    ]);

    return [
      ...products.content
        .filter((p) => p.isVisible && p.slug)
        .map((p) => ({
          url: `${SITE_URL}/products/${p.slug}`,
          lastModified: p.createdAt ? new Date(p.createdAt) : undefined,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        })),
      ...categories.map((c) => ({
        url: `${SITE_URL}/categories/${c.id}`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...brands.map((b) => ({
        url: `${SITE_URL}/brands/${b.id}`,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      })),
    ];
  } catch {
    // Backend not reachable at build/revalidate time — return only static.
    return [];
  }
}
