"use client";

import { useState, useTransition } from "react";
import { Inbox } from "lucide-react";
import { BroadcastCard } from "./BroadcastCard";
import { Button } from "@/components/ui/Button";
import { StaggerItem } from "@/components/motion/Reveal";
import { loadMoreBroadcasts } from "@/app/feed-actions";
import { categoryOf } from "@/lib/categories";
import type { Broadcast, FeedParams } from "@/lib/types";

export function FeedList({
  initial, nextCursor, params,
}: {
  initial: Broadcast[];
  nextCursor: string | null;
  params: FeedParams;
}) {
  const [items, setItems] = useState(initial);
  const [cursor, setCursor] = useState(nextCursor);
  const [pending, start] = useTransition();

  if (!items.length) {
    const msg = params.q
      ? `Tidak ada broadcast yang cocok dengan "${params.q}"`
      : params.cat
        ? `Belum ada broadcast di kategori ${categoryOf(params.cat).label}`
        : "Belum ada broadcast di arsip";
    return (
      <div className="glass flex flex-col items-center gap-3 rounded-[22px] px-6 py-12 text-center text-ink-2">
        <Inbox size={28} strokeWidth={1.5} className="text-muted" aria-hidden />
        {msg}.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((b, i) => (
        <StaggerItem key={b.id} index={i}>
          <BroadcastCard b={b} />
        </StaggerItem>
      ))}
      {cursor ? (
        <Button
          variant="secondary"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const page = await loadMoreBroadcasts(params, cursor);
              setItems((l) => [...l, ...page.items.filter((p) => !l.some((x) => x.id === p.id))]);
              setCursor(page.nextCursor);
            })
          }
        >
          {pending ? "Memuat..." : "Muat lebih banyak"}
        </Button>
      ) : null}
    </div>
  );
}
