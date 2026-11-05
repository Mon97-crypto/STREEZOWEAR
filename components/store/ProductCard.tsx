import Link from "next/link";
import { FloatingGarment } from "@/components/motion/FloatingGarment";
import { effectivePrice, totalStock } from "@/lib/catalog/queries";
import type { Product } from "@/lib/catalog/types";
import { Price } from "./Price";
import { WishlistButton } from "./WishlistButton";

export function ProductCard({ product, phase = 0, priority = false }: { product: Product; phase?: number; priority?: boolean }) {
  const media = product.cutout ?? product.images[0]!;
  const soldOut = totalStock(product) === 0;
  const badge = soldOut ? "Out of stock" : product.isLimited ? "Limited" : product.isNew ? "New drop" : null;
  return (
    <div className="group relative">
      <Link href={`/products/${product.slug}`} className="block outline-none" aria-label={`${product.name}, ${product.short}`}>
        <div className="relative">
          {badge && (
            <span className={`label absolute left-4 top-4 z-[3] border bg-void/60 px-2.5 py-1.5 text-[0.65rem] ${soldOut ? "border-steel text-steel" : "border-neon text-neon"}`}>
              {badge}
            </span>
          )}
          <FloatingGarment media={media} phase={phase} priority={priority} className="group-focus-visible:outline group-focus-visible:outline-1 group-focus-visible:outline-neon" />
        </div>
        <div className="-mt-px flex justify-between gap-4 border-t border-gunmetal pt-4">
          <div>
            <h3 className="display text-lg">{product.name}</h3>
            <p className="mt-1 max-w-[30ch] text-sm text-steel">{product.short}</p>
            <span className="label mt-3 block text-neon transition-all duration-300 [@media(hover:hover)]:translate-y-1.5 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100 group-focus-within:opacity-100">
              View product →
            </span>
          </div>
          <Price price={product.pricePaise} sale={product.salePricePaise === null ? null : effectivePrice(product)} className="whitespace-nowrap" />
        </div>
      </Link>
      <WishlistButton slug={product.slug} name={product.name} className="absolute right-2 top-2 z-[4] text-chrome hover:text-neon" />
    </div>
  );
}
