"use client";

import { useEffect, useSyncExternalStore } from "react";

// Simpanan per-perangkat (tanpa login). Semua akses storage dibungkus try/catch:
// mode privat atau storage yang diblokir tidak boleh membuat halaman gagal.
const SAVED_KEY = "pixel:saved";
const LAST_VISIT_KEY = "pixel:last-visit";
const PREV_VISIT_KEY = "pixel:prev-visit";
const EVENT = "pixel:storage";
export const MAX_SAVED = 100;

function read(key: string, store: "local" | "session" = "local"): string | null {
  try {
    return (store === "local" ? localStorage : sessionStorage).getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string, store: "local" | "session" = "local") {
  try {
    (store === "local" ? localStorage : sessionStorage).setItem(key, value);
  } catch {}
}

export function parseSaved(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && /^[0-9a-f-]{36}$/.test(x)).slice(0, MAX_SAVED) : [];
  } catch {
    return [];
  }
}

export function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [id, ...ids].slice(0, MAX_SAVED);
}

function subscribe(cb: () => void) {
  const onStorage = (e: Event) => {
    if (e instanceof StorageEvent && e.key && e.key !== SAVED_KEY) return;
    cb();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(EVENT, cb);
  };
}

let cacheRaw: string | null | undefined;
let cacheIds: string[] = [];
function snapshot(): string[] {
  const raw = read(SAVED_KEY);
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    cacheIds = parseSaved(raw);
  }
  return cacheIds;
}
const EMPTY: string[] = [];

export function useSaved() {
  const ids = useSyncExternalStore(subscribe, snapshot, () => EMPTY);
  return {
    ids,
    has: (id: string) => ids.includes(id),
    toggle: (id: string) => {
      write(SAVED_KEY, JSON.stringify(toggleId(snapshot(), id)));
      window.dispatchEvent(new Event(EVENT));
    },
  };
}

/** Waktu kunjungan sebelumnya (ms), tetap sama selama satu sesi. null = kunjungan pertama. */
export function prevVisit(): number | null {
  const v = Number(read(PREV_VISIT_KEY, "session"));
  return Number.isFinite(v) && v > 0 ? v : null;
}

export function usePrevVisit(): number | null | undefined {
  // undefined saat SSR/hidrasi, supaya badge baru muncul setelah mount tanpa mismatch.
  return useSyncExternalStore(subscribe, prevVisit, () => undefined);
}

/** Dipasang sekali di root: catat kunjungan sebelumnya ke sessionStorage, lalu perbarui waktu kunjungan. */
export function VisitTracker() {
  useEffect(() => {
    if (read(PREV_VISIT_KEY, "session") === null) {
      write(PREV_VISIT_KEY, read(LAST_VISIT_KEY) ?? "0", "session");
      window.dispatchEvent(new Event(EVENT));
    }
    write(LAST_VISIT_KEY, String(Date.now()));
  }, []);
  return null;
}
