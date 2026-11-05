const base = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, "aria-hidden": true } as const;
export const SearchIcon = (p: { className?: string }) => (<svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>);
export const UserIcon = (p: { className?: string }) => (<svg {...base} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>);
export const HeartIcon = (p: { className?: string }) => (<svg {...base} {...p}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>);
export const BagIcon = (p: { className?: string }) => (<svg {...base} {...p}><path d="M5 8h14l-1 12H6z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>);
export const MenuIcon = (p: { className?: string }) => (<svg {...base} {...p}><path d="M3 7h18M3 12h18M3 17h12" /></svg>);
export const CloseIcon = (p: { className?: string }) => (<svg {...base} {...p}><path d="M5 5l14 14M19 5 5 19" /></svg>);
export const BoltIcon = (p: { className?: string }) => (<svg {...base} {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></svg>);
