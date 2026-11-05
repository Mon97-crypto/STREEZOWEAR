import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BoltSlash, RuleLabel } from "@/components/brand/RuleLabel";
import { CampaignVideo } from "@/components/motion/CampaignVideo";
import { Reveal } from "@/components/motion/Reveal";
import { Countdown } from "@/components/store/Countdown";
import { Price } from "@/components/store/Price";
import { ProductCard } from "@/components/store/ProductCard";
import { drops } from "@/lib/catalog/data";
import { getDrop, getDropProducts } from "@/lib/catalog/queries";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return drops.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const d = await getDrop((await params).slug);
  if (!d) return {};
  return {
    title: `Drop ${d.number}: ${d.name}`,
    description: d.intro,
    alternates: { canonical: `/drops/${d.slug}` },
    openGraph: { images: [{ url: d.video.poster, alt: d.name }] },
  };
}

export default async function DropPage({ params }: Params) {
  const drop = await getDrop((await params).slug);
  if (!drop) notFound();
  const pieces = await getDropProducts(drop);
  const upcoming = drop.status === "scheduled" && drop.launchAt && new Date(drop.launchAt) > new Date();

  return (
    <>
      <section className="relative isolate grid min-h-[100svh] items-end overflow-hidden">
        <CampaignVideo video={drop.video} priority className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(7_7_10/.5),transparent_35%,rgb(7_7_10/.95)_92%)]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-void/45 sm:bg-transparent" />
        <BoltSlash className="top-[62%] -z-10" />
        <div className="wrap w-full pb-[clamp(3rem,8vw,6rem)] pt-[calc(var(--sw-header)+2rem)]">
          <RuleLabel>Drop {drop.number}{drop.isLimited ? " · Limited run" : ""}</RuleLabel>
          <h1 className="display chrome-text mt-4 text-[clamp(3.5rem,12vw,11rem)]">{drop.name}</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-steel">{drop.intro}</p>
          {upcoming ? <div className="mt-8"><Countdown to={drop.launchAt!} /></div> : <Link href="#pieces" className="btn btn-primary mt-8">Shop the drop</Link>}
        </div>
      </section>

      <section className="wrap grid gap-10 py-[var(--sw-section)] lg:grid-cols-[1fr_1.4fr]">
        <Reveal><RuleLabel>The drop</RuleLabel></Reveal>
        <Reveal className="space-y-6">
          {drop.story.map((s, i) => (
            <p key={i} className={i === 0 ? "display text-[clamp(1.6rem,3vw,2.6rem)] leading-[1.05]" : "text-lg leading-relaxed text-steel"}>{s}</p>
          ))}
        </Reveal>
      </section>

      <section id="pieces" className="wrap scroll-mt-24">
        <div className="grid gap-x-[clamp(1rem,3vw,3rem)] gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {pieces.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.08}><ProductCard product={p} phase={i * 2} priority={i === 0} /></Reveal>
          ))}
        </div>
      </section>

      {/* Editorial rows: one piece at a time, in close-up */}
      <section className="mt-[var(--sw-section)] space-y-px bg-gunmetal">
        {pieces.map((p, i) => {
          const details = p.images.filter((m) => m.kind === "detail").slice(0, 2);
          return (
            <div key={p.slug} className={`grid bg-void lg:grid-cols-2 ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}>
              <div className="grid grid-cols-2 gap-px bg-gunmetal">
                {details.map((m) => (
                  <Image key={m.src} src={m.src} alt={m.alt} width={m.width} height={m.height} sizes="(max-width:1024px) 50vw, 25vw" className="h-full w-full object-cover" />
                ))}
              </div>
              <Reveal className="flex flex-col justify-center gap-5 p-[clamp(2rem,6vw,5rem)]">
                <span className="label text-neon">{String(i + 1).padStart(2, "0")} / {String(pieces.length).padStart(2, "0")}</span>
                <h2 className="display text-[clamp(2.25rem,5vw,4rem)]">{p.name}</h2>
                <p className="max-w-md leading-relaxed text-steel">{p.description[0]}</p>
                <div className="flex items-center gap-6">
                  <Link href={`/products/${p.slug}`} className="btn btn-ghost">View product</Link>
                  <Price price={p.pricePaise} sale={p.salePricePaise} />
                </div>
              </Reveal>
            </div>
          );
        })}
      </section>

      {drop.stills.map((m) => (
        <Reveal key={m.src} className="wrap mt-[var(--sw-section)]">
          <Image src={m.src} alt={m.alt} width={m.width} height={m.height} sizes="100vw" className="h-auto w-full" />
        </Reveal>
      ))}
    </>
  );
}
