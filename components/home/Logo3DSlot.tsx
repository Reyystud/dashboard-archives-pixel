"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";
import { useSyncExternalStore } from "react";
import { PixelMark } from "@/components/brand/PixelMark";

function Fallback() {
  return (
    <div className="grid h-full w-full place-items-center">
      <PixelMark height={200} id="hero-fallback" className="drop-shadow-[0_20px_60px_rgba(32,91,194,0.55)] max-md:h-[140px] max-md:w-auto" />
    </div>
  );
}

const PixelLogo3D = dynamic(() => import("@/components/three/PixelLogo3D"), { ssr: false, loading: Fallback });

let webglCache: boolean | undefined;
function hasWebGL() {
  if (webglCache === undefined) {
    try {
      const c = document.createElement("canvas");
      webglCache = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webglCache = false;
    }
  }
  return webglCache;
}
const noop = () => () => {};

/** Logo 3D bila WebGL tersedia dan pengguna tidak memilih reduced motion; selain itu logo SVG. */
export function Logo3DSlot() {
  const reduce = useReducedMotion();
  const webgl = useSyncExternalStore(noop, hasWebGL, () => false);
  return reduce || !webgl ? <Fallback /> : <PixelLogo3D />;
}
