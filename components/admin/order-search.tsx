"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";

/**
 * Finds the order a customer is calling about.
 *
 * The three things a caller actually has to hand: the tracking code from the
 * carrier's SMS, the phone number they gave, or the order number. Nothing was
 * searchable before, so a complaint quoting a tracking code had nowhere to go.
 *
 * Submit-driven rather than search-as-you-type: the backend matches exactly, so
 * every keystroke before the last one is a guaranteed miss and a wasted request.
 */
export function OrderSearch({
  onSearch,
  onClear,
  active,
}: Readonly<{
  onSearch: (q: string) => void;
  onClear: () => void;
  active: boolean;
}>) {
  const [value, setValue] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (q) onSearch(q);
  }

  function clear() {
    setValue("");
    onClear();
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <div className="relative">
        <Search
          size={14}
          className="text-admin-text-muted pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2"
        />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Mã vận đơn, SĐT, mã đơn"
          aria-label="Tìm đơn hàng theo mã vận đơn, số điện thoại hoặc mã đơn"
          className="bg-admin-surface text-admin-text border-admin-border w-60 rounded-md border py-1.5 pr-8 pl-8 text-sm focus:border-primary-400 focus:outline-none"
        />
        {active && (
          <button
            type="button"
            onClick={clear}
            aria-label="Xoá tìm kiếm"
            className="text-admin-text-muted hover:text-admin-text absolute top-1/2 right-2 -translate-y-1/2"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <button
        type="submit"
        className="bg-admin-primary rounded-md px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        disabled={!value.trim()}
      >
        Tìm
      </button>
    </form>
  );
}
