"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/cn";

// #arsip: setelah memilih kategori, langsung lompat ke feed (melewati hero).
function href(cat: string | undefined, q?: string) {
  const sp = new URLSearchParams();
  if (cat) sp.set("cat", cat);
  if (q) sp.set("q", q);
  const s = sp.toString();
  return s ? `/?${s}#arsip` : "/#arsip";
}

type Handlers = { onSelect: (cat?: string) => void; onIntent?: (cat?: string) => void };

// Klik biasa dicegat (ganti kategori di klien); klik tengah / Ctrl / Cmd tetap membuka tautan normal.
function nav(h: Handlers, key?: string) {
  return {
    onClick: (e: React.MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      h.onSelect(key);
    },
    onPointerEnter: () => h.onIntent?.(key),
    onTouchStart: () => h.onIntent?.(key),
    onFocus: () => h.onIntent?.(key),
  };
}

export function CategoryChips({ active, q, counts, ...h }: { active?: string; q?: string; counts: Record<string, number> } & Handlers) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const chip = (key: string | undefined, label: string, color: string | null, n: number) => {
    const on = active === key;
    return (
      <Link
        key={key ?? "all"}
        href={href(key, q)}
        {...nav(h, key)}
        aria-current={on ? "true" : undefined}
        className={cn(
          "relative flex min-h-10 flex-none items-center gap-2 rounded-full border px-3.5 text-[14px] whitespace-nowrap transition-colors duration-200",
          on ? "border-transparent text-white" : "border-line bg-white/5 text-ink-2 hover:text-ink",
        )}
      >
        {on ? (
          <motion.span
            layoutId="chip-active"
            className="absolute inset-0 -z-10 rounded-full bg-gradient-to-b from-brand-500 to-brand-700"
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          />
        ) : null}
        {color ? <span aria-hidden className="inline-block size-2 rounded-[3px]" style={{ background: color }} /> : null}
        {label}
        <span className="font-mono text-[12px] opacity-75">{n}</span>
      </Link>
    );
  };
  return (
    <nav aria-label="Kategori" className="no-scrollbar isolate flex gap-2 overflow-x-auto py-2">
      {chip(undefined, "Semua", null, total)}
      {CATEGORIES.map((c) => chip(c.key, c.label, c.color, counts[c.key] ?? 0))}
    </nav>
  );
}

export function CategorySidebar({ active, q, counts, ...h }: { active?: string; q?: string; counts: Record<string, number> } & Handlers) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const item = (key: string | undefined, label: string, color: string | null, n: number) => {
    const on = active === key;
    return (
      <Link
        key={key ?? "all"}
        href={href(key, q)}
        {...nav(h, key)}
        aria-current={on ? "true" : undefined}
        className={cn(
          "relative flex min-h-10 items-center gap-2.5 rounded-xl px-3 text-[14px] transition-colors duration-200",
          on ? "font-medium text-ink" : "text-ink-2 hover:bg-white/5 hover:text-ink",
        )}
      >
        {on ? (
          <motion.span
            layoutId="side-active"
            className="absolute inset-0 -z-10 rounded-xl border border-brand-500/30 bg-brand-50"
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          />
        ) : null}
        {color ? (
          <span aria-hidden className="inline-block size-2 rounded-[3px]" style={{ background: color, boxShadow: on ? `0 0 10px ${color}` : undefined }} />
        ) : (
          <span className="size-2" />
        )}
        <span className="flex-1">{label}</span>
        <span className="font-mono text-[12px] text-muted">{n}</span>
      </Link>
    );
  };
  return (
    <nav aria-label="Kategori" className="glass sticky top-[92px] isolate flex flex-col gap-0.5 rounded-[22px] p-2">
      <p className="px-3 pb-1 pt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Kategori</p>
      {item(undefined, "Semua", null, total)}
      {CATEGORIES.map((c) => item(c.key, c.label, c.color, counts[c.key] ?? 0))}
    </nav>
  );
}
