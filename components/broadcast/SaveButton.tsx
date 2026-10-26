"use client";

import { AnimatePresence, motion } from "motion/react";
import { Bookmark } from "lucide-react";
import { useSaved, usePrevVisit } from "@/lib/client/saved";
import { useToast } from "@/components/ui/Toast";
import { isNew } from "@/lib/format";
import { cn } from "@/lib/cn";

export function SaveButton({ id, withLabel = false }: { id: string; withLabel?: boolean }) {
  const saved = useSaved();
  const toast = useToast();
  const on = saved.has(id);
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      aria-pressed={on}
      aria-label={on ? "Hapus dari disimpan" : "Simpan broadcast"}
      onClick={() => {
        saved.toggle(id);
        toast(on ? "Dihapus dari Disimpan" : "Disimpan di perangkat ini");
      }}
      className={cn(
        "relative z-10 inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-full transition-colors",
        withLabel ? "border border-line-strong bg-white/5 px-4 text-[15px] hover:bg-white/10" : "-m-2",
        on ? "text-sand" : "text-muted hover:text-ink",
      )}
    >
      <Bookmark size={18} strokeWidth={1.75} fill={on ? "currentColor" : "none"} aria-hidden />
      {withLabel ? (on ? "Tersimpan" : "Simpan") : null}
    </motion.button>
  );
}

/** "Baru" = masuk setelah kunjungan sebelumnya; kunjungan pertama memakai patokan 24 jam. */
export function NewBadge({ receivedAt }: { receivedAt: string }) {
  const prev = usePrevVisit();
  const show = prev === undefined ? false : prev === null ? isNew(receivedAt) : new Date(receivedAt).getTime() > prev;
  return (
    <AnimatePresence>
      {show ? (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 rounded-full bg-sand/10 px-2 py-0.5 text-[12px] font-medium text-sand"
        >
          <span className="ring-dot live" style={{ width: 6, height: 6 }} aria-hidden /> Baru
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
}
