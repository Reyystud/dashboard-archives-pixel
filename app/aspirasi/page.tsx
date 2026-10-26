import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { listPojok } from "@/lib/queries";

export const revalidate = 60;
export const metadata: Metadata = { title: "Pojok Aspirasi" };

export default async function AspirasiPage() {
  const list = await listPojok();
  return (
    <SiteShell wide={false}>
      <Reveal>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-300">04 · Aspirasi</p>
        <h1 className="mt-1 text-[32px] font-bold leading-tight md:text-[44px]">Pojok Aspirasi</h1>
        <p className="mt-1 text-ink-2">Tulis aspirasimu tanpa login. Jawaban yang sama akan tampil makin besar.</p>
      </Reveal>

      <div className="mt-5 flex flex-col gap-3">
        {list.length ? (
          list.map((p, i) => (
            <Reveal key={p.id} delay={Math.min(i, 6) * 0.05}>
            <TiltCard className="glass group rounded-[22px] transition-colors duration-200 hover:border-line-strong">
            <Link href={`/aspirasi/${p.slug}`} className="block p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[19px] font-semibold transition-colors group-hover:text-brand-200">{p.title}</h2>
                {p.is_open ? (
                  <span className="flex items-center gap-2 rounded-full bg-sand/10 px-2.5 py-0.5 text-[12px] text-sand"><span className="ring-dot live" style={{ width: 6, height: 6 }} aria-hidden />Dibuka</span>
                ) : (
                  <span className="text-[13px] text-muted">Ditutup</span>
                )}
              </div>
              <p className="mt-1 text-ink-2">{p.question}</p>
              <p className="mt-3 flex items-center justify-between font-mono text-[12px] text-muted">
                {p.total} jawaban
                <ArrowUpRight size={18} className="text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden />
              </p>
            </Link>
            </TiltCard>
            </Reveal>
          ))
        ) : (
          <p className="glass rounded-[22px] p-6 text-ink-2">Belum ada pojok aspirasi yang dibuka.</p>
        )}
      </div>
    </SiteShell>
  );
}
