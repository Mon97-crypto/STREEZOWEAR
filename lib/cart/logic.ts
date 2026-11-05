/**
 * Pure cart logic. The cart stores identities only (SKU, qty, customisation) — never prices.
 * Prices are always looked up from the catalogue (and in Phase 4 recomputed on the server).
 */
import type { TextCustomisation } from "@/lib/validation/customise";

export const MAX_PER_LINE = 10;

export type CartLine = {
  key: string;
  slug: string;
  sku: string;
  size: string;
  colour: string;
  qty: number;
  custom?: TextCustomisation;
};

export function lineKey(sku: string, custom?: TextCustomisation): string {
  return custom ? `${sku}::${custom.placement}:${custom.style}:${custom.colour}:${custom.text}` : sku;
}

/** Units of a SKU already in the cart across all lines (custom + plain share the same stock). */
export function qtyForSku(lines: CartLine[], sku: string, exceptKey?: string): number {
  return lines.filter((l) => l.sku === sku && l.key !== exceptKey).reduce((n, l) => n + l.qty, 0);
}

export function clampQty(want: number, stock: number, alreadyInCart: number): number {
  const room = Math.max(0, Math.min(stock - alreadyInCart, MAX_PER_LINE));
  return Math.max(0, Math.min(Math.floor(want), room));
}

export type AddResult = { lines: CartLine[]; added: number; reason?: "out-of-stock" | "limit" };

export function addLine(lines: CartLine[], line: Omit<CartLine, "key">, stock: number): AddResult {
  const key = lineKey(line.sku, line.custom);
  const existing = lines.find((l) => l.key === key);
  const others = qtyForSku(lines, line.sku, key);
  const current = existing?.qty ?? 0;
  const target = clampQty(current + line.qty, stock, others);
  const added = target - current;
  if (added <= 0) return { lines, added: 0, reason: stock - others - current <= 0 ? "out-of-stock" : "limit" };
  const next = existing
    ? lines.map((l) => (l.key === key ? { ...l, qty: target } : l))
    : [...lines, { ...line, key, qty: target }];
  return { lines: next, added, reason: added < line.qty ? "limit" : undefined };
}

export function setQty(lines: CartLine[], key: string, qty: number, stock: number): CartLine[] {
  const line = lines.find((l) => l.key === key);
  if (!line) return lines;
  const q = clampQty(qty, stock, qtyForSku(lines, line.sku, key));
  return q <= 0 ? lines.filter((l) => l.key !== key) : lines.map((l) => (l.key === key ? { ...l, qty: q } : l));
}

export function removeLine(lines: CartLine[], key: string): CartLine[] {
  return lines.filter((l) => l.key !== key);
}

export function changeSize(
  lines: CartLine[],
  key: string,
  next: { sku: string; size: string },
  stock: number,
): CartLine[] {
  const line = lines.find((l) => l.key === key);
  if (!line || line.sku === next.sku) return lines;
  const without = removeLine(lines, key);
  return addLine(without, { ...line, sku: next.sku, size: next.size }, stock).lines;
}
