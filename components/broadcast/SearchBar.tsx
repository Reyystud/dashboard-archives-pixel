"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const sp = useSearchParams();
  const [value, setValue] = useState(sp.get("q") ?? "");
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => {
      const next = new URLSearchParams(window.location.search);
      if (value.trim()) next.set("q", value.trim());
      else next.delete("q");
      const s = next.toString();
      router.replace(s ? `/?${s}` : "/", { scroll: false });
    }, 300);
    return () => clearTimeout(t);
  }, [value, router]);

  return (
    <div className="relative">
      <Search size={18} strokeWidth={1.75} aria-hidden className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Cari broadcast"
        aria-label="Cari broadcast"
        className="glass min-h-12 w-full rounded-full pl-11 pr-11 text-[15px] transition-colors hover:border-line-strong focus-visible:outline-brand-400 placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          aria-label="Hapus pencarian"
          onClick={() => setValue("")}
          className="absolute right-0.5 top-0.5 grid size-11 cursor-pointer place-items-center text-muted"
        >
          <X size={18} strokeWidth={1.75} />
        </button>
      ) : null}
    </div>
  );
}
