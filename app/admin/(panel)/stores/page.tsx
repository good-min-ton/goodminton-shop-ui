"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, MapPin, Star } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminSearchBar } from "@/components/admin/admin-search-bar";
import { DataTable } from "@/components/admin/data-table";
import { Pagination } from "@/components/storefront/pagination";
import { Button } from "@/components/ui/button";
import { storesApi } from "@/lib/api/stores";
import { searchApi } from "@/lib/api/search";
import { useDebouncedValue } from "@/hooks/use-debounce";
import type { Store } from "@/types/api";

export default function AdminStoresPage() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const debouncedQ = useDebouncedValue(query.trim(), 300);
  const useSearch = debouncedQ.length >= 2;

  const list = useQuery({
    queryKey: ["stores", "list"],
    queryFn: () => storesApi.list(),
    enabled: !useSearch,
    refetchOnMount: "always",
  });

  const search = useQuery({
    queryKey: ["search", "stores", debouncedQ, page],
    queryFn: () => searchApi.stores({ q: debouncedQ, page, size: 20 }),
    enabled: useSearch,
    placeholderData: (prev) => prev,
    staleTime: 30 * 1000,
  });

  const data = useSearch ? (search.data?.content ?? []) : (list.data ?? []);
  const loading = useSearch ? search.isLoading : list.isLoading;
  const totalPages = useSearch ? (search.data?.page.totalPages ?? 1) : 1;

  return (
    <>
      <AdminPageHeader
        title="Chi nhánh"
        description="Quản lý các cửa hàng vật lý."
        actions={
          <Link href="/admin/stores/create">
            <Button variant="admin-primary">
              <Plus size={16} />
              Tạo chi nhánh
            </Button>
          </Link>
        }
      />

      <AdminSearchBar
        value={query}
        onChange={(v) => {
          setQuery(v);
          setPage(1);
        }}
        placeholder="Tìm theo tên hoặc địa chỉ..."
        className="mb-4"
      />

      <DataTable
        columns={[
          {
            key: "name",
            header: "Tên",
            render: (r: Store) => (
              <span className="inline-flex items-center gap-2 font-medium">
                {r.name}
                {r.isCentral && (
                  <span
                    title="Kho trung tâm (HQ)"
                    className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300"
                  >
                    <Star size={10} className="fill-amber-300" />
                    HQ
                  </span>
                )}
              </span>
            ),
          },
          {
            key: "address",
            header: "Địa chỉ",
            render: (r: Store) => (
              <span className="text-admin-text-muted inline-flex items-center gap-1.5 text-sm">
                <MapPin size={12} className="flex-shrink-0" />
                <span className="line-clamp-1">{r.address}</span>
              </span>
            ),
          },
          {
            key: "contact",
            header: "Liên hệ",
            render: (r: Store) => (
              <span className="font-mono text-xs">{r.contact}</span>
            ),
          },
          {
            key: "admin",
            header: "Quản lý",
            render: (r: Store) =>
              r.admin ? (
                <span className="text-admin-text">{r.admin.fullName}</span>
              ) : (
                <span className="text-admin-text-muted text-xs italic">
                  Chưa gán
                </span>
              ),
          },
          {
            key: "actions",
            header: "",
            width: "100px",
            align: "right",
            render: (r: Store) => (
              <Link
                href={`/admin/stores/${r.id}`}
                className="text-primary-300 text-xs hover:underline"
              >
                Chi tiết →
              </Link>
            ),
          },
        ]}
        data={data}
        loading={loading}
        rowKey={(r) => r.id}
        emptyText={
          useSearch
            ? "Không tìm thấy chi nhánh phù hợp"
            : "Chưa có chi nhánh nào"
        }
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        admin
        className="mt-6"
      />
    </>
  );
}
