"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { ChatPanel } from "./chat-panel";

/**
 * Floating chatbot widget. Mounted once per storefront page.
 * Button stays at bottom-right; panel slides up when opened.
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false);

  // Close panel on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {open && <ChatPanel onClose={() => setOpen(false)} />}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Đóng trợ lý" : "Mở trợ lý"}
        aria-expanded={open}
        className="bg-primary-700 hover:bg-primary-800 fixed right-4 bottom-4 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg shadow-primary-700/30 transition-all hover:scale-105 hover:shadow-xl"
      >
        {open ? (
          <X size={22} className="transition-transform" />
        ) : (
          <MessageCircle size={22} className="transition-transform" />
        )}
        {!open && (
          <span
            aria-hidden
            className="absolute top-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400"
          />
        )}
      </button>
    </>
  );
}
