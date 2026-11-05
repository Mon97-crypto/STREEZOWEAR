"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { products } from "@/lib/catalog/data";
import { TEXT_ADDON_PAISE, TEXT_COLOURS, TEXT_PLACEMENTS, TEXT_STYLES, type TextPlacementId } from "@/lib/customise/options";
import { formatINR } from "@/lib/pricing/format";
import { textCustomisationSchema } from "@/lib/validation/customise";
import { useCart } from "@/lib/cart/store";

const ZONES: Record<TextPlacementId, { side: "front" | "back"; x: number; y: number; w: number; rotate?: number }> = {
  "left-chest": { side: "front", x: 128, y: 92, w: 42 },
  "upper-back": { side: "back", x: 100, y: 78, w: 92 },
  sleeve: { side: "front", x: 32, y: 74, w: 34, rotate: 62 },
};

function TeeOutline({ side, children }: { side: "front" | "back"; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 200 220" className="h-auto w-full" role="img" aria-label={`${side} of tee with your text`}>
      <path
        d="M62 14 L38 22 L4 52 L22 86 L44 76 L44 210 L156 210 L156 76 L178 86 L196 52 L162 22 L138 14 C130 28 116 34 100 34 C84 34 70 28 62 14 Z"
        fill="#1a1a1e"
        stroke="#3B3E45"
        strokeWidth="1"
      />
      {side === "front" ? (
        <path d="M62 14 C70 28 84 34 100 34 C116 34 130 28 138 14" fill="none" stroke="#3B3E45" strokeWidth="3" />
      ) : (
        <path d="M66 15 C76 21 88 23 100 23 C112 23 124 21 134 15" fill="none" stroke="#3B3E45" strokeWidth="3" />
      )}
      <text x="100" y="204" textAnchor="middle" fill="#888C96" fontSize="7" letterSpacing="2" fontFamily="JetBrains Mono" fontStyle="italic">
        {side.toUpperCase()}
      </text>
      {children}
    </svg>
  );
}

export function TextCustomiser() {
  const params = useSearchParams();
  const customisable = products.filter((p) => p.isCustomisable);
  const initial = customisable.find((p) => p.slug === params.get("product")) ?? customisable[0]!;

  const [slug, setSlug] = useState(initial.slug);
  const [size, setSize] = useState("");
  const [placement, setPlacement] = useState<TextPlacementId>("left-chest");
  const [style, setStyle] = useState<string>("display");
  const [colour, setColour] = useState<string>("chrome");
  const [text, setText] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const add = useCart((s) => s.add);

  const product = customisable.find((p) => p.slug === slug)!;
  const zone = ZONES[placement];
  const place = TEXT_PLACEMENTS.find((p) => p.id === placement)!;
  const hex = TEXT_COLOURS.find((c) => c.id === colour)!.hex;
  const parsed = useMemo(() => textCustomisationSchema.safeParse({ placement, text, style, colour }), [placement, text, style, colour]);
  const error = text && !parsed.success ? parsed.error.issues[0]?.message : null;
  const priced = TEXT_ADDON_PAISE !== null;

  function addToBag() {
    if (!parsed.success) return setMsg(parsed.error.issues[0]?.message ?? "Check your text");
    const v = product.variants.find((x) => x.size === size);
    if (!v) return setMsg("Pick a size");
    const r = add({ slug: product.slug, sku: v.sku, size: v.size, colour: v.colour, qty: 1, custom: parsed.data });
    setMsg(r.added ? null : "That size is sold out.");
  }

  const fontSize = Math.max(7, Math.min(16, (zone.w / Math.max(text.length, 4)) * 1.7));

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="sticky top-24 self-start border border-gunmetal bg-carbon p-6 sm:p-10">
        <TeeOutline side={zone.side}>
          <rect x={zone.x - zone.w / 2} y={zone.y - 10} width={zone.w} height={20} fill="none" stroke="#FF1E3C" strokeDasharray="2 2" strokeWidth=".6" opacity={text ? 0 : 0.8} transform={zone.rotate ? `rotate(${zone.rotate} ${zone.x} ${zone.y})` : undefined} />
          <text
            x={zone.x}
            y={zone.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={hex}
            fontSize={fontSize}
            fontFamily={style === "display" ? "Archivo" : "JetBrains Mono"}
            fontWeight={style === "display" ? 900 : 500}
            fontStyle="italic"
            letterSpacing={style === "mono" ? 1.5 : -0.3}
            transform={zone.rotate ? `rotate(${zone.rotate} ${zone.x} ${zone.y})` : undefined}
            style={colour === "neon" ? { filter: "drop-shadow(0 0 2px rgb(255 30 60 / .8))" } : undefined}
          >
            {(text || "YOUR NAME").toUpperCase()}
          </text>
        </TeeOutline>
        <p className="label mt-4 text-center text-[0.65rem] text-steel">Preview — placement and scale are indicative</p>
      </div>

      <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); addToBag(); }}>
        <Field label="Base piece">
          <select className="field" aria-label="Base piece" value={slug} onChange={(e) => setSlug(e.target.value)}>
            {customisable.map((p) => <option key={p.slug} value={p.slug}>{p.name} — {formatINR(p.pricePaise)}</option>)}
          </select>
        </Field>
        <Field label="Size">
          <div className="grid grid-cols-4 gap-2">
            {product.sizes.map((s) => (
              <button key={s} type="button" aria-pressed={size === s} onClick={() => setSize(s)} className={`label h-12 border ${size === s ? "border-neon bg-neon text-void" : "border-gunmetal hover:border-chrome"}`}>{s}</button>
            ))}
          </div>
        </Field>
        <Field label="Placement">
          <div className="grid gap-2 sm:grid-cols-3">
            {TEXT_PLACEMENTS.map((p) => (
              <button key={p.id} type="button" aria-pressed={placement === p.id} onClick={() => setPlacement(p.id)} className={`border p-3 text-left ${placement === p.id ? "border-neon" : "border-gunmetal hover:border-steel"}`}>
                <span className="label block text-[0.7rem]">{p.label}</span>
                <span className="mt-1 block text-xs text-steel">{p.note} · max {p.maxChars}</span>
              </button>
            ))}
          </div>
        </Field>
        <Field label={`Your text — ${text.length}/${place.maxChars}`}>
          <input className="field uppercase" aria-label="Your text" value={text} maxLength={place.maxChars} onChange={(e) => setText(e.target.value)} placeholder="YOUR NAME" aria-invalid={!!error} aria-describedby="text-err" autoComplete="off" />
          <p id="text-err" className="mt-2 min-h-5 text-sm text-neon">{error}</p>
        </Field>
        <div className="grid gap-8 sm:grid-cols-2">
          <Field label="Style">
            <div className="flex gap-2">
              {TEXT_STYLES.map((s) => (
                <button key={s.id} type="button" aria-pressed={style === s.id} onClick={() => setStyle(s.id)} className={`h-12 flex-1 border ${s.className} text-sm ${style === s.id ? "border-neon" : "border-gunmetal"}`}>{s.label}</button>
              ))}
            </div>
          </Field>
          <Field label="Colour">
            <div className="flex gap-2">
              {TEXT_COLOURS.map((c) => (
                <button key={c.id} type="button" aria-pressed={colour === c.id} onClick={() => setColour(c.id)} className={`label flex h-12 flex-1 items-center justify-center gap-2 border text-[0.65rem] ${colour === c.id ? "border-neon" : "border-gunmetal"}`}>
                  <span className="h-3 w-3" style={{ background: c.hex }} />{c.label}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <div className="border-t border-gunmetal pt-6">
          <div className="mb-4 flex justify-between text-sm">
            <span className="text-steel">{product.name} + custom text</span>
            <span className="text-neon">{priced ? formatINR(product.pricePaise + TEXT_ADDON_PAISE!) : `${formatINR(product.pricePaise)} + add-on`}</span>
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={!priced}>Add custom piece to bag</button>
          <p className="mt-3 text-xs leading-relaxed text-steel" role="status">
            {msg ?? (priced ? "Made to order. Custom pieces can't be returned unless faulty." : "Custom text pricing is being finalised. The preview works now; ordering opens shortly.")}
          </p>
          <p className="mt-2 text-xs text-steel">Every custom order is checked by our team before printing. <Link href="/returns" className="text-neon">Returns policy</Link></p>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label mb-3 text-steel">{label}</p>
      {children}
    </div>
  );
}
