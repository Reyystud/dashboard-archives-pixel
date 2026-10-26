import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { SavedList } from "@/components/broadcast/SavedList";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = { title: "Disimpan", robots: { index: false } };

export default function DisimpanPage() {
  return (
    <SiteShell wide={false}>
      <Reveal>
        <h1 className="text-[32px] font-bold leading-tight md:text-[44px]">Disimpan</h1>
        <p className="mt-1 text-ink-2">Broadcast yang kamu tandai. Tersimpan di perangkat ini saja, tanpa login.</p>
      </Reveal>
      <div className="mt-6">
        <SavedList />
      </div>
    </SiteShell>
  );
}
