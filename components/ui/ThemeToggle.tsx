"use client";

import { useEffect, useState } from "react";

export type Theme = "dark" | "light";
export const THEME_KEY = "szw-theme";

/** Runs in <head> before paint so the saved theme applies with no flash. Default: dark (brand-first). */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');if(t!=='light'&&t!=='dark')t='dark';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

function apply(t: Theme) {
  document.documentElement.setAttribute("data-theme", t);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t === "light" ? "#FFFFFF" : "#07070A");
  try {
    localStorage.setItem(THEME_KEY, t);
  } catch {}
}

/** Current theme, kept in sync with <html data-theme>. */
export function useTheme(): Theme {
  const [t, setT] = useState<Theme>("dark");
  useEffect(() => {
    const read = () => setT(document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);
  return t;
}

export function ThemeToggle({ className = "", withLabel = false }: { className?: string; withLabel?: boolean }) {
  const [theme, setTheme] = useState<Theme | null>(null);
  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");
  }, []);
  const next: Theme = theme === "light" ? "dark" : "light";
  return (
    <button
      type="button"
      onClick={() => {
        apply(next);
        setTheme(next);
      }}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-2 hover:text-neon ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        {theme === "light" ? (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        )}
      </svg>
      {withLabel && <span className="label">{theme === "light" ? "Dark mode" : "Light mode"}</span>}
    </button>
  );
}
