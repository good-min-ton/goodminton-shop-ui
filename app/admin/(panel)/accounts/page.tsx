"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminSearchBar } from "@/components/admin/admin-search-bar";
import { DataTable } from "@/components/admin/data-table";
import { Pagination } from "@/components/storefront/pagination";
import { Button } from "@/components/ui/button";
import { accountsApi } from "@/lib/api/accounts";
import { searchApi } from "@/lib/api/search";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { formatDateTime } from "@/lib/utils";
import type { Account, Role } from "@/types/api";

const ROLE_LABEL: Record<Role, string> = {
  CUSTOMER: "Khách hàng",
  STORE_ADMIN: "Quản lý CN",
  SUPER_ADMIN: "Super Admin",
};

const ROLE_BADGE: Record<Role, string> = {
  CUSTOMER: "bg-stone-500/10 text-stone-300",
  STORE_ADMIN: "bg-blue-500/10 text-blue-400",
  SUPER_ADMIN: "bg-primary-400/10 text-primary-300",
};

export default function AdminAccountsPage() {
  const [page, setPage] = useState(1);
  const [role, setRole] = useState<Role | "">("");
  const [query, setQuery] = useState("");
  const debouncedQ = useDebouncedValue(query.trim(), 300);
  const useSearch = debouncedQ.length >= 2;

  const list = useQuery({
    queryKey: ["accounts", "list", { page, role }],
    queryFn: () =>
      accountsApi.list({
        page,
        size: 20,
        sortBy: "createdAt",
        sortDir: "desc",
        role: role || undefined,
      }),
    enabled: !useSearch,
    refetchOnMount: "always",
  });

  const search = useQuery({
    queryKey: ["search", "accounts", debouncedQ, page],
    queryFn: () => searchApi.accounts({ q: debouncedQ, page, size: 20 }),
    enabled: useSearch,
    placeholderData: (prev) => prev,
    staleTime: 30 * 1000,
  });

  const active = useSearch ? search : list;
  const totalPages = active.data?.page.totalPages ?? 1;

  return (
    <>
      <AdminPageHeader
        title="Tài khoản"
        description="Tất cả người dùng trong hệ thống."
        actions={
          <Link href="/admin/accounts/create-store-admin">
            <Button variant="admin-primary">
              <Plus size={16} />
              Tạo Store Admin
            </Button>
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <AdminSearchBar
          value={query}
          onChange={(v) => {
            setQuery(v);
            setPage(1);
          }}
          placeholder="Tìm theo tên, email, số điện thoại..."
        />
        {!useSearch && (
          <div className="flex items-center gap-2">
            <span className="text-admin-text-muted text-xs">
              Lọc theo vai trò:
            </span>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value as Role | "");
                setPage(1);
              }}
              className="bg-admin-surface text-admin-text border-admin-border rounded-md border px-3 py-1.5 text-sm focus:border-primary-400 focus:outline-none"
            >
              <option value="">Tất cả</option>
              <option value="CUSTOMER">Khách hàng</option>
              <option value="STORE_ADMIN">Store Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
        )}
      </div>

      <DataTable
        columns={[
          {
            key: "name",
            header: "Tên",
            render: (r: Account) => (
              <span className="font-medium">{r.fullName}</span>
            ),
          },
          {
            key: "email",
            header: "Email",
            render: (r: Account) => (
              <span className="text-admin-text-muted">{r.email}</span>
            ),
          },
          {
            key: "phone",
            header: "Điện thoại",
            render: (r: Account) => (
              <span className="font-mono text-admin-text-muted text-xs">
                {r.phone}
              </span>
            ),
          },
          {
            key: "role",
            header: "Vai trò",
            render: (r: Account) => (
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs ${ROLE_BADGE[r.role]}`}
              >
                {ROLE_LABEL[r.role]}
              </span>
            ),
          },
          {
            key: "status",
            header: "Trạng thái",
            render: (r: Account) =>
              r.status === "ACTIVE" ? (
                <span className="inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
                  Hoạt động
                </span>
              ) : (
                <span className="inline-flex rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-400">
                  Đã khoá
                </span>
              ),
          },
          {
            key: "created",
            header: "Tạo lúc",
            render: (r: Account) => (
              <span className="font-mono text-admin-text-muted text-xs">
                {formatDateTime(r.createdAt)}
              </span>
            ),
          },
          {
            key: "actions",
            header: "",
            width: "100px",
            align: "right",
            render: (r: Account) => (
              <Link
                href={`/admin/accounts/${r.id}`}
                className="text-primary-300 text-xs hover:underline"
              >
                Chi tiết →
              </Link>
            ),
          },
        ]}
        data={active.data?.content}
        loading={active.isLoading}
        rowKey={(r) => r.id}
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
