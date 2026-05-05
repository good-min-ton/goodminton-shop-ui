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

type Envelope<T> = ApiResponse<T> | { code?: number; message?: string } | null;

function buildHeaders(init: RequestInitExtended): Headers {
  const headers = new Headers(init.headers);
  if (!init.skipAuth) {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  if (
    init.body &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }
  return headers;
}

async function parseEnvelope<T>(res: Response): Promise<Envelope<T>> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as Envelope<T>;
  } catch {
    throw new ApiException("Invalid response from server", 9999, res.status);
  }
}

function shouldAttemptRefresh(
  init: RequestInitExtended,
  res: Response,
  code: number | undefined,
): boolean {
  if (init.skipAuth || init._retried) return false;
  if (res.status === 401) return true;
  return code != null && isAuthExpiredCode(code);
}

function redirectToLogin(path: string) {
  const g = globalThis as typeof globalThis & {
    location?: Location;
  };
  if (g.location === undefined || path.includes("/auth/")) return;
  const next = encodeURIComponent(g.location.pathname + g.location.search);
  g.location.href = `/login?next=${next}`;
}

function assertSuccess<T>(res: Response, envelope: Envelope<T>) {
  const code = envelope?.code;
  if (!res.ok) {
    throw new ApiException(
      envelope?.message || `HTTP ${res.status}`,
      code ?? res.status,
      res.status,
    );
  }
  if (code != null && code !== 1000) {
    throw new ApiException(
      envelope?.message || "Request failed",
      code,
      res.status,
    );
  }
}

async function rawFetch<T>(
  path: string,
  init: RequestInitExtended = {},
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const res = await fetch(url, { ...init, headers: buildHeaders(init) });
  const envelope = await parseEnvelope<T>(res);

  if (shouldAttemptRefresh(init, res, envelope?.code)) {
    try {
      await refreshTokens();
      return rawFetch<T>(path, { ...init, _retried: true });
    } catch (err) {
      clearAuth();
      redirectToLogin(path);
      throw err;
    }
  }

  assertSuccess(res, envelope);
  return (envelope as ApiResponse<T>).result;
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
 * Build query string from object. Skips undefined / null / empty string and
 * any non-primitive values. Backend page is 1-based per API doc.
 */
export function buildQuery<T extends object>(params: T): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    if (
      typeof v === "string" ||
      typeof v === "number" ||
      typeof v === "boolean"
    ) {
      qs.set(k, String(v));
    }
  }
  const out = qs.toString();
  return out ? `?${out}` : "";
}
