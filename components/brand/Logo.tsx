import Image from "next/image";

/** Fades only the outer few % of the artwork's Void background, so no box edge shows over film/haze. */
const EDGE_FADE: React.CSSProperties = {
  WebkitMaskImage:
    "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent), linear-gradient(to bottom, transparent, #000 7%, #000 93%, transparent)",
  maskImage:
    "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent), linear-gradient(to bottom, transparent, #000 7%, #000 93%, transparent)",
  WebkitMaskComposite: "source-in",
  maskComposite: "intersect",
};

/**
 * Official STREEZØWEAR artwork, unaltered (extracted from the brand book).
 * The files sit on Void (#07070A); `mix-blend-lighten` hides that box when the mark floats over video.
 */
export function Wordmark({ className = "", priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/brand/wordmark-sm.webp"
      alt="STREEZØWEAR"
      width={725}
      height={90}
      priority={priority}
      className={`h-auto mix-blend-lighten ${className}`}
      style={EDGE_FADE}
    />
  );
}

/** Official S mark above the wordmark (the primary lockup without its tagline row). */
export function LogoStack({ className = "", priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/brand/logo-stack-240.webp"
      alt="STREEZØWEAR"
      width={364}
      height={240}
      priority={priority}
      className={`h-auto mix-blend-lighten ${className}`}
      style={EDGE_FADE}
    />
  );
}

export function LogoLockup({ className = "", priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/brand/logo-primary-900.webp"
      alt="STREEZØWEAR — Own your street, define your style"
      width={900}
      height={900}
      priority={priority}
      className={`h-auto mix-blend-lighten ${className}`}
      style={EDGE_FADE}
    />
  );
}

export function SMark({ className = "", size = 64 }: { className?: string; size?: number }) {
  return (
    <Image src="/brand/s-mark.webp" alt="" aria-hidden width={size} height={size} className={`mix-blend-lighten ${className}`} />
  );
}
