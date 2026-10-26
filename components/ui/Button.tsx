import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "link" | "danger" | "ghost";

const styles: Record<Variant, string> = {
  primary: "bg-gradient-to-b from-brand-500 to-brand-700 text-white shadow-[0_8px_24px_-8px_rgba(32,91,194,0.8),inset_0_1px_0_rgba(255,255,255,0.25)] hover:brightness-110 active:scale-[0.98] disabled:opacity-50",
  secondary: "bg-white/5 border border-line-strong text-ink backdrop-blur-md hover:bg-white/10 active:scale-[0.98] disabled:opacity-50",
  link: "bg-brand-50 border border-brand-500/30 text-brand-200 hover:bg-brand-100 hover:border-brand-400/50 w-full md:w-auto",
  danger: "bg-danger-strong text-white hover:opacity-90 disabled:opacity-50",
  ghost: "text-ink-2 hover:bg-white/5 hover:text-ink disabled:opacity-50",
};

export const buttonClass = (variant: Variant = "primary", extra?: string) =>
  cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-5 min-h-11 md:min-h-10 text-[15px] font-medium transition-all duration-200 cursor-pointer disabled:cursor-not-allowed",
    styles[variant],
    extra,
  );

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }>(
  function Button({ variant = "primary", className, type = "button", ...props }, ref) {
    return <button ref={ref} type={type} className={buttonClass(variant, className)} {...props} />;
  },
);
