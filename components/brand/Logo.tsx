import Image from "next/image";

/**
 * Official STREEZØWEAR artwork, unaltered: the brand book's own transparent versions of the
 * primary lockup and the S mark (glow included), so the logo sits directly on any background.
 * Sources: assets/source/brand/*-transparent-PRINT-ONLY.png (crops only, no redraw or recolour).
 */
export function Wordmark({ className = "", priority = false }: { className?: string; priority?: boolean }) {
  return <Image src="/brand/wordmark-t-180.webp" alt="STREEZØWEAR" width={1225} height={180} priority={priority} className={`h-auto ${className}`} />;
}

/** S mark above the wordmark (the primary lockup without its tagline row). */
export function LogoStack({ className = "", priority = false }: { className?: string; priority?: boolean }) {
  return <Image src="/brand/logo-stack-t-480.webp" alt="STREEZØWEAR" width={712} height={480} priority={priority} className={`h-auto ${className}`} />;
}

export function LogoLockup({ className = "", priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/brand/logo-primary-t-900.webp"
      alt="STREEZØWEAR — Own your street, define your style"
      width={900}
      height={659}
      priority={priority}
      className={`h-auto ${className}`}
    />
  );
}

export function SMark({ className = "", size = 64 }: { className?: string; size?: number }) {
  return <Image src="/brand/s-mark-t-512.png" alt="" aria-hidden width={size} height={size} className={className} />;
}
