import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { RuleLabel } from "@/components/brand/RuleLabel";
import { Reveal } from "@/components/motion/Reveal";
import { PageHead } from "@/components/store/PageHead";

export const metadata: Metadata = { title: "About", description: "STREEZØWEAR is a Bangalore streetwear label making premium printed tees, released in limited drops.", alternates: { canonical: "/about" } };

const PILLARS = [
  ["Chrome S", "Strength and a polished finish. The luxury side of the brand."],
  ["Neon glow", "Energy, nightlife, the street after dark."],
  ["Lightning slash", "Speed and disruption. Breaking the ordinary."],
  ["The Ø", "The slashed zero sets the name apart and carries the bolt into the wordmark."],
];

export default function About() {
  return (
    <>
      <PageHead kicker="About" title={<>Street attitude.<br />Luxury finish.</>} intro="STREEZØWEAR is a Bangalore streetwear label making premium printed tees, mostly oversized and drop-shoulder, released in limited drops." />
      <section className="wrap grid gap-12 lg:grid-cols-2">
        <Reveal className="space-y-5 text-lg leading-relaxed text-steel">
          <p>The brand sits between two worlds: the attitude of the street and the finish of a luxury label. Everything we put out, from a tee to a shipping bag, should feel dark, sharp, electric and premium.</p>
          <p>We make it for people who wear their attitude. Neon light cutting through a dark street at night. Street style that looks and feels expensive.</p>
          <p className="display text-3xl text-chrome">Welcome to the street. Wear it loud.</p>
        </Reveal>
        <Reveal><Image src="/media/products/velvet-detail-portrait-1080.webp" alt="Crystal portrait detail from a One of One custom piece" width={1080} height={1080} sizes="(max-width:1024px) 100vw, 50vw" className="h-auto w-full" /></Reveal>
      </section>
      <section className="wrap mt-[var(--sw-section)]">
        <RuleLabel>The idea behind the logo</RuleLabel>
        <div className="mt-8 grid gap-px bg-gunmetal sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map(([t, b]) => (
            <div key={t} className="border-t-2 border-neon bg-carbon p-6">
              <h2 className="display text-xl">{t}</h2>
              <p className="mt-3 text-sm leading-relaxed text-steel">{b}</p>
            </div>
          ))}
        </div>
        <Link href="/drops" className="btn btn-primary mt-12">See the drops</Link>
      </section>
    </>
  );
}
