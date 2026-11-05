"use client";

import Link from "next/link";
import { PageHead } from "@/components/store/PageHead";
import { ProductCard } from "@/components/store/ProductCard";
import { useHydrated } from "@/components/ui/useHydrated";
import { products } from "@/lib/catalog/data";
import { useWishlist } from "@/lib/cart/store";

export function WishlistView() {
  const hydrated = useHydrated();
  const slugs = useWishlist((s) => s.slugs);
  const saved = products.filter((p) => slugs.includes(p.slug));
  return (
    <>
      <PageHead kicker="Wishlist" title="Saved." intro="Saved on this device. Sign-in sync arrives with accounts." />
      <div className="wrap">
        {!hydrated ? <div className="h-64" /> : saved.length === 0 ? (
          <div className="py-10"><p className="text-steel">Tap the heart on any piece to save it here.</p><Link href="/shop" className="btn btn-ghost mt-8">Browse the shop</Link></div>
        ) : (
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">{saved.map((p, i) => <ProductCard key={p.slug} product={p} phase={i * 2} />)}</div>
        )}
      </div>
    </>
  );
}
