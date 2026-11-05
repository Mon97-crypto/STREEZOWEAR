import type { Metadata } from "next";
import { WishlistView } from "@/components/views/WishlistView";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } };

export default function Page() {
  return <WishlistView />;
}
