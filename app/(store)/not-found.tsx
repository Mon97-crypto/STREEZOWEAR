import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap grid min-h-[80vh] place-items-center pt-[var(--sw-header)] text-center">
      <div>
        <p className="label rule text-neon">404</p>
        <h1 className="display chrome-text mt-6 text-[clamp(3rem,10vw,8rem)]">Wrong street.</h1>
        <p className="mt-4 text-steel">This page doesn&apos;t exist, or it dropped and sold out.</p>
        <Link href="/" className="btn btn-primary mt-10">Back home</Link>
      </div>
    </div>
  );
}
