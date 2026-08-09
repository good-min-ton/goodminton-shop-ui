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
  /** Variant picker returned by RAG when the customer wants to buy but has not
   *  chosen yet. Once they pick, the card builds a draft locally. */
  order_selection?: OrderSelection;
  /** Client-only: the draft the picker produced, so a reload restores the
   *  confirm step instead of dropping the customer back to the chips. */
  picked_draft?: OrderDraft;
  /** Client-only: set to the created order id after a successful placement.
   *  Persisted to localStorage → durable single-write guard across reloads. */
  placedOrderId?: number;
  /** Client-only: small data-URL thumbnail of an image the user sent for
   *  visual search. Display-only; not sent to any backend. */
  image?: string;
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
  /** Set after the frontend places an order, so the backend advances its order
   *  state machine to ORDER_CONFIRMED. Read-only signal; backend never places. */
  order_placed_id?: number;
}

export interface ChatResponse {
  answer: string;
  sources: SourceRef[];
  products?: string[];
  order_draft?: OrderDraft;
  order_selection?: OrderSelection;
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

/** Stock at a non-central store. Walk-in only: an online order is fulfilled
 *  from the central store, so this can be mentioned but never ordered from. */
export interface BranchStock {
  store_id: number | null;
  store_name: string | null;
  quantity: number;
}

/** One orderable variant, already priced (sale price resolved backend-side). */
export interface OrderOption {
  variant_id: string;
  size: string | null;
  color: string | null;
  unit_price: number;
  /** Central-store quantity — the picker caps its stepper at this, so the
   *  customer cannot assemble an order checkout would reject. */
  orderable: number;
  branches: BranchStock[];
}

/** Emitted by the RAG `start_order` tool when the customer wants to buy but has
 *  not chosen a variant. The picker runs entirely in the UI: no LLM turns. */
export interface OrderSelection {
  product_id: string;
  product_name: string;
  currency: string;
  options: OrderOption[];
}
