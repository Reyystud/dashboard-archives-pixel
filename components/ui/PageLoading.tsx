import { SiteShell } from "@/components/SiteShell";
import { CardSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { PIXEL_PARTS } from "@/lib/brand/pixel";

/** Loading antar halaman: tile logo berdenyut + skeleton kaca. */
export function PageLoading({ wide = true }: { wide?: boolean }) {
  return (
    <SiteShell wide={wide}>
      <div className="flex items-center gap-3" role="status" aria-label="Memuat">
        <span className="grid grid-cols-3 gap-1" aria-hidden>
          {PIXEL_PARTS.slice(0, 6).map((p, i) => (
            <span key={p.id} className="size-2.5 animate-pulse rounded-[3px] bg-brand-600" style={{ animationDelay: `${i * 120}ms` }} />
          ))}
        </span>
        <Skeleton className="h-8 w-56" />
      </div>
      <div className="mt-6 flex flex-col gap-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </SiteShell>
  );
}
