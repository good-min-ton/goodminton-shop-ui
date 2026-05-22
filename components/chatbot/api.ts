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
      headers: { "Content-Type": "application/json" },
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
