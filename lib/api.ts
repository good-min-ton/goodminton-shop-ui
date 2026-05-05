/**
 * Fetch wrapper with JWT auto-attach + auto-refresh.
 *
 * Behavior:
 * - Reads access token from localStorage and attaches as Bearer.
 * - Unwraps `{ code, result }` envelope. Non-1000 code → throws ApiException.
 * - On 401 (or code 1102/1103/1005), tries refresh once; on success retries the original request.
 * - Single-flight refresh: concurrent failing requests share one refresh round-trip.
 */

import type { ApiResponse, AuthTokens } from "@/types/api";
import {
  clearAuth,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "./auth-storage";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8080";

export class ApiException extends Error {
  code: number;
  status?: number;
  constructor(message: string, code: number, status?: number) {
    super(message);
    this.name = "ApiException";
    this.code = code;
    this.status = status;
  }
}

type RequestInitExtended = RequestInit & {
  /** Skip auth attach + refresh (useful for /auth/login, /auth/refresh). */
  skipAuth?: boolean;
  /** Internal flag to prevent infinite refresh loops. */
  _retried?: boolean;
};

let refreshPromise: Promise<AuthTokens> | null = null;

async function performRefresh(): Promise<AuthTokens> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new ApiException("No refresh token", 1103);

  const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  const json = (await res.json()) as ApiResponse<AuthTokens> | {
    code: number;
    message?: string;
  };

  if (!res.ok || json.code !== 1000 || !("result" in json)) {
    throw new ApiException(
      ("message" in json && json.message) || "Refresh failed",
      json.code ?? 1103,
      res.status,
    );
  }

  setTokens(json.result);
  return json.result;
}

function refreshTokens(): Promise<AuthTokens> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

function isAuthExpiredCode(code: number) {
  return code === 1005 || code === 1102 || code === 1103;
}

async function rawFetch<T>(
  path: string,
  init: RequestInitExtended = {},
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const headers = new Headers(init.headers);

  // Auto-attach Bearer token
  if (!init.skipAuth) {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  // Default JSON content-type only when there is a body that is not FormData
  if (
    init.body &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, { ...init, headers });

  // Try parse JSON; tolerate empty body (204)
  let json: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      throw new ApiException("Invalid response from server", 9999, res.status);
    }
  }

  // Non-OK or non-1000 envelope → maybe expired token → try refresh
  const envelope = json as ApiResponse<T> | { code: number; message?: string };
  const code = envelope?.code;

  if (
    !init.skipAuth &&
    !init._retried &&
    (res.status === 401 || (code != null && isAuthExpiredCode(code)))
  ) {
    try {
      await refreshTokens();
      return rawFetch<T>(path, { ...init, _retried: true });
    } catch (err) {
      clearAuth();
      // Redirect to login on the client (best-effort)
      if (typeof window !== "undefined" && !path.includes("/auth/")) {
        const next = encodeURIComponent(
          window.location.pathname + window.location.search,
        );
        window.location.href = `/login?next=${next}`;
      }
      throw err;
    }
  }

  if (!res.ok) {
    throw new ApiException(
      (envelope as { message?: string })?.message || `HTTP ${res.status}`,
      code ?? res.status,
      res.status,
    );
  }

  if (code != null && code !== 1000) {
    throw new ApiException(
      (envelope as { message?: string })?.message || "Request failed",
      code,
      res.status,
    );
  }

  return (envelope as ApiResponse<T>)?.result as T;
}

// ============================================================
// Public verbs
// ============================================================

export const api = {
  get<T>(path: string, init?: RequestInitExtended) {
    return rawFetch<T>(path, { ...init, method: "GET" });
  },
  post<T>(path: string, body?: unknown, init?: RequestInitExtended) {
    return rawFetch<T>(path, {
      ...init,
      method: "POST",
      body: body == null ? undefined : JSON.stringify(body),
    });
  },
  put<T>(path: string, body?: unknown, init?: RequestInitExtended) {
    return rawFetch<T>(path, {
      ...init,
      method: "PUT",
      body: body == null ? undefined : JSON.stringify(body),
    });
  },
  patch<T>(path: string, body?: unknown, init?: RequestInitExtended) {
    return rawFetch<T>(path, {
      ...init,
      method: "PATCH",
      body: body == null ? undefined : JSON.stringify(body),
    });
  },
  delete<T>(path: string, init?: RequestInitExtended) {
    return rawFetch<T>(path, { ...init, method: "DELETE" });
  },
  /** Multipart form upload. Pass a FormData body. */
  upload<T>(
    path: string,
    formData: FormData,
    init?: RequestInitExtended & { method?: "POST" | "PUT" },
  ) {
    return rawFetch<T>(path, {
      ...init,
      method: init?.method ?? "POST",
      body: formData,
    });
  },
};

/**
 * Build query string from object. Skips undefined / null / empty string.
 * Auto-converts 1-based page (client) — backend already expects 1-based per API doc.
 */
export function buildQuery(
  params: Record<string, string | number | boolean | null | undefined>,
): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== "",
  );
  if (entries.length === 0) return "";
  const qs = new URLSearchParams();
  for (const [k, v] of entries) qs.set(k, String(v));
  return `?${qs.toString()}`;
}
