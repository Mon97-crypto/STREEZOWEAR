/**
 * Body-following garment warp (free, on-device "3D-aware" try-on).
 *
 * The garment image is covered by a grid. Each grid point is moved in two steps:
 *  1. sleeves: points in a sleeve turn around the shoulder joint so the sleeve follows the upper arm;
 *  2. torso: a bilinear map sends the garment's own shoulder/hip reference points onto the
 *     person's shoulders and hips, so the tee widens, narrows, tilts and lengthens with the body.
 * Then the user's manual adjustments (move, size, length, tilt) are applied around the collar.
 * The result is a triangle mesh the renderer draws with affine transforms. Pure maths, unit-tested.
 */
export type P = { x: number; y: number };

/** Where things are on the flat garment image (pixels of that image). */
export type GarmentSpec = {
  w: number;
  h: number;
  collar: P;
  /** where the wearer's shoulder joints sit under the tee (oversized: inside the dropped seam) */
  jointL: P;
  jointR: P;
  /** where the wearer's hip joints sit under the tee */
  hipL: P;
  hipR: P;
  /** armhole lines: from the top of the shoulder seam to the armpit, one per side */
  armholeL: [P, P];
  armholeR: [P, P];
  /** middle of each sleeve opening */
  sleeveL: P;
  sleeveR: P;
};

/** Body points in photo pixels. L/R = as seen in the photo (left of the image), not the wearer's. */
export type Body = {
  shoulderL: P;
  shoulderR: P;
  hipL: P | null;
  hipR: P | null;
  elbowL: P | null;
  elbowR: P | null;
  /** 0.72–1: narrower when the body is turned away from the camera */
  turn: number;
};

export type Adjust = { dx: number; dy: number; scale: number; length: number; tilt: number };
export const NO_ADJUST: Adjust = { dx: 0, dy: 0, scale: 1, length: 1, tilt: 0 };

export type Mesh = { src: P[]; dst: P[]; tris: [number, number, number][] };
/** The body and each sleeve are separate pieces: sleeves swing as solid pieces about the shoulder joint. */
export type GarmentMesh = { torso: Mesh; left: Mesh; right: Mesh };

/** Which piece a garment-image point belongs to (for cutting the flat garment into body + sleeves). */
export function pieceOf(g: GarmentSpec, p: P): "torso" | "left" | "right" {
  if (side(p, g.armholeL[0], g.armholeL[1], 1) > 0) return "left";
  if (side(p, g.armholeR[0], g.armholeR[1], -1) > 0) return "right";
  return "torso";
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const sub = (a: P, b: P): P => ({ x: a.x - b.x, y: a.y - b.y });
const add = (a: P, b: P): P => ({ x: a.x + b.x, y: a.y + b.y });
const mul = (a: P, k: number): P => ({ x: a.x * k, y: a.y * k });
const len = (a: P) => Math.hypot(a.x, a.y);
const rot = (a: P, c: P, ang: number): P => {
  const s = Math.sin(ang), co = Math.cos(ang), d = sub(a, c);
  return { x: c.x + d.x * co - d.y * s, y: c.y + d.x * s + d.y * co };
};
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
/** signed distance of p from line a→b, positive on the outer side given by `outward` */
function side(p: P, a: P, b: P, outward: 1 | -1) {
  const d = sub(b, a), n = { x: -d.y, y: d.x }, l = len(n) || 1;
  return (((p.x - a.x) * n.x + (p.y - a.y) * n.y) / l) * outward;
}
/** angle between two vectors, signed */
const angleBetween = (a: P, b: P) => Math.atan2(a.x * b.y - a.y * b.x, a.x * b.x + a.y * b.y);

/** Fill in missing hips/elbows from typical proportions so the warp always has something to follow. */
export function completeBody(b: Body): Required<{ [K in keyof Body]: NonNullable<Body[K]> }> {
  const sh = sub(b.shoulderR, b.shoulderL);
  const w = len(sh) || 1;
  const down = { x: -sh.y / w, y: sh.x / w }; // perpendicular to the shoulder line, pointing down the body
  const hipL = b.hipL ?? add(add(b.shoulderL, mul(down, w * 1.45)), mul(sh, 0.18));
  const hipR = b.hipR ?? add(add(b.shoulderR, mul(down, w * 1.45)), mul(sh, -0.18));
  const elbowL = b.elbowL ?? add(add(b.shoulderL, mul(down, w * 0.8)), mul(sh, -0.12));
  const elbowR = b.elbowR ?? add(add(b.shoulderR, mul(down, w * 0.8)), mul(sh, 0.12));
  return { shoulderL: b.shoulderL, shoulderR: b.shoulderR, hipL, hipR, elbowL, elbowR, turn: b.turn };
}

/** Bilinear map of the garment's [jointL, jointR, hipR, hipL] quad onto the body's. Extrapolates outside it. */
function torsoMap(g: GarmentSpec, quad: [P, P, P, P]) {
  // garment quad → (u,v) using the garment's own (near-rectangular) frame
  const top = { a: g.jointL, b: g.jointR }, bot = { a: g.hipL, b: g.hipR };
  return (p: P): P => {
    const ty = (g.jointL.y + g.jointR.y) / 2, by = (g.hipL.y + g.hipR.y) / 2;
    const v = (p.y - ty) / (by - ty);
    const lx = lerp(top.a.x, bot.a.x, v), rx = lerp(top.b.x, bot.b.x, v);
    const u = (p.x - lx) / (rx - lx);
    const T = add(quad[0], mul(sub(quad[1], quad[0]), u));
    const B = add(quad[3], mul(sub(quad[2], quad[3]), u));
    return add(T, mul(sub(B, T), v));
  };
}

export function buildMesh(g: GarmentSpec, body: Body, adj: Adjust = NO_ADJUST, cols = 14, rows = 16): GarmentMesh {
  const b = completeBody(body);
  // the tee hangs: at the hem it's wider than the hips. Blend the hip width toward the shoulder width.
  const hipMid = mul(add(b.hipL, b.hipR), 0.5);
  const shW = len(sub(b.shoulderR, b.shoulderL));
  const hipDir = mul(sub(b.hipR, b.hipL), 1 / (len(sub(b.hipR, b.hipL)) || 1));
  const gShW = len(sub(g.jointR, g.jointL)), gHipW = len(sub(g.hipR, g.hipL));
  const hipW = lerp(len(sub(b.hipR, b.hipL)), shW * (gHipW / gShW), 0.55);
  const quad: [P, P, P, P] = [b.shoulderL, b.shoulderR, add(hipMid, mul(hipDir, hipW / 2)), add(hipMid, mul(hipDir, -hipW / 2))];
  // a turned body narrows the garment toward its centre line
  const centre = mul(add(add(quad[0], quad[1]), add(quad[2], quad[3])), 0.25);
  for (let i = 0; i < 4; i++) quad[i] = { x: centre.x + (quad[i]!.x - centre.x) * b.turn, y: quad[i]!.y };
  const T = torsoMap(g, quad);

  // sleeve rotation, measured after the torso map so it compares like with like
  const sleeveTurn = (joint: P, tip: P, elbow: P) => {
    const jd = T(joint), td = T(tip);
    return clamp(angleBetween(sub(td, jd), sub(elbow, jd)), -1.6, 1.6); // up to arms straight out
  };
  const angL = sleeveTurn(g.jointL, g.sleeveL, b.elbowL);
  const angR = sleeveTurn(g.jointR, g.sleeveR, b.elbowR);
  // turn about the shoulder joint so the sleeve lines up with the upper arm
  const pivotL = T(g.jointL), pivotR = T(g.jointR);

  // manual adjustments around the (warped) collar
  const collarD = T(g.collar);
  const tilt = (adj.tilt * Math.PI) / 180;
  const finish = (p: P): P => {
    let q = sub(p, collarD);
    q = { x: q.x * adj.scale, y: q.y * adj.scale * adj.length };
    q = rot(q, { x: 0, y: 0 }, tilt);
    return { x: collarD.x + q.x + adj.dx, y: collarD.y + q.y + adj.dy };
  };

  const src: P[] = [], torso: P[] = [], left: P[] = [], right: P[] = [];
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      const s = { x: (c / cols) * g.w, y: (r / rows) * g.h };
      src.push(s);
      const d = T(s);
      torso.push(finish(d));
      left.push(finish(rot(d, pivotL, angL)));
      right.push(finish(rot(d, pivotR, angR)));
    }
  }
  const tris: [number, number, number][] = [];
  const idx = (r: number, c: number) => r * (cols + 1) + c;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      tris.push([idx(r, c), idx(r, c + 1), idx(r + 1, c)]);
      tris.push([idx(r, c + 1), idx(r + 1, c + 1), idx(r + 1, c)]);
    }
  return { torso: { src, dst: torso, tris }, left: { src, dst: left, tris }, right: { src, dst: right, tris } };
}

