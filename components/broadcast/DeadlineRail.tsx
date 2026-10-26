import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { daysUntil, deadlineParts } from "@/lib/format";

export function DeadlineRail({ items }: { items: { id: string; title: string; deadline: string | null }[] }) {
  return (
    <aside aria-label="Tenggat terdekat" className="glass sticky top-[92px] rounded-[22px] p-2">
      <div className="flex items-center justify-between px-3 pb-1 pt-2">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Tenggat terdekat</h2>
        <Link href="/kalender" className="inline-flex min-h-8 items-center gap-1 text-[12px] text-brand-300 hover:text-brand-200">
          Kalender <ArrowRight size={13} aria-hidden />
        </Link>
      </div>
      {items.length ? (
        <ul className="flex flex-col">
          {items.map((d) => {
            const p = deadlineParts(d.deadline!);
            const left = daysUntil(d.deadline!);
            return (
              <li key={d.id}>
                <Link href={`/b/${d.id}`} className="group flex gap-3 rounded-xl p-2.5 transition-shadow duration-200 hover:shadow-neu-xs">
                  <span
                    className={`grid w-12 flex-none place-items-center rounded-xl border py-1 font-mono leading-tight ${
                      left <= 3 ? "border-warn/30 bg-warn/10 shadow-neu-in-sm" : "border-transparent neu-well-sm"
                    }`}
                  >
                    <span className={`block text-[20px] font-semibold ${left <= 3 ? "text-warn" : "text-brand-300"}`}>{p.day}</span>
                    <span className="block text-[11px] text-muted">{p.month}</span>
                  </span>
                  <span className="line-clamp-2 self-center text-[14px] text-ink-2 transition-colors group-hover:text-ink">{d.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="p-3 text-[14px] text-ink-2">Belum ada tenggat yang akan datang.</p>
      )}
    </aside>
  );
}
