"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { accountsApi } from "@/lib/api/accounts";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "@/store/toast-store";
import { ApiException } from "@/lib/api";
import { getErrorMessage } from "@/lib/error-messages";
import type { LoginRequest, RegisterRequest, Role } from "@/types/api";

const QK_ME = ["accounts", "me"] as const;

function defaultRedirectFor(role: Role): string {
  if (role === "SUPER_ADMIN") return "/admin/dashboard";
  if (role === "STORE_ADMIN") return "/store-admin/dashboard";
  return "/";
}

export function useCurrentUser() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: QK_ME,
    queryFn: async () => {
      const me = await accountsApi.myInfo();
      setUser(me);
      return me;
    },
    enabled: isHydrated && !!accessToken,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const logoutLocal = useAuthStore((s) => s.logout);
  const router = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: LoginRequest & { redirectTo?: string }) => {
      const tokens = await authApi.login({
        identifier: input.identifier,
        password: input.password,
      });
      setSession(tokens);
      const me = await accountsApi.myInfo();
      if (me.role !== "CUSTOMER") {
        logoutLocal();
        throw new ApiException(
          "Đây là form khách hàng. Tài khoản quản trị vui lòng đăng nhập tại trang quản trị.",
          1004,
        );
      }
      setSession(tokens, me);
      return { me, redirectTo: input.redirectTo };
    },
    onSuccess: ({ me, redirectTo }) => {
      qc.setQueryData(QK_ME, me);
      const target = redirectTo || defaultRedirectFor(me.role);
      router.replace(target);
      toast(`Chào mừng trở lại, ${me.fullName}!`, "success");
    },
    onError: (err) => {
      toast(getErrorMessage(err, "Đăng nhập thất bại"), "error");
    },
  });
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  const router = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: RegisterRequest) => {
      await authApi.register(body);
      const tokens = await authApi.login({
        identifier: body.email,
        password: body.password,
      });
      setSession(tokens);
      const me = await accountsApi.myInfo();
      setSession(tokens, me);
      return me;
    },
    onSuccess: (me) => {
      qc.setQueryData(QK_ME, me);
      router.replace(defaultRedirectFor(me.role));
      toast("Đăng ký thành công. Chào mừng đến Goodminton!", "success");
    },
    onError: (err) => {
      toast(getErrorMessage(err, "Đăng ký thất bại"), "error");
    },
  });
}

export function useAdminLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const logoutLocal = useAuthStore((s) => s.logout);
  const router = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: LoginRequest) => {
      const tokens = await authApi.login({
        identifier: input.identifier,
        password: input.password,
      });
      setSession(tokens);
      const me = await accountsApi.myInfo();
      if (me.role === "CUSTOMER") {
        logoutLocal();
        throw new ApiException(
          "Đây là form quản trị. Tài khoản khách hàng vui lòng đăng nhập tại trang storefront.",
          1004,
        );
      }
      setSession(tokens, me);
      return me;
    },
    onSuccess: (me) => {
      qc.setQueryData(QK_ME, me);
      const target =
        me.role === "SUPER_ADMIN"
          ? "/admin/dashboard"
          : "/store-admin/dashboard";
      router.replace(target);
      toast(`Chào mừng, ${me.fullName}!`, "success");
    },
    onError: (err) => {
      toast(getErrorMessage(err, "Đăng nhập thất bại"), "error");
    },
  });
}

export function useLogout() {
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        try {
          await authApi.logout(refreshToken);
        } catch {
          // Best-effort: backend blacklist failure shouldn't block local logout.
        }
      }
    },
    onSettled: () => {
      logout();
      qc.clear();
      router.replace("/");
      toast("Đã đăng xuất", "info");
    },
  });
}
