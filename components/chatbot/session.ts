// Per-page-load chat session id. A reload starts a brand-new conversation, so
// server-side state (keyed by this id) and the visible transcript reset together.
let currentId: string | null = null;

export function getChatSessionId(): string {
  if (globalThis.window === undefined) return "";
  if (currentId) return currentId;
  currentId = globalThis.crypto?.randomUUID?.() ?? fallbackId();
  return currentId;
}

export function resetChatSessionId(): void {
  currentId = null;
}

function fallbackId(): string {
  const g = globalThis.crypto;
  if (g?.getRandomValues) {
    const buf = new Uint32Array(1);
    g.getRandomValues(buf);
    return `s-${buf[0].toString(36)}`;
  }
  return `s-${Date.now().toString(36)}`;
}
