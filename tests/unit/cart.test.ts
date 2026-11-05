import { describe, expect, it } from "vitest";
import { addLine, changeSize, clampQty, lineKey, MAX_PER_LINE, qtyForSku, setQty, type CartLine } from "@/lib/cart/logic";

const base = { slug: "seraph-oversized-tee", sku: "SZW-SERAPH-WBLK-M", size: "M", colour: "Washed Black", qty: 1 };

describe("cart stock rules", () => {
  it("never adds more than stock", () => {
    const r = addLine([], { ...base, qty: 99 }, 3);
    expect(r.lines[0]!.qty).toBe(3);
    expect(r.reason).toBe("limit");
  });

  it("refuses when sold out", () => {
    const r = addLine([], base, 0);
    expect(r.added).toBe(0);
    expect(r.reason).toBe("out-of-stock");
    expect(r.lines).toHaveLength(0);
  });

  it("merges repeated adds of the same SKU", () => {
    let lines: CartLine[] = [];
    lines = addLine(lines, base, 15).lines;
    lines = addLine(lines, { ...base, qty: 2 }, 15).lines;
    expect(lines).toHaveLength(1);
    expect(lines[0]!.qty).toBe(3);
  });

  it("caps a line at MAX_PER_LINE even with deep stock", () => {
    const r = addLine([], { ...base, qty: 50 }, 1000);
    expect(r.lines[0]!.qty).toBe(MAX_PER_LINE);
  });

  it("custom and plain lines share the same SKU stock", () => {
    const custom = { placement: "left-chest", text: "RUGGED", style: "display", colour: "neon" } as const;
    let lines = addLine([], { ...base, qty: 4 }, 5).lines;
    const r = addLine(lines, { ...base, qty: 4, custom }, 5);
    lines = r.lines;
    expect(lines).toHaveLength(2);
    expect(qtyForSku(lines, base.sku)).toBe(5);
    expect(r.added).toBe(1);
    expect(lineKey(base.sku, custom)).not.toBe(lineKey(base.sku));
  });

  it("setQty clamps and removes at zero", () => {
    const lines = addLine([], base, 15).lines;
    expect(setQty(lines, base.sku, 40, 15)[0]!.qty).toBe(MAX_PER_LINE);
    expect(setQty(lines, base.sku, 0, 15)).toHaveLength(0);
  });

  it("changeSize moves the line to the new SKU and respects its stock", () => {
    const lines = addLine([], { ...base, qty: 4 }, 15).lines;
    const moved = changeSize(lines, base.sku, { sku: "SZW-SERAPH-WBLK-L", size: "L" }, 2);
    expect(moved).toHaveLength(1);
    expect(moved[0]).toMatchObject({ sku: "SZW-SERAPH-WBLK-L", size: "L", qty: 2 });
  });

  it("clampQty handles fractional and negative input", () => {
    expect(clampQty(2.7, 10, 0)).toBe(2);
    expect(clampQty(-3, 10, 0)).toBe(0);
    expect(clampQty(5, 10, 8)).toBe(2);
  });
});
