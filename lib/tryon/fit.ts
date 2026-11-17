/**
 * Try-on fit: where to draw a tee on a photo, from the body's shoulder and hip points.
 * Pure maths, no browser APIs, so it is unit-tested.
 */
export type Pt = { x: number; y: number; z?: number };

export type Fit = {
  /** where the tee's collar centre goes, in photo pixels */
  cx: number;
  cy: number;
  /** tee width in photo pixels (sleeve tip to sleeve tip) */
  width: number;
  /** tilt in radians, following the shoulder line */
  angle: number;
  /** vertical stretch so the hem lands below the hips (1 = the tee's own proportions) */
  stretch: number;
  /** horizontal squeeze when the body is turned away from the camera (1 = facing it) */
  turn: number;
};

/** How a tee image maps to a body. Fractions of the tee image. */
export type TeeAnchor = {
  /** collar centre */
  collarX: number;
  collarY: number;
  /** tee image width ÷ distance between the wearer's shoulder joints (oversized, drop shoulder) */
  widthPerShoulder: number;
  /** image height ÷ width */
  aspect: number;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * @param a,b the two shoulder joints (any order), in photo pixels
 * @param hips the two hip joints if they were found
 */
export function fitTee(a: Pt, b: Pt, hips: [Pt, Pt] | null, tee: TeeAnchor): Fit {
  const [l, r] = a.x <= b.x ? [a, b] : [b, a]; // left/right as seen in the photo
  const dx = r.x - l.x;
  const dy = r.y - l.y;
  const shoulder = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  // turned body: the far shoulder is deeper (z is in the same unit as x after scaling)
  const dz = (r.z ?? 0) - (l.z ?? 0);
  const turn = clamp(Math.cos(Math.atan2(Math.abs(dz), shoulder)), 0.72, 1);
  const width = (shoulder / turn) * tee.widthPerShoulder;
  // the collar sits a little above the line between the shoulder joints
  const up = shoulder * 0.16;
  const cx = (l.x + r.x) / 2 + Math.sin(angle) * up;
  const cy = (l.y + r.y) / 2 - Math.cos(angle) * up;
  let stretch = 1;
  if (hips) {
    const hx = (hips[0].x + hips[1].x) / 2;
    const hy = (hips[0].y + hips[1].y) / 2;
    const torso = Math.hypot(hx - (l.x + r.x) / 2, hy - (l.y + r.y) / 2);
    // an oversized tee ends a little below the hip joints
    const wanted = torso * 1.28 + up;
    stretch = clamp(wanted / (width * tee.aspect * (1 - tee.collarY)), 0.85, 1.3);
  }
  return { cx, cy, width, angle, stretch, turn };
}

/** Placement when no body was found: centred, upper-middle of the photo. */
export function defaultFit(photoW: number, photoH: number): Fit {
  return { cx: photoW / 2, cy: photoH * 0.3, width: Math.min(photoW * 0.7, photoH * 0.6), angle: 0, stretch: 1, turn: 1 };
}
