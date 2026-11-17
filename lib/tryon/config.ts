import type { GarmentSpec } from "./mesh";

/**
 * Pieces available in the try-on. Add one when it has a clean, high-quality cutout,
 * and measure its reference points (see docs/PHASE-2.md, "Try it on").
 */
export type TryOnView = { id: "front" | "back"; label: string; src: string; spec: GarmentSpec };
export type TryOnPiece = { slug: string; name: string; views: TryOnView[] };

/**
 * Reference points measured from the cutouts' outlines (collar, armpits, hem, sleeve openings).
 * Shoulder joints sit at ~78% of the body width (drop shoulder); hip joints at ~65% of the joint
 * width and ~82% of the height, typical proportions for an oversized tee.
 */
const fallenFront: GarmentSpec = {
  w: 621, h: 736,
  collar: { x: 332, y: 6 },
  jointL: { x: 168, y: 96 }, jointR: { x: 484, y: 96 },
  hipL: { x: 224, y: 604 }, hipR: { x: 428, y: 604 },
  armholeL: [{ x: 178, y: 30 }, { x: 124, y: 436 }],
  armholeR: [{ x: 478, y: 30 }, { x: 528, y: 432 }],
  sleeveL: { x: 62, y: 400 }, sleeveR: { x: 575, y: 412 },
};

const fallenBack: GarmentSpec = {
  w: 629, h: 729,
  collar: { x: 295, y: 6 },
  jointL: { x: 140, y: 94 }, jointR: { x: 454, y: 94 },
  hipL: { x: 195, y: 598 }, hipR: { x: 399, y: 598 },
  armholeL: [{ x: 150, y: 30 }, { x: 96, y: 442 }],
  armholeR: [{ x: 444, y: 30 }, { x: 498, y: 436 }],
  sleeveL: { x: 45, y: 415 }, sleeveR: { x: 548, y: 400 },
};

export const TRY_ON: TryOnPiece[] = [
  {
    slug: "fallen-angel-oversized-tee",
    name: "Fallen Angel",
    views: [
      { id: "front", label: "Front", src: "/media/products/fallen-angel-front.webp", spec: fallenFront },
      { id: "back", label: "Back", src: "/media/products/fallen-angel-back.webp", spec: fallenBack },
    ],
  },
];

export const hasTryOn = (slug: string) => TRY_ON.some((p) => p.slug === slug);

/** Photos are resized to this on the longest side, in the browser, before anything else. */
export const MAX_PHOTO_PX = 1600;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
export const MAX_PHOTO_BYTES = 25 * 1024 * 1024;
