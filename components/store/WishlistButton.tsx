"use client";

import { useWishlist } from "@/lib/cart/store";
import { useHydrated } from "@/components/ui/useHydrated";

export function WishlistButton({ slug, name, className = "", withLabel = false }: { slug: string; name: string; className?: string; withLabel?: boolean }) {
  const hydrated = useHydrated();
  const on = useWishlist((s) => s.slugs.includes(slug)) && hydrated;
  const toggle = useWishlist((s) => s.toggle);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
      }}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-2 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill={on ? "var(--sw-neon)" : "none"} stroke={on ? "var(--sw-neon)" : "currentColor"} strokeWidth={1.5} aria-hidden>
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
      </svg>
      {withLabel && <span className="label">{on ? "Saved" : "Wishlist"}</span>}
    </button>
  );
}
