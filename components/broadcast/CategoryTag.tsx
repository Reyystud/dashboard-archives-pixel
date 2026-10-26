import { categoryOf } from "@/lib/categories";

export function CategoryTag({ category }: { category: string }) {
  const c = categoryOf(category);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/5 px-2.5 py-0.5 text-[12px] font-medium text-ink-2">
      <span aria-hidden className="inline-block size-2 rounded-[3px]" style={{ background: c.color, boxShadow: `0 0 8px ${c.color}` }} />
      {c.label}
    </span>
  );
}
