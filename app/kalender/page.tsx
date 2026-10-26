import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus, ChevronLeft, ChevronRight, Rss } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { CategoryTag } from "@/components/broadcast/CategoryTag";
import { Reveal } from "@/components/motion/Reveal";
import { buttonClass } from "@/components/ui/Button";
import { deadlinesInRange, type DeadlineItem } from "@/lib/queries";
import { todayJakarta } from "@/lib/classify/rules";
import { addDays, googleCalendarUrl, monthGrid, monthKey, parseMonth, shiftMonth } from "@/lib/calendar";
import { categoryOf } from "@/lib/categories";
import { clientEnv } from "@/lib/env";
import { cn } from "@/lib/cn";

export const revalidate = 60;
export const metadata: Metadata = { title: "Kalender tenggat" };

const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const DOW = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

type Props = { searchParams: Promise<{ m?: string }> };

export default async function KalenderPage({ searchParams }: Props) {
  const today = todayJakarta();
  const { y, m } = parseMonth((await searchParams).m, today);
  const grid = monthGrid(y, m);
  const items = await deadlinesInRange(grid[0], grid[41]);
  const byDay = new Map<string, DeadlineItem[]>();
  for (const it of items) byDay.set(it.deadline!, [...(byDay.get(it.deadline!) ?? []), it]);

  const prev = shiftMonth(y, m, -1);
  const next = shiftMonth(y, m, 1);
  const cur = monthKey(y, m);
  const inMonth = items.filter((i) => i.deadline!.startsWith(cur));
  const week = items.filter((i) => i.deadline! >= today && i.deadline! <= addDays(today, 7));
  const site = clientEnv.NEXT_PUBLIC_SITE_URL;
  const feed = `${site.replace(/^https?:/, "webcal:").replace(/\/$/, "")}/api/ics`;

  return (
    <SiteShell>
      <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-300">02 · Kalender</p>
          <h1 className="mt-1 text-[32px] font-bold leading-tight md:text-[44px]">Kalender tenggat</h1>
          <p className="mt-1 max-w-prose text-ink-2">Semua tenggat dari broadcast angkatan. Langganan sekali, otomatis ter-update di kalendermu.</p>
        </div>
        <a href={feed} className={buttonClass("primary", "self-start md:self-auto")}>
          <Rss size={17} strokeWidth={2} aria-hidden /> Langganan kalender
        </a>
      </Reveal>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Reveal delay={0.06} className="glass rounded-[26px] p-3 md:p-5">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="font-display text-[20px] font-semibold md:text-[24px]">
              {MONTHS[m - 1]} <span className="text-muted">{y}</span>
            </h2>
            <div className="ml-auto flex gap-1">
              <Link href={`/kalender?m=${monthKey(prev.y, prev.m)}`} aria-label="Bulan sebelumnya" className={buttonClass("ghost", "size-11 px-0!")} scroll={false}>
                <ChevronLeft size={18} aria-hidden />
              </Link>
              <Link href="/kalender" className={buttonClass("ghost", "px-3 text-[14px]")} scroll={false}>
                Hari ini
              </Link>
              <Link href={`/kalender?m=${monthKey(next.y, next.m)}`} aria-label="Bulan berikutnya" className={buttonClass("ghost", "size-11 px-0!")} scroll={false}>
                <ChevronRight size={18} aria-hidden />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 md:gap-1.5">
            {DOW.map((d) => (
              <div key={d} className="pb-1 text-center font-mono text-[11px] uppercase tracking-wider text-muted">
                {d}
              </div>
            ))}
            {grid.map((day) => {
              const list = byDay.get(day) ?? [];
              const out = !day.startsWith(cur);
              const isToday = day === today;
              const past = day < today;
              return (
                <div
                  key={day}
                  className={cn(
                    "relative flex min-h-[58px] flex-col gap-1 rounded-xl border p-1.5 md:min-h-[104px] md:p-2",
                    out ? "border-transparent opacity-35" : "border-line bg-white/[0.025]",
                    isToday && "border-brand-400/60 bg-brand-50 shadow-[0_0_0_1px_rgba(123,163,255,0.3),0_0_24px_-6px_rgba(76,127,240,0.6)]",
                  )}
                >
                  <span className={cn("font-mono text-[12px]", isToday ? "font-semibold text-brand-200" : past ? "text-muted" : "text-ink-2")}>
                    {Number(day.slice(8))}
                  </span>
                  {list.length ? <span className="sr-only">{list.length} tenggat</span> : null}
                  {/* Mobile: titik per tenggat. Desktop: judul ringkas. */}
                  <div className="flex flex-wrap gap-1 md:hidden">
                    {list.slice(0, 4).map((it) => (
                      <span key={it.id} className="size-1.5 rounded-full" style={{ background: categoryOf(it.category).color }} />
                    ))}
                  </div>
                  <div className="hidden flex-col gap-1 md:flex">
                    {list.slice(0, 2).map((it) => (
                      <Link
                        key={it.id}
                        href={`/b/${it.id}`}
                        className={cn("truncate rounded-md px-1.5 py-0.5 text-[11px] leading-tight transition-colors hover:bg-white/10", past && "opacity-60")}
                        style={{ background: `${categoryOf(it.category).color}22`, color: categoryOf(it.category).color }}
                        title={it.title}
                      >
                        {it.title}
                      </Link>
                    ))}
                    {list.length > 2 ? <span className="px-1.5 text-[11px] text-muted">+{list.length - 2} lagi</span> : null}
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>

        <div className="flex flex-col gap-5">
          <Reveal delay={0.12} className="glass rounded-[26px] p-5">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">7 hari ke depan</h2>
            {week.length ? (
              <ul className="mt-3 flex flex-col gap-2">
                {week.map((it) => (
                  <DeadlineRow key={it.id} it={it} today={today} site={site} />
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-[14px] text-ink-2">Aman, tidak ada tenggat minggu ini.</p>
            )}
          </Reveal>
        </div>
      </div>

      <Reveal className="mt-8">
        <h2 className="text-[22px] font-bold md:text-[26px]">
          Semua tenggat {MONTHS[m - 1]} <span className="font-mono text-[14px] font-normal text-muted">({inMonth.length})</span>
        </h2>
        {inMonth.length ? (
          <ul className="mt-4 grid gap-2.5 md:grid-cols-2">
            {inMonth.map((it) => (
              <DeadlineRow key={it.id} it={it} today={today} site={site} wide />
            ))}
          </ul>
        ) : (
          <p className="glass mt-4 rounded-[22px] p-6 text-ink-2">Belum ada tenggat di bulan ini.</p>
        )}
      </Reveal>
    </SiteShell>
  );
}

function DeadlineRow({ it, today, site, wide = false }: { it: DeadlineItem; today: string; site: string; wide?: boolean }) {
  const d = it.deadline!;
  const past = d < today;
  return (
    <li className={cn("flex items-center gap-3 rounded-[18px] border border-line p-2.5", wide ? "glass" : "bg-white/[0.03]", past && "opacity-60")}>
      <span className="grid w-12 flex-none place-items-center rounded-xl border border-line bg-white/5 py-1 font-mono leading-tight">
        <span className="text-[18px] font-semibold text-brand-300">{Number(d.slice(8))}</span>
        <span className="text-[10px] uppercase text-muted">{MONTHS[Number(d.slice(5, 7)) - 1].slice(0, 3)}</span>
      </span>
      <div className="min-w-0 flex-1">
        <Link href={`/b/${it.id}`} className="line-clamp-2 text-[14px] font-medium hover:text-brand-200">
          {it.title}
        </Link>
        {wide ? (
          <div className="mt-1">
            <CategoryTag category={it.category} />
          </div>
        ) : null}
      </div>
      {!past ? (
        <a
          href={googleCalendarUrl({ id: it.id, title: it.title, deadline: d }, site)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Tambah "${it.title}" ke Google Calendar`}
          className="grid size-11 flex-none place-items-center rounded-full text-muted transition-colors hover:bg-white/10 hover:text-ink"
        >
          <CalendarPlus size={18} strokeWidth={1.75} aria-hidden />
        </a>
      ) : null}
    </li>
  );
}
