import { formatINR } from "@/lib/pricing/format";

export function Price({ price, sale, className = "" }: { price: number; sale: number | null; className?: string }) {
  if (sale !== null && sale < price) {
    return (
      <span className={`label tracking-[0.12em] ${className}`}>
        <span className="text-neon">{formatINR(sale)}</span>{" "}
        <s className="text-steel">{formatINR(price)}</s>
      </span>
    );
  }
  return <span className={`label tracking-[0.12em] text-neon ${className}`}>{formatINR(price)}</span>;
}
