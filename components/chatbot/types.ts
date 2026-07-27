export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
  /** Local-only timestamp; not sent to backend. Used for keys + ordering. */
  ts?: number;
  /** Sources returned by backend for assistant messages. */
  sources?: SourceRef[];
  /** product_ids the answer recommends — drives the product cards. */
  products?: string[];
  /** Priced order draft returned by RAG for this assistant turn. */
  order_draft?: OrderDraft;
  /** Client-only: set to the created order id after a successful placement.
   *  Persisted to localStorage → durable single-write guard across reloads. */
  placedOrderId?: number;
  /** Structured card ids for this assistant message (backend-resolved). */
  display_products?: number[];
}

export interface SourceRef {
  doc_type: "static" | "product";
  source_id: string;
}

export interface ChatRequest {
  message: string;
  chat_history?: { role: ChatRole; content: string }[];
  /** Stable per-browser id — helps backend group tracing across turns. */
  session_id?: string;
}

export interface ChatResponse {
  answer: string;
  sources: SourceRef[];
  products?: string[];
  order_draft?: OrderDraft;
  /** Structured ids to render as cards for THIS message (supersedes products/sources). */
  display_products?: number[];
  intent?: string | null;
  categories?: string[];
  conversation_state?: unknown;
}

/** One line of a RAG-prepared order draft. Mirrors the canonical contract
 *  EXACTLY — product_id/variant_id are STRINGS (RAG convention); the UI does
 *  Number() only at the ordersApi.create boundary. size/color are kept
 *  SEPARATE from product_name so a wrong-variant map is visible to the user. */
export interface OrderDraftItem {
  product_id: string;
  variant_id: string;
  product_name: string;
  size: string | null;
  color: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  in_stock: boolean;
}

/** Priced, stock-checked draft emitted by the RAG `prepare_order` tool. */
export interface OrderDraft {
  items: OrderDraftItem[];
  total: number;
  currency: string;
  warnings: string[];
}
