import Image from "next/image";
import Link from "next/link";
import { BoltSlash, RuleLabel } from "@/components/brand/RuleLabel";
import { CampaignVideo } from "@/components/motion/CampaignVideo";
import { Reveal } from "@/components/motion/Reveal";
import { ExpressCheck } from "@/components/store/ExpressCheck";
import { FloatingStore } from "@/components/motion/FloatingStore";
import { brandFilm, customExample } from "@/lib/catalog/data";
import { getDrop, getDropProducts } from "@/lib/catalog/queries";
import { business } from "@/lib/config/business";
import { EXPRESS } from "@/lib/delivery/express";

const CHAPTERS = [
  { n: "01", k: "The street", t: "Born in Bangalore", b: "Night roads, sodium light, neon cutting through the dark. That's where the look comes from." },
  { n: "02", k: "The drop", t: "Limited run", b: "Every design drops once. When the run is gone, it's gone. Don't sleep." },
  { n: "03", k: "Make it yours", t: "One of One", b: "Your name on the chest, or your own artwork made into a piece nobody else owns." },
  { n: "04", k: "60 minutes", t: "At your door", b: `Within ${EXPRESS.radiusKm} km of Dommasandra, your order can be on you inside the hour.` },
];

export default async function Home() {
  const drop = (await getDrop("origin-collection"))!;
  const pieces = await getDropProducts(drop);

  return (
    <>
      {/* ── Hero ───────────────────────────────────── */}
      <section className="sw-dark relative isolate grid min-h-[100svh] items-end overflow-hidden bg-void" aria-label="STREEZØWEAR">
        <CampaignVideo video={brandFilm} priority className="absolute inset-0 -z-20 h-full w-full object-cover opacity-75" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(7_7_10/.6)_0%,rgb(7_7_10/.1)_40%,rgb(7_7_10/.92)_88%,var(--sw-void)_100%)]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-void/50 sm:bg-transparent" />
        <BoltSlash className="top-[58%] -z-10" />
        <div className="wrap w-full pb-[clamp(3rem,8vw,6rem)] pt-[calc(var(--sw-header)+2rem)]">
          <RuleLabel>Drop {drop.number} · {drop.name}</RuleLabel>
          <h1 className="display chrome-text mt-5 text-[clamp(2.9rem,9vw,8.5rem)]">
            Own your street,<br />define your style.
          </h1>
          <p className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-steel">
            Premium oversized tees with big stories on the back, released in limited drops. Made in Bangalore for people who wear their attitude.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/drops/${drop.slug}`} className="btn btn-primary">Shop the latest drop</Link>
            <Link href="#story" className="btn btn-ghost">The story</Link>
          </div>
        </div>
      </section>

      {/* ── Ticker ─────────────────────────────────── */}
      <div className="border-y border-gunmetal bg-carbon">
        <div className="wrap label flex flex-wrap justify-between gap-x-8 gap-y-2 py-4 text-[0.7rem] text-steel">
          <span><span className="text-neon">●</span> Limited run</span>
          <span><span className="text-neon">●</span> 250 GSM</span>
          <span><span className="text-neon">●</span> Custom name & artwork</span>
          <span><span className="text-neon">●</span> 60-min delivery · Dommasandra</span>
        </div>
      </div>

      {/* ── Showroom ───────────────────────────────── */}
      <section className="py-[var(--sw-section)]" id="showroom">
        <div className="wrap">
          <Reveal className="mb-[clamp(2.5rem,6vw,4.5rem)] flex flex-wrap items-end justify-between gap-6">
            <div>
              <RuleLabel>The showroom</RuleLabel>
              <h2 className="display mt-4 text-[clamp(2.5rem,6vw,5rem)]">Neon on night.</h2>
            </div>
            <p className="max-w-sm text-steel">The floating store. Spin the rack, pick a piece, and the red light finds the print.</p>
          </Reveal>
          <FloatingStore products={pieces} kicker={`Drop ${drop.number}`} />
        </div>
      </section>

      {/* ── Story ──────────────────────────────────── */}
      <section id="story" className="pb-[var(--sw-section)]">
        <div className="wrap">
          <Reveal className="mb-12">
            <RuleLabel>The story</RuleLabel>
            <h2 className="display mt-4 text-[clamp(2.5rem,6vw,5rem)]">From the street up.</h2>
          </Reveal>
          <div className="grid border-t border-gunmetal sm:grid-cols-2 lg:grid-cols-4">
            {CHAPTERS.map((c, i) => (
              <Reveal key={c.n} delay={i * 0.06} className="border-b border-gunmetal py-8 pr-6">
                <span className="label text-neon">{c.n} — {c.k}</span>
                <h3 className="display mt-4 text-2xl">{c.t}</h3>
                <p className="mt-3 max-w-[32ch] leading-relaxed text-steel">{c.b}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── One of One (customisation) ─────────────── */}
      <section className="sw-dark grid min-h-[80vh] bg-carbon text-chrome lg:grid-cols-[1.1fr_1fr]" aria-labelledby="one-of-one">
        <div className="relative min-h-[55vh] overflow-hidden">
          <CampaignVideo video={customExample.video} className="absolute inset-0 h-full w-full object-cover" />
          <span className="label absolute bottom-4 left-4 border border-gunmetal bg-void/70 px-2.5 py-1.5 text-[0.6rem] text-steel">Custom example · not for sale</span>
        </div>
        <div className="flex flex-col justify-center gap-6 p-[clamp(2rem,6vw,5rem)]">
          <RuleLabel>Custom studio</RuleLabel>
          <h2 id="one-of-one" className="display chrome-text text-[clamp(2.75rem,6vw,5.5rem)]">One of One.</h2>
          <p className="max-w-md text-lg leading-relaxed text-steel">
            Your face, your crew, your artwork, set on a piece nobody else will ever own. This velvet portrait was made for the face behind the brand. Yours is next.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/customise" className="btn btn-primary">Make yours</Link>
            <Link href="/customise#artwork" className="btn btn-ghost">Send your artwork</Link>
          </div>
        </div>
      </section>

      {/* ── Craft ──────────────────────────────────── */}
      <section className="py-[var(--sw-section)]">
        <div className="wrap grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="grid grid-cols-2 gap-3">
            <Image src="/media/products/tokyo-speed-demon-label.webp" alt="Tokyo Speed Demon folded, showing the STREEZØWEAR neck label" width={502} height={510} sizes="(max-width:1024px) 45vw, 22vw" className="aspect-square h-auto w-full object-contain" />
            <Image src="/media/products/violet-oni-label.webp" alt="Violet Oni folded, showing the STREEZØWEAR neck label" width={498} height={503} sizes="(max-width:1024px) 45vw, 22vw" className="mt-12 aspect-square h-auto w-full object-contain" />
          </Reveal>
          <Reveal>
            <RuleLabel>The craft</RuleLabel>
            <h2 className="display mt-4 text-[clamp(2.25rem,5vw,4rem)]">Looks expensive. Is heavy.</h2>
            <dl className="mt-10 grid grid-cols-2 gap-px bg-gunmetal">
              {[["Weight", "250 GSM"], ["Fabric", "Cotton, polyester"], ["Print", "Back · chest · sleeve"], ["Sizes", "S · M · L · XL"]].map(([k, v]) => (
                <div key={k} className="bg-void p-4 sm:p-5">
                  <dt className="label text-steel">{k}</dt>
                  <dd className="display mt-2 text-base leading-tight sm:text-xl">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ── Customise + 60 min ─────────────────────── */}
      <section className="pb-[var(--sw-section)]">
        <div className="wrap grid gap-px bg-gunmetal lg:grid-cols-2">
          <Reveal className="flex flex-col gap-5 bg-carbon p-[clamp(1.75rem,4vw,3.5rem)]">
            <RuleLabel>Make it yours</RuleLabel>
            <h2 className="display text-[clamp(2rem,4vw,3.25rem)]">Your name. Your art.</h2>
            <p className="max-w-md leading-relaxed text-steel">
              Put your name on the chest, back or sleeve. Or send us your own artwork and we&apos;ll quote it for print.
            </p>
            <div className="mt-auto flex flex-wrap gap-3 pt-4">
              <Link href="/customise" className="btn btn-primary">Customise</Link>
              <Link href="/customise#artwork" className="btn btn-ghost">Send artwork</Link>
            </div>
          </Reveal>
          <Reveal className="flex flex-col gap-5 bg-carbon p-[clamp(1.75rem,4vw,3.5rem)]">
            <RuleLabel>60 minutes</RuleLabel>
            <h2 className="display text-[clamp(2rem,4vw,3.25rem)]">On you inside the hour.</h2>
            <p className="max-w-md leading-relaxed text-steel">
              Express delivery within {EXPRESS.radiusKm} km of {EXPRESS.origin.name}. Everywhere else in India ships by courier.
            </p>
            <ExpressCheck className="mt-auto pt-4" />
          </Reveal>
        </div>
      </section>

      {/* ── Lineup ─────────────────────────────────── */}
      <section className="pb-8">
        <div className="wrap">
          <Reveal className="relative overflow-hidden">
            <Image src="/media/products/lineup-five-tees-1312.webp" alt="Next drop preview: Villain, Doomsday, Lucifer, Apocalypse and Rebel Forever tees on concrete" width={1312} height={1199} sizes="100vw" className="h-auto w-full opacity-80 sm:h-[min(82vh,860px)] sm:object-cover sm:object-[50%_45%]" />
            <div className="pt-6 sm:absolute sm:inset-x-0 sm:bottom-0 sm:bg-gradient-to-t sm:from-void sm:via-void/70 sm:to-transparent sm:p-[clamp(1.5rem,5vw,4rem)]">
              <p className="label text-neon">Next drop · Coming soon</p>
              <p className="display mt-3 text-[clamp(2rem,5vw,4.5rem)]">Stay locked in.<br />Next drop soon.</p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
