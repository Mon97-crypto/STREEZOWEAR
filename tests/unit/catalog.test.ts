import { describe, expect, it } from "vitest";
import { drops, products } from "@/lib/catalog/data";
import { existsSync } from "node:fs";
import path from "node:path";

describe("launch catalogue", () => {
  it("matches the owner's facts", () => {
    for (const p of products) {
      expect(p.sizes).toEqual(["S", "M", "L", "XL"]);
      expect(p.gsm).toBe(250);
      expect(p.fabric).toBe("Cotton, polyester");
      for (const v of p.variants) expect(v.stock).toBe(15);
    }
    expect(products.every((p) => p.pricePaise === 49900)).toBe(true);
  });

  it("has unique slugs and SKUs", () => {
    const slugs = products.map((p) => p.slug);
    const skus = products.flatMap((p) => p.variants.map((v) => v.sku));
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(skus).size).toBe(skus.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });

  it("references media files that exist", () => {
    const pub = (src: string) => existsSync(path.join(process.cwd(), "public", src));
    for (const p of products) {
      for (const m of [...p.images, ...(p.cutout ? [p.cutout] : [])]) expect(pub(m.src), m.src).toBe(true);
      if (p.video) for (const f of [p.video.desktop, p.video.mobile, p.video.poster]) expect(pub(f), f).toBe(true);
    }
    for (const d of drops) for (const f of [...(d.video ? [d.video.desktop, d.video.poster] : []), ...d.stills.map((s) => s.src)]) expect(pub(f), f).toBe(true);
  });

  it("the customisation example is never for sale", () => {
    expect(products.some((p) => p.id.includes("velvet") || p.slug.includes("velvet"))).toBe(false);
    for (const d of drops) expect(d.products.some((s) => s.includes("velvet"))).toBe(false);
  });

  it("Drop 01 is The Origin Collection and lists every one of its products", () => {
    const d = drops.find((x) => x.slug === "origin-collection")!;
    expect(d.name).toBe("The Origin Collection");
    const inDrop = products.filter((p) => p.drop === "origin-collection").map((p) => p.slug);
    expect(inDrop.length).toBeGreaterThan(0);
    expect([...d.products].sort()).toEqual([...inDrop].sort());
  });

  it("drop products all exist", () => {
    for (const d of drops) for (const s of d.products) expect(products.some((p) => p.slug === s), s).toBe(true);
  });
});
