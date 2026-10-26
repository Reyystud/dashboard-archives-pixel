import { cn } from "@/lib/cn";

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "danger" | "sand" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[12px]",
        tone === "neutral" && "border border-line text-ink-2",
        tone === "danger" && "bg-danger-bg text-danger",
        tone === "sand" && "bg-sand/15 text-sand",
      )}
    >
      {children}
    </span>
  );
}
