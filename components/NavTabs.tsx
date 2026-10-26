"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Bookmark, CalendarDays, Images, Inbox, MessagesSquare, Search } from "lucide-react";
import { openCommandPalette } from "@/lib/client/palette";
import { useSaved } from "@/lib/client/saved";
import { cn } from "@/lib/cn";

const ITEMS = [
  { href: "/", label: "Arsip", icon: Inbox },
  { href: "/kalender", label: "Kalender", icon: CalendarDays },
  { href: "/momen", label: "Momen", icon: Images },
  { href: "/aspirasi", label: "Aspirasi", icon: MessagesSquare },
  { href: "/disimpan", label: "Disimpan", icon: Bookmark },
];

function useActive() {
  const path = usePathname();
  return (href: string) => (href === "/" ? path === "/" || path.startsWith("/b/") : path.startsWith(href));
}

export function NavTabs({ variant }: { variant: "desktop" | "mobile" }) {
  const active = useActive();
  const saved = useSaved();

  if (variant === "desktop") {
    return (
      <nav className="hidden items-center gap-0.5 md:flex" aria-label="Utama">
        {ITEMS.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            aria-current={active(i.href) ? "page" : undefined}
            className={cn(
              "relative flex min-h-10 items-center gap-1.5 rounded-full px-3.5 text-[14px] transition-colors duration-200",
              active(i.href) ? "text-ink" : "text-ink-2 hover:text-ink",
            )}
          >
            {active(i.href) ? (
              <motion.span
                layoutId="nav-pill"
                className="absolute inset-0 -z-10 rounded-full border border-white/10 bg-white/10"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            ) : null}
            {i.label}
            {i.href === "/disimpan" && saved.ids.length ? (
              <span className="rounded-full bg-brand-700 px-1.5 font-mono text-[11px] leading-[18px] text-white">{saved.ids.length}</span>
            ) : null}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav
      className="glass-strong fixed inset-x-3 bottom-3 z-40 flex h-16 items-stretch rounded-[22px] px-1 pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Utama"
    >
      {ITEMS.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          aria-current={active(i.href) ? "page" : undefined}
          className={cn(
            "relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] transition-colors",
            active(i.href) ? "text-ink" : "text-muted",
          )}
        >
          {active(i.href) ? (
            <motion.span
              layoutId="nav-pill-m"
              className="absolute inset-x-1 inset-y-1.5 -z-10 rounded-2xl bg-brand-50 ring-1 ring-brand-500/30"
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            />
          ) : null}
          <i.icon size={20} strokeWidth={1.75} aria-hidden />
          {i.label}
        </Link>
      ))}
    </nav>
  );
}

export function SearchTrigger({ compact = false }: { compact?: boolean }) {
  return (
    <button
      type="button"
      onClick={openCommandPalette}
      aria-label="Buka pencarian cepat"
      className={cn(
        "flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-line bg-white/5 text-[14px] text-muted transition-colors hover:border-line-strong hover:text-ink",
        compact ? "size-11 justify-center" : "px-3.5",
      )}
    >
      <Search size={16} strokeWidth={1.75} aria-hidden />
      {compact ? null : (
        <>
          <span>Cari</span>
          <kbd className="rounded-md border border-line px-1.5 font-mono text-[11px]">⌘K</kbd>
        </>
      )}
    </button>
  );
}
