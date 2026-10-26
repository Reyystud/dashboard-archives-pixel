"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-[760px] px-4 py-16">
      <div className="glass rounded-[26px] p-8">
        <h1 className="text-[26px] font-bold md:text-[32px]">Terjadi kesalahan</h1>
        <p className="mt-2 text-ink-2">Data tidak bisa dimuat. Jika baru lama tidak dipakai, database mungkin sedang dipulihkan.</p>
        <Button className="mt-5" onClick={reset}>
          <RotateCcw size={17} aria-hidden /> Coba lagi
        </Button>
      </div>
    </main>
  );
}
