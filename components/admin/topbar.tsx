"use client";

import { Menu } from "lucide-react";
import { NotificationBell } from "./notification-bell";
import { formatDate } from "@/lib/utils";
import { useAdminShellStore } from "@/store/admin-shell-store";

export function AdminTopbar() {
  const openDrawer = useAdminShellStore((s) => s.open);

  return (
    <header className="border-admin-border bg-admin-bg/80 sticky top-0 z-20 flex h-[64px] items-center justify-between border-b px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={openDrawer}
          className="text-admin-text-muted hover:bg-admin-surface hover:text-admin-text rounded-md p-2 lg:hidden"
          aria-label="Mở menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <p className="text-admin-text-muted text-xs">Hôm nay</p>
          <p className="text-admin-text font-mono text-sm">
            {formatDate(new Date())}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Was a decorative Bell that did nothing, which is worse than no bell:
            it looks like notifications exist. */}
        <NotificationBell orderHref={(id) => `/admin/orders/${id}`} />
      </div>
    </header>
  );
}
