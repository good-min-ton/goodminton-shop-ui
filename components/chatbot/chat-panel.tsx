"use client";

import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Image as ImageIcon, Send, Sparkles, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import { ChatApiError, sendChat, sendChatStream } from "./api";
import { MarkdownLite } from "./markdown-lite";
import { OrderConfirmCard } from "./order-confirm-card";
import { getChatSessionId } from "./session";
import {
  ThinkingBubble,
  TOOL_STAGE,
  type ThinkingStage,
} from "./thinking-bubble";
import type { ChatMessage } from "./types";
import { productsApi } from "@/lib/api/products";
import { searchApi } from "@/lib/api/search";
import { downscaleImage, makeThumbnailDataUrl } from "@/lib/image-downscale";
import { getDisplayPrice } from "@/hooks/use-products";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types/api";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "gm.chat-history";
const STREAM_ENABLED = process.env.NEXT_PUBLIC_CHAT_STREAM_ENABLED === "true";
const HISTORY_LIMIT = 20;
const SUGGESTIONS = [
  "Mình mới chơi, nên chọn vợt nào?",
  "Vợt Astrox 99 còn hàng không?",
  "Chính sách bảo hành như thế nào?",
];

interface ChatPanelProps {
  onClose: () => void;
}

export function ChatPanel({ onClose }: Readonly<ChatPanelProps>) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingTs, setStreamingTs] = useState<number | null>(null);
  /** Backend-driven thinking stage; null => ThinkingBubble uses its timed
   *  fallback (non-streaming path has no progress signal to read). */
  const [stage, setStage] = useState<ThinkingStage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedPreview, setAttachedPreview] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Revoke the preview object URL when it changes or on unmount.
  useEffect(() => {
    if (!attachedPreview) return;
    return () => URL.revokeObjectURL(attachedPreview);
  }, [attachedPreview]);

  // Persist on every change.
  useEffect(() => {
    if (messages.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll to bottom whenever messages or loading state changes.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  // Focus input on mount.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      // `ts` doubles as the React key and as the id the streaming updates key
      // off, so the assistant's ts MUST differ from the user's. Two Date.now()
      // calls in the same tick return the same millisecond, which collided:
      // the answer overwrote the user's message and rendered in its bubble.
      const userTs = Date.now();
      const userMsg: ChatMessage = {
        role: "user",
        content: trimmed,
        ts: userTs,
      };
      const nextHistory = [...messages, userMsg];
      setMessages(nextHistory);
      setInput("");
      setLoading(true);
      setError(null);

      try {
        // Backend caps chat_history at 20 — keep the most recent ones to stay
        // under that ceiling, exclude the current user message (it goes in
        // `message`, not history).
        const history = messages.slice(-HISTORY_LIMIT).map((m) => ({
          role: m.role,
          content: m.content,
        }));
        const placedId = [...messages]
          .reverse()
          .find((m) => m.placedOrderId != null)?.placedOrderId;

        if (STREAM_ENABLED) {
          const ts = userTs + 1;
          let started = false;
          setStage("retrieving");
          await sendChatStream(
            {
              message: trimmed,
              chat_history: history,
              session_id: getChatSessionId(),
              order_placed_id: placedId,
            },
            {
              // meta lands once retrieval is done and the LLM turn is starting.
              onMeta: () => setStage("thinking"),
              // Unknown/absent tool names fall back to a generic label rather
              // than rendering an undefined stage.
              onStatus: (s) => setStage(TOOL_STAGE[s.tool ?? ""] ?? "thinking"),
              onToken: (delta) => {
                if (!started) {
                  started = true;
                  setStreamingTs(ts);
                  setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: delta, ts },
                  ]);
                } else {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.ts === ts ? { ...m, content: m.content + delta } : m,
                    ),
                  );
                }
              },
              onDone: (r) => {
                // Decide the branch OUTSIDE the updater: React double-invokes
                // updaters in dev StrictMode, so flipping `started` inside one
                // made the second invocation take the other branch.
                const isFirstEmit = !started;
                started = true;
                setMessages((prev) =>
                  isFirstEmit
                    ? [
                        ...prev,
                        {
                          role: "assistant",
                          content: r.answer,
                          sources: r.sources,
                          products: r.products,
                          order_draft: r.order_draft,
                          display_products: r.display_products,
                          ts,
                        },
                      ]
                    : prev.map((m) =>
                        m.ts === ts
                          ? {
                              ...m,
                              content: r.answer ?? m.content,
                              sources: r.sources,
                              products: r.products,
                              order_draft: r.order_draft,
                              display_products: r.display_products,
                            }
                          : m,
                      ),
                );
              },
              onError: (msg) => setError(msg),
            },
          );
          return;
        }

        const res = await sendChat({
          message: trimmed,
          chat_history: history,
          session_id: getChatSessionId(),
          order_placed_id: placedId,
        });
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: res.answer,
            sources: res.sources,
            products: res.products,
            order_draft: res.order_draft,
            display_products: res.display_products,
            ts: Math.max(Date.now(), userTs + 1), // never collide with userMsg
          },
        ]);
      } catch (err) {
        const msg =
          err instanceof ChatApiError
            ? err.message
            : "Có lỗi xảy ra. Thử lại nhé.";
        setError(msg);
      } finally {
        setLoading(false);
        setStreamingTs(null);
        setStage(null);
      }
    },
    [loading, messages],
  );

  const attachImage = useCallback((file: File) => {
    const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
    if (!ACCEPTED.includes(file.type)) return;
    setAttachedFile(file);
    setAttachedPreview(URL.createObjectURL(file));
  }, []);

  function onPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const item = Array.from(e.clipboardData.items).find((it) =>
      it.type.startsWith("image/"),
    );
    const file = item?.getAsFile();
    if (file) {
      e.preventDefault();
      attachImage(file);
    }
  }

  const sendImageSearch = useCallback(
    async (file: File, caption: string) => {
      if (loading) return;
      // Small display thumbnail for the user bubble (upload uses a separate,
      // larger downscale below). LLM is bypassed — this hits /search/image.
      const thumb = await makeThumbnailDataUrl(file).catch(() => undefined);
      const userTs = Date.now();
      const userMsg: ChatMessage = {
        role: "user",
        content: caption.trim() || "Tìm sản phẩm bằng hình ảnh",
        image: thumb,
        ts: userTs,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setAttachedFile(null);
      setAttachedPreview(null);
      setLoading(true);
      setStage("image");
      setError(null);

      try {
        const downscaled = await downscaleImage(file);
        const { product_ids } = await searchApi.searchByImage(downscaled);
        // MessageBubble caps product cards at 4 — match it here (don't carry 4 unused ids).
        const ids = Array.from(new Set(product_ids)).slice(0, 4);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              ids.length > 0
                ? "Đây là các sản phẩm giống ảnh của bạn"
                : "Không tìm thấy sản phẩm giống ảnh.",
            display_products: ids.map(Number),
            ts: Math.max(Date.now(), userTs + 1), // never collide with userMsg
          },
        ]);
      } catch {
        setError("Không tìm được sản phẩm từ ảnh. Thử lại nhé.");
      } finally {
        setLoading(false);
        setStage(null);
      }
    },
    [loading],
  );

  // Durable single-write guard: stamp placedOrderId onto the message (keyed by
  // ts) exactly once. This re-persists to localStorage via the existing effect,
  // so a reload keeps the card locked to its "Đã đặt #id" state and the button
  // never re-arms. The `placedOrderId == null` check makes the write idempotent.
  const markPlaced = useCallback((ts: number, orderId: number) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.ts === ts && m.placedOrderId == null
          ? { ...m, placedOrderId: orderId }
          : m,
      ),
    );
  }, []);

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (attachedFile) sendImageSearch(attachedFile, input);
      else send(input);
    }
  }

  function clearHistory() {
    setMessages([]);
    setError(null);
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Trợ lý Goodminton"
      className="animate-scale-in fixed right-4 bottom-24 z-50 flex h-[600px] max-h-[calc(100vh-7rem)] w-[calc(100vw-2rem)] max-w-[400px] origin-bottom-right flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl"
    >
      <header className="from-primary-700 to-primary-600 flex items-center justify-between gap-2 bg-gradient-to-br px-4 py-3 text-white">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
            <Sparkles size={16} />
          </span>
          <div className="leading-tight">
            <p className="font-display text-sm font-bold tracking-tight">
              Trợ lý Goodminton
            </p>
            <p className="text-[11px] text-white/75">
              Tư vấn cầu lông trực tuyến
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearHistory}
              aria-label="Xoá lịch sử"
              className="rounded-md p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Trash2 size={15} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-md p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto bg-stone-50 px-4 py-4"
      >
        {messages.length === 0 ? (
          <EmptyState onPick={send} />
        ) : (
          messages.map((m, i) => (
            <MessageBubble
              key={m.ts ?? i}
              message={m}
              onPlaced={(orderId) => {
                if (m.ts != null) markPlaced(m.ts, orderId);
              }}
            />
          ))
        )}
        {loading && streamingTs == null && <ThinkingBubble stage={stage} />}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}
      </div>

      <footer className="border-t border-stone-200 bg-white p-3">
        {attachedPreview && (
          <div className="mb-2 flex items-center gap-2">
            <div className="h-14 w-14 overflow-hidden rounded-lg border border-stone-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={attachedPreview}
                alt="Ảnh đính kèm"
                className="h-full w-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setAttachedFile(null);
                setAttachedPreview(null);
              }}
              aria-label="Bỏ ảnh"
              className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={loading}
            aria-label="Đính kèm hình ảnh"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-stone-200 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 disabled:opacity-40"
          >
            <ImageIcon size={16} />
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) attachImage(f);
            }}
          />
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            placeholder="Hỏi gì đó về vợt cầu lông..."
            rows={1}
            disabled={loading}
            maxLength={1000}
            className="focus:border-primary-500 focus:ring-primary-100 max-h-32 min-h-[40px] flex-1 resize-none rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm leading-snug outline-none placeholder:text-stone-400 focus:bg-white focus:ring-2 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() =>
              attachedFile ? sendImageSearch(attachedFile, input) : send(input)
            }
            disabled={loading || (!input.trim() && !attachedFile)}
            aria-label="Gửi"
            className="bg-primary-700 hover:bg-primary-800 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-stone-400">
          Trợ lý AI — kết quả có thể không hoàn toàn chính xác.
        </p>
      </footer>
    </div>
  );
}

function EmptyState({ onPick }: Readonly<{ onPick: (text: string) => void }>) {
  return (
    <div className="space-y-4">
      <div className="bg-primary-50 text-primary-900 rounded-xl p-4 text-sm leading-relaxed">
        <p className="font-medium">Chào bạn!</p>
        <p className="text-primary-800/90 mt-1">
          Mình là trợ lý ảo của Goodminton. Mình có thể giúp bạn:
        </p>
        <ul className="text-primary-800/90 mt-2 space-y-1 text-[13px]">
          <li>• Tư vấn vợt theo lối chơi</li>
          <li>• Tra giá &amp; tồn kho realtime</li>
          <li>• Giải đáp chính sách bảo hành, đổi trả</li>
        </ul>
      </div>
      <div className="space-y-2">
        <p className="px-1 text-[11px] tracking-wider text-stone-500 uppercase">
          Gợi ý
        </p>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-left text-[13px] text-stone-700 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  onPlaced,
}: Readonly<{ message: ChatMessage; onPlaced: (orderId: number) => void }>) {
  const isUser = message.role === "user";
  const productIds = isUser
    ? []
    : Array.from(new Set(message.display_products ?? []))
        .filter((n) => Number.isInteger(n) && n > 0)
        .slice(0, 4);
  return (
    <div className={cn("flex flex-col gap-2", isUser ? "items-end" : "items-start")}>
      {message.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={message.image}
          alt="Ảnh đã gửi"
          className="max-w-[70%] rounded-2xl border border-stone-200"
        />
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary-700 rounded-br-md whitespace-pre-wrap text-white"
            : "rounded-bl-md border border-stone-200 bg-white text-stone-800 shadow-sm",
        )}
      >
        {/* User text is literal; assistant text is Markdown from the LLM. */}
        {isUser ? message.content : <MarkdownLite text={message.content} />}
      </div>
      {productIds.length > 0 && <ProductSourceCards ids={productIds} />}
      {!isUser && message.order_draft && (
        <OrderConfirmCard
          draft={message.order_draft}
          placedOrderId={message.placedOrderId}
          onPlaced={onPlaced}
        />
      )}
    </div>
  );
}

/** Product cards for the products a chat answer is grounded in. Fetches image/
 *  price/slug from shop-api (RAG returns only ids); clicking opens the product. */
function ProductSourceCards({ ids }: Readonly<{ ids: number[] }>) {
  const results = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["product", id],
      queryFn: () => productsApi.detail(id),
      staleTime: 10 * 60 * 1000,
    })),
  });
  const products = results
    .map((r) => r.data)
    .filter((p): p is Product => !!p && p.isVisible);
  if (products.length === 0) return null;
  return (
    <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
      {products.map((p) => {
        const { price, salePrice } = getDisplayPrice(p);
        return (
          <Link
            key={p.id}
            href={`/products/${p.slug}`}
            className="group flex w-28 flex-shrink-0 flex-col overflow-hidden rounded-lg border border-stone-200 bg-white transition-shadow hover:shadow-md"
          >
            <div className="aspect-square overflow-hidden bg-stone-100">
              {p.thumbnail?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.thumbnail.url}
                  alt={p.name}
                  className="h-full w-full object-contain transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] text-stone-400">
                  Không có ảnh
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-0.5 p-1.5">
              <p className="line-clamp-2 text-[11px] leading-tight font-medium text-stone-800">
                {p.name}
              </p>
              <p className="text-primary-700 mt-auto text-[11px] font-semibold">
                {formatPrice(salePrice ?? price)}đ
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

