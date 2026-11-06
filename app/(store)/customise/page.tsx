import type { Metadata } from "next";
import { Suspense } from "react";
import { RuleLabel } from "@/components/brand/RuleLabel";
import { ArtworkRequest } from "@/components/store/ArtworkRequest";
import { PageHead } from "@/components/store/PageHead";
import { TextCustomiser } from "@/components/store/TextCustomiser";
import Image from "next/image";
import { customExample } from "@/lib/catalog/data";

export const metadata: Metadata = {
  title: "One of One: custom studio",
  description: "Your name on the chest, back or sleeve, or your own artwork made into a STREEZØWEAR piece nobody else owns.",
  alternates: { canonical: "/customise" },
};

export default function Customise() {
  return (
    <>
      <PageHead kicker="Custom studio" title={<>One of One.</>} intro="Two ways in. Put your name on a fixed spot and add it to the bag, or send your own artwork and we'll quote it. Either way, nobody else has your piece." />
      <section className="wrap mb-[var(--sw-section)]" aria-label="Custom example">
        <div className="grid gap-px bg-gunmetal sm:grid-cols-3">
          {customExample.images.map((m) => (
            <Image key={m.src} src={m.src} alt={m.alt} width={m.width} height={m.height} sizes="(max-width:640px) 100vw, 33vw" className="aspect-square h-auto w-full object-cover" />
          ))}
        </div>
        <p className="label mt-3 text-[0.65rem] text-steel">Example: crystal portrait on black velvet, made for the face behind the brand. Not for sale.</p>
      </section>
      <section className="wrap" aria-labelledby="text">
        <div className="mb-8 flex items-baseline gap-4 border-b border-gunmetal pb-4">
          <span className="label text-neon">01</span>
          <h2 id="text" className="display text-2xl">Name or text</h2>
        </div>
        <Suspense fallback={<div className="h-[640px]" />}>
          <TextCustomiser />
        </Suspense>
      </section>
      <section id="artwork" className="wrap mt-[var(--sw-section)] scroll-mt-24" aria-labelledby="art">
        <div className="mb-8 flex items-baseline gap-4 border-b border-gunmetal pb-4">
          <span className="label text-neon">02</span>
          <h2 id="art" className="display text-2xl">Your artwork, quoted</h2>
        </div>
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div className="space-y-4 text-steel">
            <RuleLabel>How it works</RuleLabel>
            <ol className="space-y-3">
              <li><span className="text-chrome">1.</span> Send your file and the piece you want it on.</li>
              <li><span className="text-chrome">2.</span> We check print quality and rights, then quote.</li>
              <li><span className="text-chrome">3.</span> Approve and pay. We make it to order.</li>
            </ol>
            <p className="text-sm">Only send artwork you own or have permission to use.</p>
          </div>
          <ArtworkRequest />
        </div>
      </section>
    </>
  );
}
