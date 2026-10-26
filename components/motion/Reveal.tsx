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
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: EASE, delay: Math.min(index % 20, 8) * 0.05 }}
    >
      {children}
    </motion.div>
  );
}
