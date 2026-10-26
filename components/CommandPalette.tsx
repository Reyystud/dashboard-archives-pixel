"use client";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bookmark, CalendarDays, CornerDownLeft, FileText, Images, Inbox, Loader2, MessagesSquare, Search, Tag } from "lucide-react";
import { CATEGORIES, categoryOf } from "@/lib/categories";
import { formatDeadline } from "@/lib/format";

const OPEN_EVENT = "pixel:cmdk";
export const openCommandPalette = () => window.dispatchEvent(new Event(OPEN_EVENT));

type Result = {
  broadcasts: { id: string; title: string; category: string; deadline: string | null }[];
  pojok: { slug: string; title: string; question: string }[];
};

const PAGES = [
  { href: "/", label: "Arsip broadcast", icon: Inbox },
  { href: "/kalender", label: "Kalender tenggat", icon: CalendarDays },
  { href: "/momen", label: "Momen angkatan", icon: Images },
  { href: "/aspirasi", label: "Pojok aspirasi", icon: MessagesSquare },
  { href: "/disimpan", label: "Broadcast disimpan", icon: Bookmark },
];

const EMPTY: Result = { broadcasts: [], pojok: [] };
const match = (text: string, q: string) => !q || text.toLowerCase().includes(q.toLowerCase());

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [res, setRes] = useState<Result>({ broadcasts: [], pojok: [] });
  const [loading, setLoading] = useState(false);
  const reqId = useRef(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return;
    const id = ++reqId.current;
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
        const data = (await r.json()) as Result;
        if (id === reqId.current) setRes(data);
      } catch {
        if (id === reqId.current) setRes({ broadcasts: [], pojok: [] });
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const go = (href: string) => {
    setOpen(false);
    setQ("");
    router.push(href);
  };

  const active = q.trim().length >= 2;
  const shown = active ? res : EMPTY;
  const busy = active && loading;
  const pages = PAGES.filter((p) => match(p.label, q));
  const cats = CATEGORIES.filter((c) => match(c.label, q));
  const item = "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 text-[14px] text-ink-2 aria-selected:text-ink";

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Pencarian cepat"
      shouldFilter={false}
      overlayClassName="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm animate-[fade-in_150ms_ease-out]"
      contentClassName="glass-strong fixed left-1/2 top-[12vh] z-[71] w-[calc(100vw-24px)] max-w-xl -translate-x-1/2 overflow-hidden rounded-[22px] animate-[pop-in_220ms_cubic-bezier(0.22,1,0.36,1)]"
    >
      <div className="flex items-center gap-3 border-b border-line px-4">
        {busy ? (
          <Loader2 size={18} className="animate-spin text-muted" aria-hidden />
        ) : (
          <Search size={18} strokeWidth={1.75} className="text-muted" aria-hidden />
        )}
        <Command.Input
          value={q}
          onValueChange={(v) => {
            setQ(v);
            setLoading(v.trim().length >= 2);
          }}
          placeholder="Cari broadcast, kategori, halaman…"
          className="h-14 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-muted"
        />
        <kbd className="hidden rounded-md border border-line px-1.5 font-mono text-[11px] text-muted md:block">Esc</kbd>
      </div>
      <Command.List className="max-h-[min(60vh,440px)] overflow-y-auto p-2">
        <Command.Empty className="px-3 py-8 text-center text-[14px] text-muted">
          {busy ? "Mencari…" : "Tidak ada hasil."}
        </Command.Empty>

        {shown.broadcasts.length ? (
          <Command.Group heading="Broadcast">
            {shown.broadcasts.map((b) => (
              <Command.Item key={b.id} value={`b-${b.id}`} onSelect={() => go(`/b/${b.id}`)} className={item}>
                <FileText size={16} strokeWidth={1.75} className="flex-none text-muted" aria-hidden />
                <span className="min-w-0 flex-1 truncate">{b.title}</span>
                <span className="flex-none font-mono text-[11px] text-muted">
                  {b.deadline ? `Tenggat ${formatDeadline(b.deadline)}` : categoryOf(b.category).label}
                </span>
              </Command.Item>
            ))}
          </Command.Group>
        ) : null}

        {shown.pojok.length ? (
          <Command.Group heading="Pojok aspirasi">
            {shown.pojok.map((p) => (
              <Command.Item key={p.slug} value={`p-${p.slug}`} onSelect={() => go(`/aspirasi/${p.slug}`)} className={item}>
                <MessagesSquare size={16} strokeWidth={1.75} className="flex-none text-muted" aria-hidden />
                <span className="min-w-0 flex-1 truncate">{p.question}</span>
              </Command.Item>
            ))}
          </Command.Group>
        ) : null}

        {pages.length ? (
          <Command.Group heading="Halaman">
            {pages.map((p) => (
              <Command.Item key={p.href} value={`page-${p.href}`} onSelect={() => go(p.href)} className={item}>
                <p.icon size={16} strokeWidth={1.75} className="flex-none text-muted" aria-hidden />
                <span className="flex-1">{p.label}</span>
                <CornerDownLeft size={14} className="text-muted opacity-0 [[aria-selected=true]_&]:opacity-100" aria-hidden />
              </Command.Item>
            ))}
          </Command.Group>
        ) : null}

        {cats.length ? (
          <Command.Group heading="Kategori">
            {cats.map((c) => (
              <Command.Item key={c.key} value={`cat-${c.key}`} onSelect={() => go(`/?cat=${c.key}#arsip`)} className={item}>
                <Tag size={16} strokeWidth={1.75} className="flex-none" style={{ color: c.color }} aria-hidden />
                <span className="flex-1">{c.label}</span>
              </Command.Item>
            ))}
          </Command.Group>
        ) : null}
      </Command.List>
      <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 font-mono text-[11px] text-muted">
        <span>↑↓ pilih</span>
        <span>↵ buka</span>
        <span className="ml-auto">⌘K / Ctrl+K</span>
      </div>
    </Command.Dialog>
  );
}
