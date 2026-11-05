import type { MetadataRoute } from "next";
import { categories, drops, products } from "@/lib/catalog/data";
import { site } from "@/lib/config/business";

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string) => `${site.url}${p}`;
  const pages = ["", "/shop", "/drops", "/customise", "/about", "/contact", "/faq", "/size-guide", "/shipping-policy", "/returns", "/privacy", "/terms", "/track"];
  return [
    ...pages.map((p) => ({ url: u(p || "/"), changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.6 })),
    ...categories.map((c) => ({ url: u(`/shop/${c.slug}`), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...drops.filter((d) => d.status !== "draft").map((d) => ({ url: u(`/drops/${d.slug}`), changeFrequency: "weekly" as const, priority: 0.9 })),
    ...products.map((p) => ({ url: u(`/products/${p.slug}`), changeFrequency: "daily" as const, priority: 0.9, images: p.images.map((m) => u(m.src)) })),
  ];
}
