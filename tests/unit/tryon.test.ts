import { describe, expect, it } from "vitest";
import { defaultFit, fitTee } from "@/lib/tryon/fit";

const tee = { collarX: 0.5, collarY: 0.055, widthPerShoulder: 2.15, aspect: 736 / 621 };

describe("try-on fit", () => {
  it("centres on level shoulders and scales with them", () => {
    const f = fitTee({ x: 400, y: 300 }, { x: 600, y: 300 }, null, tee);
    expect(f.cx).toBeCloseTo(500);
    expect(f.cy).toBeLessThan(300); // collar above the shoulder line
    expect(f.width).toBeCloseTo(200 * 2.15);
    expect(f.angle).toBeCloseTo(0);
    expect(f.stretch).toBe(1);
  });
  it("gives the same result whichever shoulder comes first", () => {
    const a = fitTee({ x: 400, y: 300 }, { x: 600, y: 320 }, null, tee);
    const b = fitTee({ x: 600, y: 320 }, { x: 400, y: 300 }, null, tee);
    expect(a).toEqual(b);
    expect(a.angle).toBeGreaterThan(0); // tilts with the shoulders
  });
  it("lengthens for a long torso, within limits", () => {
    const short = fitTee({ x: 400, y: 300 }, { x: 600, y: 300 }, [{ x: 430, y: 520 }, { x: 570, y: 520 }], tee);
    const long = fitTee({ x: 400, y: 300 }, { x: 600, y: 300 }, [{ x: 430, y: 900 }, { x: 570, y: 900 }], tee);
    expect(long.stretch).toBeGreaterThan(short.stretch);
    expect(long.stretch).toBeLessThanOrEqual(1.3);
    expect(short.stretch).toBeGreaterThanOrEqual(0.85);
  });
  it("narrows for a turned body but never collapses", () => {
    const f = fitTee({ x: 400, y: 300, z: 0 }, { x: 600, y: 300, z: 600 }, null, tee);
    expect(f.turn).toBeGreaterThanOrEqual(0.72);
    expect(f.turn).toBeLessThan(1);
  });
  it("has a sensible fallback when no body is found", () => {
    const f = defaultFit(1000, 1500);
    expect(f.cx).toBe(500);
    expect(f.width).toBeGreaterThan(300);
  });
});
