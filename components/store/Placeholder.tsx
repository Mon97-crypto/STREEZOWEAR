/** Visible marker for business details that must be confirmed before launch. */
export function Placeholder({ children }: { children: React.ReactNode }) {
  return <span className="border border-dashed border-steel px-1.5 text-chrome" title="To be confirmed before launch">{children}</span>;
}

export function DraftNotice() {
  return (
    <p className="label mb-10 border border-dashed border-steel p-4 text-[0.65rem] leading-relaxed text-steel">
      Draft for review. Dashed values are placeholders. Have this page checked by a lawyer before launch.
    </p>
  );
}
