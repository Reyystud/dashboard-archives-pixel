import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { MomentGallery } from "@/components/momen/MomentGallery";
import { Reveal } from "@/components/motion/Reveal";
import { listMoments } from "@/lib/queries";

export const revalidate = 120;
export const metadata: Metadata = { title: "Momen angkatan", description: "Galeri momen PIXEL'25 HMIF ITB." };

export default async function MomenPage() {
  const moments = await listMoments();
  return (
    <SiteShell>
      <Reveal>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-300">03 · Momen</p>
        <h1 className="mt-1 text-[32px] font-bold leading-tight md:text-[44px]">
          Momen <span className="text-gradient">PIXEL&apos;25</span>
        </h1>
        <p className="mt-1 max-w-prose text-ink-2">Potongan cerita angkatan, dari makrab sampai begadang tubes.</p>
      </Reveal>
      <div className="mt-6">
        <MomentGallery moments={moments} />
      </div>
    </SiteShell>
  );
}
