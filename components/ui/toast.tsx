"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { useToastStore, type Toast } from "@/store/toast-store";
import { cn } from "@/lib/utils";

const ICON: Record<Toast["type"], typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const STYLE: Record<Toast["type"], string> = {
  success: "border-primary-400 bg-primary-700 text-white",
  error: "border-red-400 bg-red-900 text-white",
  info: "border-blue-400 bg-blue-900 text-white",
  warning: "border-amber-400 bg-amber-800 text-white",
};

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const Icon = ICON[toast.type];

  useEffect(() => {
    if (toast.duration === Infinity) return;
    const t = setTimeout(() => dismiss(toast.id), toast.duration ?? 3500);
    return () => clearTimeout(t);
  }, [toast, dismiss]);

  return (
    <div
      className={cn(
        "animate-slide-in-right flex min-w-[300px] items-start gap-3 rounded-xl border px-4 py-3 shadow-lg",
        STYLE[toast.type],
      )}
    >
      <Icon size={18} className="mt-0.5 flex-shrink-0" />
      <span className="flex-1 text-sm leading-snug">{toast.message}</span>
      <button
        onClick={() => dismiss(toast.id)}
        className="opacity-70 hover:opacity-100"
        aria-label="Đóng"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed top-5 right-5 z-[9999] flex flex-col gap-2"
    >
      <div className="pointer-events-auto flex flex-col gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </div>
    </div>
  );
}
