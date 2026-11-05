import { RuleLabel } from "@/components/brand/RuleLabel";

export function PageHead({ kicker, title, intro }: { kicker: string; title: React.ReactNode; intro?: React.ReactNode }) {
  return (
    <header className="wrap pb-10 pt-[calc(72px+clamp(2.5rem,7vw,5rem))]">
      <RuleLabel>{kicker}</RuleLabel>
      <h1 className="display mt-4 text-[clamp(2.75rem,7vw,6rem)]">{title}</h1>
      {intro && <p className="mt-5 max-w-xl text-lg leading-relaxed text-steel">{intro}</p>}
    </header>
  );
}
