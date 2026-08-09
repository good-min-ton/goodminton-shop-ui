"use client";

import { useState } from "react";
import { Check, Copy, Truck } from "lucide-react";

/**
 * The tracking code, given room to be read out loud.
 *
 * It used to sit as small text at the bottom of the summary box. That is fine
 * for glancing at and wrong for the moment it actually matters: a customer on
 * the phone to support, being asked for it. Copy exists because reading a
 * fourteen-character alphanumeric aloud is where transcription errors come from.
 */
export function TrackingCode({ code }: Readonly<{ code: string }>) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard denied or unavailable (insecure origin). The code is on
      // screen and selectable, so there is nothing to fall back to.
    }
  }

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
      <p className="flex items-center gap-1.5 text-xs font-medium text-blue-700">
        <Truck size={13} />
        Mã vận đơn
      </p>
      <div className="mt-1.5 flex items-center gap-2">
        {/* Selectable and generously sized: this is the one string on the page
            a human has to relay accurately. */}
        <span className="font-mono flex-1 text-base font-semibold tracking-wide break-all text-blue-900 select-all">
          {code}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Đã sao chép mã vận đơn" : "Sao chép mã vận đơn"}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-white text-blue-700 transition-colors hover:bg-blue-100"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <p className="mt-1.5 text-[11px] text-blue-700/80">
        Dùng mã này khi tra cứu với đơn vị vận chuyển hoặc liên hệ shop.
      </p>
    </div>
  );
}
