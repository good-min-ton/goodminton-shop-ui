"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

/**
 * What the assistant is actually doing right now.
 *
 * On the streaming path these come from real backend signals (the `meta` event,
 * then a `status` event per tool call), so the label is never a lie. On the
 * non-streaming path there is no signal to read, so `stage = null` falls back to
 * a deliberately generic elapsed-time script.
 */
export type ThinkingStage =
  | "retrieving"
  | "thinking"
  | "pricing"
  | "inventory"
  | "similar"
  | "order"
  | "image"
  | "writing";

const LABELS: Record<ThinkingStage, string> = {
  retrieving: "Đang tìm thông tin liên quan",
  thinking: "Đang suy nghĩ",
  pricing: "Đang tra giá mới nhất",
  inventory: "Đang kiểm tra tồn kho",
  similar: "Đang tìm sản phẩm tương tự",
  order: "Đang chuẩn bị đơn hàng",
  image: "Đang tìm sản phẩm giống ảnh",
  writing: "Đang soạn câu trả lời",
};

/** RAG tool name -> stage. Keep in sync with TOOL_SCHEMAS in the rag-service. */
export const TOOL_STAGE: Record<string, ThinkingStage> = {
  get_pricing: "pricing",
  check_inventory: "inventory",
  recommend_similar_products: "similar",
  prepare_order: "order",
};

/** Fallback script for the non-streaming path: [elapsed ms, stage]. Wording stays
 *  generic because nothing here is observed — only elapsed time is known. */
const FALLBACK: ReadonlyArray<readonly [number, ThinkingStage]> = [
  [0, "retrieving"],
  [2500, "thinking"],
  [9000, "writing"],
];

export function ThinkingBubble({
  stage,
}: Readonly<{ stage: ThinkingStage | null }>) {
  const [elapsed, setElapsed] = useState(0);

  // Only the fallback path needs a ticker; a driven stage re-renders on its own.
  useEffect(() => {
    if (stage !== null) return;
    const started = Date.now();
    const id = setInterval(() => setElapsed(Date.now() - started), 500);
    return () => clearInterval(id);
  }, [stage]);

  const resolved =
    stage ??
    FALLBACK.reduce<ThinkingStage>(
      (acc, [at, s]) => (elapsed >= at ? s : acc),
      "retrieving",
    );

  return (
    <div className="flex justify-start">
      <div
        className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-stone-200 bg-white px-3.5 py-2.5 shadow-sm"
        role="status"
        aria-live="polite"
      >
        <Sparkles size={13} className="text-primary-500 animate-pulse-soft" />
        {/* Two spans on purpose: `animation` is a shorthand, so fade and shimmer
            on one element would clobber each other. key = resolved replays the
            fade each time the stage advances. */}
        <span key={resolved} className="animate-fade-in">
          <span className="animate-shimmer-text text-xs font-medium">
            {LABELS[resolved]}…
          </span>
        </span>
      </div>
    </div>
  );
}
