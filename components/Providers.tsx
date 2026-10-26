"use client";

import { MotionConfig } from "motion/react";
import { CommandPalette } from "@/components/CommandPalette";
import { VisitTracker } from "@/lib/client/saved";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 260, damping: 26 }}>
      {children}
      <CommandPalette />
      <VisitTracker />
    </MotionConfig>
  );
}
