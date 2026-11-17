"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MAX_PHOTO_BYTES, PHOTO_TYPES, type TryOnPiece } from "@/lib/tryon/config";

/**
 * Realistic try-on, one step: tick consent, add a photo, and the AI result appears.
 * The photo is resized in the browser (≤1024 px JPEG) and sent once to our server, which passes it
 * to the AI provider and keeps nothing. The page keeps it only in memory until the visitor leaves.
 */
type State =
  | { s: "idle" }
  | { s: "working"; photo: string }
  | { s: "done"; photo: string; result: string }
  | { s: "error"; photo?: string; msg: string };

const SEND_PX = 1024;

async function prepare(file: File): Promise<{ blob: Blob; preview: string }> {
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const k = Math.min(1, SEND_PX / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close();
  const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/jpeg", 0.88));
  c.width = c.height = 0;
  if (!blob) throw new Error("encode");
  return { blob, preview: URL.createObjectURL(blob) };
}

async function runTryOn(blob: Blob, slug: string, signal: AbortSignal): Promise<string> {
  const fd = new FormData();
  fd.append("photo", blob, "photo.jpg");
  fd.append("slug", slug);
  fd.append("consent", "yes");
  type R = { status?: string; id?: string; image?: string; error?: string };
  const res = await fetch("/api/try-on", { method: "POST", body: fd, cache: "no-store", signal });
  let j = (await res.json().catch(() => ({}))) as R;
  if (!res.ok && res.status !== 202) throw new Error(j.error ?? "Realistic try-on is unavailable right now.");
  // the job may still be queued: check back every 2 s for up to 2 minutes
  const until = Date.now() + 120_000;
  while (!j.image && j.id && Date.now() < until) {
    await new Promise((r) => setTimeout(r, 2000));
    if (signal.aborted) throw new DOMException("aborted", "AbortError");
    const id: string = j.id;
    const r = await fetch(`/api/try-on?id=${encodeURIComponent(id)}`, { cache: "no-store", signal });
    j = { id, ...((await r.json().catch(() => ({}))) as R) };
    if (!r.ok && r.status !== 202) throw new Error(j.error ?? "Realistic try-on is unavailable right now.");
  }
  if (!j.image) {
    if (j.id) fetch(`/api/try-on?id=${encodeURIComponent(j.id)}`, { method: "DELETE" }).catch(() => {});
    throw new Error("That took too long. Please try again.");
  }
  return j.image;
}

export function TryOnRealistic({ piece }: { piece: TryOnPiece }) {
  const [consent, setConsent] = useState(false);
  const [st, setSt] = useState<State>({ s: "idle" });
  const [showOriginal, setShowOriginal] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const previewUrl = useRef<string | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  // keep the photo in view when the try-on starts and when it's ready (on phones the buttons sit below it)
  useEffect(() => {
    if (st.s === "working" || st.s === "done") stage.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [st.s]);
  const tee = piece.views.find((v) => v.id === "front") ?? piece.views[0]!;

  const dropPhoto = () => {
    abort.current?.abort();
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = null;
  };
  // forget everything when leaving the page
  useEffect(() => dropPhoto, []);

  async function onFile(file: File | undefined) {
    if (!file || !consent) return;
    if (file.size > MAX_PHOTO_BYTES) return setSt({ s: "error", msg: "That photo is over 25 MB. Try a smaller one." });
    if (file.type && !PHOTO_TYPES.includes(file.type)) return setSt({ s: "error", msg: "Use a JPG, PNG or WebP photo." });
    dropPhoto();
    let prepared: { blob: Blob; preview: string };
    try { prepared = await prepare(file); } catch { return setSt({ s: "error", msg: "We couldn't open that photo. Try a JPG or PNG." }); }
    previewUrl.current = prepared.preview;
    setShowOriginal(false);
    setSt({ s: "working", photo: prepared.preview });
    const ac = new AbortController();
    abort.current = ac;
    try {
      const result = await runTryOn(prepared.blob, piece.slug, ac.signal);
      if (!ac.signal.aborted) setSt({ s: "done", photo: prepared.preview, result });
    } catch (e) {
      if (ac.signal.aborted) return;
      setSt({ s: "error", photo: prepared.preview, msg: e instanceof Error ? e.message : "Realistic try-on is unavailable right now." });
    }
  }

  function reset() { dropPhoto(); setSt({ s: "idle" }); }

  function save() {
    if (st.s !== "done") return;
    const a = document.createElement("a");
    a.href = st.result; a.download = `streezowear-${piece.slug}-try-on.jpg`; a.click();
  }

  const picker = (label: string, capture?: boolean, primary = true) => (
    <label className={`btn ${primary ? "btn-primary" : "btn-ghost"} ${consent ? "cursor-pointer" : "pointer-events-none opacity-40"} ${capture ? "sm:hidden" : ""}`} aria-disabled={!consent}>
      {label}
      <input
        type="file"
        accept={capture ? "image/*" : "image/jpeg,image/png,image/webp,image/heic,image/heif"}
        {...(capture ? { capture: "user" as const } : {})}
        disabled={!consent}
        className="sr-only"
        onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }}
      />
    </label>
  );

  const shown = st.s === "done" ? (showOriginal ? st.photo : st.result) : st.s === "working" || st.s === "error" ? st.photo : undefined;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr]">
      <div>
        <div ref={stage} className={`relative grid scroll-mt-28 place-items-center overflow-hidden border border-gunmetal bg-carbon ${shown ? "" : "aspect-[4/5]"}`}>
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shown}
              alt={st.s === "done" && !showOriginal ? `AI-generated image of you wearing the ${piece.name} tee` : "Your photo"}
              className={`max-h-[80svh] w-auto max-w-full transition-[filter,opacity] duration-500 ${st.s === "working" ? "opacity-60 blur-[2px]" : ""}`}
            />
          ) : (
            <div className="flex flex-col items-center gap-6 p-8 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={tee.src} alt="" aria-hidden className="w-40 opacity-90 drop-shadow-[0_20px_30px_rgba(0,0,0,.6)]" />
              <p className="display text-3xl">Your photo here.</p>
              <p className="max-w-xs text-sm text-steel">Face the camera, upper body in frame, good light. One person only.</p>
            </div>
          )}

          {st.s === "working" && (
            <div className="absolute inset-0 grid place-items-center" role="status" aria-live="polite">
              <div aria-hidden className="sw-scan absolute inset-x-0 h-0.5 bg-neon shadow-[0_0_24px_var(--sw-neon-glow)]" style={{ animationDuration: "1.8s" }} />
              <p className="label border border-neon/60 bg-void/80 px-4 py-3 text-neon">Putting the {piece.name} on you…</p>
            </div>
          )}
          {st.s === "done" && (
            <span className="label absolute left-3 top-3 border border-gunmetal bg-void/70 px-2 py-1 text-[0.6rem] text-steel">
              {showOriginal ? "Your photo" : "AI try-on"}
            </span>
          )}
        </div>
        {st.s === "error" && <p className="mt-3 text-sm text-neon" role="alert">{st.msg}</p>}
        <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-steel">
          <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-neon" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden><rect x="5" y="11" width="14" height="9" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
          Your photo is sent once to our AI provider to make this image. We don&apos;t store it, and the provider deletes it automatically within an hour.
        </p>
      </div>

      <div className="space-y-7">
        <div>
          <p className="label text-neon">Trying on</p>
          <p className="display mt-2 text-3xl">{piece.name}</p>
        </div>

        {st.s === "idle" || st.s === "error" ? (
          <div className="space-y-5">
            <label className="flex gap-3 border border-gunmetal bg-carbon p-4 text-sm leading-relaxed text-steel">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[var(--sw-neon)]" />
              <span>This is a photo of me (or I have permission), I&apos;m 18 or older, and I agree to it being sent to STREEZØWEAR&apos;s AI provider to create my try-on. It isn&apos;t stored and is deleted automatically within an hour. <Link href="/privacy" className="text-neon">Privacy</Link></span>
            </label>
            <div className="flex flex-wrap gap-3">
              {picker(st.s === "error" && st.photo ? "Try another photo" : "Upload a photo")}
              {picker("Take a photo", true, false)}
            </div>
            {!consent && <p className="text-xs text-steel">Tick the box to add your photo.</p>}
          </div>
        ) : st.s === "working" ? (
          <p className="text-sm leading-relaxed text-steel">Usually takes about 5–10 seconds.</p>
        ) : (
          <div className="space-y-3">
            <button type="button" className="btn btn-ghost w-full" onClick={() => setShowOriginal((v) => !v)}>
              {showOriginal ? "Show the try-on" : "Compare with my photo"}
            </button>
            <button type="button" className="btn btn-ghost w-full" onClick={save}>Save picture</button>
            <button type="button" className="btn btn-ghost w-full" onClick={reset}>Try another photo</button>
            <p className="text-xs text-steel">AI-generated preview. Colours and fit are approximate.</p>
          </div>
        )}

        <div className="border-t border-gunmetal pt-6">
          <Link href={`/products/${piece.slug}`} className="btn btn-primary w-full">Like it? Get the {piece.name}</Link>
          <p className="mt-3 text-xs leading-relaxed text-steel">Real fit and drape depend on your size, so check the size guide.</p>
        </div>
      </div>
    </div>
  );
}
