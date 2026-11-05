/**
 * Catalogue read API. Async on purpose: Phase 3 swaps the bodies for Supabase queries
 * (published-only via RLS) without touching any page or component.
 */
import { categories, drops, products } from "./data";
import type { Category, Drop, Product } from "./types";

export async function getProducts(): Promise<Product[]> {
  return products;
}

export async function getProduct(slug: string): Promise<Product | null> {
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  return products.filter((p) => p.categories.includes(slug));
}

export async function getCategories(): Promise<Category[]> {
  return categories;
}

export async function getCategory(slug: string): Promise<Category | null> {
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function getDrops(): Promise<Drop[]> {
  return drops.filter((d) => d.status !== "draft");
}

export async function getDrop(slug: string): Promise<Drop | null> {
  return drops.find((d) => d.slug === slug && d.status !== "draft") ?? null;
}

export async function getDropProducts(drop: Drop): Promise<Product[]> {
  return drop.products.map((s) => products.find((p) => p.slug === s)).filter((p): p is Product => !!p);
}

export async function getRelated(product: Product, limit = 3): Promise<Product[]> {
  return products
    .filter((p) => p.slug !== product.slug)
    .sort((a, b) => Number(b.drop === product.drop) - Number(a.drop === product.drop))
    .slice(0, limit);
}

export function totalStock(p: Product): number {
  return p.variants.reduce((n, v) => n + v.stock, 0);
}

export function variantFor(p: Product, size: string, colour: string) {
  return p.variants.find((v) => v.size === size && v.colour === colour) ?? null;
}

export function effectivePrice(p: Product): number {
  return p.salePricePaise ?? p.pricePaise;
}
