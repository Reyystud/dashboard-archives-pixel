"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { PixelMark } from "@/components/brand/PixelMark";

function Fallback() {
  return (
    <div className="grid h-full w-full place-items-center">
      <PixelMark height={200} id="hero-fallback" className="logo-float drop-shadow-[0_20px_60px_rgba(32,91,194,0.55)] max-md:h-[140px] max-md:w-auto" />
    </div>
  );
}

const PixelLogo3D = dynamic(() => import("@/components/three/PixelLogo3D"), { ssr: false, loading: Fallback });

let capable: boolean | undefined;
/**
 * 3D hanya untuk perangkat yang sanggup: ada WebGL, pointer halus + hover (laptop/desktop), tidak hemat data,
 * dan CPU tidak lemah. HP/tablet mendapat logo SVG beranimasi CSS: tidak mengunduh three.js (±280 KB gzip)
 * dan tidak membebani GPU.
 */
function canRun3D() {
  if (capable !== undefined) return capable;
  try {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const wide = matchMedia("(min-width: 1024px)").matches;
    const lean = !!nav.connection?.saveData || (nav.hardwareConcurrency ?? 8) < 4 || (nav.deviceMemory ?? 8) < 4;
    const c = document.createElement("canvas");
    const gl = !!(c.getContext("webgl2") || c.getContext("webgl"));
    capable = fine && wide && !lean && gl;
  } catch {
    capable = false;
  }
  return capable;
}
const noop = () => () => {};

/** Mount ditunda sampai browser idle, supaya unduhan/parsing three.js tidak berebut dengan hidrasi. */
function useIdle() {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setIdle(true), { timeout: 1200 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = setTimeout(() => setIdle(true), 400);
    return () => clearTimeout(t);
  }, []);
  return idle;
}

export function Logo3DSlot() {
  const reduce = useReducedMotion();
  const ok = useSyncExternalStore(noop, canRun3D, () => false);
  const idle = useIdle();
  if (reduce || !ok || !idle) return <Fallback />;
  return <PixelLogo3D />;
}
