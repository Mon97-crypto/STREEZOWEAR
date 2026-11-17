import type { Metadata } from "next";
import { PageHead } from "@/components/store/PageHead";
import { TryOn } from "@/components/store/TryOn";
import { TRY_ON } from "@/lib/tryon/config";

export const metadata: Metadata = {
  title: "Try it on",
  description: "See a STREEZØWEAR tee on your own photo. Your photo stays on your device: it is never uploaded or stored.",
  alternates: { canonical: "/try-on" },
};

export default function TryOnPage() {
  const piece = TRY_ON[0]!;
  return (
    <>
      <PageHead kicker="Try it on" title="See it on you." intro="Add a photo of yourself and we'll fit the tee to your shoulders. Your photo stays on your device." />
      <div className="wrap"><TryOn piece={piece} /></div>
    </>
  );
}
