"use client";

import { useMemo, useState } from "react";
import { PageHead } from "@/components/store/PageHead";
import { ProductCard } from "@/components/store/ProductCard";
import { products } from "@/lib/catalog/data";

export function SearchView() {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return products.filter((p) => [p.name, p.short, ...p.description, ...p.categories, p.fabric].join(" ").toLowerCase().includes(t));
  }, [q]);
  return (
    <>
      <PageHead kicker="Search" title="Find it." />
      <div className="wrap">
        <label htmlFor="q" className="sr-only">Search products</label>
        <input id="q" type="search" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Angel, velvet, oversized…" className="field !min-h-16 !text-xl" />
        <p className="label mt-4 text-steel" aria-live="polite">{q ? `${results.length} result${results.length === 1 ? "" : "s"}` : "Type to search"}</p>
        <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">{results.map((p, i) => <ProductCard key={p.slug} product={p} phase={i * 2} />)}</div>
      </div>
    </>
  );
}
