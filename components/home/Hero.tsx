"use client";

import { openCommandPalette } from "@/lib/client/palette";
import { buttonClass } from "@/components/ui/Button";
import type { HomeStats } from "@/lib/queries";
import { ArrowDown, CalendarDays, Command } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Logo3DSlot } from "./Logo3DSlot";

const EASE = [0.22, 1, 0.36, 1] as const;
const up = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: EASE, delay },
});

export function Hero({ stats }: { stats: HomeStats }) {
  const items = [
    { n: stats.total, label: "broadcast terarsip" },
    { n: stats.dueThisWeek, label: "tenggat 7 hari ke depan" },
    { n: stats.openPojok, label: "pojok aspirasi dibuka" },
  ];
  return (
    <section className="relative -mt-2 grid grid-cols-1 items-center gap-4 pb-10 md:grid-cols-[1.05fr_1fr] md:gap-8 md:pb-16" aria-labelledby="hero-title">
      <div className="relative order-2 min-w-0 md:order-1">
        <motion.p
          {...up(0.1)}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-2"
        >
          <span className="ring-dot live" style={{ width: 7, height: 7 }} aria-hidden />
          HMIF ITB · Angkatan 2025
        </motion.p>
        <motion.h1
          id="hero-title"
          {...up(0.18)}
          className="mt-4 font-display text-[clamp(56px,11vw,128px)] font-bold leading-[0.9] tracking-[-0.03em]"
        >
          <span className="text-gradient">PIXEL</span>
          <span className="text-sand">&apos;25</span>
        </motion.h1>
        <motion.p {...up(0.28)} className="mt-5 max-w-[34ch] text-[17px] leading-relaxed text-ink-2 md:text-[19px]">
          Semua broadcast, tenggat, momen, dan suara angkatan, terkumpul di satu tempat.
        </motion.p>
        <motion.div {...up(0.36)} className="mt-7 flex flex-wrap gap-2.5">
          <a href="#arsip" className={buttonClass("primary", "min-h-12 px-6")}>
            Explore Archive <ArrowDown size={18} strokeWidth={2} aria-hidden />
          </a>
          <Link href="/kalender" className={buttonClass("secondary", "min-h-12 px-6")}>
            <CalendarDays size={18} strokeWidth={1.75} aria-hidden /> Kalender
          </Link>
          <span className="hidden md:inline-flex">
            <button type="button" onClick={openCommandPalette} className={buttonClass("ghost", "min-h-12")}>
              <Command size={16} strokeWidth={1.75} aria-hidden /> Tekan ⌘K untuk cari
            </button>
          </span>
        </motion.div>

        <motion.dl {...up(0.46)} className="mt-9 grid max-w-xl grid-cols-3 gap-2.5">
          {items.map((s) => (
            <div key={s.label} className="glass min-w-0 rounded-[18px] px-3 py-3 md:px-3.5">
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display text-[26px] font-bold leading-none text-ink md:text-[32px]">{s.n}</dd>
              <dd className="mt-1.5 text-[11px] leading-snug text-muted md:text-[12px]">{s.label}</dd>
            </div>
          ))}
        </motion.dl>
      </div>

      <motion.div
        className="relative order-1 h-[260px] md:order-2 md:h-[520px]"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: EASE, delay: 0.1 }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(closest-side,rgba(32,91,194,0.34),transparent)]" aria-hidden />
        <Logo3DSlot />
      </motion.div>
    </section>
  );
}
