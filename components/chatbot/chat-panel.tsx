"use client";

import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Send, Sparkles, Trash2, X } from "lucide-react";
import { ChatApiError, sendChat } from "./api";
import type { ChatMessage } from "./types";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "gm.chat-history";
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
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Restore from localStorage on first mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ChatMessage[];
      if (Array.isArray(parsed)) setMessages(parsed);
    } catch {
      /* corrupted — ignore */
    }
  }, []);

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

      const userMsg: ChatMessage = {
        role: "user",
        content: trimmed,
        ts: Date.now(),
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
        const res = await sendChat({ message: trimmed, chat_history: history });
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: res.answer,
            sources: res.sources,
            ts: Date.now(),
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
      }
    },
    [loading, messages],
  );

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
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
            <MessageBubble key={m.ts ?? i} message={m} />
          ))
        )}
        {loading && <LoadingBubble />}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}
      </div>

      <footer className="border-t border-stone-200 bg-white p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Hỏi gì đó về vợt cầu lông..."
            rows={1}
            disabled={loading}
            maxLength={1000}
            className="focus:border-primary-500 focus:ring-primary-100 max-h-32 min-h-[40px] flex-1 resize-none rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm leading-snug outline-none placeholder:text-stone-400 focus:bg-white focus:ring-2 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
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
        <p className="font-medium">👋 Chào bạn!</p>
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

function MessageBubble({ message }: Readonly<{ message: ChatMessage }>) {
  const isUser = message.role === "user";
  return (
    <div
      className={cn(
        "flex",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
          isUser
            ? "bg-primary-700 rounded-br-md text-white"
            : "rounded-bl-md border border-stone-200 bg-white text-stone-800 shadow-sm",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}

function LoadingBubble() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-bl-md border border-stone-200 bg-white px-4 py-3 shadow-sm">
        <span className="flex items-center gap-1">
          <Dot delay="0ms" />
          <Dot delay="150ms" />
          <Dot delay="300ms" />
        </span>
      </div>
    </div>
  );
}

function Dot({ delay }: Readonly<{ delay: string }>) {
  return (
    <span
      className="bg-primary-500 inline-block h-1.5 w-1.5 animate-bounce rounded-full"
      style={{ animationDelay: delay }}
    />
  );
}
