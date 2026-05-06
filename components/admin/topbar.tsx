"use client";

import { Bell } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function AdminTopbar() {
  return (
    <header className="border-admin-border bg-admin-bg/80 sticky top-0 z-20 flex h-[64px] items-center justify-between border-b px-6 backdrop-blur-sm">
      <div>
        <p className="text-admin-text-muted text-xs">Hôm nay</p>
        <p className="text-admin-text font-mono text-sm">
          {formatDate(new Date())}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="text-admin-text-muted hover:bg-admin-surface hover:text-admin-text relative rounded-lg p-2"
          aria-label="Thông báo"
        >
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
}
