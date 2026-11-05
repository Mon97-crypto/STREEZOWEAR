"use client";

import { useState } from "react";
import { products } from "@/lib/catalog/data";
import { ARTWORK } from "@/lib/customise/options";
import { artworkRequestSchema, validateArtworkFile } from "@/lib/validation/customise";

/**
 * Artwork-for-quote request. Validation runs here for instant feedback and again on the server.
 * Submission is held until Phase 3 connects private storage (signed upload URLs, type sniffing,
 * size limits, admin-only access) and the request inbox in /admin.
 */
const UPLOADS_LIVE = false;

export function ArtworkRequest() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileErr, setFileErr] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  return (
    <form
      noValidate
      className="grid gap-6 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const r = artworkRequestSchema.safeParse(Object.fromEntries(fd));
        const f = fd.get("artwork");
        const fe = f instanceof File && f.size > 0 ? validateArtworkFile(f) : "Attach your artwork";
        setFileErr(fe);
        setErrors(r.success ? {} : Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])));
        setChecked(r.success && !fe);
      }}
    >
      <Input name="name" label="Name" autoComplete="name" err={errors.name} />
      <Input name="email" label="Email" type="email" autoComplete="email" err={errors.email} />
      <Input name="phone" label="Mobile" type="tel" autoComplete="tel" inputMode="tel" err={errors.phone} />
      <Sel name="garment" label="Base garment" err={errors.garment} options={products.map((p) => [p.slug, p.name])} />
      <Sel name="size" label="Size" err={errors.size} options={["S", "M", "L", "XL"].map((s) => [s, s])} />
      <Input name="quantity" label="Quantity" type="number" inputMode="numeric" defaultValue="1" min={1} max={100} err={errors.quantity} />
      <Sel name="placement" label="Placement" err={errors.placement} options={[["front", "Front"], ["back", "Back (up to 12 in wide)"], ["left-chest", "Left chest"], ["sleeve", "Sleeve"]]} />
      <div>
        <label htmlFor="artwork" className="label mb-2 block text-steel">Artwork file</label>
        <input id="artwork" name="artwork" type="file" accept={ARTWORK.extensions.join(",")} className="field file:mr-4 file:border-0 file:bg-gunmetal file:px-3 file:py-1.5 file:text-chrome" onChange={(e) => { const f = e.target.files?.[0]; setFileErr(f ? validateArtworkFile(f) : null); }} aria-describedby="artwork-help" />
        <p id="artwork-help" className={`mt-2 text-xs ${fileErr ? "text-neon" : "text-steel"}`}>{fileErr ?? `${ARTWORK.guidance} PNG, JPG or PDF, max 15 MB.`}</p>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="notes" className="label mb-2 block text-steel">Notes</label>
        <textarea id="notes" name="notes" rows={4} maxLength={1000} className="field" placeholder="Colours, size on the garment, deadline…" />
      </div>
      <div className="sm:col-span-2">
        <button type="submit" className="btn btn-primary w-full sm:w-auto">{UPLOADS_LIVE ? "Send for quote" : "Check my request"}</button>
        <p className="mt-3 text-sm text-steel" role="status">
          {checked && !UPLOADS_LIVE
            ? "Everything checks out. Secure artwork upload opens shortly. Nothing has been sent yet."
            : "We review every artwork for print quality and rights, then send a quote. Nothing is charged until you approve it."}
        </p>
      </div>
    </form>
  );
}

function Input({ name, label, err, ...rest }: { name: string; label: string; err?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={name} className="label mb-2 block text-steel">{label}</label>
      <input id={name} name={name} className="field" aria-invalid={!!err} aria-describedby={`${name}-err`} {...rest} />
      <p id={`${name}-err`} className="mt-1.5 min-h-4 text-xs text-neon">{err}</p>
    </div>
  );
}

function Sel({ name, label, err, options }: { name: string; label: string; err?: string; options: [string, string][] }) {
  return (
    <div>
      <label htmlFor={name} className="label mb-2 block text-steel">{label}</label>
      <select id={name} name={name} className="field" defaultValue="" aria-invalid={!!err} aria-describedby={`${name}-err`}>
        <option value="" disabled>Choose…</option>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <p id={`${name}-err`} className="mt-1.5 min-h-4 text-xs text-neon">{err}</p>
    </div>
  );
}
