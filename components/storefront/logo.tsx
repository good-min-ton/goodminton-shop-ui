import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Use `card` on dark backgrounds to keep the dark-element logo readable. */
  variant?: "default" | "card";
  href?: string;
  priority?: boolean;
}

const sizeMap: Record<NonNullable<LogoProps["size"]>, number> = {
  sm: 36,
  md: 52,
  lg: 72,
};

export function Logo({
  className,
  size = "md",
  variant = "default",
  href = "/",
  priority = false,
}: Readonly<LogoProps>) {
  const px = sizeMap[size];
  return (
    <Link
      href={href}
      aria-label="Goodminton Shop"
      className={cn("inline-flex items-center", className)}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center",
          variant === "card" &&
            "rounded-2xl bg-white p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]",
        )}
      >
        <Image
          src="/logo.png"
          alt="Goodminton Shop"
          width={px}
          height={px}
          priority={priority}
          className="block h-auto w-auto"
          style={{ height: px, width: px }}
        />
      </span>
    </Link>
  );
}
