"use client";

import { Menu } from "lucide-react";
import { NotificationBell } from "@/components/admin/notification-bell";
import { formatDate } from "@/lib/utils";
import { useAdminShellStore } from "@/store/admin-shell-store";

export function StoreAdminTopbar() {
  const openDrawer = useAdminShellStore((s) => s.open);

  return (
    <header
      className="border-admin-border sticky top-0 z-20 flex h-[60px] items-center justify-between border-b px-4 backdrop-blur-sm md:px-6"
      style={{ background: "rgba(19, 22, 31, 0.85)" }}
    >
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
        {/* The store admin is the middle of the chain: they get told when an
            order is confirmed and needs preparing, which is the handoff most
            likely to sit unnoticed. */}
        <NotificationBell orderHref={(id) => `/store-admin/orders/${id}`} />
      </div>
    </header>
  );
}
