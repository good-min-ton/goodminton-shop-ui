"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable } from "@/components/admin/data-table";
import { Pagination } from "@/components/storefront/pagination";
import { Button } from "@/components/ui/button";
import { accountsApi } from "@/lib/api/accounts";
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
    refetchOnMount: "always",
  });

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

      <div className="mb-4 flex items-center gap-2">
        <span className="text-admin-text-muted text-xs">Lọc theo vai trò:</span>
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
        data={list.data?.content}
        loading={list.isLoading}
        rowKey={(r) => r.id}
      />

      <Pagination
        page={page}
        totalPages={list.data?.totalPages ?? 1}
        onPageChange={setPage}
        className="mt-6"
      />
    </>
  );
}
