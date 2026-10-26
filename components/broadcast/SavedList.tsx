"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bookmark } from "lucide-react";
import { BroadcastCard } from "./BroadcastCard";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { buttonClass } from "@/components/ui/Button";
import { useSaved } from "@/lib/client/saved";
import type { Broadcast } from "@/lib/types";

const noop = () => () => {};

export function SavedList() {
  const { ids } = useSaved();
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const [items, setItems] = useState<Broadcast[]>([]);
  // id yang sudah selesai diminta (ada atau tidak di server), supaya tidak diminta ulang.
  const [resolved, setResolved] = useState<ReadonlySet<string>>(new Set());
  const missing = ids.filter((id) => !resolved.has(id));
  const missingKey = missing.join(",");

  useEffect(() => {
    if (!missingKey) return;
    let alive = true;
    const want = missingKey.split(",");
    const finish = (got: Broadcast[]) => {
      if (!alive) return;
      setItems((cur) => [...cur, ...got.filter((g) => !cur.some((c) => c.id === g.id))]);
      setResolved((cur) => new Set([...cur, ...want]));
    };
    fetch(`/api/broadcasts?ids=${missingKey}`)
      .then((r) => r.json())
      .then((d: { items: Broadcast[] }) => finish(d.items))
      .catch(() => finish([]));
    return () => {
      alive = false;
    };
  }, [missingKey]);

  if (!hydrated || missing.length) {
    return (
      <div className="flex flex-col gap-3">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const shown = ids.map((id) => items.find((b) => b.id === id)).filter((b): b is Broadcast => !!b);
  if (!shown.length) {
    return (
      <div className="glass flex flex-col items-center gap-3 rounded-[26px] px-6 py-14 text-center">
        <span className="neu-well grid size-14 place-items-center rounded-2xl text-brand-300">
          <Bookmark size={24} strokeWidth={1.75} aria-hidden />
        </span>
        <p className="font-display text-[18px] font-semibold">Belum ada yang disimpan</p>
        <p className="max-w-sm text-[14px] text-ink-2">Tekan ikon bookmark di kartu broadcast untuk menyimpannya di sini.</p>
        <Link href="/#arsip" className={buttonClass("primary", "mt-2")}>Buka arsip</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {shown.map((b) => (
          <motion.div
            key={b.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
          >
            <BroadcastCard b={b} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
