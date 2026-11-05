export function RuleLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`label rule text-neon ${className}`}>{children}</p>;
}

export function BoltSlash({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`sw-bolt pointer-events-none absolute -inset-x-[10%] h-[2px] -rotate-[14deg] opacity-0 ${className}`}
      style={{
        background: "linear-gradient(90deg,transparent,var(--sw-neon) 40%,#ffd0d7 50%,var(--sw-neon) 60%,transparent)",
        boxShadow: "0 0 18px 2px var(--sw-neon-glow)",
      }}
    />
  );
}
