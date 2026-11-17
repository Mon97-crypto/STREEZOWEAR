"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { analyse, cutGarment, render, type Analysis } from "@/components/tryon/render";
import { MAX_PHOTO_BYTES, MAX_PHOTO_PX, PHOTO_TYPES, type TryOnPiece } from "@/lib/tryon/config";
import { buildMesh, NO_ADJUST, type Adjust, type Body } from "@/lib/tryon/mesh";

/**
 * Try-on. The instant version happens entirely in this browser tab: the photo is read from the
 * device, the body and its parts are found by models that run locally (files served from this site),
 * the tee is warped to the body, lit by the photo, and hair/hands are put back in front.
 * The photo is never sent anywhere by this part and is not saved.
 */

type Status = "empty" | "loading" | "ready";

/** a centred, front-on stand-in body when none was found, so the tee can still be placed by hand */
function stagedBody(w: number, h: number): Body {
  const sw = Math.min(w * 0.36, h * 0.3), cx = w / 2, y = h * 0.45;
  return { shoulderL: { x: cx - sw / 2, y }, shoulderR: { x: cx + sw / 2, y }, hipL: null, hipR: null, elbowL: null, elbowR: null, turn: 1 };
}

export function TryOn({ piece, aiEnabled = false }: { piece: TryOnPiece; aiEnabled?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photoRef = useRef<HTMLCanvasElement | null>(null); // the resized photo, kept in memory only
  const analysisRef = useRef<Analysis | null>(null);
  const teeRef = useRef<Record<string, HTMLImageElement>>({});
  const [status, setStatus] = useState<Status>("empty");
  const [viewId, setViewId] = useState(piece.views[0]!.id);
  const [body, setBody] = useState<Body | null>(null);
  const [adj, setAdj] = useState<Adjust>(NO_ADJUST);
  const [realism, setRealism] = useState(0.8);
  const [teeReady, setTeeReady] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const view = piece.views.find((v) => v.id === viewId)!;
  const drag = useRef<{ x: number; y: number } | null>(null);
  const frame = useRef(0);
  const [consent, setConsent] = useState(false);
  const [ai, setAi] = useState<{ state: "idle" | "working" | "done" | "error"; image?: string; msg?: string }>({ state: "idle" });

  // load the tee images once
  useEffect(() => {
    for (const v of piece.views) {
      const img = new Image();
      img.src = v.src;
      img.onload = () => { teeRef.current[v.id] = img; setTeeReady((n) => n + 1); };
    }
  }, [piece]);

  const draw = useCallback(() => {
    const c = canvasRef.current, photo = photoRef.current, an = analysisRef.current, tee = teeRef.current[view.id];
    if (!c || !photo || !an || !body || !tee) return;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => render(c, photo, cutGarment(tee, view.spec), buildMesh(view.spec, body, adj), an, { realism }));
  }, [body, adj, view, realism]);

  useEffect(draw, [draw, teeReady]);

  // drop the photo and everything derived from it when leaving the page
  useEffect(() => () => { photoRef.current = null; analysisRef.current = null; }, []);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null); setNote(null);
    if (file.size > MAX_PHOTO_BYTES) return setError("That photo is over 25 MB. Try a smaller one.");
    if (file.type && !PHOTO_TYPES.includes(file.type)) return setError("Use a JPG, PNG or WebP photo.");
    setStatus("loading");
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
      const k = Math.min(1, MAX_PHOTO_PX / Math.max(bmp.width, bmp.height));
      const photo = document.createElement("canvas");
      photo.width = Math.round(bmp.width * k); photo.height = Math.round(bmp.height * k);
      photo.getContext("2d")!.drawImage(bmp, 0, 0, photo.width, photo.height);
      bmp.close();
      photoRef.current = photo;
      let found: Body | null = null;
      try {
        const an = await analyse(photo);
        analysisRef.current = an;
        found = an.body;
        setNote(found
          ? "Fitted to your body: shoulders, torso and arms. Drag or use the sliders to fine-tune."
          : "We couldn't find your shoulders in this photo. Drag the tee into place, or try a front-facing photo.");
      } catch {
        analysisRef.current = { body: null, occlusion: null, shading: photo };
        setRealism(0);
        setNote("Automatic fit isn't available on this device. Drag the tee into place.");
      }
      setBody(found ?? stagedBody(photo.width, photo.height));
      setAdj(NO_ADJUST);
      setStatus("ready");
    } catch {
      setStatus("empty");
      setError("We couldn't open that photo. Try a JPG or PNG.");
    }
  }

  async function makeRealistic() {
    const photo = photoRef.current;
    if (!photo || !consent) return;
    setAi({ state: "working" });
    // send a fresh ≤1024 px JPEG of the original photo (no overlay); nothing is kept here either
    const k = Math.min(1, 1024 / Math.max(photo.width, photo.height));
    const c = document.createElement("canvas");
    c.width = Math.round(photo.width * k); c.height = Math.round(photo.height * k);
    c.getContext("2d")!.drawImage(photo, 0, 0, c.width, c.height);
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/jpeg", 0.88));
    c.width = c.height = 0;
    if (!blob) return setAi({ state: "error", msg: "Couldn't prepare the photo." });
    const fd = new FormData();
    fd.append("photo", blob, "photo.jpg");
    fd.append("slug", piece.slug);
    fd.append("consent", "yes");
    try {
      const res = await fetch("/api/try-on", { method: "POST", body: fd, cache: "no-store" });
      const j = (await res.json().catch(() => ({}))) as { image?: string; error?: string };
      if (!res.ok || !j.image) return setAi({ state: "error", msg: j.error ?? "Realistic try-on is unavailable right now." });
      setAi({ state: "done", image: j.image });
    } catch {
      setAi({ state: "error", msg: "Couldn't reach the server. Check your connection." });
    }
  }

  function saveAi() {
    if (!ai.image) return;
    const a = document.createElement("a");
    a.href = ai.image; a.download = `streezowear-${piece.slug}-realistic.jpg`; a.click();
  }

  function clear() {
    setAi({ state: "idle" }); setConsent(false);
    photoRef.current = null; analysisRef.current = null;
    const c = canvasRef.current;
    if (c) { c.getContext("2d")!.clearRect(0, 0, c.width, c.height); c.width = c.height = 0; }
    setBody(null); setAdj(NO_ADJUST); setStatus("empty"); setNote(null);
  }

  function save() {
    canvasRef.current?.toBlob((b) => {
      if (!b) return;
      const url = URL.createObjectURL(b);
      const a = document.createElement("a");
      a.href = url; a.download = `streezowear-${piece.slug}-try-on.jpg`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }, "image/jpeg", 0.92);
  }

  const scale = () => { const c = canvasRef.current!; return c.width / c.getBoundingClientRect().width; };
  const upd = (p: Partial<Adjust>) => setAdj((a) => ({ ...a, ...p }));

  return (
    <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr]">
      <div>
        <div className={`relative grid place-items-center overflow-hidden border border-gunmetal bg-carbon ${status === "ready" ? "" : "aspect-[4/5]"}`}>
          <canvas
            ref={canvasRef}
            className={`max-h-[80svh] w-auto max-w-full touch-none ${status === "ready" ? "block cursor-grab active:cursor-grabbing" : "hidden"}`}
            role="img"
            aria-label={`Your photo wearing the ${piece.name} tee`}
            onPointerDown={(e) => { drag.current = { x: e.clientX, y: e.clientY }; e.currentTarget.setPointerCapture(e.pointerId); }}
            onPointerMove={(e) => {
              if (!drag.current) return;
              const k = scale(), dx = (e.clientX - drag.current.x) * k, dy = (e.clientY - drag.current.y) * k;
              setAdj((a) => ({ ...a, dx: a.dx + dx, dy: a.dy + dy }));
              drag.current = { x: e.clientX, y: e.clientY };
            }}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
          />
          {status !== "ready" && (
            <div className="flex flex-col items-center gap-5 p-8 text-center">
              {status === "loading" ? (
                <p className="label text-neon" role="status">Reading your pose and fitting the tee…</p>
              ) : (
                <>
                  <p className="display text-3xl">Your photo here.</p>
                  <p className="max-w-xs text-sm text-steel">Stand facing the camera, shoulders in frame, arms relaxed. Good light helps.</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <label className="btn btn-primary cursor-pointer">
                      Upload a photo
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" className="sr-only" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
                    </label>
                    <label className="btn btn-ghost cursor-pointer sm:hidden">
                      Take a photo
                      <input type="file" accept="image/*" capture="user" className="sr-only" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
                    </label>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <p className="mt-3 text-sm text-neon" role="alert">{error}</p>
        <p className="mt-1 flex items-start gap-2 text-xs leading-relaxed text-steel">
          <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-neon" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden><rect x="5" y="11" width="14" height="9" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
          {aiEnabled
            ? "The instant preview runs on your device and nothing is uploaded. The realistic version sends your photo to our AI provider only when you ask for it; we don't keep it, and the provider deletes it automatically within an hour."
            : "Your photo never leaves your device. It isn't uploaded, saved or shared: the fitting runs inside your browser, and the photo is gone when you close or leave this page."}
        </p>
        {ai.state === "done" && ai.image && (
          <figure className="mt-8">
            <figcaption className="label mb-3 text-neon">Realistic try-on</figcaption>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ai.image} alt={`AI-generated image of you wearing the ${piece.name} tee`} className="w-full border border-gunmetal" />
            <p className="mt-2 text-xs text-steel">AI-generated preview. Colours and fit are approximate.</p>
          </figure>
        )}
      </div>

      <div className="space-y-7">
        <div>
          <p className="label text-neon">Trying on</p>
          <p className="display mt-2 text-3xl">{piece.name}</p>
        </div>

        <div>
          <p className="label mb-3 text-steel">Side</p>
          <div className="flex gap-2">
            {piece.views.map((v) => (
              <button key={v.id} type="button" aria-pressed={v.id === viewId} onClick={() => setViewId(v.id)} className={`label h-12 flex-1 border ${v.id === viewId ? "border-neon bg-neon text-void" : "border-gunmetal hover:border-chrome"}`}>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <fieldset disabled={status !== "ready"} className="space-y-5 disabled:opacity-40">
          <p className="min-h-10 text-sm text-steel" role="status">{note ?? "Upload a photo to start."}</p>
          <Slider label="Size" min={0.6} max={1.6} step={0.01} value={adj.scale} onChange={(v) => upd({ scale: v })} />
          <Slider label="Length" min={0.8} max={1.3} step={0.01} value={adj.length} onChange={(v) => upd({ length: v })} />
          <Slider label="Tilt" min={-20} max={20} step={0.5} value={adj.tilt} onChange={(v) => upd({ tilt: v })} />
          <Slider label="Realism (light and folds)" min={0} max={1} step={0.05} value={realism} onChange={setRealism} />
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn btn-ghost" onClick={() => setAdj(NO_ADJUST)}>Reset fit</button>
            <button type="button" className="btn btn-ghost" onClick={save}>Save picture</button>
            <button type="button" className="btn btn-ghost" onClick={clear}>Remove photo</button>
          </div>
        </fieldset>

        {aiEnabled && (
          <div className="border border-neon/60 bg-carbon p-5" aria-live="polite">
            <p className="label text-neon">Make it realistic</p>
            <p className="mt-2 text-sm leading-relaxed text-steel">AI redraws your photo with you wearing the {piece.name}, front view. Takes up to a minute.</p>
            <label className="mt-4 flex gap-3 text-sm leading-relaxed text-steel">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} disabled={status !== "ready"} className="mt-1 h-5 w-5 shrink-0 accent-[var(--sw-neon)]" />
              <span>This is a photo of me (or I have permission), I&apos;m 18 or older, and I agree to it being sent to STREEZØWEAR&apos;s AI provider to make this image. It is not stored and is deleted automatically within an hour. <Link href="/privacy" className="text-neon">Privacy</Link></span>
            </label>
            <button type="button" className="btn btn-primary mt-4 w-full" disabled={status !== "ready" || !consent || ai.state === "working"} onClick={makeRealistic}>
              {ai.state === "working" ? "Creating… up to a minute" : ai.state === "done" ? "Create again" : "Make it realistic"}
            </button>
            {ai.state === "error" && <p className="mt-3 text-sm text-neon" role="alert">{ai.msg}</p>}
            {ai.state === "done" && <button type="button" className="btn btn-ghost mt-3 w-full" onClick={saveAi}>Save realistic picture</button>}
          </div>
        )}

        <div className="border-t border-gunmetal pt-6">
          <Link href={`/products/${piece.slug}`} className="btn btn-primary w-full">Like it? Get the {piece.name}</Link>
          <p className="mt-3 text-xs leading-relaxed text-steel">A preview to help you picture it. Real fit and drape depend on your size, so check the size guide.</p>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, onChange, ...rest }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  const id = `tryon-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`;
  return (
    <div>
      <label htmlFor={id} className="label mb-2 block text-steel">{label}</label>
      <input id={id} type="range" value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-11 w-full accent-[var(--sw-neon)]" {...rest} />
    </div>
  );
}
