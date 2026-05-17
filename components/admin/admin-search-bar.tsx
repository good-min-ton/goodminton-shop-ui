"use client";

import { Search, X } from "lucide-react";

interface AdminSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function AdminSearchBar({
  value,
  onChange,
  placeholder = "Tìm kiếm...",
  className,
}: Readonly<AdminSearchBarProps>) {
  return (
    <div className={className}>
      <div className="relative max-w-sm">
        <Search
          size={16}
          className="text-admin-text-muted absolute top-1/2 left-3 -translate-y-1/2"
        />
        <input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-admin-surface text-admin-text border-admin-border placeholder:text-admin-text-muted focus:border-primary-400 w-full rounded-lg border py-2 pr-9 pl-9 text-sm outline-none"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Xoá"
            className="text-admin-text-muted hover:text-admin-text absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
