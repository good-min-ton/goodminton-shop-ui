"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Heart,
  ShoppingBag,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Logo } from "./logo";
import { HeaderSearch } from "./header-search";
import { CategoriesDropdown } from "./categories-dropdown";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { useAuthStore } from "@/store/auth-store";
import { useBrands, useCategories } from "@/hooks/use-catalog";
import { useLogout } from "@/hooks/use-auth";

const STATIC_NAV = [
  { href: "/", label: "Trang chủ" },
  { href: "/stores", label: "Cửa hàng" },
  { href: "/news", label: "Tin tức" },
  { href: "/about", label: "Giới thiệu" },
  { href: "/contact", label: "Liên hệ" },
];

export function StorefrontHeader() {
  const pathname = usePathname();
  const totalItems = useCartStore((s) => s.totalItems());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const logout = useLogout();
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const productsActive =
    pathname.startsWith("/products") ||
    pathname.startsWith("/categories") ||
    pathname.startsWith("/brands");

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur-sm">
      <div className="container-app flex h-[72px] items-center gap-4">
        <Logo size="md" priority />

        <nav className="hidden flex-1 items-center justify-center md:flex">
          <ul className="flex items-center gap-0.5">
            <li>
              <Link
                href="/"
                className={cn(
                  "rounded-lg px-4 py-2 text-[15px] font-medium transition-colors",
                  pathname === "/"
                    ? "bg-stone-100 text-primary-700"
                    : "text-stone-700 hover:bg-stone-50 hover:text-primary-700",
                )}
              >
                Trang chủ
              </Link>
            </li>
            <li>
              <CategoriesDropdown active={productsActive} />
            </li>
            {STATIC_NAV.filter((n) => n.href !== "/").map((item) => {
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
            href="/wishlist"
            className="relative rounded-lg p-2 text-stone-700 hover:bg-stone-100 hover:text-red-500"
            aria-label="Danh sách yêu thích"
          >
            <Heart size={20} />
            {isHydrated && wishlistCount > 0 && (
              <span className="font-mono absolute -top-0.5 -right-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            )}
          </Link>

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
        <MobileNav
          pathname={pathname ?? "/"}
          isLoggedIn={!!(isHydrated && user)}
          onClose={() => setMobileOpen(false)}
        />
      )}
    </header>
  );
}

interface MobileNavProps {
  pathname: string;
  isLoggedIn: boolean;
  onClose: () => void;
}

function MobileNav({ pathname, isLoggedIn, onClose }: Readonly<MobileNavProps>) {
  const [productsExpanded, setProductsExpanded] = useState(true);
  const categories = useCategories();
  const brands = useBrands();

  return (
    <nav className="border-t border-stone-200 bg-white md:hidden">
      <ul className="container-app flex flex-col py-2">
        <MobileNavLink href="/" pathname={pathname} onClose={onClose}>
          Trang chủ
        </MobileNavLink>

        <li>
          <button
            type="button"
            onClick={() => setProductsExpanded((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50"
            aria-expanded={productsExpanded}
          >
            <span>Sản phẩm</span>
            <ChevronDown
              size={14}
              className={cn(
                "transition-transform",
                productsExpanded ? "rotate-180" : "rotate-0",
              )}
            />
          </button>
          {productsExpanded && (
            <div className="ml-3 border-l border-stone-100 pl-3 pb-2">
              <Link
                href="/products"
                onClick={onClose}
                className="text-primary-700 block rounded-md px-3 py-2 text-sm font-medium hover:bg-stone-50"
              >
                Tất cả sản phẩm →
              </Link>
              {(categories.data ?? []).slice(0, 8).map((c) => (
                <Link
                  key={c.id}
                  href={`/categories/${c.id}`}
                  onClick={onClose}
                  className="block rounded-md px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
                >
                  {c.name}
                </Link>
              ))}
              {(brands.data?.length ?? 0) > 0 && (
                <>
                  <p className="mt-2 px-3 text-[10px] font-semibold tracking-wider text-stone-400 uppercase">
                    Thương hiệu
                  </p>
                  <div className="flex flex-wrap gap-1.5 px-3 pt-1.5 pb-2">
                    {(brands.data ?? []).slice(0, 8).map((b) => (
                      <Link
                        key={b.id}
                        href={`/brands/${b.id}`}
                        onClick={onClose}
                        className="rounded-md border border-stone-200 px-2.5 py-1 text-xs text-stone-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                      >
                        {b.name}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </li>

        <MobileNavLink href="/stores" pathname={pathname} onClose={onClose}>
          Cửa hàng
        </MobileNavLink>
        <MobileNavLink href="/news" pathname={pathname} onClose={onClose}>
          Tin tức
        </MobileNavLink>
        <MobileNavLink href="/about" pathname={pathname} onClose={onClose}>
          Giới thiệu
        </MobileNavLink>
        <MobileNavLink href="/contact" pathname={pathname} onClose={onClose}>
          Liên hệ
        </MobileNavLink>

        {!isLoggedIn && (
          <li className="mt-2 border-t border-stone-100 pt-2">
            <Link
              href="/login"
              onClick={onClose}
              className="text-primary-700 block rounded-lg px-4 py-3 text-sm font-medium hover:bg-stone-50"
            >
              Đăng nhập
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

interface MobileNavLinkProps {
  href: string;
  pathname: string;
  onClose: () => void;
  children: React.ReactNode;
}

function MobileNavLink({
  href,
  pathname,
  onClose,
  children,
}: Readonly<MobileNavLinkProps>) {
  const active = pathname === href;
  return (
    <li>
      <Link
        href={href}
        onClick={onClose}
        className={cn(
          "block rounded-lg px-4 py-3 text-sm font-medium",
          active
            ? "bg-stone-100 text-primary-700"
            : "text-stone-700 hover:bg-stone-50",
        )}
      >
        {children}
      </Link>
    </li>
  );
}
