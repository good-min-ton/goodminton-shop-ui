"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus, MapPin } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { storesApi } from "@/lib/api/stores";
import type { Store } from "@/types/api";

export default function AdminStoresPage() {
  const list = useQuery({
    queryKey: ["stores", "list"],
    queryFn: () => storesApi.list(),
    refetchOnMount: "always",
  });

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

      <DataTable
        columns={[
          {
            key: "name",
            header: "Tên",
            render: (r: Store) => (
              <span className="font-medium">{r.name}</span>
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
                href={`/admin/stores/${r.storeId}`}
                className="text-primary-300 text-xs hover:underline"
              >
                Chi tiết →
              </Link>
            ),
          },
        ]}
        data={list.data}
        loading={list.isLoading}
        rowKey={(r) => r.storeId}
      />
    </>
  );
}
