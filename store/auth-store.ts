"use client";

import { create } from "zustand";
import type { Account, AuthTokens, Role } from "@/types/api";
import {
  clearAuth,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setStoredUser,
  setTokens,
} from "@/lib/auth-storage";

interface AuthState {
  user: Account | null;
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;

  /** Read tokens + user from localStorage on client mount. */
  hydrate: () => void;
  /** Persist tokens (called after login or refresh). */
  setSession: (tokens: AuthTokens, user?: Account | null) => void;
  setUser: (user: Account | null) => void;
  logout: () => void;
  hasRole: (role: Role | Role[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isHydrated: false,

  hydrate: () => {
    set({
      user: getStoredUser(),
      accessToken: getAccessToken(),
      refreshToken: getRefreshToken(),
      isHydrated: true,
    });
  },

  setSession: (tokens, user) => {
    setTokens(tokens);
    if (user !== undefined) setStoredUser(user);
    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      ...(user !== undefined ? { user } : {}),
    });
  },

  setUser: (user) => {
    setStoredUser(user);
    set({ user });
  },

  logout: () => {
    clearAuth();
    set({ user: null, accessToken: null, refreshToken: null });
  },

  hasRole: (role) => {
    const r = get().user?.role;
    if (!r) return false;
    return Array.isArray(role) ? role.includes(r) : r === role;
  },
}));
