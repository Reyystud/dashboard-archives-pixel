import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { SavedList } from "@/components/broadcast/SavedList";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = { title: "Disimpan", robots: { index: false } };

export default function DisimpanPage() {
  return (
    <SiteShell wide={false}>
      <Reveal>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-300">Koleksi pribadi</p>
        <h1 className="mt-1 text-[32px] font-bold leading-tight md:text-[44px]">Disimpan</h1>
        <p className="mt-1 text-ink-2">Broadcast yang kamu tandai. Tersimpan di perangkat ini saja, tanpa login.</p>
      </Reveal>
      <div className="mt-6">
        <SavedList />
      </div>
    </SiteShell>
  );
}
