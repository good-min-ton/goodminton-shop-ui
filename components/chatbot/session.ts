const SESSION_KEY = "gm.chat-session-id";

/**
 * Return a stable per-browser chat session id, generating one on first call.
 * Backend uses it to group tracing across turns of the same conversation.
 */
export function getChatSessionId(): string {
  if (globalThis.window === undefined) return "";
  try {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const fresh = globalThis.crypto?.randomUUID?.() ?? fallbackId();
    localStorage.setItem(SESSION_KEY, fresh);
    return fresh;
  } catch {
    return fallbackId();
  }
}

export function resetChatSessionId(): void {
  if (globalThis.window === undefined) return;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

function fallbackId(): string {
  // Non-security fallback when crypto.randomUUID is unavailable — the id is
  // only a tracing label. Use crypto.getRandomValues where available.
  let rand = "";
  const g = globalThis.crypto;
  if (g?.getRandomValues) {
    const buf = new Uint32Array(1);
    g.getRandomValues(buf);
    rand = buf[0].toString(36);
  } else {
    rand = Date.now().toString(36);
  }
  return `s-${Date.now().toString(36)}-${rand}`;
}
