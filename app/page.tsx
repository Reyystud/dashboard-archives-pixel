import { SiteShell } from "@/components/SiteShell";
import { FeedBrowser } from "@/components/broadcast/FeedBrowser";
import { DeadlineRail } from "@/components/broadcast/DeadlineRail";
import { Hero } from "@/components/home/Hero";
import { categoryCounts, homeStats, listBroadcasts, upcomingDeadlines } from "@/lib/queries";
import { todayJakarta } from "@/lib/classify/rules";
import { addDays } from "@/lib/calendar";
import { CATEGORY_KEYS } from "@/lib/categories";

export const revalidate = 60;

type Props = { searchParams: Promise<{ cat?: string; q?: string }> };

export default async function Home({ searchParams }: Props) {
  const sp = await searchParams;
  const cat = sp.cat && (CATEGORY_KEYS as string[]).includes(sp.cat) ? sp.cat : undefined;
  const q = sp.q?.trim() || undefined;
  const today = todayJakarta();

  const [page, counts, deadlines, stats] = await Promise.all([
    listBroadcasts({ cat, q }),
    categoryCounts(),
    upcomingDeadlines(today),
    homeStats(today, addDays(today, 7)),
  ]);

  return (
    <SiteShell>
      <Hero stats={stats} />
      <section id="arsip" aria-labelledby="arsip-title" className="scroll-mt-24">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 id="arsip-title" className="text-[26px] font-bold md:text-[34px]">Broadcast angkatan</h2>
          </div>
        </div>
        <FeedBrowser
          initialCat={cat}
          initialQ={q}
          initialPage={page}
          counts={counts}
          rail={<DeadlineRail items={deadlines} />}
        />
      </section>
    </SiteShell>
  );
}
