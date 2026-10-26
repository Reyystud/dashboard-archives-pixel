"use client";

import { Search, X } from "lucide-react";

/** Kotak pencarian terkontrol; debounce dan pengambilan data ada di FeedBrowser. */
export function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <Search size={18} strokeWidth={1.75} aria-hidden className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Cari broadcast"
        aria-label="Cari broadcast"
        className="neu-well min-h-12 w-full rounded-full pl-11 pr-11 text-[15px] focus-visible:outline-brand-400 placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          aria-label="Hapus pencarian"
          onClick={() => onChange("")}
          className="absolute right-0.5 top-0.5 grid size-11 cursor-pointer place-items-center text-muted"
        >
          <X size={18} strokeWidth={1.75} />
        </button>
      ) : null}
    </div>
  );
}
