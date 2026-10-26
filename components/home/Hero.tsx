"use client";

import { openCommandPalette } from "@/lib/client/palette";
import { buttonClass } from "@/components/ui/Button";
import type { HomeStats } from "@/lib/queries";
import { ArrowDown, CalendarDays, Command } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { PixelHop } from "./PixelHop";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero({ stats }: { stats: HomeStats }) {
  // Tiap angka membawa ke tempat datanya, bukan sekadar hiasan.
  const items = [
    { n: stats.total, label: "broadcast terarsip", href: "#arsip" },
    { n: stats.dueThisWeek, label: "tenggat 7 hari ke depan", href: "/kalender" },
    { n: stats.openPojok, label: "pojok aspirasi dibuka", href: "/aspirasi" },
  ];
  return (
    <section className="relative -mt-2 grid grid-cols-1 items-center gap-2 pb-12 md:grid-cols-[1.05fr_1fr] md:gap-8 md:pb-20" aria-labelledby="hero-title">
      <motion.div
        className="relative order-2 min-w-0 md:order-1"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <p className="text-[15px] text-ink-2">Angkatan 2025 HMIF ITB</p>
        <h1
          id="hero-title"
          className="mt-3 font-display text-[clamp(56px,11vw,128px)] font-bold leading-[0.9] tracking-[-0.03em]"
        >
          <span className="text-gradient">PIXEL</span>
          <span className="text-sand">&apos;25</span>
        </h1>
        <p className="mt-5 max-w-[34ch] text-[17px] leading-relaxed text-ink-2 md:text-[19px]">
          Semua broadcast, tenggat, momen, dan suara angkatan, terkumpul di satu tempat.
        </p>
        <div className="mt-7 flex flex-wrap gap-2.5">
          <a href="#arsip" className={buttonClass("primary", "min-h-12 px-6")}>
            Lihat arsip <ArrowDown size={18} strokeWidth={2} aria-hidden />
          </a>
          <Link href="/kalender" className={buttonClass("secondary", "min-h-12 px-6")}>
            <CalendarDays size={18} strokeWidth={1.75} aria-hidden /> Kalender
          </Link>
          <span className="hidden md:inline-flex">
            <button type="button" onClick={openCommandPalette} className={buttonClass("ghost", "min-h-12")}>
              <Command size={16} strokeWidth={1.75} aria-hidden /> Tekan ⌘K untuk cari
            </button>
          </span>
        </div>

        <ul className="mt-10 grid max-w-xl grid-cols-3 gap-3 md:gap-4">
          {items.map((s) => (
            <li key={s.label}>
              <Link href={s.href} className="neu-raise group flex h-full min-h-11 flex-col rounded-[18px] p-3 md:p-4">
                <span className="font-display text-[28px] font-bold leading-none text-ink transition-colors group-hover:text-brand-300 md:text-[36px]">
                  {s.n}
                </span>
                <span className="mt-2 text-[13px] leading-snug text-muted transition-colors group-hover:text-ink-2">{s.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </motion.div>

      <div className="relative order-1 h-[280px] md:order-2 md:h-[540px]">
        <div className="neu-well pointer-events-none absolute inset-2 rounded-[40px] md:inset-4 md:rounded-[56px]" aria-hidden />
        <PixelHop className="relative h-full w-full overflow-visible p-6 md:p-10" />
      </div>
    </section>
  );
}
