"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";

const FINE = "(hover: hover) and (pointer: fine)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(FINE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/** Tilt 3D + kilau kursor hanya di perangkat bermouse. Di layar sentuh: div biasa (tanpa spring per kartu). */
export function TiltCard({ children, className, max = 4 }: { children: React.ReactNode; className?: string; max?: number }) {
  const fine = useSyncExternalStore(subscribe, () => window.matchMedia(FINE).matches, () => false);
  return fine ? (
    <Tilt className={className} max={max}>{children}</Tilt>
  ) : (
    <div className={className}>{children}</div>
  );
}

function Tilt({ children, className, max }: { children: React.ReactNode; className?: string; max: number }) {
  const reduce = useReducedMotion();
  const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });

  return (
    <motion.div
      className={cn("sheen", className)}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        e.currentTarget.style.setProperty("--mx", `${px * 100}%`);
        e.currentTarget.style.setProperty("--my", `${py * 100}%`);
        if (reduce) return;
        ry.set((px - 0.5) * max);
        rx.set(-(py - 0.5) * max);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
