import Link from "next/link";
import { CalendarClock, Pin } from "lucide-react";
import { CategoryTag } from "./CategoryTag";
import { LinkButtons } from "./LinkButtons";
import { NewBadge, SaveButton } from "./SaveButton";
import { TiltCard } from "@/components/motion/TiltCard";
import { daysUntil, formatDeadline, formatRelative } from "@/lib/format";
import type { Broadcast } from "@/lib/types";

export function BroadcastCard({ b }: { b: Broadcast }) {
  const image = b.media.find((m) => m.mime.startsWith("image/"));
  const left = b.deadline ? daysUntil(b.deadline) : null;
  return (
    <TiltCard className="glass group relative rounded-[22px] p-4 transition-colors duration-200 hover:border-line-strong md:p-5">
      <article>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <CategoryTag category={b.category} />
          {b.pinned ? (
            <span className="inline-flex items-center gap-1 text-[13px] text-sand">
              <Pin size={13} strokeWidth={2} aria-hidden /> Disematkan
            </span>
          ) : null}
          <NewBadge receivedAt={b.received_at} />
          <time dateTime={b.received_at} suppressHydrationWarning className="ml-auto font-mono text-[12px] text-muted">
            {formatRelative(b.received_at)}
          </time>
          <SaveButton id={b.id} />
        </div>

        <div className="mt-3 flex gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-[17px] font-semibold leading-snug line-clamp-2 md:text-[18px]">
              <Link
                href={`/b/${b.id}`}
                className="transition-colors after:absolute after:inset-0 after:rounded-[22px] after:content-[''] group-hover:text-brand-200"
              >
                {b.title}
              </Link>
            </h2>
            <p className="mt-1.5 whitespace-pre-line text-[15px] text-ink-2 line-clamp-3">{b.body}</p>
          </div>
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image.url}
              alt=""
              loading="lazy"
              className="size-[76px] flex-none rounded-[14px] border border-line object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : null}
        </div>

        {b.deadline && left !== null ? (
          <p
            className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[12px] ${
              left < 0
                ? "border-danger/30 text-danger"
                : left <= 3
                  ? "border-warn/30 bg-warn/10 text-warn"
                  : "border-line text-ink-2"
            }`}
          >
            <CalendarClock size={13} strokeWidth={2} aria-hidden />
            Tenggat {formatDeadline(b.deadline)}
            {left >= 0 ? ` · ${left === 0 ? "hari ini" : `${left} hari lagi`}` : " · lewat"}
          </p>
        ) : null}

        {b.links.length ? (
          <div className="mt-3">
            <LinkButtons links={b.links} compact />
          </div>
        ) : null}
      </article>
    </TiltCard>
  );
}
