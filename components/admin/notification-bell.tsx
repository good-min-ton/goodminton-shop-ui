"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import {
  useMarkAllRead,
  useMarkRead,
  useNotificationStream,
  useNotifications,
  useUnreadCount,
} from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/types/api";

/**
 * The bell both admin panels share.
 *
 * An order changes hands three times on its way to the customer and every
 * handoff used to be silent, so orders sat in PENDING until somebody happened to
 * open the list. This is the thing that says "your turn".
 *
 * `orderHref` differs per panel - a store admin's order lives under
 * /store-admin/orders, a super admin's under /admin/orders - so the route is
 * passed in rather than guessed.
 */
/** Only the palette differs between the two panels. */
const ADMIN_THEME = {
  trigger: "text-admin-text-muted hover:bg-admin-surface-2 hover:text-admin-text",
  panel: "border-admin-border bg-admin-surface",
  border: "border-admin-border",
  title: "text-admin-text",
  muted: "text-admin-text-muted",
  accent: "text-admin-primary",
  row: "hover:bg-admin-surface-2",
  unreadRow: "bg-admin-primary/5",
  dot: "bg-admin-primary",
};

const STOREFRONT_THEME = {
  trigger: "text-stone-700 hover:bg-stone-100 hover:text-stone-900",
  panel: "border-stone-200 bg-white",
  border: "border-stone-200",
  title: "text-stone-800",
  muted: "text-stone-500",
  accent: "text-primary-700",
  row: "hover:bg-stone-50",
  unreadRow: "bg-primary-50",
  dot: "bg-primary-600",
};

export function NotificationBell({
  orderHref,
  variant = "admin",
}: Readonly<{
  orderHref: (orderId: number) => string;
  /** The admin panels are dark and the storefront is light, so the palette has
   *  to switch. Everything else - polling, the stream, mark-as-read - is
   *  identical, and a customer needs the bell for the same reason an admin
   *  does. */
  variant?: "admin" | "storefront";
}>) {
  const t = variant === "admin" ? ADMIN_THEME : STOREFRONT_THEME;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { data: unread = 0 } = useUnreadCount();
  // Only fetch the list while the panel is open; the badge alone is what polls.
  const { data, isLoading } = useNotifications(open);
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  useNotificationStream();

  // Close on an outside click, the way every other dropdown here behaves.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function openOrder(n: AppNotification) {
    if (!n.read) markRead.mutate(n.id);
    setOpen(false);
    router.push(orderHref(n.orderId));
  }

  const items = data?.content ?? [];

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unread > 0 ? `Thông báo (${unread} chưa đọc)` : "Thông báo"}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
          t.trigger,
        )}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className={cn(
            "animate-scale-in absolute right-0 z-50 mt-2 w-80 origin-top-right overflow-hidden rounded-xl border shadow-xl",
            t.panel,
          )}>
          <div className={cn("flex items-center justify-between border-b px-3 py-2", t.border)}>
            <p className={cn("text-sm font-semibold", t.title)}>Thông báo</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                className={cn("flex items-center gap-1 text-[11px] hover:underline", t.accent)}
              >
                <CheckCheck size={12} />
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading && (
              <p className={cn("px-3 py-6 text-center text-xs", t.muted)}>
                Đang tải...
              </p>
            )}
            {!isLoading && items.length === 0 && (
              <p className={cn("px-3 py-6 text-center text-xs", t.muted)}>
                Chưa có thông báo nào
              </p>
            )}
            {items.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => openOrder(n)}
                className={cn(
                  "block w-full border-b px-3 py-2.5 text-left transition-colors last:border-b-0",
                  t.border,
                  t.row,
                  !n.read && t.unreadRow,
                )}
              >
                <p className={cn("flex items-start gap-1.5 text-[13px] leading-snug", t.title)}>
                  {!n.read && (
                    <span className={cn("mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full", t.dot)} />
                  )}
                  <span className={cn(n.read && "pl-3")}>{n.message}</span>
                </p>
                <p className={cn("mt-0.5 pl-3 text-[11px]", t.muted)}>
                  {formatWhen(n.createdAt)}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Relative time, because "2 giờ trước" is what tells someone an order is aging. */
function formatWhen(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const minutes = Math.floor((Date.now() - then) / 60_000);
  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}
