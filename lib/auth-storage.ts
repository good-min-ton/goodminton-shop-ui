/**
 * Token storage layer (localStorage-based).
 * Decoupled from React so fetch wrapper can use it directly.
 */

import type { Account, AuthTokens } from "@/types/api";

const KEY_ACCESS = "gm.accessToken";
const KEY_REFRESH = "gm.refreshToken";
const KEY_USER = "gm.user";

function isBrowser(): boolean {
  return (globalThis as { localStorage?: Storage }).localStorage !== undefined;
}

export function getAccessToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(KEY_ACCESS);
}

export function getRefreshToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(KEY_REFRESH);
}

export function getStoredUser(): Account | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(KEY_USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Account;
  } catch {
    return null;
  }
}

export function setTokens(tokens: AuthTokens) {
  if (!isBrowser()) return;
  localStorage.setItem(KEY_ACCESS, tokens.accessToken);
  localStorage.setItem(KEY_REFRESH, tokens.refreshToken);
}

export function setStoredUser(user: Account | null) {
  if (!isBrowser()) return;
  if (user) localStorage.setItem(KEY_USER, JSON.stringify(user));
  else localStorage.removeItem(KEY_USER);
}

export function clearAuth() {
  if (!isBrowser()) return;
  localStorage.removeItem(KEY_ACCESS);
  localStorage.removeItem(KEY_REFRESH);
  localStorage.removeItem(KEY_USER);
}
