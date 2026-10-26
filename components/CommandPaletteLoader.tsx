"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { PALETTE_EVENT } from "@/lib/client/palette";

// cmdk + dialog baru diunduh saat pertama kali dibutuhkan (⌘K, "/", atau tombol Cari).
const CommandPalette = dynamic(() => import("@/components/CommandPalette"), { ssr: false });

export function CommandPaletteLoader() {
  const [load, setLoad] = useState(false);

  useEffect(() => {
    if (load) return;
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setLoad(true);
      }
    };
    const onOpen = () => setLoad(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(PALETTE_EVENT, onOpen);
    };
  }, [load]);

  // defaultOpen: pemicu pertama yang memuat komponen langsung membuka paletnya.
  return load ? <CommandPalette defaultOpen /> : null;
}
