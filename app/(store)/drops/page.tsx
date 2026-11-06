import type { Metadata } from "next";
import Link from "next/link";
import { CampaignVideo } from "@/components/motion/CampaignVideo";
import { Countdown } from "@/components/store/Countdown";
import { DropArt } from "@/components/store/DropArt";
import { PageHead } from "@/components/store/PageHead";
import { getDrops } from "@/lib/catalog/queries";

export const metadata: Metadata = {
  title: "New Drops",
  description: "STREEZØWEAR releases in limited drops. Every design drops once.",
  alternates: { canonical: "/drops" },
};

export default async function Drops() {
  const drops = await getDrops();
  return (
    <>
      <PageHead kicker="New drops" title="One run each." intro="Every design drops once. When the run is gone, it's gone." />
      <div className="wrap grid gap-10">
        {drops.map((d) => (
          <Link key={d.slug} href={`/drops/${d.slug}`} className="group relative block min-h-[60vh] overflow-hidden border border-gunmetal">
            {d.video ? (
              <CampaignVideo video={d.video} className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-[1.2s] group-hover:scale-[1.03]" />
            ) : (
              <DropArt stills={d.heroArt ?? d.stills} className="absolute inset-0 opacity-75 transition-transform duration-[1.2s] group-hover:scale-[1.03]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-[clamp(1.5rem,5vw,4rem)]">
              <p className="label text-neon">Drop {d.number} · {d.status === "live" ? "Live now" : d.status === "scheduled" ? "Coming" : "Archive"}</p>
              <h2 className="display chrome-text mt-3 break-words text-[clamp(2.2rem,8vw,7rem)]">{d.name}</h2>
              <p className="mt-3 max-w-lg text-steel">{d.intro}</p>
              {d.status === "scheduled" && d.launchAt && <div className="mt-6"><Countdown to={d.launchAt} /></div>}
              <span className="label mt-6 inline-block text-chrome group-hover:text-neon">Enter the drop →</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
