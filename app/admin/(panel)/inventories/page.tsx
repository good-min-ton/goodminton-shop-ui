"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable } from "@/components/admin/data-table";
import { Pagination } from "@/components/storefront/pagination";
import { Button } from "@/components/ui/button";
import { InventoryFormModal } from "@/components/admin/inventory-form-modal";
import { storesApi } from "@/lib/api/stores";
import { inventoriesApi } from "@/lib/api/inventories";
import type { Inventory } from "@/types/api";

export default function AdminInventoriesPage() {
  const [storeId, setStoreId] = useState<number | "">("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Inventory | null>(null);
  const [adding, setAdding] = useState(false);

  const stores = useQuery({
    queryKey: ["stores", "list"],
    queryFn: () => storesApi.list(),
  });

  const inv = useQuery({
    queryKey: ["inventories", "by-store", storeId, page],
    queryFn: () =>
      inventoriesApi.byStore(storeId as number, {
        page,
        size: 20,
        sortBy: "updatedAt",
        sortDir: "desc",
      }),
    enabled: storeId !== "",
  });

  // For variant-picker filtering we need ALL existing inventory at this store,
  // not just the current page. Cheap-ish for typical store sizes.
  const allAtStore = useQuery({
    queryKey: ["inventories", "by-store-full", storeId],
    queryFn: () =>
      inventoriesApi.byStore(storeId as number, { page: 1, size: 1000 }),
    enabled: storeId !== "" && (editing !== null || adding),
  });

  const modalOpen = editing !== null || adding;
  const numericStoreId = typeof storeId === "number" ? storeId : null;

  return (
    <>
      <AdminPageHeader
        title="Kho hàng"
        description="Tồn kho theo từng chi nhánh và variant."
        actions={
          <Button
            variant="admin-primary"
            onClick={() => setAdding(true)}
            disabled={storeId === ""}
          >
            <Plus size={16} />
            Thêm tồn kho
          </Button>
        }
      />

      <div className="mb-5 flex items-center gap-3">
        <span className="text-admin-text-muted text-sm">Chi nhánh:</span>
        <select
          value={storeId}
          onChange={(e) => {
            setStoreId(e.target.value ? Number(e.target.value) : "");
            setPage(1);
          }}
          className="bg-admin-surface text-admin-text border-admin-border rounded-md border px-3 py-1.5 text-sm focus:border-primary-400 focus:outline-none"
        >
          <option value="">-- Chọn chi nhánh --</option>
          {stores.data?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
              {s.isCentral ? " (HQ)" : ""}
            </option>
          ))}
        </select>
      </div>

      {storeId === "" ? (
        <div className="bg-admin-surface border-admin-border text-admin-text-muted rounded-xl border py-16 text-center text-sm">
          Vui lòng chọn chi nhánh để xem tồn kho.
        </div>
      ) : (
        <>
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
                header: "Tồn kho",
                align: "right",
                render: (r: Inventory) => (
                  <QuantityCell quantity={r.quantity} />
                ),
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
            data={inv.data?.content}
            loading={inv.isLoading}
            rowKey={(r) => r.id}
            emptyText='Chi nhánh này chưa có tồn kho. Bấm "Thêm tồn kho" để cấp hàng cho variant đầu tiên.'
          />

          <Pagination
            page={page}
            totalPages={inv.data?.page.totalPages ?? 1}
            onPageChange={setPage}
        admin
            className="mt-6"
          />
        </>
      )}

      <InventoryFormModal
        open={modalOpen}
        storeId={numericStoreId}
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

  return <span className={`font-mono font-medium ${cls}`}>{quantity}</span>;
}
