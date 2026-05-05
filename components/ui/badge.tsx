import { cn } from "@/lib/utils";

type Variant =
  | "neutral"
  | "primary"
  | "accent"
  | "success"
  | "warning"
  | "error"
  | "info";

const variantClass: Record<Variant, string> = {
  neutral: "bg-stone-100 text-stone-700",
  primary: "bg-primary-50 text-primary-700",
  accent: "bg-accent-light text-accent-dark",
  success: "bg-primary-50 text-primary-700",
  warning: "bg-amber-50 text-amber-700",
  error: "bg-red-50 text-red-700",
  info: "bg-blue-50 text-blue-700",
};

interface BadgeProps {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
  /** Use Barlow Condensed uppercase styling (CTA/label badge). */
  display?: boolean;
}

export function Badge({
  variant = "neutral",
  className,
  display,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        display && "font-display font-bold uppercase tracking-wider",
        variantClass[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
