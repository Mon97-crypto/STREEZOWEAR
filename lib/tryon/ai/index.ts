import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { replicateProvider } from "./replicate";
import { TryOnError, type TryOnProvider } from "./types";

/** Which provider runs the realistic try-on. Only "replicate" is implemented. */
export function getProvider(env: Record<string, string | undefined> = process.env): TryOnProvider {
  const p = env.TRYON_PROVIDER ?? "replicate";
  if (p === "replicate") return replicateProvider(env);
  throw new TryOnError("not_configured", `Unknown try-on provider ${p}`);
}

export function aiTryOnEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return env.TRYON_AI_ENABLED === "true" && !!env.REPLICATE_API_TOKEN;
}

/** Garments the AI may use. Chosen server-side by slug, so a visitor can't send their own garment. */
const GARMENTS: Record<string, { file: string; description: string }> = {
  "fallen-angel-oversized-tee": { file: "fallen-angel-front.jpg", description: "red and black oversized t-shirt with a crowned stone face print" },
};

export async function loadGarment(slug: string) {
  const g = GARMENTS[slug];
  if (!g) return null;
  const bytes = new Uint8Array(await readFile(path.join(process.cwd(), "lib/tryon/ai/garments", g.file)));
  return { bytes, mime: "image/jpeg", description: g.description };
}
