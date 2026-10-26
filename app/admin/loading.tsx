import { CardSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-3" role="status" aria-label="Memuat">
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}
