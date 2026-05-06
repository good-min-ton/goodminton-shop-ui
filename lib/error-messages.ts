/**
 * Error message resolution.
 *
 * Backend already returns user-friendly Vietnamese messages alongside the code:
 *   { "code": 1001, "message": "Email đã được sử dụng" }
 *
 * Resolution priority:
 *   1. Backend message on the ApiException (preferred — single source of truth)
 *   2. Local override map (only for codes we want to *replace* the backend wording)
 *   3. Caller-supplied fallback
 *   4. Generic default
 *
 * Reference: docs/api-docs.md
 */

import { ApiException } from "./api";

/**
 * Local overrides — only add an entry here when we want to render *different*
 * wording than what the backend sends. Most cases should leave this empty
 * and rely on `err.message`.
 */
const ERROR_MESSAGE_OVERRIDES: Record<number, string> = {
  // Auto-redirect handled in api.ts — show this only if redirect couldn't happen.
  1005: "Vui lòng đăng nhập để tiếp tục",
};

const DEFAULT_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại.";

export function getErrorMessage(err: unknown, fallback?: string): string {
  if (err instanceof ApiException) {
    const override = ERROR_MESSAGE_OVERRIDES[err.code];
    if (override) return override;
    if (err.message?.trim()) return err.message;
    return fallback || DEFAULT_MESSAGE;
  }
  if (err instanceof Error && err.message?.trim()) {
    return err.message;
  }
  return fallback || DEFAULT_MESSAGE;
}

/**
 * Helper for code-based logic (e.g. trigger redirect on 1005, highlight a
 * specific form field on 1907 — slug duplicate). Returns null if not an
 * `ApiException`.
 */
export function getErrorCode(err: unknown): number | null {
  if (err instanceof ApiException) return err.code;
  return null;
}
