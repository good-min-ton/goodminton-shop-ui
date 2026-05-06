import type { MetadataRoute } from "next";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/store-admin",
          "/store-admin/",
          "/account",
          "/account/",
          "/checkout",
          "/cart",
          "/orders",
          "/orders/",
          "/payment/",
          "/api/",
          "/403",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
