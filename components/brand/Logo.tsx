import Image from "next/image";

/**
 * Official STREEZØWEAR artwork, unaltered (extracted from the brand book).
 * The files sit on Void (#07070A); `mix-blend-screen` hides that box when the mark floats over video.
 */
export function Wordmark({ className = "", priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/brand/wordmark-sm.webp"
      alt="STREEZØWEAR"
      width={725}
      height={90}
      priority={priority}
      className={`h-auto mix-blend-screen ${className}`}
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
      className={`h-auto mix-blend-screen ${className}`}
    />
  );
}

export function SMark({ className = "", size = 64 }: { className?: string; size?: number }) {
  return (
    <Image src="/brand/s-mark.webp" alt="" aria-hidden width={size} height={size} className={`mix-blend-screen ${className}`} />
  );
}
