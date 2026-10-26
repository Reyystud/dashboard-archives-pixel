import { Suspense } from "react";
import { SiteShell } from "@/components/SiteShell";
import { SearchBar } from "@/components/broadcast/SearchBar";
import { CategoryChips, CategorySidebar } from "@/components/broadcast/CategoryChips";
import { FeedList } from "@/components/broadcast/FeedList";
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
  const params = { cat, q };
  const today = todayJakarta();

  const [page, counts, deadlines, stats] = await Promise.all([
    listBroadcasts(params),
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
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-300">01 · Arsip</p>
            <h2 id="arsip-title" className="mt-1 text-[26px] font-bold md:text-[34px]">Broadcast angkatan</h2>
          </div>
        </div>
        <div className="lg:grid lg:grid-cols-[232px_minmax(0,680px)_280px] lg:justify-center lg:gap-6">
          <div className="hidden lg:block">
            <CategorySidebar active={cat} q={q} counts={counts} />
          </div>
          <div className="min-w-0">
            <Suspense>
              <SearchBar />
            </Suspense>
            <div className="sticky top-[76px] z-20 -mx-4 mb-1 bg-bg/70 px-4 backdrop-blur-xl lg:hidden">
              <CategoryChips active={cat} q={q} counts={counts} />
            </div>
            <div className="mt-2">
              <FeedList key={`${cat ?? ""}|${q ?? ""}`} initial={page.items} nextCursor={page.nextCursor} params={params} />
            </div>
          </div>
          <div className="hidden lg:block">
            <DeadlineRail items={deadlines} />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
