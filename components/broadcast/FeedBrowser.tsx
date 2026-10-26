"use client";

import { useEffect, useRef, useState } from "react";
import { CategoryChips, CategorySidebar } from "./CategoryChips";
import { FeedList } from "./FeedList";
import { SearchBar } from "./SearchBar";
import { useToast } from "@/components/ui/Toast";
import { CATEGORY_KEYS } from "@/lib/categories";
import { cn } from "@/lib/cn";
import type { Broadcast } from "@/lib/types";

type Page = { items: Broadcast[]; nextCursor: string | null };
type Entry = { page: Page; at: number };
type Shown = { key: string; cat?: string; q?: string; page: Page };

const STALE_MS = 60_000;
const SEARCH_DEBOUNCE_MS = 250;
const keyOf = (cat?: string, q?: string) => `${cat ?? ""}|${q ?? ""}`;
const EMPTY: Page = { items: [], nextCursor: null };

/**
 * Feed + kategori + pencarian dalam satu komponen klien. Ganti kategori/pencarian TIDAK menavigasi halaman:
 * status aktif langsung berpindah, hasil diambil dari cache klien (atau /api/feed), URL diperbarui lewat replaceState.
 */
export function FeedBrowser({
  initialCat, initialQ, initialPage, counts, rail,
}: {
  initialCat?: string;
  initialQ?: string;
  initialPage: Page;
  counts: Record<string, number>;
  rail: React.ReactNode;
}) {
  const toast = useToast();
  const [cache] = useState(() => new Map<string, Entry>());
  const [inflight] = useState(() => new Map<string, Promise<Page | null>>());
  const [cat, setCat] = useState(initialCat);
  const [q, setQ] = useState(initialQ ?? "");
  const [shown, setShown] = useState<Shown>({ key: keyOf(initialCat, initialQ), cat: initialCat, q: initialQ, page: initialPage });
  const [pending, setPending] = useState(false);
  const wanted = useRef(shown.key);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    cache.set(keyOf(initialCat, initialQ), { page: initialPage, at: Date.now() });
    // Prefetch 3 kategori terbanyak saat idle (lewati bila hemat data / koneksi lambat).
    const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };
    if (nav.connection?.saveData || (nav.connection?.effectiveType && nav.connection.effectiveType !== "4g")) return;
    const top = [...CATEGORY_KEYS].filter((c) => (counts[c] ?? 0) > 0 && c !== initialCat).sort((a, b) => counts[b] - counts[a]).slice(0, 3);
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    const run = () => top.forEach((c, i) => setTimeout(() => void load(c, undefined), i * 300));
    const id = w.requestIdleCallback ? w.requestIdleCallback(run, { timeout: 4000 }) : window.setTimeout(run, 2000);
    return () => (w.cancelIdleCallback ? w.cancelIdleCallback(id) : clearTimeout(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function load(c?: string, qq?: string): Promise<Page | null> {
    const k = keyOf(c, qq);
    const running = inflight.get(k);
    if (running) return running;
    const sp = new URLSearchParams();
    if (c) sp.set("cat", c);
    if (qq) sp.set("q", qq);
    const p = fetch(`/api/feed?${sp}`)
      .then((r) => (r.ok ? (r.json() as Promise<Page>) : null))
      .then((page) => {
        if (page) cache.set(k, { page, at: Date.now() });
        return page;
      })
      .catch(() => null)
      .finally(() => inflight.delete(k));
    inflight.set(k, p);
    return p;
  }

  function sync(c?: string, qq?: string) {
    const sp = new URLSearchParams();
    if (c) sp.set("cat", c);
    if (qq) sp.set("q", qq);
    const s = sp.toString();
    window.history.replaceState(window.history.state, "", s ? `/?${s}` : "/");
  }

  function show(c?: string, qq?: string) {
    const k = keyOf(c, qq);
    wanted.current = k;
    const done = (page: Page) => {
      setShown({ key: k, cat: c, q: qq, page });
      setPending(false);
    };
    const hit = cache.get(k);
    if (hit) {
      done(hit.page);
      if (Date.now() - hit.at > STALE_MS) void load(c, qq).then((p) => p && wanted.current === k && done(p));
      return;
    }
    // Kategori kosong menurut hitungan: tidak perlu ke server.
    if (c && !qq && (counts[c] ?? 0) === 0) {
      cache.set(k, { page: EMPTY, at: Date.now() });
      done(EMPTY);
      return;
    }
    setPending(true);
    void load(c, qq).then((p) => {
      if (wanted.current !== k) return;
      setPending(false);
      if (p) done(p);
      else toast("Gagal memuat broadcast. Coba lagi.", true);
    });
  }

  function selectCat(c?: string) {
    if (c === cat && !q.trim()) return;
    setCat(c);
    const qq = q.trim() || undefined;
    sync(c, qq);
    show(c, qq);
    // Bila pengguna sudah menggulir melewati awal feed, bawa kembali ke awal.
    const top = document.getElementById("arsip")?.getBoundingClientRect().top ?? 0;
    if (top < 0) document.getElementById("arsip")?.scrollIntoView({ block: "start" });
  }

  function onSearch(v: string) {
    setQ(v);
    clearTimeout(timer.current);
    const qq = v.trim() || undefined;
    const go = () => {
      sync(cat, qq);
      show(cat, qq);
    };
    if (!qq) go();
    else timer.current = setTimeout(go, SEARCH_DEBOUNCE_MS);
  }

  const intent = (c?: string) => {
    if (q.trim() || keyOf(c) === shown.key || cache.has(keyOf(c)) || (c && (counts[c] ?? 0) === 0)) return;
    void load(c, undefined);
  };

  return (
    <div className="lg:grid lg:grid-cols-[232px_minmax(0,680px)_280px] lg:justify-center lg:gap-6">
      <div className="hidden lg:block">
        <CategorySidebar active={cat} q={q.trim() || undefined} counts={counts} onSelect={selectCat} onIntent={intent} />
      </div>
      <div className="min-w-0">
        <SearchBar value={q} onChange={onSearch} />
        <div className="sticky top-[76px] z-20 -mx-4 mb-1 bg-bg/95 px-4 lg:hidden">
          <CategoryChips active={cat} q={q.trim() || undefined} counts={counts} onSelect={selectCat} onIntent={intent} />
          <div className={cn("h-0.5 origin-left rounded-full bg-gradient-to-r from-brand-500 to-sand transition-opacity", pending ? "animate-pulse opacity-100" : "opacity-0")} aria-hidden />
        </div>
        <div className="mt-2" aria-busy={pending}>
          <div className={cn("transition-opacity duration-150", pending && "pointer-events-none opacity-50")}>
            <FeedList
              key={shown.key}
              initial={shown.page.items}
              nextCursor={shown.page.nextCursor}
              params={{ cat: shown.cat, q: shown.q }}
            />
          </div>
        </div>
      </div>
      <div className="hidden lg:block">{rail}</div>
    </div>
  );
}
