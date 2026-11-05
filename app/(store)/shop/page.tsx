import type { Metadata } from "next";
import { PageHead } from "@/components/store/PageHead";
import { ShopView } from "@/components/store/ShopView";
import { getCategories, getProducts } from "@/lib/catalog/queries";

export const metadata: Metadata = {
  title: "Shop",
  description: "Premium oversized tees and full-sleeve velvet, 250 GSM, crystal-detailed. Limited drops from Bangalore.",
  alternates: { canonical: "/shop" },
};

export default async function Shop() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return (
    <>
      <PageHead kicker="Shop" title="Everything." intro="Premium street tees. ₹499. Limited drop." />
      <div className="wrap"><ShopView products={products} categories={categories} active={null} /></div>
    </>
  );
}
