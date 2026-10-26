"use client";

import { MotionConfig } from "motion/react";
import { CommandPaletteLoader } from "@/components/CommandPaletteLoader";
import { VisitTracker } from "@/lib/client/saved";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 260, damping: 26 }}>
      {children}
      <CommandPaletteLoader />
      <VisitTracker />
    </MotionConfig>
  );
}
