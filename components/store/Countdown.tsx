"use client";

import { useEffect, useState } from "react";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

export function Countdown({ to }: { to: string }) {
  const target = new Date(to).getTime();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (now === null) return <div className="h-16" />;
  const p = parts(target - now);
  if (target <= now) return <p className="label text-neon">Live now</p>;
  return (
    <div className="flex gap-6" role="timer" aria-label={`Launches in ${p.d} days ${p.h} hours ${p.m} minutes`}>
      {([["Days", p.d], ["Hrs", p.h], ["Min", p.m], ["Sec", p.s]] as const).map(([k, v]) => (
        <div key={k} className="flex flex-col gap-1">
          <b className="display text-4xl tabular-nums">{String(v).padStart(2, "0")}</b>
          <span className="label text-steel">{k}</span>
        </div>
      ))}
    </div>
  );
}
