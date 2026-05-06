"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./logo";
import { HeaderSearch } from "./header-search";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { useLogout } from "@/hooks/use-auth";

const NAV_LINKS = [
  { href: "/products?categoryId=1", label: "Vợt" },
  { href: "/products?categoryId=2", label: "Giày" },
  { href: "/products?categoryId=3", label: "Áo" },
  { href: "/products?categoryId=4", label: "Phụ kiện" },
  { href: "/products", label: "Tất cả" },
];

export function StorefrontHeader() {
  const pathname = usePathname();
  const totalItems = useCartStore((s) => s.totalItems());
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const logout = useLogout();
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur-sm">
      <div className="container-app flex h-[72px] items-center gap-6">
        <Logo size="md" priority />

        <nav className="hidden flex-1 items-center justify-center md:flex">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "rounded-lg px-4 py-2 text-[15px] font-medium transition-colors",
                      active
                        ? "bg-stone-100 text-primary-700"
                        : "text-stone-700 hover:bg-stone-50 hover:text-primary-700",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <HeaderSearch />

          <Link
            href="/cart"
            className="relative rounded-lg p-2 text-stone-700 hover:bg-stone-100 hover:text-stone-900"
            aria-label="Giỏ hàng"
          >
            <ShoppingBag size={20} />
            {isHydrated && totalItems > 0 && (
              <span className="font-mono bg-accent absolute -top-0.5 -right-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-medium text-white">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>

          <div className="relative">
            {!isHydrated || !user ? (
              <Link
                href="/login"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 md:inline-block"
              >
                Đăng nhập
              </Link>
            ) : (
              <button
                onClick={() => setAccountOpen((v) => !v)}
                className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 md:inline-flex"
              >
                <User size={16} />
                <span className="max-w-[120px] truncate">
                  {user.fullName.split(" ").at(-1)}
                </span>
              </button>
            )}

            {accountOpen && user && (
              <>
                <button
                  className="fixed inset-0 z-40 cursor-default"
                  aria-label="Close menu"
                  onClick={() => setAccountOpen(false)}
                />
                <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg">
                  <div className="border-b border-stone-100 px-4 py-3">
                    <div className="text-sm font-medium text-stone-900">
                      {user.fullName}
                    </div>
                    <div className="text-xs text-stone-500">{user.email}</div>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/account"
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                    >
                      Tài khoản
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                    >
                      Đơn hàng của tôi
                    </Link>
                    {user.role === "SUPER_ADMIN" && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setAccountOpen(false)}
                        className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                      >
                        Quản trị hệ thống
                      </Link>
                    )}
                    {user.role === "STORE_ADMIN" && (
                      <Link
                        href="/store-admin/dashboard"
                        onClick={() => setAccountOpen(false)}
                        className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                      >
                        Quản lý cửa hàng
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setAccountOpen(false);
                        logout.mutate();
                      }}
                      className="flex w-full items-center gap-2 border-t border-stone-100 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                    >
                      <LogOut size={14} />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-lg p-2 text-stone-700 hover:bg-stone-100 md:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-stone-200 bg-white md:hidden">
          <ul className="container-app flex flex-col py-2">
            {NAV_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {!user && (
              <li className="mt-2 border-t border-stone-100 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-4 py-3 text-sm font-medium text-primary-700 hover:bg-stone-50"
                >
                  Đăng nhập
                </Link>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
