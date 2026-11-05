export function Accordion({ items }: { items: { title: string; body: React.ReactNode }[] }) {
  return (
    <div className="divide-y divide-gunmetal border-y border-gunmetal">
      {items.map((it) => (
        <details key={it.title} className="group">
          <summary className="label flex min-h-14 cursor-pointer list-none items-center justify-between text-chrome [&::-webkit-details-marker]:hidden">
            {it.title}
            <span aria-hidden className="text-neon transition-transform group-open:rotate-45">+</span>
          </summary>
          <div className="pb-5 text-sm leading-relaxed text-steel">{it.body}</div>
        </details>
      ))}
    </div>
  );
}
