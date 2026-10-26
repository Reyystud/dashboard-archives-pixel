"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { PixelDefs, fillOf } from "@/components/brand/PixelMark";
import { PIXEL_PARTS, PIXEL_RING, PIXEL_VIEWBOX } from "@/lib/brand/pixel";
import { INTRO_KEY } from "@/lib/brand/intro";

const ORDER = ["l1", "l2", "l3", "t", "x", "i", "e", "l"];
const WORD = "PIXEL'25".split("");
const HOLD_MS = 1900;

/** Overlay pembuka: tile logo tersusun satu per satu, ring mengunci, lalu panel naik keluar. */
const noop = () => () => {};
const bootDone = () => document.documentElement.dataset.intro === "done";

export function IntroLoader() {
  // Skrip boot di <head> sudah menandai "done" untuk kunjungan ulang / reduced motion.
  const skipped = useSyncExternalStore(noop, bootDone, () => false);
  const [playing, setPlaying] = useState(true);
  const show = playing && !skipped;

  useEffect(() => {
    if (skipped) return;
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {}
    document.documentElement.style.overflow = "hidden";
    const t = setTimeout(() => setPlaying(false), HOLD_MS);
    return () => clearTimeout(t);
  }, [skipped]);

  useEffect(() => {
    if (show) return;
    document.documentElement.style.overflow = "";
    // Tandai selesai saat panel mulai naik, supaya logo 3D sudah merakit ketika terlihat.
    document.documentElement.dataset.intro = "done";
  }, [show]);

  const { w, h } = PIXEL_VIEWBOX;
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="intro"
          aria-hidden
          className="intro-loader fixed inset-0 z-[100] grid cursor-pointer place-items-center overflow-hidden bg-bg"
          onClick={() => setPlaying(false)}
          exit={{ clipPath: "inset(0 0 100% 0)", transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] } }}
          initial={{ clipPath: "inset(0 0 0% 0)" }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_45%,rgba(32,91,194,0.35),transparent_70%)]" />
          <div className="relative flex flex-col items-center">
            <svg viewBox={`-40 -40 ${w + 80} ${h + 80}`} className="w-[min(56vw,300px)] overflow-visible">
              <PixelDefs id="intro" />
              {PIXEL_PARTS.map((p) => {
                const i = ORDER.indexOf(p.id);
                return (
                  <motion.path
                    key={p.id}
                    d={p.d}
                    fill={fillOf(p.fill, "intro")}
                    style={{ transformBox: "fill-box", transformOrigin: "center" }}
                    initial={{ opacity: 0, scale: 0.3, y: i % 2 ? 120 : -120, rotate: i % 2 ? 12 : -12 }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.08 + i * 0.07 }}
                  />
                );
              })}
              <motion.circle
                cx={PIXEL_RING.cx}
                cy={PIXEL_RING.cy}
                r={PIXEL_RING.r}
                fill="url(#intro-sand)"
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: [0, 1.35, 1], rotate: 0 }}
                transition={{ duration: 0.7, delay: 0.75, ease: "easeOut" }}
              />
              <motion.circle
                cx={PIXEL_RING.cx}
                cy={PIXEL_RING.cy}
                r={PIXEL_RING.inner}
                fill="var(--color-bg)"
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 0.95 }}
              />
            </svg>

            <div className="mt-8 flex overflow-hidden font-display text-[28px] font-bold tracking-[0.18em] text-ink md:text-[34px]">
              {WORD.map((c, i) => (
                <motion.span
                  key={i}
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.9 + i * 0.04 }}
                >
                  {c}
                </motion.span>
              ))}
            </div>
            <motion.p
              className="mt-2 font-mono text-[12px] uppercase tracking-[0.3em] text-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.25 }}
            >
              HMIF ITB
            </motion.p>
            <div className="mt-6 h-[2px] w-40 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full origin-left bg-gradient-to-r from-brand-500 to-sand"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: HOLD_MS / 1000 - 0.2, ease: [0.65, 0, 0.35, 1] }}
              />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
