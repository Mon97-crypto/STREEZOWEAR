import type { TeeAnchor } from "./fit";

/**
 * Pieces available in the try-on. Add one when it has a clean, high-quality cutout.
 * collarX/collarY: where the middle of the neckline is in the image (0–1).
 */
export type TryOnPiece = {
  slug: string;
  name: string;
  views: { id: "front" | "back"; label: string; src: string; width: number; height: number; anchor: TeeAnchor }[];
};

export const TRY_ON: TryOnPiece[] = [
  {
    slug: "fallen-angel-oversized-tee",
    name: "Fallen Angel",
    views: [
      { id: "front", label: "Front", src: "/media/products/fallen-angel-front.webp", width: 621, height: 736, anchor: { collarX: 0.5, collarY: 0.055, widthPerShoulder: 2.15, aspect: 736 / 621 } },
      { id: "back", label: "Back", src: "/media/products/fallen-angel-back.webp", width: 629, height: 729, anchor: { collarX: 0.5, collarY: 0.03, widthPerShoulder: 2.15, aspect: 729 / 629 } },
    ],
  },
];

export const hasTryOn = (slug: string) => TRY_ON.some((p) => p.slug === slug);

/** Photos are resized to this on the longest side, in the browser, before anything else. */
export const MAX_PHOTO_PX = 1600;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
export const MAX_PHOTO_BYTES = 25 * 1024 * 1024;
