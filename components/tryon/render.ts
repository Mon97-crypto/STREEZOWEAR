"use client";

/**
 * On-device try-on renderer. Runs entirely in the browser:
 *  - body points (MediaPipe Pose, full model) and a body-part mask (MediaPipe multiclass segmenter),
 *    both served from this site under /vendor/mediapipe;
 *  - the garment is drawn as a warped triangle mesh (lib/tryon/mesh.ts);
 *  - the photo's own light and folds are laid over the garment;
 *  - hair, face and hands/forearms from the photo are put back on top, so they sit in front of the tee.
 * Nothing leaves the device.
 */
import { pieceOf, type Body, type GarmentMesh, type GarmentSpec, type Mesh, type P } from "@/lib/tryon/mesh";

export type Analysis = {
  body: Body | null;
  /** white where the photo must stay in front of the garment (hair, face, hands/forearms) */
  occlusion: HTMLCanvasElement | null;
  /** grey 128 = no change; darker/lighter = the photo's folds and light */
  shading: HTMLCanvasElement;
};

const VENDOR = "/vendor/mediapipe";

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return c;
}

/** blur that works everywhere (Safari's canvas filter support is patchy): shrink, then stretch back */
function softBlur(src: CanvasImageSource, w: number, h: number, factor: number) {
  const sw = Math.max(2, Math.round(w / factor)), sh = Math.max(2, Math.round(h / factor));
  const small = canvas(sw, sh), sctx = small.getContext("2d")!;
  sctx.imageSmoothingQuality = "high";
  sctx.drawImage(src, 0, 0, sw, sh);
  const out = canvas(w, h), octx = out.getContext("2d")!;
  octx.imageSmoothingQuality = "high";
  octx.drawImage(small, 0, 0, w, h);
  return out;
}

function luminance(c: HTMLCanvasElement) {
  const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
  const L = new Float32Array(c.width * c.height);
  for (let i = 0, j = 0; i < d.length; i += 4, j++) L[j] = (0.2126 * d[i]! + 0.7152 * d[i + 1]! + 0.0722 * d[i + 2]!) / 255;
  return L;
}

/** folds and light: fine detail ÷ broad light, centred on grey */
function shadingMap(photo: HTMLCanvasElement) {
  const { width: w, height: h } = photo;
  const fine = luminance(softBlur(photo, w, h, Math.max(2, w / 300)));
  const broad = luminance(softBlur(photo, w, h, Math.max(8, w / 14)));
  let mean = 0;
  for (let i = 0; i < broad.length; i++) mean += broad[i]!;
  mean /= broad.length;
  const out = canvas(w, h), ctx = out.getContext("2d")!;
  const img = ctx.createImageData(w, h);
  for (let i = 0, j = 0; j < fine.length; i += 4, j++) {
    const ratio = fine[j]! / Math.max(0.04, broad[j]!);
    // folds (local ratio) + a little of the overall light level
    const v = 128 + (ratio - 1) * 150 + (broad[j]! - mean) * 70;
    const g = Math.max(40, Math.min(215, v));
    img.data[i] = img.data[i + 1] = img.data[i + 2] = g;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return out;
}

export async function analyse(photo: HTMLCanvasElement): Promise<Analysis> {
  const shading = shadingMap(photo);
  const { FilesetResolver, PoseLandmarker, ImageSegmenter } = await import("@mediapipe/tasks-vision");
  const files = await FilesetResolver.forVisionTasks(VENDOR);
  const W = photo.width, H = photo.height;

  const pose = await PoseLandmarker.createFromOptions(files, {
    baseOptions: { modelAssetPath: `${VENDOR}/pose_landmarker_full.task`, delegate: "CPU" },
    runningMode: "IMAGE",
    numPoses: 1,
  });
  let body: Body | null = null;
  let arms: { elbow: P; wrist: P; hand: P }[] = [];
  try {
    const lm = pose.detect(photo).landmarks[0];
    if (lm) {
      const pt = (i: number) => ({ x: lm[i]!.x * W, y: lm[i]!.y * H, z: lm[i]!.z * W, v: lm[i]!.visibility ?? 0 });
      const s = [pt(11), pt(12)], e = [pt(13), pt(14)], wr = [pt(15), pt(16)], ix = [pt(19), pt(20)], h = [pt(23), pt(24)];
      if (s[0]!.v > 0.5 && s[1]!.v > 0.5) {
        const li = s[0]!.x <= s[1]!.x ? 0 : 1, ri = 1 - li; // image-left / image-right
        const ok = (q: { v: number; y: number }) => q.v > 0.45 && q.y < H * 1.08;
        const shoulderW = Math.hypot(s[1]!.x - s[0]!.x, s[1]!.y - s[0]!.y);
        const dz = Math.abs(s[1]!.z - s[0]!.z);
        body = {
          shoulderL: s[li]!, shoulderR: s[ri]!,
          hipL: ok(h[li]!) && ok(h[ri]!) ? h[li]! : null,
          hipR: ok(h[li]!) && ok(h[ri]!) ? h[ri]! : null,
          elbowL: ok(e[li]!) ? e[li]! : null,
          elbowR: ok(e[ri]!) ? e[ri]! : null,
          turn: Math.min(1, Math.max(0.72, Math.cos(Math.atan2(dz, shoulderW)))),
        };
        arms = [0, 1].filter((k) => e[k]!.v > 0.45 && wr[k]!.v > 0.45).map((k) => ({ elbow: e[k]!, wrist: wr[k]!, hand: ix[k]!.v > 0.3 ? ix[k]! : wr[k]! }));
      }
    }
  } finally {
    pose.close();
  }

  let occlusion: HTMLCanvasElement | null = null;
  try {
    const seg = await ImageSegmenter.createFromOptions(files, {
      baseOptions: { modelAssetPath: `${VENDOR}/selfie_multiclass_256x256.tflite`, delegate: "CPU" },
      runningMode: "IMAGE",
      outputCategoryMask: true,
      outputConfidenceMasks: false,
    });
    try {
      const res = seg.segment(photo);
      const mask = res.categoryMask;
      if (mask) {
        const mw = mask.width, mh = mask.height, cats = mask.getAsUint8Array();
        // forearm/hand areas: skin there goes in front of the tee (arms crossed, hands on chest)
        const zone = canvas(mw, mh), zctx = zone.getContext("2d")!;
        zctx.strokeStyle = "#fff"; zctx.fillStyle = "#fff"; zctx.lineCap = "round";
        for (const a of arms) {
          const r = Math.hypot(a.wrist.x - a.elbow.x, a.wrist.y - a.elbow.y) * 0.32 * (mw / W);
          zctx.lineWidth = r * 2;
          zctx.beginPath();
          zctx.moveTo((a.elbow.x / W) * mw, (a.elbow.y / H) * mh);
          zctx.lineTo((a.wrist.x / W) * mw, (a.wrist.y / H) * mh);
          zctx.lineTo((a.hand.x / W) * mw, (a.hand.y / H) * mh);
          zctx.stroke();
        }
        const zd = zctx.getImageData(0, 0, mw, mh).data;
        const small = canvas(mw, mh), sctx = small.getContext("2d")!;
        const img = sctx.createImageData(mw, mh);
        // categories: 0 background, 1 hair, 2 body skin, 3 face skin, 4 clothes, 5 accessories
        for (let i = 0; i < cats.length; i++) {
          const c = cats[i]!;
          const front = c === 1 || c === 3 || (c === 2 && zd[i * 4]! > 0);
          img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = 255;
          img.data[i * 4 + 3] = front ? 255 : 0;
        }
        sctx.putImageData(img, 0, 0);
        occlusion = canvas(W, H);
        const octx = occlusion.getContext("2d")!;
        octx.imageSmoothingQuality = "high";
        octx.drawImage(small, 0, 0, W, H); // stretching softens the edge
      }
      mask?.close();
    } finally {
      seg.close();
    }
  } catch {
    occlusion = null; // still works without it, just no hair/hands in front
  }
  return { body, occlusion, shading };
}

/** draw one source triangle of the garment onto its destination triangle */
function drawTri(ctx: CanvasRenderingContext2D, img: CanvasImageSource, s: [P, P, P], d: [P, P, P]) {
  // grow the destination triangle by ~0.7 px so neighbours overlap and no hairline seams show
  const cx = (d[0].x + d[1].x + d[2].x) / 3, cy = (d[0].y + d[1].y + d[2].y) / 3;
  const grow = (p: P) => { const dx = p.x - cx, dy = p.y - cy, l = Math.hypot(dx, dy) || 1; return { x: p.x + (dx / l) * 0.7, y: p.y + (dy / l) * 0.7 }; };
  const [g0, g1, g2] = [grow(d[0]), grow(d[1]), grow(d[2])];
  ctx.save();
  ctx.beginPath(); ctx.moveTo(g0.x, g0.y); ctx.lineTo(g1.x, g1.y); ctx.lineTo(g2.x, g2.y); ctx.closePath(); ctx.clip();
  // affine transform taking s → d
  const [s0, s1, s2] = s, [d0, d1, d2] = d;
  const den = s0.x * (s1.y - s2.y) + s1.x * (s2.y - s0.y) + s2.x * (s0.y - s1.y);
  if (Math.abs(den) < 1e-6) { ctx.restore(); return; }
  const a = (d0.x * (s1.y - s2.y) + d1.x * (s2.y - s0.y) + d2.x * (s0.y - s1.y)) / den;
  const b = (d0.y * (s1.y - s2.y) + d1.y * (s2.y - s0.y) + d2.y * (s0.y - s1.y)) / den;
  const c = (d0.x * (s2.x - s1.x) + d1.x * (s0.x - s2.x) + d2.x * (s1.x - s0.x)) / den;
  const dd = (d0.y * (s2.x - s1.x) + d1.y * (s0.x - s2.x) + d2.y * (s1.x - s0.x)) / den;
  const e = (d0.x * (s1.x * s2.y - s2.x * s1.y) + d1.x * (s2.x * s0.y - s0.x * s2.y) + d2.x * (s0.x * s1.y - s1.x * s0.y)) / den;
  const f = (d0.y * (s1.x * s2.y - s2.x * s1.y) + d1.y * (s2.x * s0.y - s0.x * s2.y) + d2.y * (s0.x * s1.y - s1.x * s0.y)) / den;
  ctx.transform(a, b, c, dd, e, f);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}

export type RenderOptions = { realism: number };

/** The flat garment cut into body + sleeves along its armhole lines (cached per image). */
export type GarmentPieces = { torso: HTMLCanvasElement; left: HTMLCanvasElement; right: HTMLCanvasElement };
const pieceCache = new WeakMap<HTMLImageElement, GarmentPieces>();

export function cutGarment(img: HTMLImageElement, g: GarmentSpec): GarmentPieces {
  const hit = pieceCache.get(img);
  if (hit) return hit;
  const W = img.naturalWidth, H = img.naturalHeight, sx = W / g.w, sy = H / g.h;
  const src = canvas(W, H).getContext("2d")!;
  src.drawImage(img, 0, 0);
  const data = src.getImageData(0, 0, W, H).data;
  const make = (part: "torso" | "left" | "right") => {
    const c = canvas(W, H), ctx = c.getContext("2d")!, out = ctx.createImageData(W, H);
    for (let y = 0, i = 0; y < H; y++)
      for (let x = 0; x < W; x++, i += 4) {
        const p = { x: x / sx, y: y / sy };
        // the body piece reaches 2 px past each armhole so no gap shows at rest
        const mine = pieceOf(g, p) === part || (part === "torso" && pieceOf(g, { x: p.x + (p.x < g.collar.x ? 2 : -2), y: p.y }) === "torso");
        if (!mine) continue;
        out.data[i] = data[i]!; out.data[i + 1] = data[i + 1]!; out.data[i + 2] = data[i + 2]!; out.data[i + 3] = data[i + 3]!;
      }
    ctx.putImageData(out, 0, 0);
    return c;
  };
  const pieces = { torso: make("torso"), left: make("left"), right: make("right") };
  pieceCache.set(img, pieces);
  return pieces;
}

function drawMesh(ctx: CanvasRenderingContext2D, img: CanvasImageSource, m: Mesh) {
  for (const [i, j, k] of m.tris) drawTri(ctx, img, [m.src[i]!, m.src[j]!, m.src[k]!], [m.dst[i]!, m.dst[j]!, m.dst[k]!]);
}

export function render(out: HTMLCanvasElement, photo: HTMLCanvasElement, garment: GarmentPieces, mesh: GarmentMesh, an: Analysis, opt: RenderOptions) {
  const W = photo.width, H = photo.height;
  out.width = W; out.height = H;
  const ctx = out.getContext("2d")!;
  ctx.drawImage(photo, 0, 0);

  // 1. warped garment on its own layer
  const layer = canvas(W, H), l = layer.getContext("2d")!;
  l.imageSmoothingQuality = "high";
  // sleeves first, so where a lowered sleeve overlaps the body the body edge sits on top like a seam
  drawMesh(l, garment.left, mesh.left);
  drawMesh(l, garment.right, mesh.right);
  drawMesh(l, garment.torso, mesh.torso);

  // 2. the photo's folds and light, only on the garment
  if (opt.realism > 0) {
    const sh = canvas(W, H), s = sh.getContext("2d")!;
    s.globalAlpha = opt.realism;
    s.drawImage(an.shading, 0, 0);
    s.globalAlpha = 1;
    s.globalCompositeOperation = "destination-in";
    s.drawImage(layer, 0, 0);
    l.globalCompositeOperation = "soft-light";
    l.drawImage(sh, 0, 0);
    l.globalCompositeOperation = "source-over";
  }

  // 3. hair, face and hands stay in front
  if (an.occlusion) {
    l.globalCompositeOperation = "destination-out";
    l.drawImage(an.occlusion, 0, 0);
    l.globalCompositeOperation = "source-over";
  }

  // 4. onto the photo with a soft contact shadow
  const shadow = Math.max(4, W * 0.012);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.38)";
  ctx.shadowBlur = shadow;
  ctx.shadowOffsetY = shadow * 0.35;
  ctx.drawImage(layer, 0, 0);
  ctx.restore();
}
