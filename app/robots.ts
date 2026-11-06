import type { MetadataRoute } from "next";
import { AI_BOT_UAS, AI_ROBOTS_TOKENS } from "@/lib/security/ai-bots";
import { site } from "@/lib/config/business";

export default function robots(): MetadataRoute.Robots {
  // AI crawlers are always shut out, before and after launch
  const noAi = { userAgent: [...AI_BOT_UAS, ...AI_ROBOTS_TOKENS], disallow: "/" };
  if (!site.indexable) return { rules: [noAi, { userAgent: "*", disallow: "/" }] };
  return {
    rules: [noAi, { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/account", "/cart", "/checkout", "/search"] }],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
