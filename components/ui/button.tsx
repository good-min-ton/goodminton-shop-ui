"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost"
  | "admin-primary"
  | "admin-ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  /** When true, render uppercase Barlow Condensed label (CTA style). */
  uppercase?: boolean;
}

const variantClass: Record<Variant, string> = {
  primary:
    "bg-primary-700 text-white hover:bg-primary-800 active:bg-primary-900 disabled:bg-primary-700/60",
  secondary:
    "bg-transparent text-stone-700 border-[1.5px] border-stone-300 hover:bg-stone-50 hover:border-stone-400",
  danger:
    "bg-transparent text-error border-[1.5px] border-red-200 hover:bg-red-50",
  ghost: "bg-transparent text-stone-700 hover:bg-stone-100",
  "admin-primary":
    "bg-primary-400 text-admin-bg hover:bg-primary-300 active:bg-primary-500",
  "admin-ghost":
    "bg-white/5 text-admin-text border border-admin-border hover:bg-white/10",
};

const sizeClass: Record<Size, string> = {
  sm: "px-3.5 py-1.5 text-[13px] rounded-md",
  md: "px-5 py-2.5 text-[15px] rounded-lg",
  lg: "px-7 py-3.5 text-[17px] rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "md",
      uppercase = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300",
          "disabled:cursor-not-allowed disabled:opacity-60",
          uppercase && "font-display font-bold tracking-wider uppercase",
          variantClass[variant],
          sizeClass[size],
          className,
        )}
        {...props}
      >
        {loading && (
          <span
            aria-hidden
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        )}
        {children}
      </button>
    );
  },
);
