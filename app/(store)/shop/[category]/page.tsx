import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/store/PageHead";
import { ShopView } from "@/components/store/ShopView";
import { categories as all } from "@/lib/catalog/data";
import { getCategories, getCategory, getProductsByCategory } from "@/lib/catalog/queries";

type Params = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return all.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const c = await getCategory((await params).category);
  if (!c) return {};
  return { title: c.name, description: c.description, alternates: { canonical: `/shop/${c.slug}` } };
}

export default async function CategoryPage({ params }: Params) {
  const slug = (await params).category;
  const category = await getCategory(slug);
  if (!category) notFound();
  const [products, categories] = await Promise.all([getProductsByCategory(slug), getCategories()]);
  return (
    <>
      <PageHead kicker="Shop" title={category.name} intro={category.description} />
      <div className="wrap"><ShopView products={products} categories={categories} active={slug} /></div>
    </>
  );
}
