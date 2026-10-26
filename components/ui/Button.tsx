import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "link" | "danger" | "ghost";

const styles: Record<Variant, string> = {
  primary: "neu-brand text-white disabled:opacity-50",
  secondary: "neu-raise text-ink disabled:opacity-50",
  link: "neu-raise text-brand-200 hover:text-brand-100 w-full md:w-auto",
  danger: "bg-danger-strong text-white shadow-neu-sm hover:opacity-90 active:shadow-neu-in-sm disabled:opacity-50",
  ghost: "text-ink-2 hover:text-ink hover:shadow-neu-xs active:shadow-neu-in-sm disabled:opacity-50",
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
