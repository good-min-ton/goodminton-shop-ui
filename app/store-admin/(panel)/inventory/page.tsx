"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable } from "@/components/admin/data-table";
import { Pagination } from "@/components/storefront/pagination";
import { Button } from "@/components/ui/button";
import { InventoryFormModal } from "@/components/admin/inventory-form-modal";
import { inventoriesApi } from "@/lib/api/inventories";
import { useMyStore } from "@/hooks/use-my-store";
import type { Inventory } from "@/types/api";

export default function StoreAdminInventoryPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Inventory | null>(null);
  const [adding, setAdding] = useState(false);

  const { storeId, store } = useMyStore();

  const inv = useQuery({
    queryKey: ["my-store-inventory", page],
    queryFn: () =>
      inventoriesApi.myStore({
        page,
        size: 20,
        sortBy: "updatedAt",
        sortDir: "desc",
      }),
  });

  // Full inventory at this store — for variant-picker filtering in add modal.
  const allAtStore = useQuery({
    queryKey: ["my-store-inventory", "full"],
    queryFn: () => inventoriesApi.myStore({ page: 1, size: 1000 }),
    enabled: editing !== null || adding,
  });

  const filtered = (inv.data?.content ?? []).filter((row) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      row.skuCode.toLowerCase().includes(q) ||
      row.productName.toLowerCase().includes(q)
    );
  });

  const modalOpen = editing !== null || adding;

  return (
    <>
      <AdminPageHeader
        title="Tồn kho"
        description={
          store
            ? `Quản lý tồn kho tại ${store.name}.`
            : "Quản lý tồn kho cửa hàng của bạn."
        }
        actions={
          <Button
            variant="admin-primary"
            onClick={() => setAdding(true)}
            disabled={storeId == null}
          >
            <Plus size={16} />
            Thêm tồn kho
          </Button>
        }
      />

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search
            size={16}
            className="text-admin-text-muted absolute top-1/2 left-3 -translate-y-1/2"
          />
          <input
            type="text"
            placeholder="Tìm theo SKU hoặc tên sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-admin-surface text-admin-text border-admin-border placeholder:text-admin-text-muted focus:border-amber-400 w-full rounded-lg border py-2 pr-3 pl-9 text-sm outline-none"
          />
        </div>
      </div>

      <DataTable
        columns={[
          {
            key: "sku",
            header: "SKU",
            render: (r: Inventory) => (
              <span className="font-mono text-xs">{r.skuCode}</span>
            ),
          },
          {
            key: "product",
            header: "Sản phẩm",
            render: (r: Inventory) => (
              <span className="font-medium">{r.productName}</span>
            ),
          },
          {
            key: "variant",
            header: "Phiên bản",
            render: (r: Inventory) => (
              <span className="text-admin-text-muted text-xs">
                {r.color.name} · {r.size.name}
              </span>
            ),
          },
          {
            key: "qty",
            header: "Tồn",
            align: "right",
            render: (r: Inventory) => <QuantityCell quantity={r.quantity} />,
          },
          {
            key: "actions",
            header: "",
            width: "100px",
            align: "right",
            render: (r: Inventory) => (
              <button
                onClick={() => setEditing(r)}
                className="text-primary-300 text-xs hover:underline"
              >
                Cập nhật
              </button>
            ),
          },
        ]}
        data={filtered}
        loading={inv.isLoading}
        rowKey={(r) => r.id}
        emptyText={
          search
            ? "Không tìm thấy sản phẩm phù hợp"
            : 'Cửa hàng chưa có tồn kho. Bấm "Thêm tồn kho" để cấp hàng.'
        }
      />

      <Pagination
        page={page}
        totalPages={inv.data?.page.totalPages ?? 1}
        onPageChange={setPage}
        admin
        className="mt-6"
      />

      <InventoryFormModal
        open={modalOpen}
        storeId={storeId}
        editing={editing}
        existingInventory={allAtStore.data?.content ?? []}
        onClose={() => {
          setEditing(null);
          setAdding(false);
        }}
      />
    </>
  );
}

function QuantityCell({ quantity }: Readonly<{ quantity: number }>) {
  let cls: string;
  if (quantity <= 2) cls = "text-red-400";
  else if (quantity <= 5) cls = "text-amber-400";
  else cls = "text-emerald-400";

  return (
    <span className={`font-mono text-sm font-medium ${cls}`}>{quantity}</span>
  );
}
