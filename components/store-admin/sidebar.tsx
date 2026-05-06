"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  Store,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useLogout } from "@/hooks/use-auth";
import { Logo } from "@/components/storefront/logo";

const NAV = [
  {
    href: "/store-admin/dashboard",
    label: "Tổng quan",
    icon: LayoutDashboard,
  },
  {
    href: "/store-admin/orders",
    label: "Đơn hàng",
    icon: ShoppingCart,
  },
  {
    href: "/store-admin/inventory",
    label: "Tồn kho",
    icon: Boxes,
  },
  {
    href: "/store-admin/pos",
    label: "Bán tại quầy",
    icon: Store,
  },
];

export function StoreAdminSidebar() {
  const pathname = usePathname() ?? "";
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <aside
      className="border-admin-border fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col border-r lg:flex"
      style={{ background: "#13161f" }}
    >
      <div className="border-admin-border border-b px-5 py-5">
        <Logo size="sm" variant="card" />
        <p className="font-mono mt-2 text-[11px] tracking-widest text-amber-400 uppercase">
          Store Admin
        </p>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg border-l-2 px-2.5 py-2.5 text-sm transition-colors",
                    active
                      ? "border-amber-400 bg-amber-400/10 font-medium text-amber-300"
                      : "text-admin-text-muted hover:bg-admin-surface hover:text-admin-text border-transparent",
                  )}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-admin-border flex items-center gap-3 border-t px-4 py-3">
        <div className="font-display flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-sm font-bold text-stone-900">
          {user?.fullName?.slice(0, 2).toUpperCase() || "SA"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-admin-text truncate text-sm font-medium">
            {user?.fullName || "Store Admin"}
          </div>
          <div className="text-admin-text-muted truncate text-[11px]">
            {user?.email}
          </div>
        </div>
        <button
          onClick={() => logout.mutate()}
          className="text-admin-text-muted hover:bg-admin-surface hover:text-admin-text rounded-md p-1.5"
          aria-label="Đăng xuất"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
