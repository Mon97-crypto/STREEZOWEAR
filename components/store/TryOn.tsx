"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_PHOTO_BYTES, MAX_PHOTO_PX, PHOTO_TYPES, type TryOnPiece } from "@/lib/tryon/config";
import { defaultFit, fitTee, type Fit } from "@/lib/tryon/fit";

/**
 * Try-on. Everything happens in this browser tab:
 * the photo is read from the device, drawn on a canvas, the body is found by a model that
 * runs locally (files served from this site), and the tee is drawn on top.
 * The photo is never sent anywhere and is not saved: closing or leaving the page drops it.
 */

type Status = "empty" | "loading" | "ready";

async function detectBody(source: HTMLCanvasElement) {
  const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
  const files = await FilesetResolver.forVisionTasks("/vendor/mediapipe");
  const lm = await PoseLandmarker.createFromOptions(files, {
    baseOptions: { modelAssetPath: "/vendor/mediapipe/pose_landmarker_lite.task", delegate: "CPU" },
    runningMode: "IMAGE",
    numPoses: 1,
  });
  try {
    const p = lm.detect(source).landmarks[0];
    if (!p) return null;
    const W = source.width, H = source.height;
    const pt = (i: number) => ({ x: p[i]!.x * W, y: p[i]!.y * H, z: p[i]!.z * W, v: p[i]!.visibility ?? 0 });
    const [ls, rs, lh, rh] = [pt(11), pt(12), pt(23), pt(24)];
    if (ls.v < 0.5 || rs.v < 0.5) return null;
    const hips = lh.v > 0.5 && rh.v > 0.5 && lh.y < H * 1.05 && rh.y < H * 1.05 ? ([lh, rh] as [typeof lh, typeof rh]) : null;
    return { shoulders: [ls, rs] as const, hips };
  } finally {
    lm.close();
  }
}

export function TryOn({ piece }: { piece: TryOnPiece }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photoRef = useRef<HTMLCanvasElement | null>(null); // the resized photo, kept in memory only
  const teeRef = useRef<Record<string, HTMLImageElement>>({});
  const [status, setStatus] = useState<Status>("empty");
  const [viewId, setViewId] = useState(piece.views[0]!.id);
  const [fit, setFit] = useState<Fit | null>(null);
  const [auto, setAuto] = useState<Fit | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const view = piece.views.find((v) => v.id === viewId)!;
  const drag = useRef<{ x: number; y: number } | null>(null);

  // load the tee images once
  useEffect(() => {
    for (const v of piece.views) {
      const img = new Image();
      img.src = v.src;
      img.onload = () => { teeRef.current[v.id] = img; draw(); };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [piece]);

  const draw = useCallback(() => {
    const c = canvasRef.current, photo = photoRef.current;
    if (!c || !photo || !fit) return;
    const ctx = c.getContext("2d")!;
    c.width = photo.width; c.height = photo.height;
    ctx.drawImage(photo, 0, 0);
    const tee = teeRef.current[view.id];
    if (!tee) return;
    const w = fit.width, h = w * view.anchor.aspect * fit.stretch;
    ctx.save();
    ctx.translate(fit.cx, fit.cy);
    ctx.rotate(fit.angle);
    ctx.scale(fit.turn, 1);
    ctx.shadowColor = "rgba(0,0,0,.45)";
    ctx.shadowBlur = w * 0.04;
    ctx.shadowOffsetY = w * 0.015;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(tee, -w * view.anchor.collarX, -h * view.anchor.collarY, w, h);
    ctx.restore();
  }, [fit, view]);

  useEffect(draw, [draw]);

  // drop the photo when leaving the page
  useEffect(() => () => { photoRef.current = null; }, []);

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
      let f: Fit;
      try {
        const body = await detectBody(photo);
        if (body) {
          f = fitTee(body.shoulders[0], body.shoulders[1], body.hips, view.anchor);
          setNote("Fitted to your shoulders. Drag the tee or use the sliders to fine-tune.");
        } else {
          f = defaultFit(photo.width, photo.height);
          setNote("We couldn't find your shoulders in this photo. Drag the tee into place, or try a front-facing photo.");
        }
      } catch {
        f = defaultFit(photo.width, photo.height);
        setNote("Automatic fit isn't available on this device. Drag the tee into place.");
      }
      setAuto(f); setFit(f); setStatus("ready");
    } catch {
      setStatus("empty");
      setError("We couldn't open that photo. Try a JPG or PNG.");
    }
  }

  function clear() {
    photoRef.current = null;
    const c = canvasRef.current;
    if (c) { c.getContext("2d")!.clearRect(0, 0, c.width, c.height); c.width = c.height = 0; }
    setFit(null); setAuto(null); setStatus("empty"); setNote(null);
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
  const upd = (p: Partial<Fit>) => setFit((f) => (f ? { ...f, ...p } : f));

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
              if (!drag.current || !fit) return;
              const k = scale();
              upd({ cx: fit.cx + (e.clientX - drag.current.x) * k, cy: fit.cy + (e.clientY - drag.current.y) * k });
              drag.current = { x: e.clientX, y: e.clientY };
            }}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
          />
          {status !== "ready" && (
            <div className="flex flex-col items-center gap-5 p-8 text-center">
              {status === "loading" ? (
                <p className="label text-neon" role="status">Fitting the tee…</p>
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
          Your photo never leaves your device. It isn&apos;t uploaded, saved or shared: the fitting runs inside your browser, and the photo is gone when you close or leave this page.
        </p>
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
          <Slider label="Size" min={0.5} max={1.8} step={0.01} value={fit && auto ? fit.width / auto.width : 1} onChange={(v) => auto && upd({ width: auto.width * v })} />
          <Slider label="Length" min={0.8} max={1.4} step={0.01} value={fit?.stretch ?? 1} onChange={(v) => upd({ stretch: v })} />
          <Slider label="Tilt" min={-25} max={25} step={0.5} value={fit ? (fit.angle * 180) / Math.PI : 0} onChange={(v) => upd({ angle: (v * Math.PI) / 180 })} />
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn btn-ghost" onClick={() => auto && setFit(auto)}>Reset fit</button>
            <button type="button" className="btn btn-ghost" onClick={save}>Save picture</button>
            <button type="button" className="btn btn-ghost" onClick={clear}>Remove photo</button>
          </div>
        </fieldset>

        <div className="border-t border-gunmetal pt-6">
          <Link href={`/products/${piece.slug}`} className="btn btn-primary w-full">Like it? Get the {piece.name}</Link>
          <p className="mt-3 text-xs leading-relaxed text-steel">A preview to help you picture it. Real fit and drape depend on your size, so check the size guide.</p>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, onChange, ...rest }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  const id = `tryon-${label.toLowerCase()}`;
  return (
    <div>
      <label htmlFor={id} className="label mb-2 block text-steel">{label}</label>
      <input id={id} type="range" value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-11 w-full accent-[var(--sw-neon)]" {...rest} />
    </div>
  );
}
