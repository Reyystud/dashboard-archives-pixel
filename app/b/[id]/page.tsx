import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, CalendarPlus, Download, FileText } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { CategoryTag } from "@/components/broadcast/CategoryTag";
import { LinkButtons } from "@/components/broadcast/LinkButtons";
import { RichText } from "@/components/broadcast/RichText";
import { DetailActions, StickyBar } from "@/components/broadcast/DetailActions";
import { SaveButton } from "@/components/broadcast/SaveButton";
import { Reveal } from "@/components/motion/Reveal";
import { buttonClass } from "@/components/ui/Button";
import { getBroadcast } from "@/lib/queries";
import { daysUntil, formatFullDate, formatDeadline } from "@/lib/format";
import { googleCalendarUrl } from "@/lib/calendar";
import { clientEnv } from "@/lib/env";

export const revalidate = 60;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const b = await getBroadcast((await params).id);
  if (!b) return {};
  return { title: b.title, description: b.body.replace(/\s+/g, " ").slice(0, 160), openGraph: { title: b.title, description: b.body.replace(/\s+/g, " ").slice(0, 160) } };
}

export default async function BroadcastPage({ params }: Props) {
  const b = await getBroadcast((await params).id);
  if (!b) notFound();
  const images = b.media.filter((m) => m.mime.startsWith("image/"));
  const pdfs = b.media.filter((m) => m.mime === "application/pdf");
  const left = b.deadline ? daysUntil(b.deadline) : null;

  return (
    <SiteShell wide={false}>
      <Link href="/#arsip" className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-[15px] text-ink-2 transition-colors hover:bg-white/5 hover:text-ink">
        <ArrowLeft size={18} strokeWidth={1.75} /> Arsip
      </Link>

      <article className="glass mt-3 rounded-[26px] p-5 pb-28 md:p-8 md:pb-8">
        <Reveal>
          <div className="flex items-center gap-3">
            <CategoryTag category={b.category} />
            <span className="ml-auto">
              <SaveButton id={b.id} />
            </span>
          </div>
          <h1 className="mt-4 text-[26px] font-bold leading-tight md:text-[36px]">{b.title}</h1>
          <p className="mt-3 font-mono text-[12px] text-muted">
            {[b.source_group, b.sender, formatFullDate(b.received_at)].filter(Boolean).join("  ·  ")}
          </p>
        </Reveal>

        {b.deadline && left !== null ? (
          <Reveal delay={0.08} className="mt-5 flex flex-col gap-3 rounded-[18px] border border-brand-500/25 bg-brand-50 p-4 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-brand-700/40 text-brand-200">
                <CalendarClock size={20} strokeWidth={1.75} aria-hidden />
              </span>
              <div>
                <p className="font-display text-[17px] font-semibold">Tenggat {formatDeadline(b.deadline)}</p>
                <p className={`text-[13px] ${left < 0 ? "text-danger" : left <= 3 ? "text-warn" : "text-ink-2"}`}>
                  {left < 0 ? "Sudah lewat" : left === 0 ? "Hari ini" : `${left} hari lagi`}
                </p>
              </div>
            </div>
            <div className="flex gap-2 md:ml-auto">
              <a
                href={googleCalendarUrl({ id: b.id, title: b.title, deadline: b.deadline }, clientEnv.NEXT_PUBLIC_SITE_URL)}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass("secondary", "flex-1 md:flex-none")}
              >
                <CalendarPlus size={17} strokeWidth={1.75} aria-hidden /> Google Calendar
              </a>
              <a href={`/api/ics/${b.id}`} className={buttonClass("ghost", "border border-line")} aria-label="Unduh file .ics">
                <Download size={17} strokeWidth={1.75} aria-hidden /> .ics
              </a>
            </div>
          </Reveal>
        ) : null}

        <Reveal delay={0.12} className="mt-6 text-[16px] text-ink md:text-[17px]">
          <RichText text={b.body} />
        </Reveal>

        {images.length ? (
          <div className="mt-6 flex flex-col gap-3">
            {images.map((m) => (
              <Reveal key={m.path}>
                <a href={m.url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-[18px] border border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt="" className="w-full transition-transform duration-500 hover:scale-[1.02]" />
                </a>
              </Reveal>
            ))}
          </div>
        ) : null}
        {pdfs.map((m) => (
          <div key={m.path} className="mt-3 flex items-center gap-3 rounded-[18px] border border-line bg-white/5 p-3">
            <FileText size={18} strokeWidth={1.75} className="text-muted" aria-hidden />
            <span className="flex-1 truncate font-mono text-[13px]">{m.path.split("/").pop()}</span>
            <a href={m.url} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary")}>Buka PDF</a>
          </div>
        ))}

        {b.links.length ? (
          <div className="mt-7 hidden md:block">
            <LinkButtons links={b.links} />
          </div>
        ) : null}
        <div className="mt-6 hidden md:block">
          <DetailActions body={b.body} title={b.title} />
        </div>
        <div className="mt-6 md:hidden">
          <LinkButtons links={b.links} />
        </div>
      </article>
      <StickyBar body={b.body} primary={b.links[0] ? { url: b.links[0].url, label: b.links[0].label } : undefined} />
    </SiteShell>
  );
}
