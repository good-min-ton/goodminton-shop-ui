import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "xl" | "full";
}

const roundedClass: Record<NonNullable<SkeletonProps["rounded"]>, string> = {
  sm: "rounded",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

export function Skeleton({
  className,
  rounded = "md",
}: Readonly<SkeletonProps>) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse bg-stone-200/70 dark:bg-stone-700/40",
        roundedClass[rounded],
        className,
      )}
    />
  );
}
