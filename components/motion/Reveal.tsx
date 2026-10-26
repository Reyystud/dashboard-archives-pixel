"use client";

import { motion, type HTMLMotionProps } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Muncul (fade + naik) saat masuk viewport. */
export function Reveal({
  children, delay = 0, y = 18, className, as = "div", ...rest
}: { children: React.ReactNode; delay?: number; y?: number; as?: "div" | "section" | "li" } & Omit<HTMLMotionProps<"div">, "children">) {
  const M = motion[as] as typeof motion.div;
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </M>
  );
}

/** Masuk berurutan untuk item list; delay dibatasi supaya halaman panjang tidak terasa lambat. */
export function StaggerItem({ children, index, className }: { children: React.ReactNode; index: number; className?: string }) {
  // CSS murni (class .rise): tanpa instance motion per kartu, dan kartu di luar layar dilewati (.cv-auto).
  return (
    <div className={`rise cv-auto ${className ?? ""}`} style={{ animationDelay: `${Math.min(index, 6) * 25}ms` }}>
      {children}
    </div>
  );
}
