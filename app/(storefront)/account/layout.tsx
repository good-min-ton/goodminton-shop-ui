"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Lock, Package, User } from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";
import { useAuthStore } from "@/store/auth-store";
import { useLogout } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/account", label: "Hồ sơ", icon: User },
  { href: "/account/change-password", label: "Đổi mật khẩu", icon: Lock },
  { href: "/orders", label: "Đơn hàng của tôi", icon: Package },
];

export default function AccountLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <RequireAuth roles={["CUSTOMER"]}>
      <AccountShell>{children}</AccountShell>
    </RequireAuth>
  );
}

function AccountShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <div className="container-app py-10">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside>
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <p className="text-xs font-medium tracking-wider text-stone-400 uppercase">
              Tài khoản
            </p>
            <p className="mt-1 truncate font-medium text-stone-900">
              {user?.fullName || "—"}
            </p>
            <p className="mt-0.5 truncate text-xs text-stone-500">
              {user?.email}
            </p>
          </div>

          <nav className="mt-4 space-y-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-primary-50 text-primary-700 font-medium"
                      : "text-stone-700 hover:bg-stone-100",
                  )}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={() => logout.mutate()}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-100"
            >
              <LogOut size={16} />
              Đăng xuất
            </button>
          </nav>
        </aside>

        <div>{children}</div>
      </div>
    </div>
  );
}
