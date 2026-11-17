import type { Metadata } from "next";
import { PageHead } from "@/components/store/PageHead";
import { TryOn } from "@/components/store/TryOn";
import { TryOnRealistic } from "@/components/store/TryOnRealistic";
import { TRY_ON } from "@/lib/tryon/config";
import { aiTryOnEnabled } from "@/lib/tryon/ai";

export const metadata: Metadata = {
  title: "Try it on",
  description: "See a STREEZØWEAR tee on your own photo, realistically. Your photo isn't stored.",
  alternates: { canonical: "/try-on" },
};

export default function TryOnPage() {
  const piece = TRY_ON[0]!;
  // Realistic (AI) try-on whenever it's configured; the on-device preview is only the fallback when it isn't.
  const realistic = aiTryOnEnabled();
  return (
    <>
      <PageHead
        kicker="Try it on"
        title="See it on you."
        intro={realistic
          ? "Add a photo of yourself and see yourself wearing it, realistically, in seconds."
          : "Add a photo of yourself and we'll fit the tee to your body. Your photo stays on your device."}
      />
      <div className="wrap">{realistic ? <TryOnRealistic piece={piece} /> : <TryOn piece={piece} />}</div>
    </>
  );
}
