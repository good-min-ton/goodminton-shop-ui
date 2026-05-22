export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
  /** Local-only timestamp; not sent to backend. Used for keys + ordering. */
  ts?: number;
  /** Sources returned by backend for assistant messages. */
  sources?: SourceRef[];
}

export interface SourceRef {
  doc_type: "static" | "product";
  source_id: string;
}

export interface ChatRequest {
  message: string;
  chat_history?: { role: ChatRole; content: string }[];
}

export interface ChatResponse {
  answer: string;
  sources: SourceRef[];
}
