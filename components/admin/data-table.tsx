"use client";

import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  width?: string;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[] | undefined;
  loading?: boolean;
  rowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  emptyText?: string;
  /** Number of skeleton rows to show during initial load. */
  skeletonRows?: number;
}

export function DataTable<T>({
  columns,
  data,
  loading,
  rowKey,
  onRowClick,
  emptyText = "Không có dữ liệu",
  skeletonRows = 6,
}: Readonly<DataTableProps<T>>) {
  const showSkeleton = loading && (!data || data.length === 0);

  return (
    <div className="border-admin-border bg-admin-surface overflow-hidden rounded-xl border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-admin-surface-2 border-admin-border border-b">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={cn(
                    "font-display text-admin-text-muted px-4 py-3 text-[11px] font-bold tracking-wider uppercase",
                    c.align === "right" && "text-right",
                    c.align === "center" && "text-center",
                    c.align === "left" && "text-left",
                    !c.align && "text-left",
                  )}
                  style={c.width ? { width: c.width } : undefined}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-admin-border divide-y">
            {showSkeleton &&
              Array.from({ length: skeletonRows }).map((_, rowIdx) => (
                // eslint-disable-next-line react/no-array-index-key
                <tr key={rowIdx}>
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        "px-4 py-3.5",
                        c.align === "right" && "text-right",
                        c.align === "center" && "text-center",
                      )}
                    >
                      <Skeleton className="h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && (!data || data.length === 0) && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-admin-text-muted px-4 py-12 text-center text-sm"
                >
                  {emptyText}
                </td>
              </tr>
            )}

            {!showSkeleton &&
              data &&
              data.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "hover:bg-admin-surface-2 transition-colors",
                    onRowClick && "cursor-pointer",
                  )}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        "text-admin-text px-4 py-3 text-sm",
                        c.align === "right" && "text-right",
                        c.align === "center" && "text-center",
                        c.className,
                      )}
                    >
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
