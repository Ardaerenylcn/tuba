import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://atolyebiz.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/hesabim/", "/rezervasyon/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
