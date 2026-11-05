import type { Metadata } from "next";
import { PageHead } from "@/components/store/PageHead";
import { Placeholder } from "@/components/store/Placeholder";

export const metadata: Metadata = { title: "Size guide", description: "STREEZØWEAR sizing: oversized, drop-shoulder fit in S, M, L and XL.", alternates: { canonical: "/size-guide" } };

/** PLACEHOLDER — garment measurements (inches) per size must come from the manufacturer's spec sheet. */
const SIZES = ["S", "M", "L", "XL"];

export default function SizeGuide() {
  return (
    <>
      <PageHead kicker="Size guide" title="Find your fit." intro="Our tees are cut oversized with drop shoulders. Want it less roomy? Go one size down." />
      <div className="wrap max-w-3xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-left">
            <thead>
              <tr className="label border-b border-gunmetal text-steel">
                <th className="py-4 pr-4 font-medium">Size</th><th className="py-4 pr-4 font-medium">Chest (in)</th><th className="py-4 pr-4 font-medium">Length (in)</th><th className="py-4 font-medium">Shoulder (in)</th>
              </tr>
            </thead>
            <tbody>
              {SIZES.map((s) => (
                <tr key={s} className="border-b border-gunmetal">
                  <td className="display py-4 pr-4 text-lg">{s}</td>
                  <td className="py-4 pr-4"><Placeholder>—</Placeholder></td>
                  <td className="py-4 pr-4"><Placeholder>—</Placeholder></td>
                  <td className="py-4"><Placeholder>—</Placeholder></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="prose-sw mt-10">
          <h2>How to measure</h2>
          <p>Lay a tee you love flat. Chest: armpit to armpit, across the front. Length: from the highest point of the shoulder to the hem. Compare with the table.</p>
        </div>
      </div>
    </>
  );
}
