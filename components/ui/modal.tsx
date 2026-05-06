"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  /** Match the surrounding theme. `dark` = admin/store-admin panels. */
  theme?: Theme;
}

const sizeClass = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

const surface: Record<Theme, string> = {
  light: "bg-white",
  dark: "bg-admin-surface ring-1 ring-admin-border",
};

const headerBorder: Record<Theme, string> = {
  light: "border-stone-200",
  dark: "border-admin-border",
};

const titleColor: Record<Theme, string> = {
  light: "text-stone-900",
  dark: "text-admin-text",
};

const closeBtn: Record<Theme, string> = {
  light: "text-stone-500 hover:bg-stone-100 hover:text-stone-900",
  dark: "text-admin-text-muted hover:bg-admin-surface-2 hover:text-admin-text",
};

const footerSurface: Record<Theme, string> = {
  light: "border-stone-200",
  dark: "border-admin-border bg-admin-surface-2/40",
};

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  className,
  theme = "light",
}: Readonly<ModalProps>) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "animate-scale-in relative w-full rounded-2xl shadow-xl",
          surface[theme],
          sizeClass[size],
          className,
        )}
      >
        {title && (
          <div
            className={cn(
              "flex items-center justify-between border-b px-6 py-4",
              headerBorder[theme],
            )}
          >
            <h2
              className={cn(
                "font-display text-xl font-bold tracking-tight",
                titleColor[theme],
              )}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className={cn("rounded-md p-1", closeBtn[theme])}
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div
            className={cn(
              "flex items-center justify-end gap-2 border-t px-6 py-4",
              footerSurface[theme],
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
