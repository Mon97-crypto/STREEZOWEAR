import { describe, expect, it } from "vitest";
import { buildMesh, NO_ADJUST, pieceOf, type Body, type GarmentSpec, type Mesh, type P } from "@/lib/tryon/mesh";
import { TRY_ON } from "@/lib/tryon/config";

const g = TRY_ON[0]!.views[0]!.spec;
const body: Body = {
  shoulderL: { x: 400, y: 300 }, shoulderR: { x: 600, y: 300 },
  hipL: { x: 430, y: 600 }, hipR: { x: 570, y: 600 },
  elbowL: { x: 380, y: 470 }, elbowR: { x: 620, y: 470 }, turn: 1,
};
const near = (a: P, b: P, tol: number) => Math.hypot(a.x - b.x, a.y - b.y) < tol;

/** where a garment point lands: nearest grid vertex */
function landing(spec: GarmentSpec, m: Mesh, p: P) {
  let best = 0, bd = Infinity;
  m.src.forEach((s, i) => { const d = Math.hypot(s.x - p.x, s.y - p.y); if (d < bd) { bd = d; best = i; } });
  return m.dst[best]!;
}

describe("garment warp", () => {
  it("puts the garment's shoulder joints on the person's shoulders", () => {
    const m = buildMesh(g, body, NO_ADJUST, 60, 70).torso;
    expect(near(landing(g, m, g.jointL), body.shoulderL, 12)).toBe(true);
    expect(near(landing(g, m, g.jointR), body.shoulderR, 12)).toBe(true);
  });
  it("follows the body: a tilted body tilts the tee", () => {
    const tilted = { ...body, shoulderR: { x: 600, y: 340 } };
    const m = buildMesh(g, tilted, NO_ADJUST, 60, 70).torso;
    const l = landing(g, m, g.jointL), r = landing(g, m, g.jointR);
    expect(r.y - l.y).toBeGreaterThan(25);
  });
  it("turns the sleeves toward the elbows", () => {
    const armsOut = { ...body, elbowL: { x: 260, y: 380 }, elbowR: { x: 740, y: 380 } };
    const down = buildMesh(g, body, NO_ADJUST, 60, 70), out = buildMesh(g, armsOut, NO_ADJUST, 60, 70);
    expect(landing(g, out.left, g.sleeveL).x).toBeLessThan(landing(g, down.left, g.sleeveL).x - 20);
    expect(landing(g, out.right, g.sleeveR).x).toBeGreaterThan(landing(g, down.right, g.sleeveR).x + 20);
    // the chest doesn't move when only the arms do
    const chest = { x: 330, y: 300 };
    expect(near(landing(g, out.torso, chest), landing(g, down.torso, chest), 1)).toBe(true);
    // sleeves stay attached at the shoulder joint
    expect(near(landing(g, out.left, g.jointL), landing(g, out.torso, g.jointL), 12)).toBe(true);
  });
  it("still works without hips or elbows", () => {
    const m = buildMesh(g, { ...body, hipL: null, hipR: null, elbowL: null, elbowR: null }).torso;
    expect(m.dst.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y))).toBe(true);
    const bottom = Math.max(...m.dst.map((p) => p.y));
    expect(bottom).toBeGreaterThan(body.shoulderL.y + 200);
  });
  it("manual size and move apply on top", () => {
    const a = buildMesh(g, body).torso, b = buildMesh(g, body, { dx: 10, dy: 0, scale: 1.2, length: 1, tilt: 0 }).torso;
    const wa = Math.max(...a.dst.map((p) => p.x)) - Math.min(...a.dst.map((p) => p.x));
    const wb = Math.max(...b.dst.map((p) => p.x)) - Math.min(...b.dst.map((p) => p.x));
    expect(wb / wa).toBeCloseTo(1.2, 1);
  });
  it("cuts the garment into body and sleeves", () => {
    expect(pieceOf(g, g.collar)).toBe("torso");
    expect(pieceOf(g, g.sleeveL)).toBe("left");
    expect(pieceOf(g, g.sleeveR)).toBe("right");
  });
  it("makes a complete triangle mesh", () => {
    const m = buildMesh(g, body, NO_ADJUST, 4, 5).torso;
    expect(m.src).toHaveLength(5 * 6);
    expect(m.tris).toHaveLength(4 * 5 * 2);
  });
});
