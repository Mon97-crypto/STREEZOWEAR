import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RuleLabel } from "@/components/brand/RuleLabel";
import { Accordion } from "@/components/store/Accordion";
import { ExpressCheck } from "@/components/store/ExpressCheck";
import { Price } from "@/components/store/Price";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductPurchase } from "@/components/store/ProductPurchase";
import { products } from "@/lib/catalog/data";
import { effectivePrice, getDrop, getProduct, getRelated, totalStock } from "@/lib/catalog/queries";
import { business, policies, site } from "@/lib/config/business";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  if (!p) return {};
  const img = p.images[0]!;
  return {
    title: `${p.name} — ${p.short}`,
    description: `${p.description[0]} ${p.gsm} GSM ${p.fabric.toLowerCase()}. Sizes ${p.sizes.join(", ")}.`,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: { type: "website", images: [{ url: img.src, width: img.width, height: img.height, alt: img.alt }] },
  };
}

export default async function ProductPage({ params }: Params) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();
  const [drop, related] = await Promise.all([product.drop ? getDrop(product.drop) : null, getRelated(product)]);
  const inStock = totalStock(product) > 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.name} — ${business.name}`,
    description: product.description.join(" "),
    image: product.images.map((m) => `${site.url}${m.src}`),
    brand: { "@type": "Brand", name: business.name },
    material: product.fabric,
    offers: product.variants.map((v) => ({
      "@type": "Offer",
      sku: v.sku,
      priceCurrency: "INR",
      price: (effectivePrice(product) / 100).toFixed(2),
      availability: v.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${site.url}/products/${product.slug}`,
      itemCondition: "https://schema.org/NewCondition",
    })),
  };

  return (
    <div className="pb-28 pt-[var(--sw-header)] lg:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className="wrap label py-5 text-[0.65rem] text-steel">
        <Link href="/shop" className="hover:text-chrome">Shop</Link>
        {drop && <> / <Link href={`/drops/${drop.slug}`} className="hover:text-chrome">Drop {drop.number}</Link></>} / <span className="text-chrome">{product.name}</span>
      </nav>

      <div className="wrap grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
        <ProductGallery name={product.name} images={product.images} video={product.video} />

        <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-wrap gap-2">
            {product.isLimited && <span className="label border border-neon px-2.5 py-1 text-[0.65rem] text-neon">Limited edition</span>}
            {product.isNew && <span className="label border border-gunmetal px-2.5 py-1 text-[0.65rem] text-chrome">New drop</span>}
            {!inStock && <span className="label border border-steel px-2.5 py-1 text-[0.65rem] text-steel">Out of stock</span>}
          </div>
          <h1 className="display mt-4 text-[clamp(2.5rem,5vw,4rem)]">{product.name}</h1>
          <p className="mt-2 text-steel">{product.short}</p>
          <Price price={product.pricePaise} sale={product.salePricePaise} className="mt-5 block text-lg" />
          <p className="mt-1 text-xs text-steel">Inclusive of all taxes</p>

          <ProductPurchase product={product} />

          <div className="mt-8 border border-gunmetal bg-carbon p-5">
            <ExpressCheck />
            <p className="text-xs text-steel">{policies.standardDeliveryEstimate}.</p>
          </div>

          {product.isCustomisable && (
            <Link href={`/customise?product=${product.slug}`} className="mt-4 flex items-center justify-between border border-gunmetal p-5 transition-colors hover:border-neon">
              <span>
                <span className="label block text-neon">Make it yours</span>
                <span className="mt-1 block text-sm text-steel">Add your name, or send your own artwork.</span>
              </span>
              <span aria-hidden className="text-neon">→</span>
            </Link>
          )}

          <div className="mt-8">
            <Accordion
              items={[
                { title: "Description", body: product.description.map((d) => <p key={d} className="mb-3">{d}</p>) },
                {
                  title: "Fabric & fit",
                  body: (
                    <dl className="grid grid-cols-[7rem_1fr] gap-y-2">
                      <dt>Fabric</dt><dd className="text-chrome">{product.fabric}</dd>
                      <dt>Weight</dt><dd className="text-chrome">{product.gsm} GSM</dd>
                      {product.fit && (<><dt>Fit</dt><dd className="text-chrome">{product.fit}</dd></>)}
                      <dt>Details</dt><dd className="text-chrome">{product.details.join(" · ")}</dd>
                      <dt>Sizes</dt><dd className="text-chrome">{product.sizes.join(" · ")}</dd>
                    </dl>
                  ),
                },
                {
                  title: "Shipping & returns",
                  body: (
                    <>
                      <p className="mb-3">60-minute delivery in our Dommasandra zone; courier delivery across India. Rates and estimates show at checkout.</p>
                      <p>Returns or exchanges within {policies.returnWindowDays} days of delivery, subject to the returns policy. Custom pieces are made to order and can&apos;t be returned unless faulty. <Link href="/returns" className="text-neon">Full policy</Link></p>
                    </>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>

      <section className="wrap mt-[var(--sw-section)]" aria-labelledby="reviews">
        <RuleLabel>Reviews</RuleLabel>
        <h2 id="reviews" className="display mt-4 text-3xl">Word on the street.</h2>
        <p className="mt-4 max-w-md text-steel">No reviews yet. Verified buyers can review once accounts are live.</p>
      </section>

      {related.length > 0 && (
        <section className="wrap mt-[var(--sw-section)]" aria-labelledby="related">
          <RuleLabel>More from the drop</RuleLabel>
          <h2 id="related" className="display mb-10 mt-4 text-3xl">Complete the fit.</h2>
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => <ProductCard key={p.slug} product={p} phase={i * 2} />)}
          </div>
        </section>
      )}
    </div>
  );
}
