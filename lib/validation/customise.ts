import { z } from "zod";
import { ARTWORK, TEXT_ALLOWED, TEXT_COLOURS, TEXT_PLACEMENTS, TEXT_STYLES } from "@/lib/customise/options";

const placementIds = TEXT_PLACEMENTS.map((p) => p.id) as [string, ...string[]];

export const textCustomisationSchema = z
  .object({
    placement: z.enum(placementIds),
    text: z.string().trim().min(1, "Add your text").regex(TEXT_ALLOWED, "Letters, numbers and . - & ' ! # only"),
    style: z.enum(TEXT_STYLES.map((s) => s.id) as [string, ...string[]]),
    colour: z.enum(TEXT_COLOURS.map((c) => c.id) as [string, ...string[]]),
  })
  .superRefine((v, ctx) => {
    const max = TEXT_PLACEMENTS.find((p) => p.id === v.placement)?.maxChars ?? 0;
    if (v.text.length > max) ctx.addIssue({ code: "custom", path: ["text"], message: `Max ${max} characters here` });
  });

export type TextCustomisation = z.infer<typeof textCustomisationSchema>;

export const artworkRequestSchema = z.object({
  name: z.string().trim().min(2, "Your name").max(80),
  email: z.email("A valid email"),
  phone: z
    .string()
    .trim()
    .regex(/^(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/, "A valid Indian mobile number"),
  garment: z.string().min(1, "Pick a base garment"),
  size: z.string().min(1, "Pick a size"),
  quantity: z.coerce.number().int().min(1).max(100),
  placement: z.enum(["front", "back", "left-chest", "sleeve"]),
  notes: z.string().trim().max(1000).optional().default(""),
});

export type ArtworkRequest = z.infer<typeof artworkRequestSchema>;

export function validateArtworkFile(file: { name: string; type: string; size: number }): string | null {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!ARTWORK.extensions.includes(ext) || !ARTWORK.mimeTypes.includes(file.type)) return "PNG, JPG or PDF only";
  if (file.size > ARTWORK.maxBytes) return "Max 15 MB";
  if (file.size === 0) return "That file is empty";
  return null;
}
