"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "@/store/toast-store";

/**
 * Storefront should only host guests or CUSTOMER sessions. If an admin session
 * leaks here (e.g. admin navigates to "/" via the logo), force-logout + clear
 * tokens so the user lands as a guest. RequireAuth on protected customer pages
 * will then redirect to /login if needed.
 */
export function StorefrontAuthGuard() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (!isHydrated) return;
    if (!accessToken) return;
    if (!user) return;
    if (user.role === "CUSTOMER") return;

    logout();
    toast(
      "Tài khoản quản trị không truy cập giao diện khách hàng. Đã đăng xuất.",
      "info",
    );
  }, [isHydrated, accessToken, user, logout]);

  return null;
}
