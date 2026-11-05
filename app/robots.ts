import type { MetadataRoute } from "next";
import { site } from "@/lib/config/business";

export default function robots(): MetadataRoute.Robots {
  if (!site.indexable) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/account", "/cart", "/checkout", "/search"] }],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
