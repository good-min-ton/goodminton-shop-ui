import { TUNNEL_HEADERS } from "@/lib/tunnel-headers";
import type { ChatRequest, ChatResponse } from "./types";

const RAG_API_URL =
  process.env.NEXT_PUBLIC_RAG_API_URL?.replace(/\/$/, "") ?? "";
const TIMEOUT_MS = 600_000;

export class ChatApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ChatApiError";
    this.status = status;
  }
}

/**
 * Call the RAG `/chat` endpoint with a 60s client-side timeout.
 * Throws ChatApiError on non-2xx or network failure.
 */
export async function sendChat(req: ChatRequest): Promise<ChatResponse> {
  if (!RAG_API_URL) {
    throw new ChatApiError("Chatbot chưa được cấu hình. Liên hệ admin.");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${RAG_API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...TUNNEL_HEADERS },
      body: JSON.stringify(req),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if ((err as Error).name === "AbortError") {
      throw new ChatApiError("Yêu cầu quá lâu, thử lại nhé.");
    }
    throw new ChatApiError("Mất kết nối, kiểm tra mạng.");
  }
  clearTimeout(timer);

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const detail =
      (body && typeof body === "object" && "detail" in body
        ? String((body as { detail: unknown }).detail)
        : "") || `Lỗi máy chủ (${res.status})`;
    throw new ChatApiError(detail, res.status);
  }

  return res.json();
}

export interface ChatStreamHandlers {
  onMeta?: (meta: {
    sources?: unknown[];
    intent?: string | null;
    categories?: string[] | null;
  }) => void;
  /** Progress signal emitted by the backend before each tool call — drives the
   *  thinking indicator. `tool` is a RAG tool name (see TOOL_STAGE). */
  onStatus?: (status: { tool?: string }) => void;
  onToken: (delta: string) => void;
  onDone: (payload: ChatResponse) => void;
  onError: (message: string) => void;
}

// Idle timeout = max silence between reads before aborting. The server emits an
// SSE heartbeat comment (`:\n\n`) before each silent tool turn, so any healthy
// stream keeps resetting this; 45s > worst-case single 3B turn (~16s) with margin.
const IDLE_TIMEOUT_MS = 45_000;

function parseSseBlock(raw: string): { event?: string; data?: unknown } {
  let event: string | undefined;
  const dataLines: string[] = [];
  for (const line of raw.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
  }
  let data: unknown;
  if (dataLines.length) {
    try {
      data = JSON.parse(dataLines.join("\n"));
    } catch {
      data = undefined;
    }
  }
  return { event, data };
}

/** Stream the RAG `/chat/stream` SSE endpoint. Resolves when the stream ends;
 *  all output arrives via handlers. Falls back is the caller's job (flag off ->
 *  use sendChat). Uses fetch+ReadableStream (EventSource can't POST a body). */
export async function sendChatStream(
  req: ChatRequest,
  handlers: ChatStreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  if (!RAG_API_URL) {
    handlers.onError("Chatbot chưa được cấu hình. Liên hệ admin.");
    return;
  }
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort);
  let idle: ReturnType<typeof setTimeout> | undefined;
  const resetIdle = () => {
    if (idle) clearTimeout(idle);
    idle = setTimeout(() => controller.abort(), IDLE_TIMEOUT_MS);
  };
  const cleanup = () => {
    if (idle) clearTimeout(idle);
    signal?.removeEventListener("abort", onAbort);
  };

  let res: Response;
  try {
    resetIdle();
    res = await fetch(`${RAG_API_URL}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...TUNNEL_HEADERS },
      body: JSON.stringify(req),
      signal: controller.signal,
    });
  } catch {
    cleanup();
    handlers.onError("Mất kết nối, kiểm tra mạng.");
    return;
  }
  if (!res.ok || !res.body) {
    cleanup();
    handlers.onError(`Lỗi máy chủ (${res.status})`);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let sawDone = false;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      resetIdle();
      buffer += decoder.decode(value, { stream: true });
      let sep: number;
      while ((sep = buffer.indexOf("\n\n")) !== -1) {
        const block = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        const { event, data } = parseSseBlock(block);
        if (event === "meta") handlers.onMeta?.(data as never);
        else if (event === "status") handlers.onStatus?.(data as never);
        else if (event === "token")
          handlers.onToken(String((data as { delta?: string })?.delta ?? ""));
        else if (event === "done") {
          sawDone = true;
          handlers.onDone(data as ChatResponse);
        } else if (event === "error") {
          handlers.onError(
            String((data as { detail?: string })?.detail ?? "stream failed"),
          );
          cleanup();
          return;
        }
      }
    }
    if (!sawDone) handlers.onError("Kết nối bị gián đoạn.");
  } catch {
    handlers.onError("Kết nối bị gián đoạn.");
  } finally {
    cleanup();
  }
}
