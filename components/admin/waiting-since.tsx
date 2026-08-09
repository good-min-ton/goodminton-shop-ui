"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/api";

/**
 * How long an order has been sitting where it is.
 *
 * The reason orders got missed was not that nobody looked - it was that a list
 * sorted by order date gives no hint which rows are aging. A row that has waited
 * two days for a confirmation should look different from one placed an hour ago.
 *
 * Only statuses somebody has to act on are flagged. COMPLETED and CANCELLED are
 * finished: an old one is history, not a backlog.
 */
const ACTIONABLE: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "SHIPPING",
  "DELIVERED",
];

/** Hours after which a status is treated as overdue. PENDING is tightest: an
 *  unconfirmed order is holding stock it has already deducted. */
const OVERDUE_HOURS: Partial<Record<OrderStatus, number>> = {
  PENDING: 12,
  CONFIRMED: 24,
  PREPARING: 24,
  SHIPPING: 72,
  DELIVERED: 120,
};

export function WaitingSince({
  status,
  since,
}: Readonly<{ status: OrderStatus; since: string | null }>) {
  if (!since || !ACTIONABLE.includes(status)) return null;

  const changed = new Date(since).getTime();
  if (Number.isNaN(changed)) return null;

  const hours = (Date.now() - changed) / 3_600_000;
  const limit = OVERDUE_HOURS[status];
  const overdue = limit != null && hours >= limit;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px]",
        overdue ? "font-medium text-amber-500" : "text-admin-text-muted",
      )}
      title={overdue ? `Đã quá ${limit} giờ ở trạng thái này` : undefined}
    >
      {overdue && <AlertTriangle size={11} />}
      {describe(hours)}
    </span>
  );
}

function describe(hours: number): string {
  if (hours < 1) return "vừa cập nhật";
  if (hours < 24) return `${Math.floor(hours)} giờ`;
  return `${Math.floor(hours / 24)} ngày`;
}
