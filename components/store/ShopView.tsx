"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Category, Product } from "@/lib/catalog/types";
import { ProductCard } from "./ProductCard";

type Sort = "featured" | "new" | "price-asc" | "price-desc";

export function ShopView({ products, categories, active }: { products: Product[]; categories: Category[]; active: string | null }) {
  const [sort, setSort] = useState<Sort>("featured");
  const list = useMemo(() => {
    const a = [...products];
    const price = (p: Product) => p.salePricePaise ?? p.pricePaise;
    if (sort === "price-asc") a.sort((x, y) => price(x) - price(y));
    if (sort === "price-desc") a.sort((x, y) => price(y) - price(x));
    if (sort === "new") a.sort((x, y) => Number(y.isNew) - Number(x.isNew));
    if (sort === "featured") a.sort((x, y) => Number(y.isFeatured) - Number(x.isFeatured));
    return a;
  }, [products, sort]);

  return (
    <>
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-y border-gunmetal py-4">
        <nav aria-label="Categories" className="-mx-1 flex gap-1 overflow-x-auto">
          <Chip href="/shop" on={active === null}>All</Chip>
          {categories.map((c) => <Chip key={c.slug} href={`/shop/${c.slug}`} on={active === c.slug}>{c.name}</Chip>)}
        </nav>
        <label className="label flex items-center gap-3 text-steel">
          Sort
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field !min-h-10 !w-auto !py-1.5 normal-case tracking-normal">
            <option value="featured">Featured</option>
            <option value="new">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
      </div>
      {list.length === 0 ? (
        <div className="py-24 text-center">
          <p className="display text-4xl">Not dropped yet.</p>
          <p className="mt-4 text-steel">This line is on the way. Stay locked in.</p>
          <Link href="/shop" className="btn btn-ghost mt-8">Shop everything</Link>
        </div>
      ) : (
        <div className="grid gap-x-[clamp(1rem,3vw,3rem)] gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p, i) => <ProductCard key={p.slug} product={p} phase={i * 2} priority={i < 3} />)}
        </div>
      )}
    </>
  );
}

function Chip({ href, on, children }: { href: string; on: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} aria-current={on ? "page" : undefined} className={`label shrink-0 whitespace-nowrap border px-3 py-2.5 text-[0.65rem] transition-colors ${on ? "border-neon text-neon" : "border-transparent text-steel hover:text-chrome"}`}>
      {children}
    </Link>
  );
}
