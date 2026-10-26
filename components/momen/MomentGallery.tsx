"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import { formatShortDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Moment } from "@/lib/queries";

const MotionImage = motion.create(Image);

export function MomentGallery({ moments }: { moments: Moment[] }) {
  const years = [...new Set(moments.map((m) => m.taken_on.slice(0, 4)))];
  const [year, setYear] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const shown = year ? moments.filter((m) => m.taken_on.startsWith(year)) : moments;
  const idx = shown.findIndex((m) => m.id === openId);
  const open = idx >= 0 ? shown[idx] : null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
      if (e.key === "ArrowRight") setOpenId(shown[(idx + 1) % shown.length].id);
      if (e.key === "ArrowLeft") setOpenId(shown[(idx - 1 + shown.length) % shown.length].id);
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, idx, shown]);

  if (!moments.length) {
    return (
      <div className="glass flex flex-col items-center gap-3 rounded-[26px] px-6 py-16 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-300">
          <Images size={24} strokeWidth={1.75} aria-hidden />
        </span>
        <p className="font-display text-[18px] font-semibold">Belum ada momen</p>
        <p className="max-w-sm text-[14px] text-ink-2">Foto-foto angkatan akan muncul di sini setelah diunggah admin.</p>
      </div>
    );
  }

  return (
    <>
      {years.length > 1 ? (
        <div className="no-scrollbar isolate mb-5 flex gap-2 overflow-x-auto" role="group" aria-label="Filter tahun">
          {[null, ...years].map((y) => (
            <button
              key={y ?? "all"}
              type="button"
              aria-pressed={year === y}
              onClick={() => setYear(y)}
              className={cn(
                "relative min-h-10 flex-none cursor-pointer rounded-full border px-4 text-[14px] transition-colors",
                year === y ? "border-transparent text-white" : "border-line bg-white/5 text-ink-2 hover:text-ink",
              )}
            >
              {year === y ? <motion.span layoutId="year-pill" className="absolute inset-0 -z-10 rounded-full bg-gradient-to-b from-brand-500 to-brand-700" /> : null}
              {y ?? "Semua"}
            </button>
          ))}
        </div>
      ) : null}

      <motion.ul layout className="columns-2 gap-3 md:columns-3 lg:columns-4 [&>li]:mb-3">
        <AnimatePresence initial={false}>
          {shown.map((m, i) => (
            <motion.li
              key={m.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: Math.min(i, 10) * 0.04 }}
              className="break-inside-avoid"
            >
              <button
                type="button"
                onClick={() => setOpenId(m.id)}
                className="group glass relative block w-full cursor-zoom-in overflow-hidden rounded-[20px] p-1.5 text-left"
                aria-label={`Lihat ${m.title}`}
              >
                <MotionImage
                  layoutId={`m-${m.id}`}
                  src={m.image_url}
                  alt={m.title}
                  width={m.width ?? 800}
                  height={m.height ?? 600}
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  quality={70}
                  className="h-auto w-full rounded-[15px] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <span className="pointer-events-none absolute inset-x-1.5 bottom-1.5 rounded-b-[15px] bg-gradient-to-t from-black/80 to-transparent px-3 pb-2.5 pt-8 opacity-0 transition-opacity duration-300 group-hover:opacity-100 max-md:opacity-100">
                  <span className="block truncate text-[14px] font-semibold text-white">{m.title}</span>
                  <span className="block font-mono text-[11px] text-white/70">{formatShortDate(m.taken_on)}</span>
                </span>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="lightbox"
            className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-black/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenId(null)}
            role="dialog"
            aria-modal="true"
            aria-label={open.title}
          >
            <button
              type="button"
              onClick={() => setOpenId(null)}
              aria-label="Tutup"
              className="absolute right-4 top-4 grid size-11 cursor-pointer place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
              autoFocus
            >
              <X size={20} aria-hidden />
            </button>
            {shown.length > 1 ? (
              <>
                <NavBtn side="left" onClick={() => setOpenId(shown[(idx - 1 + shown.length) % shown.length].id)} />
                <NavBtn side="right" onClick={() => setOpenId(shown[(idx + 1) % shown.length].id)} />
              </>
            ) : null}
            <MotionImage
              layoutId={`m-${open.id}`}
              src={open.image_url}
              alt={open.title}
              width={open.width ?? 1600}
              height={open.height ?? 1200}
              sizes="100vw"
              quality={80}
              priority
              className="h-auto max-h-[78vh] w-auto max-w-full rounded-[18px] object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-4 max-w-xl text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-display text-[18px] font-semibold text-white">{open.title}</p>
              <p className="font-mono text-[12px] text-white/60">{formatShortDate(open.taken_on)}</p>
              {open.caption ? <p className="mt-2 text-[14px] text-white/80">{open.caption}</p> : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function NavBtn({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={side === "left" ? "Sebelumnya" : "Berikutnya"}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "absolute top-1/2 z-10 grid size-12 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-white/10 text-white hover:bg-white/20",
        side === "left" ? "left-3 md:left-6" : "right-3 md:right-6",
      )}
    >
      <Icon size={22} aria-hidden />
    </button>
  );
}
