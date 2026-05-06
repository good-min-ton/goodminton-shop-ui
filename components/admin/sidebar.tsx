"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Boxes,
  Users,
  Building2,
  Tag,
  Folders,
  Palette,
  Ruler,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useLogout } from "@/hooks/use-auth";
import { Logo } from "@/components/storefront/logo";

const NAV_GROUPS = [
  {
    label: "Tổng quan",
    items: [
      {
        href: "/admin/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Bán hàng",
    items: [
      { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingCart },
      { href: "/admin/products", label: "Sản phẩm", icon: Package },
      { href: "/admin/inventories", label: "Kho hàng", icon: Boxes },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/categories", label: "Danh mục", icon: Folders },
      { href: "/admin/brands", label: "Thương hiệu", icon: Tag },
      { href: "/admin/colors", label: "Màu sắc", icon: Palette },
      { href: "/admin/sizes", label: "Kích cỡ", icon: Ruler },
    ],
  },
  {
    label: "Quản trị",
    items: [
      { href: "/admin/accounts", label: "Tài khoản", icon: Users },
      { href: "/admin/stores", label: "Chi nhánh", icon: Building2 },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname() ?? "";
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <aside className="bg-admin-bg border-admin-border bg-soft-glow-dark fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col border-r lg:flex">
      <div className="border-admin-border border-b px-5 py-5">
        <Logo size="sm" variant="card" />
        <p className="font-mono text-admin-text-muted mt-2 text-[11px] tracking-widest uppercase">
          Super Admin Panel
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-6">
            <div className="font-display text-admin-text-muted mb-1.5 px-2 text-[11px] font-bold tracking-widest uppercase">
              {group.label}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg border-l-2 px-2.5 py-2 text-sm transition-colors",
                        active
                          ? "border-primary-400 bg-primary-400/10 text-primary-300 font-medium"
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
          </div>
        ))}
      </nav>

      <div className="border-admin-border flex items-center gap-3 border-t px-4 py-3">
        <div className="from-primary-400 to-primary-700 font-display flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-sm font-bold text-white">
          {user?.fullName?.slice(0, 2).toUpperCase() || "SA"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-admin-text truncate text-sm font-medium">
            {user?.fullName || "Super Admin"}
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
